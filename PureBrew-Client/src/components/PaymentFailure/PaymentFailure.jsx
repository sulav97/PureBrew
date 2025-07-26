import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import background from "../../assets/cover.jpg";

const PaymentFailure = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-6 py-20"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full max-w-2xl bg-black/90 text-white rounded-3xl shadow-2xl border border-[#2a2a2a] p-10 backdrop-blur-md animate-fade-in-up">
        <div className="text-center space-y-6">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto drop-shadow-lg" />
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-[#c6a27e]">
            Payment Failed
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Your transaction couldn’t be completed. Don’t worry — your selected beans are still in the cart.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
          <Link
            to="/cart"
            className="bg-[#c6a27e] text-black font-bold py-3 px-8 rounded-lg hover:opacity-90 transition duration-300 text-center"
          >
            Retry Payment
          </Link>
          <Link
            to="/"
            className="border border-[#c6a27e] text-[#c6a27e] font-semibold py-3 px-8 rounded-lg hover:bg-[#c6a27e] hover:text-black transition duration-300 text-center"
          >
            Back to Shop
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-400 text-center space-y-1">
          <p>If issues persist, please contact PureBrew support.</p>
          <p>Your artisan beans are still waiting for their brew moment.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
