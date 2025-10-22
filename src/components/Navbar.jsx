import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, role, signOut } = useAuth();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <Link to={user ? (role === "teacher" ? "/teacher" : "/student") : "/"} className="text-xl font-bold text-blue-600">
        Cloud Attendance
      </Link>
      <div className="flex items-center gap-4">
        {!user && (
          <>
            <Link className="text-blue-600" to="/login">Login</Link>
            <Link className="text-blue-600" to="/signup">Sign up</Link>
          </>
        )}
        {user && role === "student" && (
          <>
            <Link to="/student" className="text-gray-700">Dashboard</Link>
            <Link to="/attendance" className="text-gray-700">Attendance</Link>
            <Link to="/scan" className="text-gray-700">Scan</Link>
          </>
        )}
        {user && role === "teacher" && (
          <>
            <Link to="/teacher" className="text-gray-700">Dashboard</Link>
            <Link to="/attendance" className="text-gray-700">All Attendance</Link>
            <Link to="/classes" className="text-gray-700">Classes</Link>
          </>
        )}
        {user && (
          <button
            onClick={signOut}
            className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
