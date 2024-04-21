import axios from "axios";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(403).json({ message: "Method not allowed!" });
  }
  const { id } = req.query;
  const storageRef = ref(getStorage(), id as string);
  const url = await getDownloadURL(storageRef);
  const { data } = await axios.get(url, {
    responseType: "stream",
  });
  res.setHeader("content-type", `image/png`);
  data.pipe(res);
}
