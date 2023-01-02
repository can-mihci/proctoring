// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import {ObjectId} from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const halls = db.collection("halls");
    if (req.method === "DELETE") {
      const { hallId } = req.query;
      console.log(hallId);
      const result = await halls.deleteOne({_id : ObjectId(hallId)});
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
