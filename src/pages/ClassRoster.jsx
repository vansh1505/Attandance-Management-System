import { useEffect, useMemo, useState } from "react";
import { db } from "../firebaseConfig.js";
import { 
  doc, getDoc, setDoc, onSnapshot, 
  query, collection, where, getDocs, 
  arrayUnion, arrayRemove 
} from "firebase/firestore";

export default function ClassRoster() {
  const [classId, setClassId] = useState("CS101");
  const [roster, setRoster] = useState([]); // array of UIDs
  const [details, setDetails] = useState({}); // uid -> {name, email}
  const [input, setInput] = useState(""); // email or uid
  const [loading, setLoading] = useState(false);

  // Subscribe to class roster
  useEffect(() => {
    if (!classId) return;
    const ref = doc(db, "classes", classId);
    const unsub = onSnapshot(ref, (snap) => {
      const students = snap.exists() ? (snap.data().students || []) : [];
      setRoster(Array.isArray(students) ? students : []);
    });
    return () => unsub();
  }, [classId]);

  // Load student details for roster entries
  useEffect(() => {
    (async () => {
      const map = {};
      // fetch each user's details (name/email) if available
      await Promise.all(
        roster.map(async (uid) => {
          try {
            const uref = doc(db, "users", uid);
            const usnap = await getDoc(uref);
            if (usnap.exists()) {
              const d = usnap.data();
              map[uid] = { name: d.name || "(no name)", email: d.email || "" };
            } else {
              map[uid] = { name: "(unknown)", email: "" };
            }
          } catch {
            map[uid] = { name: "(unknown)", email: "" };
          }
        })
      );
      setDetails(map);
    })();
  }, [roster]);

  const addStudent = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      let uid = input.trim();
      if (uid.includes("@")) {
        // treat as email lookup
        const q = query(collection(db, "users"), where("email", "==", uid));
        const snap = await getDocs(q);
        if (snap.empty) {
          alert("No user found with that email.");
          return;
        }
        const doc0 = snap.docs[0];
        const data = doc0.data();
        if (data.role !== "student") {
          alert("Only users with role 'student' can be added to class.");
          return;
        }
        uid = doc0.id;
      }
      const classRef = doc(db, "classes", classId);
      await setDoc(classRef, { students: arrayUnion(uid) }, { merge: true });
      setInput("");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (uid) => {
    const classRef = doc(db, "classes", classId);
    await setDoc(classRef, { students: arrayRemove(uid) }, { merge: true });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Class Roster</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="border rounded px-3 py-2"
          placeholder="Class ID (e.g., CS101)"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        />
        <div className="flex-1 flex gap-2">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Add student by email or UID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={addStudent}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div className="border rounded">
        <div className="grid grid-cols-12 bg-gray-100 font-semibold p-2">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-3">UID</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        {roster.length === 0 && (
          <div className="p-4 text-gray-600">No students in roster. Add by email or UID above.</div>
        )}
        {roster.map((uid) => (
          <div key={uid} className="grid grid-cols-12 items-center p-2 border-t">
            <div className="col-span-4 truncate">{details[uid]?.name || "(unknown)"}</div>
            <div className="col-span-4 truncate">{details[uid]?.email || ""}</div>
            <div className="col-span-3 truncate">{uid}</div>
            <div className="col-span-1 text-right">
              <button className="text-red-600" onClick={() => removeStudent(uid)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Tip: The "Close Session & Mark Absents" button in the Teacher Dashboard uses this roster to
        mark absentees for a generated session.
      </p>
    </div>
  );
}
