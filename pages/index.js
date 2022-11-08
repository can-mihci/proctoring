/* import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css"; */
import { useForm } from "react-hook-form";
import Axios from "axios";
import { useState, useEffect } from "react";
/* import useSWR, { useSWRConfig }  from "swr"; */

/* const fetcher = (...args) => Axios.get(...args).then(res => res.data) */

export default function Home() {
  /*   const { mutate } = useSWRConfig()
  const { data, error } = useSWR("/api/instructor", fetcher); */

  const [instructors, setInstructors] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Axios.get("/api/instructor").then(({ data }) => {
      console.log(data.result);
      setInstructors(data.result);
      setLoading(false);
    });
  }, []);

  const { register, handleSubmit } = useForm();
  const onSubmit = (submitData) => {
    Axios.post("/api/instructor", submitData)
      .then((response) => {
        const {result} = response.data;
        console.log(result)
        if (result.acknowledged) {
          console.log(submitData);
          setInstructors([...instructors, {...submitData, "_id": result.insertedId}]);
        }
      })
      .catch((error) => console.log(error));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Project Started</h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Adı:
            <input {...register("firstName")} />
          </label>
          <label>
            Soyadı:
            <input {...register("lastName")} />
          </label>
          <input type="submit" value="Kaydet" />
        </form>
      </div>
      <div>
        {instructors &&
          instructors.map((instructor) => {
            return (
              <div key={instructor._id}>
                {instructor.firstName} {instructor.lastName}{" "}
              </div>
            );
          })}
      </div>
    </div>
  );
}
