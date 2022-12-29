import { useRef, useState } from "react";
import readXlsxFile from "read-excel-file";
import CustomDataTable from "../../components/data-table";
import Axios from "axios";
import { ConvertTitle } from "../../helpers/helpers";
import Navbar from "../../components/navbar";

export default function Courses() {
  const inputRef = useRef(null);
  const [incomingCourses, setIncomingCourses] = useState([]);

  function handleChange() {
    const excelFile = inputRef.current.files[0];
    readXlsxFile(excelFile).then((rows) => {
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
      console.table(stagedCourses);

      // begin operation for entering courses to the database

      async function prepareReport() {
        const report = await Promise.all(
          stagedCourses.map(async (entry, index) => {
            console.log(entry)
            if (entry.courseCode) {
              const response = await Axios.get("/api/courses/find", {
                params: { courseCode: entry.courseCode, year: entry.year },
              });
              console.log(`Searching for ${entry.courseCode}`);
              const { result } = response.data;
              if (result.length > 0) {
                // bu ders kodlu bir ders veritabanında mevcutsa
                return {
                  ...entry,
                  status: "Hata",
                  message: `${entry.year} yılı için ${entry.courseCode} kodlu bir ders veritabanında zaten var! (Bkz. ${index + 2} numaralı satır)`,
                };
              } else {
                if (
                  !entry.instFirstName ||
                  !entry.instLastName ||
                  !entry.instTitle
                ) {
                  return {
                    ...entry,
                    status: "Hata",
                    message: `${index + 2} numaralı satırdaki ${entry.courseCode} kodlu dersin öğretim elemanında isim, soy isim veya unvan bilgilerinden en az biri eksik!`,
                  };
                } else {
                  if (
                    !(
                      entry.instTitle === "ProfDr" ||
                      entry.instTitle === "DocDr" ||
                      entry.instTitle === "DrOgrtUy" ||
                      entry.instTitle === "ArsGor" ||
                      entry.instTitle === "ArsGorDr" ||
                      entry.instTitle === "OgrGor" ||
                      entry.instTitle === "OgrGorDr"
                    )
                  ) {
                    return {
                      ...entry,
                      status: "Hata",
                      message: `${index + 2} numaralı satırdaki ${entry.courseCode} kodlu dersin öğretim elemanı unvanında hata. Unvan yalnızca şunlardan biri olabilir: ProfDr, DocDr, DrOgrtUy, ArsGor, ArsGorDr, OgrGor, OgrGorDr`,
                    };
                  } else {
                    if (!entry.courseName) {
                      return {
                        ...entry,
                        status: "Hata",
                        message: `${index + 2} numaralı satırdaki ${entry.courseCode} kodlu dersin ismi girilmemiş`,
                      };
                    } else {
                      const success_object = {
                        ...entry,
                        status: "Başarılı",
                        message: `${entry.year} yılı ${
                          entry.semester === 1 ? "güz" : "bahar"
                        } dönemi, ${ConvertTitle(entry.instTitle)} ${
                          entry.instFirstName
                        } ${entry.instLastName} adlı öğretim elemanına ait ${
                          entry.courseCode
                        } kodlu ${entry.courseName} adlı ders eklenmeye hazır`,
                      };
                      const instructor_search = await Axios.get("/api/instructors/find", {
                        params: { firstName: entry.instFirstName.toLocaleUpperCase("tr-TR"), lastName: entry.instLastName.toLocaleUpperCase("tr-TR") },
                      })
                      const existing_instructor = instructor_search.data.result
                      
                      if (existing_instructor.length === 0){
                        success_object.message = success_object.message + " Ancak bu isimli bir öğretim elemanı bulunamadı, kaydı sıfırdan oluşturuldu..."
                        const adding_instructor = await Axios.post("/api/instructors/add", {
                          firstName: entry.instFirstName.toLocaleUpperCase("tr-TR"),
                          lastName: entry.instLastName.toLocaleUpperCase("tr-TR"),
                          title: entry.instTitle
                        })
                        const {result} = adding_instructor.data;
                        console.log(result);
                      }
                      return success_object
                    }
                  }
                }
              }
            } else {
              // bu dersin ders kodu girilmemişse
              return {
                ...entry,
                status: "Hata",
                message: `${index + 2} numaralı satırdaki ${entry.courseName ? entry.courseName + " adlı" : ""}  ders için ders kodu girilmemiş!`,
              };
            }
          })
        );
        console.table(report);
        setIncomingCourses(report);
      }
      prepareReport();
    });
  }

  const columns = [
    {
      name: "Durum",
      selector: (row) => row.status,
      sortable: true,
      width: "100px",
    },
    {
      name: "Mesaj",
      selector: (row) => row.message,
      sortable: true,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => row.status === "Hata",
      style: {
        color: "red",
      },
    },
  ];

  return (
    <>
    <Navbar/>
    <div style={{margin: "50px"}}>
      <input type="file" id="input" ref={inputRef} onChange={handleChange} />
      <CustomDataTable
        columns={columns}
        data={incomingCourses}
        conditionalRowStyles={conditionalRowStyles}
        selectableRows={false}
      />
    </div>
    </>
  );
}
