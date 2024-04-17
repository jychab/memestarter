import { DEVNET_PROGRAM_ID, MAINNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const PROGRAM_ID = new PublicKey(
  "memep6GYetMx84qtBgB9p1rncn81HMmZZa1UoxauYGt"
);
export const HELIUS_ENDPOINT = `https://${
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod" ? "mainnet" : "devnet"
}.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

export const FEE_COLLECTOR = new PublicKey(
  "73hCTYpoZNdFiwbh2PrW99ykAyNcQVfUwPMUhu9ogNTg"
);

export const RAYDIUM_FEE_COLLECTOR =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5")
    : new PublicKey("3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR");

export const RAYDIUM_AMM_V4 =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? MAINNET_PROGRAM_ID.AmmV4
    : DEVNET_PROGRAM_ID.AmmV4;

export const OPENBOOK_MARKET_PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? MAINNET_PROGRAM_ID.OPENBOOK_MARKET
    : DEVNET_PROGRAM_ID.OPENBOOK_MARKET;
