import styles from "../styles/Instructor.module.css";
import CustomDataTable from "../components/data-table";
import { Oval } from "react-loader-spinner";

import Axios from "axios";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/navbar";

export default function Instructors() {
  const [halls, setHalls] = useState([]);
  const [isLoadingHalls, setLoadingHalls] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState("");
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    setLoadingHalls(true);
    Axios.get("/api/halls").then(({ data }) => {
      const response = data.result.map((item) => {
        return {
          label: item.hallName,
          id: item._id,
          hallLowCap: item.hallLowCap,
          hallMaxCap: item.hallMaxCap,
        };
      });
      console.log(response);
      setHalls(response);
      setLoadingHalls(false);
      console.log(halls);
    });
  }, []);

  function submitHall(hall_) {
    const { hallName, hallLowCap, hallMaxCap } = hall_;
    if (editMode) {
      if (hallName && editingEntryId) {
        Axios.put(
          `/api/halls/edit/${editingEntryId}?name=${hallName
            .trim()
            .toLocaleUpperCase("tr-TR")}&hallLowCap=${hallLowCap}&hallMaxCap=${hallMaxCap}`
        ).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            const filtered_halls = halls.filter(
              (hall) => hall.id !== editingEntryId
            );
            filtered_halls.push({
              id: editingEntryId,
              label: hallName.trim().toLocaleUpperCase("tr-TR"),
              hallLowCap: hallLowCap,
              hallMaxCap: hallMaxCap
            });
            console.log("börek");
            console.log(filtered_halls);
            setHalls(filtered_halls);
          }
          reset();
        });
      } else {
        console.log("can't submit empty");
      }
    } else {
      if (hallName) {
        Axios.post("/api/halls/add", {
          hallName: hallName.trim().toLocaleUpperCase("tr-TR"),
          hallLowCap,
          hallMaxCap,
        }).then((response) => {
          const { result } = response.data;
          console.log(result);
          if (result.acknowledged) {
            setHalls([
              ...halls,
              {
                label: hallName.trim().toLocaleUpperCase("tr-TR"),
                id: result.insertedId,
                hallLowCap,
                hallMaxCap,
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

  const columns = [
    {
      name: "Adı",
      selector: (row) => row.label,
      sortable: true,
    },
    {
      name: "Tenha Kapasite",
      selector: (row) => row.hallLowCap,
      sortable: true,
    },
    {
      name: "Max. Kapasite",
      selector: (row) => row.hallMaxCap,
      sortable: true,
    },
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
      setValue("hallLowCap", selectedRows[0].hallLowCap);
      setValue("hallMaxCap", selectedRows[0].hallMaxCap);
    } else {
      ClearForm();
    }
  }

  function handleDelete() {
    console.log(editingEntryId);
    Axios.delete(`/api/halls/remove/${editingEntryId}`)
      .then((response) => {
        const { result } = response.data;
        console.log(result);
        if (result.deletedCount === 1) {
          console.log("deleted");
          const filteredHalls = halls.filter(
            (hall) => hall.id !== editingEntryId
          );
          setHalls(filteredHalls);
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

      {isLoadingHalls ? (
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
            onSubmit={handleSubmit(submitHall)}
          >
            <div className={styles["form-body"]}>
              <label htmlFor="hall-name-input">Salon Adı</label>
              <input
                {...register("hallName")}
                placeholder="Adı"
                title="hall-name-input"
              />
              <label htmlFor="hall-low-capacity-input">Tenha Kapasite</label>
              <input
                {...register("hallLowCap")}
                placeholder="Tenha Kapasite"
                title="hall-low-capacity-input"
              />
              <label htmlFor="hall-max-capacity-input">Max. Kapasite</label>
              <input
                {...register("hallMaxCap")}
                placeholder="Max. Kapasite"
                title="hall-max-capacity-input"
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
              data={halls}
              progressPending={isLoadingHalls}
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
