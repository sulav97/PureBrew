// AllProducts.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { getAllcoffees } from "../../api/api";
import { Link, useLocation, useNavigate } from "react-router-dom";

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const query = useQuery();
  const search = query.get("search") || "";
  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    setLoading(true);
    getAllcoffees()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load products");
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.name)))];
  const categoryFiltered =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.name === selectedCategory);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return categoryFiltered;
    const term = debouncedSearch.trim().toLowerCase();
    return categoryFiltered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.keywords && p.keywords.toLowerCase().includes(term))
    );
  }, [categoryFiltered, debouncedSearch]);

  return (
    <div className="bg-[#0d0d0d] text-white px-4 md:px-16 py-10 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-4xl font-extrabold text-center mb-10 text-[#c6a27e] drop-shadow-lg">
        Explore All Brews
      </h1>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 border ${
              selectedCategory === cat
                ? "bg-[#c6a27e] text-black scale-105 border-transparent"
                : "border-[#c6a27e] text-white hover:bg-[#c6a27e] hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-lg">Loading brews...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No brews matched your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { _id, name, pricePerGram, stock, image } = product;
  const [weight, setWeight] = useState(100);

  const imgSrc = image
    ? `http://localhost:5001/uploads/${image}`
    : "http://localhost:5001/uploads/placeholder.jpg";

  const price = Math.round(pricePerGram * weight);
  const originalPrice = Math.round(price * 1.05);
  const pricePerGramDisplay = pricePerGram.toFixed(2);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: _id,
      title: `${name} ${weight}g`,
      price,
      image: imgSrc,
      stock,
    });
    toast.success(`${name} (${weight}g) added to cart!`);
  };

  const handleCardClick = () => {
    navigate(`/product/${_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      className="bg-[#181818] rounded-2xl overflow-hidden shadow-md hover:shadow-[#c6a27e]/30 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      <div className="h-60 overflow-hidden relative">
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover scale-110 hover:scale-125 transition-transform duration-500"
        />
        <span className="absolute top-2 left-2 bg-[#c6a27e] text-black text-xs font-bold px-2 py-1 rounded-full">
          5% OFF
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-white truncate">{name}</h3>
        <div className="flex items-center justify-between">
          <select
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#222] text-white border border-[#444] rounded-md text-sm px-3 py-1 focus:outline-none"
          >
            <option value={100}>100g</option>
            <option value={250}>250g</option>
            <option value={500}>500g</option>
            <option value={1000}>1kg</option>
          </select>

          <div className="text-right">
            <span className="block text-sm line-through text-gray-400">Rs {originalPrice}</span>
            <span className="block text-lg font-bold text-[#c6a27e]">Rs {price}</span>
            <span className="text-xs text-gray-300">(Rs {pricePerGramDisplay}/g)</span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="mt-3 w-full bg-[#c6a27e] hover:bg-[#b48d6e] text-black font-semibold text-sm py-2 rounded-full transition"
        >
          🛒 {stock === 0 ? "Out of Stock" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}
