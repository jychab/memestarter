import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {birdEyeApiKey} from "./utils";

interface GetPrice {
  address: string;
}

export default async function getPrice(
  data: GetPrice,
  context: CallableContext
): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  const options = {
    method: "GET",
    headers: {
      "x-chain": "solana",
      "X-API-KEY": birdEyeApiKey.value(),
    },
  };
  try {
    const response = await fetch(
      `https://public-api.birdeye.so/public/price?address=${data.address}`,
      options
    );
    return await response.json();
  } catch (error) {
    throw new HttpsError("internal", "Failed to grab price");
  }
}
