import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000"; // your backend URL

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState("");

  // ===== Signup =====
  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API_URL}/signup`, { email, password });
      alert("Signup successful!");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  // ===== Login =====
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setToken(res.data.session?.access_token);
      alert("Login successful!");
      console.log("Token:", res.data.session?.access_token);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  // ===== Change Password =====
  const handleChangePassword = async () => {
    try {
      const res = await axios.patch(`${API_URL}/change-password`, {
        email,
        currentPassword: password,
        newPassword,
      });
      alert("Password updated!");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change password");
    }
  };

  // ===== Upload File =====
  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_URL}/upload-file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // optional
        },
      });

      alert("File uploaded!");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    }
  };

  // ===== Fetch Users =====
  const handleGetUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/find-users`);
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Fetch users failed");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📂 Google Drive Clone</h1>

      {/* Signup / Login */}
      <div className="space-x-2">
        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-3 py-1" onClick={handleSignup}>
          Signup
        </button>
        <button className="bg-green-500 text-white px-3 py-1" onClick={handleLogin}>
          Login
        </button>
      </div>

      {/* Change password */}
      <div className="space-x-2">
        <input
          type="password"
          placeholder="New Password"
          className="border p-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="bg-yellow-500 text-white px-3 py-1" onClick={handleChangePassword}>
          Change Password
        </button>
      </div>

      {/* File upload */}
      <div className="space-x-2">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="bg-purple-500 text-white px-3 py-1" onClick={handleUpload}>
          Upload File
        </button>
      </div>

      {/* Fetch users */}
      <div>
        <button className="bg-gray-700 text-white px-3 py-1" onClick={handleGetUsers}>
          Get Users
        </button>
        <ul>
          {users.map((u, i) => (
            <li key={i} className="border p-1 mt-1">
              {u.email || u.name} (ID: {u.id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
