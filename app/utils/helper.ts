import { DAS, DetermineOptimalParams, PoolType, Status } from "./types";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { getCurrentPrice } from "./cloudFunctions";
import { program } from "./instructions";

/**
 * Retrieves the collection mint address from the provided asset response.
 * @param {DAS.GetAssetResponse} item - The asset response object.
 * @return {string | undefined} The collection mint address if found, otherwise undefined.
 */
export function getCollectionMintAddress(
  item: DAS.GetAssetResponse | DasApiAsset
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
  if (pool.vestingEndingAt && Date.now() / 1000 > pool.vestingEndingAt) {
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

export function convertSecondsToNearestUnit(seconds: number) {
  // Define constants for conversion
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30; // Approximation for a month
  const year = day * 365; // Approximation for a year

  // Determine the nearest unit
  if (seconds < minute) {
    return `${seconds.toFixed(0)} second${seconds === 1 ? "" : "s"}`;
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    const remainingSeconds = seconds % minute;
    return `${minutes} minute${minutes === 1 ? "" : "s"}${
      remainingSeconds > 0
        ? ` ${Math.round(remainingSeconds)} second${
            remainingSeconds === 1 ? "" : "s"
          }`
        : ""
    }`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    const remainingMinutes = (seconds % hour) / minute;
    return `${hours} hour${hours === 1 ? "" : "s"}${
      remainingMinutes > 0
        ? ` ${Math.round(remainingMinutes)} minute${
            remainingMinutes === 1 ? "" : "s"
          }`
        : ""
    }`;
  } else if (seconds < month) {
    const days = Math.floor(seconds / day);
    const remainingHours = (seconds % day) / hour;
    return `${days} day${days === 1 ? "" : "s"}${
      remainingHours > 0
        ? ` ${remainingHours.toFixed(0)} hour${remainingHours === 1 ? "" : "s"}`
        : ""
    }`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    const remainingDays = (seconds % month) / day;
    return `${months} month${months === 1 ? "" : "s"}${
      remainingDays > 0
        ? ` ${remainingDays.toFixed(1)} day${remainingDays === 1 ? "" : "s"}`
        : ""
    }`;
  } else {
    const years = Math.floor(seconds / year);
    const remainingMonths = (seconds % year) / month;
    return `${years} year${years === 1 ? "" : "s"}${
      remainingMonths > 0
        ? ` ${remainingMonths.toFixed(1)} month${
            remainingMonths === 1 ? "" : "s"
          }`
        : ""
    }`;
  }
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
  const amountInSol = poolData.liquidityCollected / LAMPORTS_PER_SOL;
  const response = await getCurrentPrice();
  const amountInUSD = amountInSol * response.data.value;
  const amountOfCoin =
    (poolData.totalSupply - poolData.vestedSupply) / 10 ** args.decimal;
  const initialPrice = amountInUSD / amountOfCoin;
  const tickSize = initialPrice / 1000;
  const maxDecimals = 6;
  const tickDecimals = countDecimalPlaces(tickSize);
  const orderSizeDecimals = Math.min(maxDecimals - tickDecimals, 6);
  const optimalOrderSize = 1 / Math.pow(10, orderSizeDecimals);
  return { tickSize: tickSize, orderSize: optimalOrderSize };
}
