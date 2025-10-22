import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { auth, db } from "../firebaseConfig.js";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";

export default function TeacherPage() {
  const [qrUrl, setQrUrl] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [count, setCount] = useState(0);
  const [classId, setClassId] = useState("CS101");
  const [subject, setSubject] = useState("General");
  const [durationMinutes] = useState(15); // session valid window

  const handleGenerate = async () => {
    const teacherId = auth.currentUser?.uid;
    if (!teacherId) return alert("You must be logged in.");

    const sessionId = Date.now().toString();
    const data = { classId, subject, sessionId, teacherId };
    const qrString = JSON.stringify(data);
    const url = await QRCode.toDataURL(qrString);

    // Optional: record the session for auditing/history
    try {
      await addDoc(collection(db, "sessions"), {
        ...data,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
      });
    } catch (e) {
      console.warn("Failed to store session record", e);
    }

    setQrUrl(url);
    setSessionData(data);
  };

  useEffect(() => {
    if (!sessionData) return;

    const q = query(
      collection(db, "attendances"),
      where("classId", "==", sessionData.classId),
      where("sessionId", "==", sessionData.sessionId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setCount(snapshot.docs.length);
    });

    return () => unsub();
  }, [sessionData]);

  const closeSessionAndMarkAbsents = async () => {
    if (!sessionData) return alert("Generate a session first.");

    // Fetch class roster: classes/{classId} with field `students: string[]`
    const classRef = doc(db, "classes", sessionData.classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) {
      alert("No class roster found. Create classes/" + sessionData.classId + " with a students[] list.");
      return;
    }
    const students = classSnap.data().students || [];
    if (!Array.isArray(students) || students.length === 0) {
      alert("Roster is empty for this class.");
      return;
    }

    // Present list for this session
    const presentQ = query(
      collection(db, "attendances"),
      where("sessionId", "==", sessionData.sessionId)
    );
    const presentSnap = await getDocs(presentQ);
    const presentSet = new Set(presentSnap.docs.map(d => d.data().studentId));

    const absentees = students.filter(sid => !presentSet.has(sid));
    if (absentees.length === 0) {
      alert("No absentees to mark for this session.");
      return;
    }

    // Batch write AB records
    const batch = writeBatch(db);
    absentees.forEach((studentId) => {
      const ref = doc(collection(db, "attendances"));
      batch.set(ref, {
        studentId,
        classId: sessionData.classId,
        sessionId: sessionData.sessionId,
        status: "AB",
        markedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    alert(`Marked ${absentees.length} students absent.`);
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Class ID (e.g., CS101)"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate QR
        </button>
      </div>

      {qrUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Class: {sessionData.classId} • Subject: {sessionData.subject}
          </h2>
          <img src={qrUrl} alt="QR Code" className="mx-auto" />
          <p className="mt-4 text-green-600 font-bold">
            ✅ Live Attendance Count: {count}
          </p>
          <p className="mt-2 text-gray-600">Session window: {durationMinutes} minutes</p>
          <button
            onClick={closeSessionAndMarkAbsents}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Close Session & Mark Absents
          </button>
        </div>
      )}

      <div className="mt-8">
        <a href="/attendance" className="text-blue-600 underline mr-4">View all attendance</a>
        <a href="/classes" className="text-blue-600 underline">Manage Class Roster</a>
      </div>
    </div>
  );
}
