import {
  DEVNET_PROGRAM_ID,
  LOOKUP_TABLE_CACHE,
  MAINNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const HELIUS_ENDPOINT =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? `https://elisabet-a7bz68-fast-mainnet.helius-rpc.com`
    : `https://corly-a4vtm7-fast-devnet.helius-rpc.com`;

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

export const LOOKUP_TABLE =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? LOOKUP_TABLE_CACHE
    : undefined;

export const DOMAIN_API_URL = "https://www.memestarter.app/api";
