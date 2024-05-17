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
    ? new PublicKey("DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8")
    : new PublicKey("G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2");

export const RAYDIUM_CPMM =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C")
    : new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW");

export const RAYDIUM_AMM_CONFIG =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? new PublicKey("D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2")
    : new PublicKey("9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6");

export const OPENBOOK_MARKET_PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? MAINNET_PROGRAM_ID.OPENBOOK_MARKET
    : DEVNET_PROGRAM_ID.OPENBOOK_MARKET;

export const LOOKUP_TABLE =
  process.env.NEXT_PUBLIC_PROJECT_ENVIRONMENT == "prod"
    ? LOOKUP_TABLE_CACHE
    : undefined;

export const DOMAIN_API_URL = "https://www.memestarter.app/api";
