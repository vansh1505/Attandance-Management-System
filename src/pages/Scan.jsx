import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { auth, db } from "../firebaseConfig.js";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  doc
} from "firebase/firestore";

export default function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    const onScanSuccess = async (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        const studentId = auth.currentUser?.uid;
        if (!studentId) return alert("Please log in first.");

        // Verify session exists and not expired
        const sessionQ = query(
          collection(db, "sessions"),
          where("sessionId", "==", data.sessionId),
          where("classId", "==", data.classId)
        );
        const sessionSnap = await getDocs(sessionQ);
        if (sessionSnap.empty) {
          alert("Invalid or unknown session.");
          return;
        }
        const sessionDoc = sessionSnap.docs[0];
        const session = sessionDoc.data();
        const now = new Date();
        if (session.expiresAt?.toDate && session.expiresAt.toDate() < now) {
          alert("This session has expired. Please contact your teacher.");
          return;
        }

        // Check if already marked
        const q = query(
          collection(db, "attendances"),
          where("studentId", "==", studentId),
          where("sessionId", "==", data.sessionId)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          alert("⚠️ You have already marked attendance for this session!");
          return;
        }

        await addDoc(collection(db, "attendances"), {
          studentId,
          classId: data.classId,
          sessionId: data.sessionId,
          markedAt: serverTimestamp(),
          status: "P"
        });

        alert("✅ Attendance marked successfully!");
        scanner.clear();
      } catch (err) {
        console.error(err);
        alert("Invalid QR Code");
      }
    };

    scanner.render(onScanSuccess);
    return () => scanner.clear();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan Attendance QR</h1>
      <div id="reader" className="mx-auto w-64 h-64 border"></div>
    </div>
  );
}
