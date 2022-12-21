// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import {ObjectId} from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const departments = db.collection("departments");
    if (req.method === "DELETE") {
      const { departmentId } = req.query;
      console.log(departmentId);
      const result = await departments.deleteOne({_id : ObjectId(departmentId)});
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
