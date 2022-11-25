import styles from "../styles/Home.module.css";
import { Button, Container, Box, TextField, Autocomplete } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import Axios from "axios";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [instructors, setInstructors] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [highlightedInstructor, setHighlightedInstructor] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    title:""
  });

  const firstNameRef = useRef("");
  const lastNameRef = useRef("");
  const firstNameInputRef = useRef();
  const lastNameInputRef = useRef();
  const titleRef = useRef("");
  const autoCompleteRef = useRef("");

  useEffect(() => {
    setLoading(true);
    Axios.get("/api/instructors").then(({ data }) => {
      setInstructors(data.result);
      setLoading(false);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(firstNameRef);
    if (editFirstName && editLastName && editTitle) {
      const submitData = {
        firstName: editFirstName,
        lastName: editLastName,
        title: editTitle
      };
      Axios.post("/api/instructors/add", submitData)
        .then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            console.log(submitData);
            setInstructors([
              ...instructors,
              { ...submitData, _id: result.insertedId },
            ]);
            firstNameRef.current.value = "";
            lastNameRef.current.value = "";
            autoCompleteRef.current.value="";
            setEditFirstName("");
            setEditLastName("");
            setEditTitle("");
          }
        })
        .catch((error) => console.log(error));
    } else {
      console.log("can't submit empty");
    }
  }

  function handleDelete() {
    console.log(highlight);
    Axios.delete(`/api/instructors/remove/${highlight}`)
      .then((response) => {
        const { result } = response.data;
        console.log(result);
        if (result.deletedCount === 1) {
          console.log(`deleted ${highlight}`);
          firstNameRef.current.value = "";
          lastNameRef.current.value = "";
          titleRef.current.value = "";
          setEditFirstName("");
          setEditLastName("");
          setEditTitle("");
          setEditMode(false);
          setHighlight(null);
          const filteredInstructors = instructors.filter(
            (instructor) => instructor._id !== highlight
          );
          setInstructors(filteredInstructors);
        }
      })
      .catch((error) => console.log(error));
  }

  function handleEdit() {
    const selectedInstructor = instructors.filter(
      (instructor) => instructor._id === highlight
    )[0];
    console.log(selectedInstructor);
    console.log(editTitle, editFirstName, editLastName);
    Axios.put(
      `/api/instructors/edit/${highlight}?title=${editTitle}&name=${editFirstName}&lastname=${editLastName}`
    )
      .then((response) => {
        const filteredInstructors = instructors.filter(
          (instructor) => instructor._id !== highlight
        );
        filteredInstructors.push({
          _id: highlight,
          firstName: editFirstName,
          lastName: editLastName,
          title: editTitle
        });
        setInstructors(filteredInstructors);
        firstNameRef.current.value = "";
        lastNameRef.current.value = "";
        titleRef.current.value = "";
        setEditFirstName("");
        setEditLastName("");
        setEditTitle("");
        setEditMode(false);
        setHighlight(null);
      })
      .catch((error) => console.log(error));
  }


  function highlightInstructor(param) {
    console.log("clicky");
    console.log(param);
    const firstname = param.row.firstName;
    const lastname = param.row.lastName;
    const title = param.row.title;
    const id = param.row._id;
    console.log(title, firstname, lastname, id);
    if (highlight === id) {
      setHighlight(null);
      setHighlightedInstructor({
        _id: "",
        title: "",
        firstName: "",
        lastName: "",
      });
      firstNameRef.current.value = "";
      lastNameRef.current.value = "";
      autoCompleteRef.current.inputValue="";
      setEditFirstName("");
      setEditLastName("");
      setEditTitle("");
      setEditMode(false);
    } else {
      console.log("begin the journey")
      setHighlight(id);
      setHighlightedInstructor({
        _id: id,
        firstName: firstname,
        lastName: lastname,
        title: title
      });
      setEditMode(true);
      firstNameRef.current.value = firstname;
      lastNameRef.current.value = lastname;
      autoCompleteRef.current.inputValue=title;
      setEditFirstName(firstNameRef.current.value);
      setEditLastName(lastNameRef.current.value);
      setEditTitle(autoCompleteRef.current.inputValue);
    }
  }

  function handleFirstNameChange(e) {
    setEditFirstName(firstNameRef.current.value);
  }
  function handleLastNameChange(e) {
    setEditLastName(lastNameRef.current.value);
  }
  function handleAutoCompleteChange(event, value) {
    console.log("autocompletechanged")
    setEditTitle(value);
  }
  function handleAutoCompleteInputChange(event, value) {
    console.log("inputchanged")
    //setEditTitle(value);
  }

  const columns = [
    { field: "title", headerName: "Unvan", flex: 1 },
    { field: "firstName", headerName: "Adı", flex: 1 },
    { field: "lastName", headerName: "Soyadı", flex: 1 },
  ];

  function convertRowId(instructor) {
    return instructor._id;
  }

  const titleOptions = [
    "",
    "Arş. Gör",
    "Arş. Gör. Dr.",
    "Öğr. Gör.",
    "Öğr. Gör. Dr.",
    "Dr. Öğr. Üyesi",
    "Doç. Dr.",
    "Prof.Dr."
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          flex: 1,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <Autocomplete
            value={editTitle}
            disablePortal
            ref={autoCompleteRef}
            onChange={handleAutoCompleteChange}
            id="autocomplete-element"
            options={titleOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unvan"
                inputRef={titleRef}
                margin="normal"
                required
                fullWidth
                id="title"
                name="title"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <TextField
            ref={firstNameInputRef}
            label="Adı"
            onChange={handleFirstNameChange}
            inputRef={firstNameRef}
            margin="normal"
            required
            fullWidth
            id="firstName"
            name="firstName"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            ref={lastNameInputRef}
            label="Soyadı"
            onChange={handleLastNameChange}
            inputRef={lastNameRef}
            margin="normal"
            required
            fullWidth
            id="lastName"
            name="lastName"
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: "flex", mt: 2 }}>
            {editMode ? (
              <>
                <Button
                  sx={{ flex: 1, mr: 1 }}
                  variant="outlined"
                  type="button"
                  disabled={
                    highlightedInstructor.firstName === editFirstName &&
                    highlightedInstructor.lastName === editLastName
                  }
                  onClick={handleEdit}
                >
                  Düzelt
                </Button>
                <Button
                  sx={{ flex: 1, ml: 1 }}
                  variant="outlined"
                  type="button"
                  onClick={handleDelete}
                >
                  Sil
                </Button>
              </>
            ) : (
              <Button fullWidth variant="outlined" type="submit">
                Yeni Ekle
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ height: "80vh", width: "100%", flex: 1 }}>
        {instructors && (
          <DataGrid
            checkboxSelection={false}
            disableMultipleSelection={true}
            getRowId={convertRowId}
            rows={instructors}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            onRowClick={highlightInstructor}
            density="compact"
          />
        )}
      </Box>
    </Container>
  );
}
