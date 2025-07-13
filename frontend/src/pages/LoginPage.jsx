import React, { useState } from "react";
import { Lock, User } from "lucide-react";

const LoginPage = ({ onLogin }) => {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");
      if (onLogin) onLogin(data.student);
    } catch (err) {
      alert(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo_ibik.png"
            alt="Logo IBIK"
            className="w-20 h-20 mb-3 "
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 Login Mahasiswa
          </h1>
          <p className="text-gray-600">
            Masukkan NIM dan password Anda untuk masuk
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="NIM"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              required
              className="w-full p-2 pl-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <User className="absolute top-4 left-4 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 pl-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <Lock className="absolute top-4 left-4 h-4 w-4 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-200 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
