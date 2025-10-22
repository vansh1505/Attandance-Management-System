import { useState } from "react";
import QRCode from "qrcode";
import { auth } from "../firebaseConfig.js";

export default function QRGenerator() {
  const [qrUrl, setQrUrl] = useState("");

  const handleGenerate = async () => {
    const teacherId = auth.currentUser?.uid;
    const data = {
      classId: "CS101",
      subject: "General",
      sessionId: Date.now().toString(),
      teacherId
    };
    const qrString = JSON.stringify(data);
    const url = await QRCode.toDataURL(qrString);
    setQrUrl(url);
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold mb-4">Generate Attendance QR</h1>
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate QR
      </button>

      {qrUrl && (
        <div className="mt-6">
          <img src={qrUrl} alt="QR Code" className="mx-auto" />
        </div>
      )}
    </div>
  );
}
