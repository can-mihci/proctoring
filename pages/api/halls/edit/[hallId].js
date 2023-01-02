// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const halls = db.collection("halls");
    if (req.method === "PUT") {
      const { hallId, name, hallLowCap, hallMaxCap } = req.query;
      const filter = { _id: ObjectId(hallId) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          hallName: name,
          hallLowCap,
          hallMaxCap
        }
      };
      const result = await halls.updateOne(filter, updateDoc, options);
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
