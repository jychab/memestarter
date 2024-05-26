import { encode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/utf8";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Account,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { DAS, PoolType, Status } from "./types";

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
    return -exponent - 1;
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

export async function determineOptimalParameters(totalSupply: number) {
  let tickSize;
  let orderSize;
  if (totalSupply <= 10000) {
    tickSize = 0.001;
    orderSize = 0.001;
  } else if (totalSupply <= 100000) {
    tickSize = 0.0001;
    orderSize = 0.01;
  } else if (totalSupply <= 1000000) {
    tickSize = 0.00001;
    orderSize = 0.1;
  } else if (totalSupply <= 10000000) {
    tickSize = 0.000001;
    orderSize = 1;
  } else if (totalSupply <= 100000000) {
    tickSize = 0.0000001;
    orderSize = 10;
  } else if (totalSupply <= 1000000000) {
    tickSize = 0.00000001;
    orderSize = 100;
  } else if (totalSupply <= 10000000000) {
    tickSize = 0.000000001;
    orderSize = 1000;
  } else {
    tickSize = 0.0000000001;
    orderSize = 10000;
  }
  return { tickSize: tickSize, orderSize: orderSize };
}

function getFirstFourNonZeroDigits(number: number) {
  // Convert the number to a string
  let numberString = number.toString();

  // Initialize result string
  let result = "";

  // Flag to track if we've encountered any non-zero digit yet
  let nonZeroFound = false;

  // Iterate through each character in the string
  for (let i = 0; i < numberString.length; i++) {
    // Check if the character is a non-zero digit and if we haven't found any non-zero digit yet
    if (numberString[i] !== "0" && !nonZeroFound) {
      nonZeroFound = true; // Set the flag to true
    }
    // If we've found a non-zero digit, append it to the result
    if (nonZeroFound && numberString[i] !== ".") {
      result += numberString[i];
    }
    // Break the loop if we have found four non-zero digits
    if (result.length === 4) break;
  }

  return result;
}

export function convertToCustomFormat(number: number) {
  const integerPart = getFirstFourNonZeroDigits(number);
  const decimalPlaces = countDecimalPlaces(number);
  let result = "";
  if (decimalPlaces) {
    result += "0.0";
    result += decimalPlaces
      .toString()
      .replace(/\d/g, (m) => "₀₁₂₃₄₅₆₇₈₉"[parseInt(m)]);
  }
  result += integerPart;
  return result;
}

export async function getOrCreateAssociatedTokenAccountInstruction(
  tx: any[],
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve: boolean,
  connection: Connection,
  programId: PublicKey = TOKEN_PROGRAM_ID,
  associatedTokenProgramId: PublicKey = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId
  );

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  let account: Account;
  try {
    account = await getAccount(
      connection,
      associatedToken,
      connection.commitment,
      programId
    );
  } catch (error: unknown) {
    // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
    // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
    // TokenInvalidAccountOwnerError in this code path.
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      // As this isn't atomic, it's possible others can create associated accounts meanwhile.
      try {
        tx.push(
          createAssociatedTokenAccountInstruction(
            payer,
            associatedToken,
            owner,
            mint,
            programId,
            associatedTokenProgramId
          )
        );
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }
    } else {
      throw error;
    }
  }
  return associatedToken;
}

export const creatorsShareTooltipContent = (
  creatorFee: number,
  supply: number,
  initialLpSupply: number,
  decimal: number
) => {
  return `This denotes the amount of tokens the creator will receive from the total supply.\n\nUpon Launch = ${formatLargeNumber(
    ((supply - initialLpSupply) * (creatorFee / 100)) / 10 ** decimal
  )} in tokens\nVesting = ${creatorFee}% of LP tokens`;
};

export async function getAuthAddress(
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const [address, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(encode("vault_and_lp_mint_auth_seed"))],
    programId
  );
  return [address, bump];
}

export async function getPoolAddress(
  ammConfig: PublicKey,
  tokenMint0: PublicKey,
  tokenMint1: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const [address, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(encode("pool")),
      ammConfig.toBuffer(),
      tokenMint0.toBuffer(),
      tokenMint1.toBuffer(),
    ],
    programId
  );
  return [address, bump];
}

export async function getPoolVaultAddress(
  pool: PublicKey,
  vaultTokenMint: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const [address, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(encode("pool_vault")),
      pool.toBuffer(),
      vaultTokenMint.toBuffer(),
    ],
    programId
  );
  return [address, bump];
}

export async function getPoolLpMintAddress(
  pool: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const [address, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(encode("pool_lp_mint")), pool.toBuffer()],
    programId
  );
  return [address, bump];
}

export async function getOrcleAccountAddress(
  pool: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  const [address, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(encode("observation")), pool.toBuffer()],
    programId
  );
  return [address, bump];
}
