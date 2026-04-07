   
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Prepare the form data for FastAPI
    const params = new URLSearchParams();
    params.append("username", email); // Using 'email' directly from your state
    params.append("password", password);

    try {
      // 2. Send the request to your backend
      const res = await axios.post("http://127.0.0.1:8000/login", params, {
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded" 
        }
      });

      // 3. If successful, save the token and go to the gold dashboard
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        router.push("/dashboard"); 
      }
    } catch (err) {
      console.error(err);
      // 4. Handle errors gracefully
      const message = err.response?.data?.detail || "Invalid email or password or Backend offline";
      setError(message);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", background: "white", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ color: "gold", WebkitTextStroke: "1px black", fontSize: "4rem", marginBottom: "30px" }}>FRANNAS</h1>
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "320px" }}>
        {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
        
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: "15px", border: "2px solid black", borderRadius: "8px" }} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: "15px", border: "2px solid black", borderRadius: "8px" }} 
        />
        
        <button type="submit" style={{ padding: "18px", backgroundColor: "gold", fontWeight: "bold", fontSize: "1.1rem", border: "2px solid black", borderRadius: "8px", cursor: "pointer" }}>
          SIGN IN
        </button>
      </form>
    </div>
  );
}
