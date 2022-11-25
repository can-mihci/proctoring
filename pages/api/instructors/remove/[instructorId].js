// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import {ObjectId} from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const instructors = db.collection("instructors");
    if (req.method === "DELETE") {
      const { instructorId } = req.query;
      console.log(instructorId);
      const result = await instructors.deleteOne({_id : ObjectId(instructorId)});
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
