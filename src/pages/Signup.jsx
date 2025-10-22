import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student"); // default student
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password || !name) return alert("Fill all fields!");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user info in Firestore
  await setDoc(doc(db, "users", uid), { name, role, email });

      alert("User created successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <input
        type="text"
        placeholder="Full Name"
        className="border p-2 m-2 w-64"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="border p-2 m-2 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 m-2 w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select className="border p-2 m-2 w-64" onChange={(e) => setRole(e.target.value)} value={role}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}
