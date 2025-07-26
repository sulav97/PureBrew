import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import bg from "../../assets/cover.jpg";

const PaymentSuccess = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 max-w-xl w-full text-center border border-black/10 animate-fade-in-up">
        <div className="mb-6">
          <FaCheckCircle className="text-green-600 text-6xl mx-auto drop-shadow-sm mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Order Confirmed
          </h1>
          <p className="mt-3 text-gray-700 text-base">
            Thanks for brewing with us! Your payment was successful.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Link
            to="/"
            className="w-full bg-black text-white py-3 rounded-full font-semibold tracking-wide hover:bg-neutral-800 transition"
          >
            Back to Shop
          </Link>
          <Link
            to="/my-orders"
            className="w-full border-2 border-black text-black py-3 rounded-full font-semibold tracking-wide hover:bg-black hover:text-white transition"
          >
            Check My Orders
          </Link>
        </div>

        <div className="mt-10 text-sm text-gray-600 leading-relaxed">
          <p>You’ll get an email confirmation shortly.</p>
          <p>If you need support, we’re just a sip away.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
