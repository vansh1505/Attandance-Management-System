import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig.js";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MarkAttendance() {
  const [status, setStatus] = useState("P");
  const [classId, setClassId] = useState("CS101");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const studentId = auth.currentUser?.uid;

  useEffect(() => {
    const checkRole = async () => {
      if (!studentId) return navigate("/login");
      const docSnap = await getDoc(doc(db, "users", studentId));
      if (!docSnap.exists()) return navigate("/login");
      const data = docSnap.data();
      setRole(data.role);
      if (data.role !== "teacher") alert("Only teachers can mark attendance!");
    };
    checkRole();
  }, []);

  const handleMark = async () => {
    if (role !== "teacher") return alert("Unauthorized");
    const studentInputId = prompt("Enter Student UID to mark:");
    if (!studentInputId) return;

    await addDoc(collection(db, "attendances"), {
      studentId: studentInputId,
      status,
      classId,
      markedAt: serverTimestamp(),
    });
    alert("Attendance marked!");
  };

  const generateSession = async () => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // random 6-char code
  await addDoc(collection(db, "sessions"), {
    classId,
    code,
    markedByTeacher: true,
    createdAt: serverTimestamp(),
  });
  alert(`Session created! Code: ${code}`);
};

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-xl font-bold mb-4">Mark Attendance</h1>
      <select className="border p-2 m-2" onChange={(e) => setStatus(e.target.value)} value={status}>
        <option value="P">Present</option>
        <option value="AB">Absent</option>
      </select>
      <input
        className="border p-2 m-2"
        placeholder="Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleMark}>
        Mark Attendance
      </button>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={generateSession}>
        Generate Session
      </button>
    </div>
  );
}
