// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const departments = db.collection("departments");
    if (req.method === "PUT") {
      const { departmentId, name } = req.query;
      const filter = { _id: ObjectId(departmentId) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          departmentName: name,
        }
      };
      const result = await departments.updateOne(filter, updateDoc, options);
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
