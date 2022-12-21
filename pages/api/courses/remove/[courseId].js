// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import {ObjectId} from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("project");
    const courses = db.collection("courses");
    if (req.method === "DELETE") {
      const { courseId } = req.query;
      console.log(courseId);
      const result = await courses.deleteOne({_id : ObjectId(courseId)});
      console.log(result);
      res.status(200).json({ result });
    }
  } catch (e) {
    console.error(e);
  }
}
