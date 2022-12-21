import { useRef, useState } from "react";
import readXlsxFile from "read-excel-file";
import CustomDataTable from "../../components/data-table";

export default function Courses() {
  const inputRef = useRef(null);
  const [incomingCourses, setIncomingCourses] = useState([]);

  function handleChange() {
    const excelFile = inputRef.current.files[0];
    readXlsxFile(excelFile).then((rows) => {
      console.table(rows);
      rows.shift();
      const stagedCourses = rows.map((row) => {
        return {
          year: row[0],
          semester: row[1].split("-")[0],
          departmentName: row[2],
          courseCode: row[3],
          courseType: row[4],
          courseName: row[5],
          courseYear: row[6].split("-")[0],
          instTitle: row[7],
          instFirstName: row[8],
          instLastName: row[9],
          registeredStudents: row[10],
        };
      });
      setIncomingCourses(stagedCourses);
    });
  }

    const columns = [
    {
      name: "Yıl",
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: "Yarıyıl",
      selector: (row) => row.semester === 1 ? "Güz" : "Bahar",
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
      selector: (row) => row.courseYear,
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

  return (
    <div>
      <input type="file" id="input" ref={inputRef} onChange={handleChange} />
      <CustomDataTable columns={columns} data={incomingCourses} />
    </div>
  );
}
