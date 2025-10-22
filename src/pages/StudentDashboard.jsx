import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className="bg-blue-600 text-white rounded-lg py-4 px-6 text-left"
          onClick={() => navigate("/attendance")}
        >
          View Attendance
          <p className="mt-2 text-blue-100 text-sm">See day-wise records and overall percentage</p>
        </button>
        <button
          className="bg-green-600 text-white rounded-lg py-4 px-6 text-left"
          onClick={() => navigate("/scan")}
        >
          Scan QR to Mark
          <p className="mt-2 text-green-100 text-sm">Scan teacher's QR to mark attendance</p>
        </button>
      </div>
    </div>
  );
}
