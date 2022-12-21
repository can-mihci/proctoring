import styles from "../styles/Instructor.module.css";
import CustomDataTable from "../components/data-table";

import Axios from "axios";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { clear } from "dom-helpers";
import {ConvertTitle, titleOptions} from "../helpers/helpers";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState("");
  const [isLoadingInstructors, setLoadingInstructors] = useState(true);
  const [isLoadingDepartments, setLoadingDepartments] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    console.log("loading");
    Axios.get("/api/departments").then((departments_response) => {
      const departments_list = departments_response.data.result.map((item) => {
        return { label: item.departmentName, id: item._id };
      });
      console.log(departments_list);
      setDepartments(departments_list);
      setLoadingDepartments(false);
      Axios.get("/api/instructors").then((instructors_response) => {
        console.log(instructors_response.data.result);
        setInstructors(instructors_response.data.result);
        setLoadingInstructors(false);
        setTableData(
          instructors_response.data.result.map((ins) => {
            const filtered_department = departments_list.filter(
              (dept) => dept.id === ins.departmentId
            );
            const departmentName =
              filtered_department.length > 0
                ? filtered_department[0].label
                : "";
            return {
              ...ins,
              titleLabel: ConvertTitle(ins.title),
              department: departmentName.toLocaleUpperCase("tr-TR"),
            };
          })
        );
      });
    });
  }, []);

  function ClearForm() {
    setEditMode(false);
    setEditingEntryId("");
    reset();
  }

  function submitNewInstructor(_instructor) {
    const { departmentId, title, firstName, lastName } = _instructor;
    if (departmentId && title && firstName && lastName) {
      if (editMode && editingEntryId) {
        Axios.put(
          `/api/instructors/edit/${editingEntryId}?name=${firstName
            .trim()
            .toLocaleUpperCase("tr-TR")}&lastname=${lastName
            .trim()
            .toLocaleUpperCase(
              "tr-TR"
            )}&title=${title}&departmentId=${departmentId}`
        ).then((response) => {
          console.log(response)
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            const filtered_instructors = instructors.filter(
              (ins) => ins._id !== editingEntryId
            );
            const filtered_tableData = tableData.filter(
              (ins) => ins._id !== editingEntryId
            );
            filtered_instructors.push({
              _id: editingEntryId,
              firstName: firstName.trim().toLocaleUpperCase("tr-TR"),
              lastName: lastName.trim().toLocaleUpperCase("tr-TR"),
              title,
              departmentId,
            });
            setInstructors(filtered_instructors);
            setTableData([
              ...filtered_tableData,
              {
                firstName: firstName.trim().toLocaleUpperCase("tr-TR"),
                lastName: lastName.trim().toLocaleUpperCase("tr-TR"),
                title,
                departmentId,
                _id: editingEntryId,
                titleLabel: ConvertTitle(title),
                department:
                  departments.length > 0
                    ? departments
                        .filter((dept) => dept.id === departmentId)[0]
                        .label.trim()
                        .toLocaleUpperCase("tr-TR")
                    : "",
              },
            ]);
          }
          reset();
          ClearForm();
        });
      } else {
        Axios.post("/api/instructors/add", {
          ..._instructor,
          firstName: firstName.toLocaleUpperCase("tr-TR"),
          lastName: lastName.toLocaleUpperCase("tr-TR"),
        }).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            setInstructors([
              ...instructors,
              {
                departmentId,
                title,
                firstName: firstName.trim().toLocaleUpperCase("tr-TR"),
                lastName: lastName.trim().toLocaleUpperCase("tr-TR"),
                _id: result.insertedId,
              },
            ]);
            setTableData([
              ...tableData,
              {
                departmentId,
                title,
                firstName: firstName.trim().toLocaleUpperCase("tr-TR"),
                lastName: lastName.trim().toLocaleUpperCase("tr-TR"),
                _id: result.insertedId,
                titleLabel: ConvertTitle(title),
                department:
                  departments.length > 0
                    ? departments
                        .filter((dept) => dept.id === departmentId)[0]
                        .label.trim()
                        .toLocaleUpperCase("tr-TR")
                    : "",
              },
            ]);
          }
        });
      }
      reset();
    } else {
      console.log("can't submit empty");
    }
  }

  function rowDisabledCriteria(row) {
    return editMode && editingEntryId !== row._id;
  }

  function handleSelect({ selectedRows }) {
    const selection = selectedRows.length > 0 ? selectedRows[0] : "";
    if (selection) {
      console.table(selection);
      setEditMode(true);
      setEditingEntryId(selection._id);
      setValue("departmentId", selection.departmentId);
      setValue("title", selection.title);
      setValue("firstName", selection.firstName);
      setValue("lastName", selection.lastName);
    } else {
      ClearForm();
      setEditMode(false);
      setEditingEntryId("");
    }
  }

  function handleDelete() {
    console.log(editingEntryId);
    Axios.delete(`/api/instructors/remove/${editingEntryId}`)
      .then((response) => {
        const { result } = response.data;
        console.log(result);
        if (result.deletedCount === 1) {
          console.log("deleted");
          const filtered_instructors = instructors.filter(
            (instructor) => instructor._id !== editingEntryId
          );
          const filtered_tableData = tableData.filter(
            (row) => row._id !== editingEntryId
          );
          setInstructors(filtered_instructors);
          setTableData(filtered_tableData);
          ClearForm();
        }
      })
      .catch((error) => console.log(error));
  }

  const columns = [
    {
      name: "ABD",
      selector: (row) => row.department,
      sortable: true,
    },
    {
      name: "Unvan",
      selector: (row) => row.titleLabel,
      sortable: true,
    },
    {
      name: "Adı",
      selector: (row) => row.firstName,
      sortable: true,
    },
    {
      name: "Soyadı",
      selector: (row) => row.lastName,
      sortable: true,
    },
  ];

  return (
    <div>
      <form
        className={styles["form-main"]}
        onSubmit={handleSubmit(submitNewInstructor)}
      >
        <div className={styles["form-body"]}>
          <label htmlFor="department-select">Anabilim Dalı</label>
          <select {...register("departmentId")} id="department-select">
            <option value="">Seçiniz...</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.label}
              </option>
            ))}
          </select>
          <label htmlFor="title-select">Unvan</label>
          <select {...register("title")} id="title-select">
            <option value="">Seçiniz...</option>
            {titleOptions.map((title) => (
              <option key={title.id} value={title.id}>
                {title.label}
              </option>
            ))}
          </select>
          <label htmlFor="first-name-input">Adı</label>
          <input
            {...register("firstName")}
            placeholder="Adı"
            title="first-name-input"
          />
          <label htmlFor="last-name-input">Soyadı</label>
          <input
            {...register("lastName")}
            placeholder="Soyadı"
            title="last-name-input"
          />
        </div>
        <div className={styles["form-button-area"]}>
          <input
            style={{ flex: 1 }}
            type="submit"
            value={editMode ? "Düzenle" : "Yeni Ekle"}
          />
          {editMode ? (
            <button
              onClick={handleDelete}
              type="button"
              style={{ margin: "5px" }}
              className={styles["form-button-right"]}
              style={{ flex: 1 }}
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
          data={tableData}
          progressPending={isLoadingDepartments || isLoadingInstructors}
          onSelectedRowsChange={handleSelect}
          selectableRowDisabled={rowDisabledCriteria}
        />
      </div>
    </div>
  );
}
