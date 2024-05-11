import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(403).json({ message: "Method not allowed!" });
  }
  const { id } = req.query;
  const url = `https://firebasestorage.googleapis.com/v0/b/memestarter-ca939.appspot.com/o/${id}?alt=media`;
  console.log(url);
  const { data } = await axios.get(url, {
    responseType: "stream",
  });
  res.setHeader("content-type", `image/png`);
  data.pipe(res);
}
