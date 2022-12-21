export function ConvertTitle (code){
    if (code === "ArsGor") return "Arş. Gör.";
    if (code === "ArsGorDr") return "Arş. Gör. Dr.";
    if (code === "OgrGor") return "Öğr. Gör.";
    if (code === "OgrGorDr") return "Öğr. Gör. Dr.";
    if (code === "DrOgr") return "Dr. Öğr. Üyesi";
    if (code === "DocDr") return "Doç. Dr.";
    if (code === "ProfDr") return "Prof. Dr.";
    return ""
}

export const titleOptions = [
    { id: "ArsGor", label: "Arş. Gör." },
    { id: "ArsGorDr", label: "Arş. Gör. Dr." },
    { id: "OgrGor", label: "Öğr. Gör." },
    { id: "OgrGorDr", label: "Öğr. Gör. Dr." },
    { id: "DrOgr", label: "Dr. Öğr. Üyesi" },
    { id: "DocDr", label: "Doç. Dr." },
    { id: "ProfDr", label: "Prof. Dr." },
  ];