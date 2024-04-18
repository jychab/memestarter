import { DAS, DetermineOptimalParams, PoolType, Status } from "./types";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getCurrentPrice } from "./cloudFunctions";
import { program } from "./instructions";
import { NATIVE_MINT } from "@solana/spl-token";

/**
 * Retrieves the collection mint address from the provided asset response.
 * @param {DAS.GetAssetResponse} item - The asset response object.
 * @return {string | undefined} The collection mint address if found, otherwise undefined.
 */
export function getCollectionMintAddress(
  item: DAS.GetAssetResponse
): string | undefined {
  if (item.grouping) {
    const group = item.grouping?.find(
      (group) => group.group_key === "collection"
    );
    return group ? group.group_value : undefined;
  } else {
    return undefined;
  }
}

/**
 * Retrieves the attributes from the provided asset response.
 * @param {DAS.GetAssetResponse} item - The asset response object.
 * @return {DAS.Attribute[] | undefined} The attributes array if found, otherwise undefined.
 */
export function getAttributes(
  item: DAS.GetAssetResponse
): DAS.Attribute[] | undefined {
  if (item.content && item.content.metadata.attributes) {
    return item.content.metadata.attributes;
  } else {
    return undefined;
  }
}

export function generateRandomU64() {
  // Generate two 32-bit integers
  const upper = Math.floor(Math.random() * 0x100000000); // 2^32
  const lower = Math.floor(Math.random() * 0x100000000); // 2^32

  // Combine them to form a 64-bit integer
  const u64 = (upper << 32) | lower;

  return u64;
}

export function getStatus(pool: PoolType) {
  if (
    pool.vestingStartedAt &&
    pool.vestingPeriod &&
    Date.now() / 1000 > pool.vestingStartedAt + pool.vestingPeriod
  ) {
    return Status.VestingCompleted;
  } else if (pool.vestingStartedAt) {
    return Status.VestingInProgress;
  } else if (
    pool.presaleTimeLimit &&
    ((Date.now() / 1000 > pool.presaleTimeLimit &&
      pool.liquidityCollected < pool.presaleTarget) ||
      Date.now() / 1000 > pool.presaleTimeLimit + 7 * 24 * 60 * 60)
  ) {
    return Status.Expired;
  } else if (
    pool.presaleTimeLimit &&
    Date.now() / 1000 > pool.presaleTimeLimit &&
    pool.liquidityCollected >= pool.presaleTarget
  ) {
    return Status.ReadyToLaunch;
  } else if (pool.liquidityCollected >= pool.presaleTarget) {
    return Status.PresaleTargetMet;
  } else if (pool.presaleTimeLimit) {
    return Status.PresaleInProgress;
  }
  return;
}

export function separateNumberWithComma(number: string) {
  let numberString = number;

  // Insert commas for thousands separation
  let separatedNumber = "";
  for (let i = numberString.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      separatedNumber = "," + separatedNumber;
    }
    separatedNumber = numberString[i] + separatedNumber;
  }

  return separatedNumber;
}

export function convertSecondsToNearestUnit(seconds: number): string {
  // Define units and their ratios
  const units = [
    { label: "year", ratio: 365 * 24 * 60 * 60 },
    { label: "month", ratio: 30 * 24 * 60 * 60 },
    { label: "day", ratio: 24 * 60 * 60 },
    { label: "hour", ratio: 60 * 60 },
    { label: "minute", ratio: 60 },
    { label: "second", ratio: 1 },
  ];

  // Iterate over units to find the nearest one
  for (const unit of units) {
    if (seconds >= unit.ratio) {
      const value = Math.floor(seconds / unit.ratio);
      const remainingSeconds = seconds % unit.ratio;
      const remainingTime = convertSecondsToNearestUnit(remainingSeconds);
      return `${value} ${unit.label}${value !== 1 ? "s" : ""}${
        remainingTime ? ` ${remainingTime}` : ""
      }`;
    }
  }

  return ``; // If seconds is less than a second
}

export function formatLargeNumber(number: number) {
  const suffixes = ["", "K", "M", "B", "T"];
  if (number === 0) {
    return "0";
  }
  let magnitude = 0;
  while (Math.abs(number) >= 1000) {
    magnitude++;
    number /= 1000.0;
  }
  const formattedNumber = number.toFixed(2) + suffixes[magnitude];
  return formattedNumber;
}

export async function getMetadata(json_uri: string): Promise<any | undefined> {
  if (typeof json_uri === "string") {
    const res = await fetch(json_uri);
    const data = res.json();
    return data;
  }
  return;
}

export function createLoginMessage(sessionKey: string) {
  return `Sign In to https://memestarter.app\n\nNonce: ${sessionKey}}`;
}
function countDecimalPlaces(number: number) {
  // Convert number to string
  var numStr = number.toString();

  // If number is in scientific notation
  if (numStr.indexOf("e") !== -1) {
    // Extract exponent part
    var exponent = parseInt(numStr.split("e")[1]);

    // Return the negative exponent as the number of decimal places
    return -exponent;
  }
  // Find the position of the decimal point
  var decimalPosition = numStr.indexOf(".");
  // If there's no decimal point, return 0
  if (decimalPosition === -1) {
    return 0;
  }

  // Look for the first non-zero digit after the decimal point
  var nonZeroIndex = decimalPosition + 1;
  while (nonZeroIndex < numStr.length && numStr.charAt(nonZeroIndex) === "0") {
    nonZeroIndex++;
  }

  // Calculate the number of decimal places
  var numDecimalPlaces = nonZeroIndex - decimalPosition - 1;

  return numDecimalPlaces;
}

export async function determineOptimalParameters(
  args: DetermineOptimalParams,
  connection: Connection
) {
  const poolData = await program(connection).account.pool.fetch(args.pool);
  const amountInSol =
    (poolData.liquidityCollected * (10000 - poolData.creatorFeeBasisPoints)) /
    (LAMPORTS_PER_SOL * 10000);

  const response = await getCurrentPrice(NATIVE_MINT.toBase58());
  const amountInUSD = amountInSol * response.data.value;
  const amountOfCoin = poolData.totalSupply / 10 ** args.decimal;
  const initialPrice = amountInUSD / amountOfCoin;
  const tickSize = initialPrice / 1000;
  const maxDecimals = 6;
  const tickDecimals = countDecimalPlaces(tickSize);
  const orderSizeDecimals = Math.min(maxDecimals - tickDecimals, 6);
  const optimalOrderSize = 1 / Math.pow(10, orderSizeDecimals);
  return { tickSize: tickSize, orderSize: optimalOrderSize };
}
