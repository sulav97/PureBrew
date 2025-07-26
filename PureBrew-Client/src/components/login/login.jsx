import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/api";
import toast from "react-hot-toast";
import { UserContext } from "../../context/UserContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useBackupCode } from "../../api/api";
import bgImage from "../../assets/cover.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!recaptchaToken) {
      toast.error("Please verify you are human");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
        token: recaptchaToken,
      });

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        toast.success("Welcome to PureBrew!");
        res.data.user.isAdmin ? navigate("/admin") : navigate("/");
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-center mb-2 text-[#3E2C27]">
            Welcome to <span className="text-[#c6a27e]">Pure</span>Brew
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">Please sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[#3E2C27]">Email</label>
              <input
                type="email"
                placeholder="you@purebrew.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3E2C27]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
              />
            </div>

            <div className="mt-3">
              <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={setRecaptchaToken} />
            </div>

            <div className="flex justify-end text-sm">
              <Link to="/forgot-password" className="text-[#8b5e3c] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7b4f3c] to-[#3E2C27] text-white font-semibold py-2 rounded-md hover:scale-105 transition-transform duration-200"
            >
              {loading ? "Logging in..." : "Login to PureBrew"}
            </button>

            <div className="text-sm text-center mt-4 text-gray-700">
              Don’t have an account?{" "}
              <Link to="/register" className="font-medium text-[#3E2C27] hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
