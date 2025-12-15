// src/pages/LoginPage.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./LoginPage.css";


function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const location = useLocation();


const backendURL =
window.location.hostname === "localhost"
? "http://localhost:5000"
: "https://digital-guidance-api.onrender.com";


const role = new URLSearchParams(location.search).get("role") || "user";


const handleLogin = async (e) => {
e.preventDefault();
setLoading(true);


try {
const res = await fetch(`${backendURL}/api/auth/login`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
});


const data = await res.json();


if (res.ok) {
const [, payload] = data.token.split(".");
const decoded = JSON.parse(atob(payload));


if (decoded.role !== role) {
alert("⚠️ Invalid role for this account!");
setLoading(false);
return;
}


localStorage.setItem("token", data.token);
localStorage.setItem("userEmail", email);
if (decoded.role === "user") {
localStorage.setItem("justLoggedIn", "true");
}


setTimeout(() => {
navigate(decoded.role === "admin" ? "/admin" : "/services");
setLoading(false);
}, 800);
} else {
alert(data.message || "❌ Login failed.");
setLoading(false);
}
} catch (err) {
console.error(err);
alert("Connection error. Please try again.");
setLoading(false);
}
};
export default LoginPage;
