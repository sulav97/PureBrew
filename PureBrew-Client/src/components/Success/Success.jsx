import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMugHot } from "react-icons/fa";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5001);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl bg-[#1c1c1c] rounded-xl shadow-2xl p-10 border border-[#2a2a2a] text-center text-white animate-fade-in">
        
        <div className="flex flex-col items-center mb-8">
          <FaMugHot className="text-[#c6a27e] text-5xl mb-4" />
          <h1 className="text-3xl font-bold tracking-wide uppercase mb-2 text-[#c6a27e]">
            Order Confirmed
          </h1>
          <p className="text-sm text-gray-300">
            Your payment was successful. Thank you for brewing with PureBrew.
          </p>
        </div>

        <div className="bg-[#262626] border border-[#3a3a3a] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#c6a27e] mb-2">
            What Happens Next?
          </h2>
          <ul className="text-sm text-gray-300 text-left space-y-1 pl-1">
            <li>• Confirmation email sent</li>
            <li>• We’ll contact you for delivery</li>
            <li>• Sip and enjoy your coffee journey</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#c6a27e] text-black font-bold py-3 rounded hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/myorder")}
            className="w-full border border-[#c6a27e] text-[#c6a27e] font-semibold py-3 rounded hover:bg-[#c6a27e] hover:text-black transition"
          >
            View My Orders
          </button>
        </div>

        <p className="text-xs text-gray-500 italic mt-4">
          Redirecting to homepage in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default Success;
