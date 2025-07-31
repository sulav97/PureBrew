import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import bgImage from "../../assets/cover.jpg";
import { verifyFormDataIntegrity, verifyAPIResponseIntegrity } from '../../utils/integrityUtils';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    token: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [loading, setLoading] = useState(false);

  const validateName = (name) => /^[A-Za-z\s]{2,}$/.test(name.trim());
  const validateEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const validatePassword = (password) => {
    if (password.length < 8) return false;
    return /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  };
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
    if (password.length < 6) return 0;
    if (score >= 5) return 4;
    if (score === 4) return 3;
    if (score === 3) return 2;
    if (score === 2) return 1;
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateName(form.name))
      newErrors.name = "Name must be at least 2 letters and only contain letters and spaces.";
    if (!validateEmail(form.email)) newErrors.email = "Invalid email format.";
    if (!validatePassword(form.password))
      newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Verify registration data integrity
    const registrationData = {
      name: form.name,
      email: form.email,
      password: form.password
    };

    if (!verifyFormDataIntegrity(registrationData, 'registration')) {
      toast.error("Invalid registration data detected.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        token: form.token,
      });
      
      // ✅ Verify API response integrity
      if (!verifyAPIResponseIntegrity(response)) {
        toast.error("Invalid response from server");
        return;
      }

      toast.success("Registration successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaChange = (token) => {
    setForm({ ...form, token });
  };

  const strengthLabels = ["Too short", "Weak", "Medium", "Strong", "Very strong"];
  const strengthColors = [
    "bg-gray-300",
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-700",
  ];

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
            Create Your <span className="text-[#c6a27e]">Pure</span>Brew Account
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">Start your roasted journey with us</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[#3E2C27] block mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
                required
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#3E2C27] block mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
                required
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#3E2C27] block mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
                required
              />
              <div className="flex gap-1 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${passwordStrength > i ? strengthColors[passwordStrength] : "bg-gray-200"}`}
                  ></div>
                ))}
              </div>
              <p className="text-xs mt-1 text-gray-700">{strengthLabels[passwordStrength]}</p>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#3E2C27] block mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c6a27e]"
                required
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleRecaptchaChange} />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7b4f3c] to-[#3E2C27] text-white font-semibold py-2 rounded-md hover:scale-105 transition-transform duration-200"
            >
              Create Account
            </button>

            <p className="text-sm text-center text-gray-700">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[#3E2C27] hover:underline">
                Brew In
              </Link>
            </p>
            <p className="text-[10px] text-gray-500 text-center mt-1">
              Use a Gmail account for the best experience.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
