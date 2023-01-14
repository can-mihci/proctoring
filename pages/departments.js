import styles from "../styles/Department.module.css";
import CustomDataTable from "../components/data-table";
import { Oval } from "react-loader-spinner";

import Axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/navbar";

export default function Instructors() {
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoadingDepartments, setLoadingDepartments] = useState(false);
  const [isLoadingInstructors, setLoadingInstructors] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    setLoadingDepartments(true);
    Axios.get("/api/departments").then(({ data }) => {
      const response = data.result.map((item) => {
        return { label: item.departmentName, id: item._id };
      });
      console.log(response);
      setDepartments(response);
      setLoadingDepartments(false);
      console.log(departments);
      Axios.get("/api/instructors").then((instructors_response) => {
        console.log(instructors_response.data.result);
        setInstructors(instructors_response.data.result);
        setLoadingInstructors(false);
      });
    });
  }, []);

  function submitDepartment(department_) {
    const { departmentName } = department_;
    if (editMode) {
      if (departmentName && editingEntryId) {
        Axios.put(
          `/api/departments/edit/${editingEntryId}?name=${departmentName
            .trim()
            .toLocaleUpperCase("tr-TR")}`
        ).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            const filtered_departments = departments.filter(
              (department) => department.id !== editingEntryId
            );
            filtered_departments.push({
              id: editingEntryId,
              label: departmentName.trim().toLocaleUpperCase("tr-TR"),
            });
            console.log("börek");
            console.log(filtered_departments);
            setDepartments(filtered_departments);
          }
          reset();
        });
      } else {
        console.log("can't submit empty");
      }
    } else {
      if (departmentName) {
        Axios.post("/api/departments/add", {
          departmentName: departmentName.trim().toLocaleUpperCase("tr-TR"),
        }).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            setDepartments([
              ...departments,
              {
                label: departmentName.trim().toLocaleUpperCase("tr-TR"),
                id: result.insertedId,
              },
            ]);
          }
          reset();
        });
      } else {
        console.log("can't submit empty");
      }
    }
  }

  let columns = [
    {
      name: "Adı",
      selector: (row) => row.label,
      sortable: true,
      grow: 10
    },
    {
      name: "Prof.Dr.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Prof.Dr.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Doç.Dr.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Doç.Dr.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Dr.Öğr.Üyesi",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Dr.Öğr.Üyesi")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Araş.Gör.Dr.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Araş.Gör.Dr.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Araş.Gör.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Araş.Gör.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Öğr.Gör.Dr.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Öğr.Gör.Dr.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    },
    {
      name: "Öğr.Gör.",
      selector: (row) => {
        const total = instructors.filter(instructor => instructor.departmentId === row.id);
        const number = total.length > 0 ? (total.filter(instructor => instructor.title === "Öğr.Gör.")).length : 0
        return number;
      },
      sortable: true,
      center: true
    }
  ];


  function ClearForm() {
    setEditMode(false);
    setEditingEntryId("");
    reset();
  }

  function handleSelect({ selectedRows }) {
    if (selectedRows[0]) {
      setEditMode(true);
      setEditingEntryId(selectedRows[0].id);
      setValue(
        "hallName",
        selectedRows[0].label.trim().toLocaleUpperCase("tr-TR")
      );
    } else {
      ClearForm();
    }
  }

  function handleDelete() {
    console.log(editingEntryId);
    Axios.delete(`/api/departments/remove/${editingEntryId}`)
      .then((response) => {
        const { result } = response.data;
        console.log(result);
        if (result.deletedCount === 1) {
          console.log("deleted");
          const filteredDepartments = departments.filter(
            (department) => department.id !== editingEntryId
          );
          setDepartments(filteredDepartments);
          ClearForm();
        }
      })
      .catch((error) => console.log(error));
  }

  function rowDisabledCriteria(row) {
    return editMode && editingEntryId !== row.id;
  }

  return (
    <>
      <Navbar />

      {isLoadingDepartments || isLoadingInstructors ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Oval
            height="80"
            width="80"
            radius="9"
            color="green"
            ariaLabel="three-dots-loading"
          />
        </div>
      ) : (
        <div>
          <form
            className={styles["form-main"]}
            onSubmit={handleSubmit(submitDepartment)}
          >
            <div className={styles["form-body"]}>
              <label htmlFor="department-name-input">Bölüm Adı</label>
              <input
                {...register("departmentName")}
                placeholder="Adı"
                title="department-name-input"
              />
            </div>
            <div className={styles["form-button-area"]}>
              <input
                className={styles["form-button"]}
                style={{ flex: 1 }}
                type="submit"
                value={editMode ? "Düzenle" : "Yeni Ekle"}
              />
              {editMode ? (
                <button
                  onClick={handleDelete}
                  type="button"
                  style={{ flex: 1 }}
                  className={styles["form-button-right"]}
                >
                  Sil
                </button>
              ) : (
                ""
              )}
            </div>
          </form>
          <div className={styles["data-table-container"]}>
            <CustomDataTable
              columns={columns}
              data={departments}
              progressPending={isLoadingDepartments || isLoadingInstructors}
              onSelectedRowsChange={handleSelect}
              selectableRowDisabled={rowDisabledCriteria}
              selectableRows
            />
          </div>
        </div>
      )}
    </>
  );
}
