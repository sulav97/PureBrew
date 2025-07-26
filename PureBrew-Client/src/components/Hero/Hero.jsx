import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hero1 from "../../assets/hero.jpg";
import hero2 from "../../assets/move1.png";
import hero3 from "../../assets/move2.jpg";

const images = [hero1, hero2, hero3];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[90vh] overflow-hidden">
      {/* Background Image Layer */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-all duration-[2000ms] ease-in-out ${
            idx === activeIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
          }`}
        >
          <img
            src={img}
            alt={`PureBrew ${idx}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6 md:px-12">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-3xl shadow-xl border border-white/20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
            PureBrew Rituals
          </h1>
          <p className="text-gray-200 text-base md:text-lg mt-4">
            Discover a world where every bean tells a story. Grounded in origin. Roasted with soul.
          </p>
          <button
            onClick={() => navigate("/allproducts")}
            className="mt-6 px-6 py-3 bg-[#c6a27e] hover:bg-[#b48d6e] text-black font-semibold rounded-full transition duration-300 shadow-lg"
          >
            Explore Blends
          </button>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-4 h-4 rounded-full cursor-pointer border border-white transition-all duration-300 ${
              i === activeIndex ? "bg-[#c6a27e] scale-110 shadow-md" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
