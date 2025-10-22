import { useState } from "react";
import { auth, db } from "../firebaseConfig.js";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function StudentMark() {
  const [code, setCode] = useState("");
  const [classId, setClassId] = useState("");

  const handleMark = async () => {
    if (!code || !classId) return alert("Fill all fields!");

    // Verify code exists
    const q = query(collection(db, "sessions"), where("code", "==", code), where("classId", "==", classId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return alert("Invalid session code!");

    // Mark attendance
    await addDoc(collection(db, "attendances"), {
      studentId: auth.currentUser.uid,
      status: "P",
      classId,
      markedAt: serverTimestamp(),
    });
    alert("Attendance marked!");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-bold mb-4">Mark Attendance</h1>
      <input
        type="text"
        placeholder="Class ID"
        className="border p-2 m-2 w-64"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Session Code"
        className="border p-2 m-2 w-64"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleMark}>
        Mark Attendance
      </button>
    </div>
  );
}
