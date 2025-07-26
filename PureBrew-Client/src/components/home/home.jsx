// Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import Hero from "../Hero/Hero";
import { getAllcoffees } from "../../api/api";
import brewing from "../../assets/cover.jpg";
import { motion } from "framer-motion";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllcoffees()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#0d0d0d] text-white">
      <Hero />
      <AnimatedProductRow title="Freshly Roasted Picks" products={products.slice(0, 4)} />
      <AnimatedProductRow title="Barista Favorites" products={products.slice(4, 8)} />
      <BrewingGuide />
      <Testimonial />
    </div>
  );
}

function AnimatedProductRow({ title, products }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 sm:px-6 md:px-16 lg:px-24 py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">{title}</h2>
        <button
          onClick={() => navigate("/allproducts")}
          className="text-sm px-6 py-2 border border-[#c6a27e] hover:bg-[#c6a27e] hover:text-black rounded-full transition"
        >
          Explore All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [weight, setWeight] = useState(100);

  const imgSrc = product.image
    ? `http://localhost:5001/uploads/${product.image}`
    : "http://localhost:5001/uploads/placeholder.jpg";

  const price = Math.round(product.pricePerGram * weight);
  const originalPrice = Math.round(price * 1.05);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-[#181818] rounded-3xl w-full shadow-lg hover:shadow-[#c6a27e]/30 hover:scale-[1.02] transition-transform duration-300 cursor-pointer overflow-hidden border border-[#2b2b2b] flex flex-col"
    >
      <div className="h-60 bg-white overflow-hidden relative">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover scale-110 hover:scale-125 transition-transform duration-500"
        />
        <span className="absolute top-2 right-2 bg-[#c6a27e] text-black text-xs font-bold px-2 py-1 rounded-full">
          5% OFF
        </span>
      </div>

      <div className="p-5 flex flex-col justify-between gap-3 flex-grow">
        <h3 className="text-base font-semibold text-white truncate">{product.name}</h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className="font-medium text-white">Rs {price.toLocaleString()}</span>
          <span className="line-through text-xs">Rs {originalPrice.toLocaleString()}</span>
        </div>

        <div className="mt-auto flex justify-between items-center gap-3">
          <select
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#222] text-white border border-[#444] rounded-md text-sm px-3 py-2 focus:outline-none"
          >
            <option value={100}>100g</option>
            <option value={250}>250g</option>
            <option value={500}>500g</option>
            <option value={1000}>1kg</option>
          </select>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                id: product._id,
                title: `${product.name} ${weight}g`,
                price,
                image: imgSrc,
                stock: product.stock,
              });
              toast.success(`${product.name} (${weight}g) added to cart!`);
            }}
            className="bg-[#c6a27e] hover:bg-[#b48d6e] text-black font-semibold text-sm px-5 py-2 rounded-full transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function BrewingGuide() {
  return (
    <section className="bg-[#0f0f0f] px-6 md:px-20 py-24">
      <div className="grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="text-4xl font-extrabold mb-6 text-white">Brew the Perfect Cup</h2>
          <ul className="list-disc text-gray-400 text-base pl-6 leading-relaxed space-y-2">
            <li>Use filtered water at 90–96°C</li>
            <li>Grind beans just before brewing</li>
            <li>Brewing ratio: 1g coffee to 16g water</li>
            <li>Let grounds bloom before full pour</li>
            <li>Try V60, French Press, or Chemex</li>
          </ul>
        </div>
        <div>
          <img
            src={brewing}
            alt="Brewing Tips"
            className="rounded-3xl w-full h-auto max-h-[360px] object-cover shadow-xl border border-gray-700"
          />
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  const reviews = [
    { text: "Loved the smooth flavor and packaging!", name: "Sujal Lama" },
    { text: "These beans changed my mornings!", name: "Ritika Rai" },
    { text: "Bold aroma. Rich taste. Perfect roast!", name: "Kabir Karki" },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#0e0e0e] to-[#1c1c1c] px-4 md:px-8 py-14 text-center">
      <h2 className="text-3xl font-bold text-white mb-8">Voices of the Brewed</h2>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto p-8 border border-gray-800 rounded-3xl bg-[#1a1a1a] shadow-md"
      >
        <p className="text-xl italic text-gray-200 mb-4">“{reviews[index].text}”</p>
        <p className="text-md font-semibold text-[#c6a27e]">{reviews[index].name}</p>
      </motion.div>
    </section>
  );
}
