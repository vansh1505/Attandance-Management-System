import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebaseConfig.js";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [role, setRole] = useState("");
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchRole = async () => {
      if (!uid) return;
      const docSnap = await getDoc(doc(db, "users", uid));
      if (!docSnap.exists()) return;
      setRole(docSnap.data().role);
    };
    fetchRole();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const q = role === "student" 
      ? query(collection(db, "attendances"), where("studentId", "==", uid))
      : collection(db, "attendances"); // teacher sees all

    const unsub = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [role]);

  const summary = useMemo(() => {
    if (role !== "student") return null;
    const total = records.length;
    const present = records.filter(r => r.status === "P").length;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { total, present, pct };
  }, [records, role]);

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Attendance Records</h1>
      {summary && (
        <div className="mb-4 p-4 rounded bg-blue-50 text-blue-800">
          <p><span className="font-semibold">Present:</span> {summary.present} / {summary.total}</p>
          <p><span className="font-semibold">Overall:</span> {summary.pct}%</p>
        </div>
      )}
      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th>Student ID</th>
            <th>Status</th>
            <th>Class</th>
            <th>Marked At</th>
          </tr>
        </thead>
        <tbody>
          {records.map(rec => (
            <tr key={rec.id}>
              <td className="border p-2">{rec.studentId}</td>
              <td className="border p-2">{rec.status}</td>
              <td className="border p-2">{rec.classId}</td>
              <td className="border p-2">{rec.markedAt?.toDate ? rec.markedAt.toDate().toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
