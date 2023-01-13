export function ConvertTitle (code){
    if (code === "Araş.Gör.") return "Arş. Gör.";
    if (code === "Araş.Gör.Dr.") return "Arş. Gör. Dr.";
    if (code === "Öğr.Gör.") return "Öğr. Gör.";
    if (code === "Öğr.Gör.Dr.") return "Öğr. Gör. Dr.";
    if (code === "Dr.Öğr.Üyesi") return "Dr. Öğr. Üyesi";
    if (code === "Doç.Dr.") return "Doç. Dr.";
    if (code === "Prof.Dr.") return "Prof. Dr.";
    return ""
}

export const titleOptions = [
    { id: "Araş.Gör.", label: "Arş. Gör." },
    { id: "Araş.Gör.Dr.", label: "Arş. Gör. Dr." },
    { id: "Öğr.Gör.", label: "Öğr. Gör." },
    { id: "Öğr.Gör.Dr.", label: "Öğr. Gör. Dr." },
    { id: "Dr.Öğr.Üyesi", label: "Dr. Öğr. Üyesi" },
    { id: "Doç.Dr.", label: "Doç. Dr." },
    { id: "Prof.Dr.", label: "Prof. Dr." },
  ];