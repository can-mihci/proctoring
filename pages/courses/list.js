import styles from "../../styles/Course.module.css";
import CustomDataTable from "../../components/data-table";
import { Oval } from "react-loader-spinner";

import Axios from "axios";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { clear } from "dom-helpers";
import { ConvertTitle, titleOptions } from "../../helpers/helpers";
import Navbar from "../../components/navbar";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState("");
  const [isLoadingInstructors, setLoadingInstructors] = useState(true);
  const [isLoadingDepartments, setLoadingDepartments] = useState(true);
  const [isLoadingCourses, setLoadingCourses] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    console.log("loading");
    Axios.get("/api/departments").then((departments_response) => {
      const departments_list = departments_response.data.result.map((item) => {
        return { label: item.departmentName, id: item._id };
      });
      setDepartments(departments_list);
      setLoadingDepartments(false);
      Axios.get("/api/instructors").then((instructors_response) => {
        let tempInstructors = instructors_response.data.result;
        setInstructors(tempInstructors);
        setLoadingInstructors(false);
        Axios.get("/api/courses").then((courses_response) => {
          setLoadingCourses(false);
          let tempCourses = courses_response.data.result;
          setCourses(tempCourses);
          const staged_table_data = tempCourses.map((course) => {
            let current_instructor = tempInstructors.filter(
              (tempInst) => tempInst._id === course.instructorId
            );
            let staged_instructor = current_instructor[0]
              ? current_instructor[0]
              : null;
            let current_department = departments_list.filter(
              (tempDept) => tempDept.id === course.departmentId
            );
            let staged_department = current_department[0]
              ? current_department[0]
              : null;
            return {
              year: course.year,
              semester: course.semester,
              departmentName: staged_department ? staged_department.label : "",
              courseCode: course.courseCode,
              courseType: course.courseType,
              courseName: course.courseName,
              level: course.level,
              instTitle: staged_instructor
                ? ConvertTitle(staged_instructor.title)
                : "",
              instFirstName: staged_instructor
                ? staged_instructor.firstName
                : "",
              instLastName: staged_instructor ? staged_instructor.lastName : "",
              registeredStudents: course.registeredStudents,
              _id: course._id,
            };
          });
          setTableData(staged_table_data);
        });
      });
    });
  }, []);

  function ClearForm() {
    setEditMode(false);
    setEditingEntryId("");
    reset();
  }

  function submitNewCourse(_course) {
    console.log(_course);
    const {
      year,
      level,
      semester,
      departmentId,
      courseCode,
      courseType,
      courseName,
      instructorId,
      registeredStudents,
    } = _course;
    if (
      year &&
      level &&
      semester &&
      departmentId &&
      courseCode &&
      courseType &&
      courseName &&
      instructorId &&
      registeredStudents
    ) {
      console.log(editMode, editingEntryId);
      if (editMode && editingEntryId) {
        Axios.put(
          `/api/courses/edit/${editingEntryId}?courseName=${courseName
            .trim()
            .toLocaleUpperCase("tr-TR")}&courseCode=${courseCode
            .trim()
            .toLocaleUpperCase(
              "tr-TR"
            )}&year=${year}&departmentId=${departmentId}&instructorId=${instructorId}&semester=${semester}&level=${level}&courseType=${courseType}&registeredStudents=${registeredStudents}`
        ).then((response) => {
          console.log(response);
          if (true) {
            const filtered_courses = courses.filter(
              (course) => course._id !== editingEntryId
            );
            setCourses([
              ...filtered_courses,
              {
                year,
                level,
                semester,
                departmentId,
                courseType,
                courseCode: courseCode.trim().toLocaleUpperCase("tr-TR"),
                courseName: courseName.trim().toLocaleUpperCase("tr-TR"),
                instructorId,
                registeredStudents,
                _id: editingEntryId,
              },
            ]);
            console.log(tableData);
            const filtered_tableData = tableData.filter((course) => {
              return course._id !== editingEntryId;
            });
            console.log(filtered_tableData);
            setTableData([
              ...filtered_tableData,
              {
                year,
                level,
                semester,
                departmentId,
                courseType,
                courseCode: courseCode.trim().toLocaleUpperCase("tr-TR"),
                courseName: courseName.trim().toLocaleUpperCase("tr-TR"),
                instructorId,
                registeredStudents,
                _id: editingEntryId,
                instFirstName: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.firstName)
                    return staged_instructor.firstName;
                  return "";
                })(),
                instLastName: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.lastName)
                    return staged_instructor.lastName;
                  return "";
                })(),
                instTitle: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.title)
                    return ConvertTitle(staged_instructor.title);
                  return "";
                })(),
                departmentName: (function () {
                  let select_department = departments.filter(
                    (dept) => dept.id === departmentId
                  );
                  let staged_department = select_department[0]
                    ? select_department[0]
                    : null;
                  if (staged_department.label) return staged_department.label;
                  return "";
                })(),
              },
            ]);
          }
          reset();
          ClearForm();
        });
      } else if (!editMode) {
        console.log("adding...");
        Axios.post("/api/courses/add", {
          ..._course,
          courseCode: courseCode.trim().toLocaleUpperCase("tr-TR"),
          courseName: courseName.trim().toLocaleUpperCase("tr-TR"),
        }).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            setCourses([
              ...courses,
              {
                year,
                level,
                semester,
                departmentId,
                courseType,
                courseCode: courseCode.trim().toLocaleUpperCase("tr-TR"),
                courseName: courseName.trim().toLocaleUpperCase("tr-TR"),
                instructorId,
                registeredStudents,
                _id: result.insertedId,
              },
            ]);
            setTableData([
              ...tableData,
              {
                year,
                level,
                semester,
                departmentId,
                courseType,
                courseCode: courseCode.trim().toLocaleUpperCase("tr-TR"),
                courseName: courseName.trim().toLocaleUpperCase("tr-TR"),
                instructorId,
                registeredStudents,
                _id: result.insertedId,
                instFirstName: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.firstName)
                    return staged_instructor.firstName;
                  return "";
                })(),
                instLastName: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.lastName)
                    return staged_instructor.lastName;
                  return "";
                })(),
                instTitle: (function () {
                  let select_instructor = instructors.filter(
                    (ins) => ins._id === instructorId
                  );
                  let staged_instructor = select_instructor[0]
                    ? select_instructor[0]
                    : null;
                  if (staged_instructor.title)
                    return ConvertTitle(staged_instructor.title);
                  return "";
                })(),
                departmentName: (function () {
                  let select_department = departments.filter(
                    (dept) => dept.id === departmentId
                  );
                  let staged_department = select_department[0]
                    ? select_department[0]
                    : null;
                  if (staged_department.label) return staged_department.label;
                  return "";
                })(),
              },
            ]);
          }
        });
      } else {
        alert("error, editingEntryId not working");
      }
      reset();
    } else {
      console.log(
        year,
        level,
        semester,
        departmentId,
        courseCode,
        courseType,
        courseName,
        instructorId,
        registeredStudents
      );
      alert("can't submit empty");
    }
  }

  function rowDisabledCriteria(row) {
    let selected_course = courses.filter(
      (course) => course._id === editingEntryId
    );
    if (selected_course[0])
      return editMode && selected_course[0].courseCode !== row.courseCode;
  }

  function handleSelect({ selectedRows }) {
    const selection = selectedRows.length > 0 ? selectedRows[0] : "";
    if (selection) {
      setEditMode(true);
      setEditingEntryId(selection._id);
      setValue("year", selection.year);
      setValue("semester", selection.semester);
      setValue("level", selection.level);
      setValue("courseCode", selection.courseCode);
      setValue("courseType", selection.courseType);
      setValue("courseName", selection.courseName);
      setValue("registeredStudents", selection.registeredStudents);
      let editing_department = departments.filter(
        (dept) => dept.label === selection.departmentName
      );
      if (editing_department[0]) {
        setValue("departmentId", editing_department[0].id);
      }
      let editing_instructor = instructors
        .filter((inst) => inst.firstName === selection.instFirstName)
        .filter((inst) => inst.lastName === selection.instLastName);
      if (editing_instructor[0]) {
        setValue("instructorId", editing_instructor[0]._id);
      }
      let editing_course = courses.filter(
        (course) => course.courseCode === selection.courseCode
      );
      if (editing_course[0]) {
        setEditingEntryId(editing_course[0]._id);
      }
    } else {
      ClearForm();
      setEditMode(false);
      setEditingEntryId("");
    }
  }

  function handleDelete() {
    console.log(editingEntryId);
    Axios.delete(`/api/courses/remove/${editingEntryId}`)
      .then((response) => {
        const { result } = response.data;
        console.log(result);
        if (result.deletedCount === 1) {
          console.log("deleted");
          const filtered_courses = courses.filter(
            (course) => course._id !== editingEntryId
          );
          const filtered_tableData = tableData.filter(
            (row) => row._id !== editingEntryId
          );
          setInstructors(filtered_courses);
          setTableData(filtered_tableData);
          ClearForm();
        }
      })
      .catch((error) => console.log(error));
  }

  const columns = [
    {
      name: "Yıl",
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: "Yarıyıl",
      selector: (row) => (row.semester === "1" ? "Güz" : "Bahar"),
      sortable: true,
    },
    {
      name: "ABD",
      selector: (row) => row.departmentName,
      sortable: true,
    },
    {
      name: "Ders Kodu",
      selector: (row) => row.courseCode,
      sortable: true,
    },
    {
      name: "Ders Tipi",
      selector: (row) => row.courseType,
      sortable: true,
    },
    {
      name: "Ders Adı",
      selector: (row) => row.courseName,
      sortable: true,
    },
    {
      name: "Sınıf",
      selector: (row) => row.level,
      sortable: true,
    },
    {
      name: "Hoca Unvan",
      selector: (row) => row.instTitle,
      sortable: true,
    },
    {
      name: "Hoca İsim",
      selector: (row) => row.instFirstName,
      sortable: true,
    },
    {
      name: "Hoca Soyisim",
      selector: (row) => row.instLastName,
      sortable: true,
    },
    {
      name: "Kayıtlı Öğrenci",
      selector: (row) => row.registeredStudents,
      sortable: true,
    },
  ];

  const listYears = [];
  for (let i = 2022; i < 2040; i++) {
    listYears.push(i);
  }
  return (
    <>
      <Navbar />

      {isLoadingInstructors || isLoadingDepartments ? (
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
            onSubmit={handleSubmit(submitNewCourse)}
          >
            <div className={styles["form-body"]}>
              <label htmlFor="year-select">Yıl</label>
              <select {...register("year")} id="year-select">
                <option value="">Seçiniz...</option>
                {listYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <label htmlFor="semester-select">Yarıyıl</label>
              <select {...register("semester")} id="semester-select">
                <option value="">Seçiniz...</option>
                {["1", "2"].map((semester) => (
                  <option key={semester} value={semester}>
                    {semester === "1" ? "Güz" : "Bahar"}
                  </option>
                ))}
              </select>
              <label htmlFor="level-select">Sınıf</label>
              <select {...register("level")} id="level-select">
                <option value="">Seçiniz...</option>
                {["1", "2", "3", "4"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <label htmlFor="department-select">Anabilim Dalı</label>
              <select {...register("departmentId")} id="department-select">
                <option value="">Seçiniz...</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.label}
                  </option>
                ))}
              </select>
              <label htmlFor="course-code-input">Ders Kodu</label>
              <input
                {...register("courseCode")}
                placeholder="Ders Kodu"
                title="Ders Kodu"
              />
              <label htmlFor="course-type-select">Ders Tipi</label>
              <select {...register("courseType")} id="course-type-select">
                <option value="">Seçiniz...</option>
                {["Zorunlu", "Seçmeli", "YÖK"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label htmlFor="course-name-input">Ders Adı</label>
              <input
                {...register("courseName")}
                placeholder="Ders Adı"
                title="Ders Adı"
              />
              <label htmlFor="instructor-select">Öğretim Elemanı</label>
              <select {...register("instructorId")} id="instructor-select">
                <option value="">Seçiniz...</option>
                {instructors.map((instructor) => {
                  return (
                    <option key={instructor._id} value={instructor._id}>
                      {`${ConvertTitle(instructor.title)} ${
                        instructor.firstName
                      } ${instructor.lastName}`}
                    </option>
                  );
                })}
              </select>
              <label htmlFor="registered-students-input">
                Kayıtlı Öğrenci Sayısı
              </label>
              <input
                {...register("registeredStudents")}
                placeholder="Kayıtlı Öğrenci Sayısı"
                title="Kayıtlı Öğrenci Sayısı"
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
              data={tableData}
              progressPending={isLoadingDepartments || isLoadingInstructors}
              onSelectedRowsChange={handleSelect}
              selectableRowDisabled={rowDisabledCriteria}
              selectableRows={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
