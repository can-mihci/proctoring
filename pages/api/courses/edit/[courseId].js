// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    console.log("editing courses...");
    const client = await clientPromise;
    const db = client.db("project");
    const courses = db.collection("courses");
    if (req.method === "PUT") {
      console.log(req.query);
      const {
        courseName,
        courseCode,
        year,
        departmentId,
        instructorId,
        semester,
        level,
        courseType,
        registeredStudents,
        courseId,
      } = req.query;
      const filter = { _id: ObjectId(courseId) };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          courseName,
          courseCode,
          courseType,
          instructorId,
          departmentId,
          registeredStudents,
          year,
          semester,
          level,
        },
      };
      const result = await courses.updateOne(filter, updateDoc, options);
      console.log(result);
      res.status(200).json({result});
    }
  } catch (e) {
    console.error(e);
  }
}
