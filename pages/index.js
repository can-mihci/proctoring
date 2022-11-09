import styles from "../styles/Home.module.css";
import { useForm } from "react-hook-form";
import Axios from "axios";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [instructors, setInstructors] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [highlightedInstructor, setHighlightedInstructor] = useState({
    _id: "",
    firstName: "",
    lastName: "",
  });

  const firstNameRef = useRef("");
  const lastNameRef = useRef("");

  useEffect(() => {
    setLoading(true);
    Axios.get("/api/instructor").then(({ data }) => {
      console.log(data.result);
      setInstructors(data.result);
      setLoading(false);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (editFirstName && editLastName) {
      const submitData = {
        firstName: editFirstName,
        lastName: editLastName,
      };
      Axios.post("/api/instructor", submitData)
        .then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            console.log(submitData);
            setInstructors([
              ...instructors,
              { ...submitData, _id: result.insertedId },
            ]);
          }
        })
        .catch((error) => console.log(error));
    } else {
      console.log("can't submit empty");
    }
  }

  function Instructor(props) {
    const { instructor } = props;
    return (
      <div
        className={`${instructor._id === highlight ? styles.highlight : ""} ${
          styles["instructor-row"]
        }`}
        onClick={props.clickHandler}
        data-id={instructor._id}
        data-firstname={instructor.firstName}
        data-lastname={instructor.lastName}
      >
        {instructor.firstName} {instructor.lastName}
      </div>
    );
  }

  function highlightInstructor(e) {
    console.log("clicky");
    const { id, firstname, lastname } = e.target.dataset;
    console.log(e.target);
    if (highlight === id) {
      setHighlight(null);
      setHighlightedInstructor({
        _id: "",
        firstName: "",
        lastName: "",
      });
      firstNameRef.current.value = "";
      lastNameRef.current.value = "";
      setEditFirstName("");
      setEditLastName("");
      setEditMode(false);
    } else {
      setHighlight(id);
      setHighlightedInstructor({
        _id: id,
        firstName: firstname,
        lastName: lastname,
      });
      setEditMode(true);
      firstNameRef.current.value = firstname;
      lastNameRef.current.value = lastname;
      setEditFirstName(firstNameRef.current.value);
      setEditLastName(lastNameRef.current.value);
    }
  }

  function handleFirstNameChange(e) {
    setEditFirstName(firstNameRef.current.value);
    console.log(editFirstName);
  }
  function handleLastNameChange(e) {
    setEditLastName(lastNameRef.current.value);
    console.log(editLastName);
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Project Started</h1>
      <div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Adı:</label>
          <input onChange={handleFirstNameChange} ref={firstNameRef} />
          <label>Soyadı:</label>
          <input onChange={handleLastNameChange} ref={lastNameRef} />
          <div></div>
          {editMode ? (
            <div className={styles["edit-buttons"]}>
              <button type="button"
                disabled={
                  highlightedInstructor.firstName === editFirstName &&
                  highlightedInstructor.lastName === editLastName
                }
              >
                Düzelt
              </button>
              <button type="button">Sil</button>
            </div>
          ) : (
            <input type="submit" value="Yeni Ekle" />
          )}
        </form>
      </div>
      <div>
        {instructors &&
          instructors.map((instructor) => {
            return (
              <Instructor
                instructor={instructor}
                key={instructor._id}
                clickHandler={highlightInstructor}
              />
            );
          })}
      </div>
    </div>
  );
}
