import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "../../api/api";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/cover.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent! Check your email.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Failed to send reset link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 animate-fade-in"
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-[#3E2C27]">
            Forgot your <span className="text-[#c6a27e]">Password</span>?
          </h2>
          <p className="text-sm text-center text-gray-600 mb-6">
            Enter your email and we’ll send you a reset link.
          </p>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e] mb-4"
            placeholder="you@purebrew.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7b4f3c] to-[#3E2C27] text-white font-semibold py-2 rounded-md hover:scale-105 transition-transform duration-200"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
