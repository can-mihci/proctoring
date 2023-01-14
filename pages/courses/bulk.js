import { useRef, useState } from "react";
import readXlsxFile from "read-excel-file";
import CustomDataTable from "../../components/data-table";
import Axios from "axios";
import { ConvertTitle } from "../../helpers/helpers";
import Navbar from "../../components/navbar";

export default function Courses() {
  const inputRef = useRef(null);
  const [incomingCourses, setIncomingCourses] = useState([]);
  const [errorState, setErrorState] = useState(false);

  function handleChange() {
    const excelFile = inputRef.current.files[0];
    readXlsxFile(excelFile).then((rows) => {
      rows.shift();
      const stagedCourses = rows.map((row) => {
        return {
          year: row[0],
          semester: row[1]
            ? row[1].split("-")[0]
            : (() => {
                alert(
                  "Excel dosyasındaki derslerden en az birinde öğretim dönemi (B sütunu) bilgisi girilmemiş"
                );
                return null;
              })(),
          departmentName: row[3],
          option: row[4],
          courseCode: row[10],
          courseName: row[11],
          courseYear: row[5],
          instTitle: row[13],
          instFirstName: (row[14] ? row[14].toLocaleUpperCase('tr-TR') : ""),
          instLastName: ((row[15] ? row[15].toLocaleUpperCase('tr-TR') : "") + (row[16] ? ` ${row[16].toLocaleUpperCase('tr-TR')}` : "")),
          registeredStudents: row[17],
        };
      });
      console.table(stagedCourses);

      // begin operation for entering courses to the database

      async function prepareReport() {
        let new_course_code_entries = [];
        let new_instructor_entries = [];
        let new_department_entries = [];
        const report = await Promise.all(
          stagedCourses.map(async (entry, index) => {
            if (entry.courseCode) {
              new_course_code_entries.push(entry.courseCode);
/*               const unique_course_code_entries = new_course_code_entries.filter(
                (item) => item === entry.courseCode
              );
              if (unique_course_code_entries.length > 1) {
                !errorState ? setErrorState(true) : "";
                return {
                  ...entry,
                  line: `${index + 2}`,
                  status: "Hata",
                  message: `${entry.courseCode} kodlu ders tabloda birden fazla kez geçiyor!`,
                };
              } */
              const response = await Axios.get("/api/courses/find", {
                params: { courseCode: entry.courseCode, year: entry.year },
              });
              console.log(`Searching for ${entry.courseCode}`);
              const { result } = response.data;
              if (result.length > 0) {
                !errorState ? setErrorState(true) : "";
                return {
                  ...entry,
                  line: `${index + 2}`,
                  status: "Hata",
                  message: `${entry.year} yılı için ${entry.courseCode} kodlu bir ders veritabanında zaten var!`,
                };
              } else {
                if (
                  !entry.instFirstName ||
                  !entry.instLastName ||
                  !entry.instTitle
                ) {
                  !errorState ? setErrorState(true) : "";
                  return {
                    ...entry,
                    line: `${index + 2}`,
                    status: "Hata",
                    message: `${entry.courseCode} kodlu dersin öğretim elemanında isim, soy isim veya unvan bilgilerinden en az biri eksik!`,
                  };
                } else {
                  if (
                    !(
                      entry.instTitle === "Prof.Dr." ||
                      entry.instTitle === "Doç.Dr." ||
                      entry.instTitle === "Dr.Öğr.Üyesi" ||
                      entry.instTitle === "Araş.Gör." ||
                      entry.instTitle === "Araş.Gör.Dr." ||
                      entry.instTitle === "Öğr.Gör." ||
                      entry.instTitle === "Öğr.Gör.Dr."
                    )
                  ) {
                    !errorState ? setErrorState(true) : "";
                    return {
                      ...entry,
                      line: `${index + 2}`,
                      status: "Hata",
                      message: `${entry.courseCode} kodlu dersin öğretim elemanı unvanında hata. Unvan yalnızca şunlardan biri olabilir: ProfDr, DocDr, DrOgrtUy, ArsGor, ArsGorDr, OgrGor, OgrGorDr`,
                    };
                  } else {
                    if (!entry.courseName) {
                      !errorState ? setErrorState(true) : "";
                      return {
                        ...entry,
                        line: `${index + 2}`,
                        status: "Hata",
                        message: `${entry.courseCode} kodlu dersin ismi girilmemiş`,
                      };
                    } else if (false) {
                    } else {
                      let departmentId = "";
                      let instructorId = "";
                      const success_object = {
                        ...entry,
                        line: `${index + 2}`,
                        status: "Başarılı",
                        message: `${entry.year} yılı ${
                          entry.semester ? (entry.semester === 1 ? "güz" : "bahar") : null
                        } dönemi, ${ConvertTitle(entry.instTitle)} ${
                          entry.instFirstName
                        } ${entry.instLastName} adlı öğretim elemanına ait ${
                          entry.courseCode
                        } kodlu ${entry.courseName} adlı ders eklenmeye hazır`,
                      };

                      const DEPARTMENT_NAME = entry.departmentName
                        ? entry.departmentName.toLocaleUpperCase("tr-TR")
                        : "";
                      const INSTRUCTOR_FIRST_NAME = entry.instFirstName
                        ? entry.instFirstName.toLocaleUpperCase("tr-TR")
                        : "";
                      const INSTRUCTOR_LAST_NAME = entry.instLastName
                        ? entry.instLastName.toLocaleUpperCase("tr-TR")
                        : "";
                      const INSTRUCTOR_NAME = `${INSTRUCTOR_FIRST_NAME} ${INSTRUCTOR_LAST_NAME}`;

                      const department_search = await Axios.get(
                        "/api/departments/find",
                        {
                          params: {
                            departmentName: DEPARTMENT_NAME,
                          },
                        }
                      );

                      const instructor_search = await Axios.get(
                        "/api/instructors/find",
                        {
                          params: {
                            firstName: INSTRUCTOR_FIRST_NAME,
                            lastName: INSTRUCTOR_LAST_NAME,
                          },
                        }
                      );
                      const existing_instructor = instructor_search.data.result;
                      const existing_department = department_search.data.result;
                      //console.log(existing_instructor);
                      //console.log(existing_department);

                      if (existing_instructor.length === 0) {
                        new_instructor_entries.push(INSTRUCTOR_NAME);
                        success_object.message =
                          success_object.message +
                          " Ancak bu isimli bir öğretim elemanı bulunamadı, kaydı sıfırdan oluşturuldu...";

                        const unique_instructor_entries =
                          new_instructor_entries.filter(
                            (item) => item === INSTRUCTOR_NAME
                          );

                        if (
                          unique_instructor_entries.length < 2 &&
                          INSTRUCTOR_NAME
                        ) {
                          const adding_instructor = await Axios.post(
                            "/api/instructors/add",
                            {
                              firstName: INSTRUCTOR_FIRST_NAME,
                              lastName: INSTRUCTOR_LAST_NAME,
                              title: entry.instTitle,
                            }
                          );
                          const { result } = adding_instructor.data;
                          console.log(result);
                          if (result.acknowledged){
                            success_object.instructorId = result.insertedId;
                          }
                        }
                      }
                      else {
                        success_object.instructorId = existing_instructor[0]._id;
                      }

                      if (existing_department.length === 0) {
                        new_department_entries.push(DEPARTMENT_NAME);
                        success_object.message =
                          success_object.message +
                          " ancak bu isimli bir anabilim dalı bulunamadığı için, kaydı sıfırdan oluşturuldu...";

                        const unique_department_entries =
                          new_department_entries.filter(
                            (item) => item === DEPARTMENT_NAME
                          );

                        if (
                          unique_department_entries.length < 2 &&
                          DEPARTMENT_NAME
                        ) {
                          const adding_department = await Axios.post(
                            "/api/departments/add",
                            {
                              departmentName: DEPARTMENT_NAME,
                            }
                          );
                          const { result } = adding_department.data;
                          console.log(result);
                          if (result.acknowledged){
                            success_object.departmentId = result.departmentId;
                          }
                        }
                      } else {
                        success_object.departmentId = existing_department[0]._id;
                      }
                      return success_object;
                    }
                  }
                }
              }
            } else {
              // bu dersin ders kodu girilmemişse
              !errorState ? setErrorState(true) : "";
              return {
                ...entry,
                line: `${index + 2}`,
                status: "Hata",
                message: `${
                  entry.courseName ? entry.courseName + " adlı ders için" : ""
                }  Ders kodu girilmemiş!`,
              };
            }
          })
        );
/*         console.table(report); */
        //setIncomingCourses(report);

        const successful_entries = report.filter(entry => entry.status === "Başarılı");
        let multiple_entries = [];
        successful_entries.forEach(entry => {
          const filtered_entries = successful_entries.filter(filter_entry => filter_entry.courseCode === entry.courseCode);
          if (filtered_entries.length > 1){
            multiple_entries.push(entry);
          }
        });
/*         console.log("Multiple Entries Table:");
        console.table(multiple_entries); */

        let joined_entries=[];

        multiple_entries.forEach(entry=>{
          
          const filtered_entries = multiple_entries.filter(filter_entry => {return (entry.courseCode === filter_entry.courseCode && entry.instructorId === filter_entry.instructorId)})
          if (filtered_entries.length > 1) {

            let calculatedRegisteredStudents = 0;
            filtered_entries.forEach(calculationEntry => {calculatedRegisteredStudents = calculatedRegisteredStudents + parseInt(calculationEntry.registeredStudents)})
            joined_entries.push({
              ...entry,
              registeredStudents : calculatedRegisteredStudents
            })
          }
        })
        //console.log("Joined Entries Table:");
        //console.table(joined_entries);

        //console.log("Unique Joined Entries Table:");
        const unique_joined_entries = joined_entries.filter((v,i,a)=>a.findIndex(v2=>['courseCode','instructorId'].every(k=>v2[k] ===v[k]))===i)
        //console.table(unique_joined_entries);

        const joined_course_codes = unique_joined_entries.map((entry) => {
          return entry.courseCode;
        })
        const unique_joined_course_codes = [...new Set(joined_course_codes)];

        let numbered_joined_entries = [];

        unique_joined_course_codes.forEach(courseCode => {
          const filtered_entries = unique_joined_entries.filter(entry=> entry.courseCode === courseCode);
          const numbered_filtered_entries = filtered_entries.map((item, index) => {
            return {
              ...item,
              courseCode : `${item.courseCode}-${index+1}`
            }
          })
          numbered_filtered_entries.forEach(entry => {
            numbered_joined_entries.push(entry);
          })
        })

        //console.log("Numbered Joined Entries Table:");
        //console.table(numbered_joined_entries);

        const single_courses = successful_entries.filter(entry => !(unique_joined_course_codes.includes(entry.courseCode)))
        const final_report = [...single_courses, ...numbered_joined_entries];
        setIncomingCourses(final_report);
        console.table(final_report)
      }
      prepareReport();
    });
  }

  const columns = [
    {
      name: "Satır",
      selector: (row) => row.line,
      sortable: true,
      width: "100px",
    },
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
      <Navbar />
      <div style={{ margin: "50px" }}>
        {incomingCourses.length === 0 ? (
          <input
            type="file"
            id="input"
            ref={inputRef}
            onChange={handleChange}
          />
        ) : (
          ""
        )}
        {incomingCourses.length > 0 ? (
          errorState ? (
            <div style={{ color: "red", fontSize: "2em" }}>
              Gidermeniz gereken hatalar var!
            </div>
          ) : (
            <button>Kaydet</button>
          )
        ) : (
          ""
        )}

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
