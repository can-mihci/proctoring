// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const departments = db.collection("departments");
    if (req.method === "GET") {
      const cursor = departments.find({});
      const result = (await cursor.toArray());
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
