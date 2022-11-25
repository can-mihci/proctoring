// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const instructors = db.collection("instructors");
    if (req.method === "PUT") {
      const { instructorId, name, lastname } = req.query;
      const filter = { _id: ObjectId(instructorId) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          firstName: name,
          lastName: lastname
        }
      };
      const result = await instructors.updateOne(filter, updateDoc, options);
      console.log(result);
      res.status(200).json({ result: "result" });
    }
  } catch (e) {
    console.error(e);
  }
}
