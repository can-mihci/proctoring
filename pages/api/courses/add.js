// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const courses = db.collection("courses");
    if (req.method === "POST") {
      const result = await courses.insertOne(req.body);
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
