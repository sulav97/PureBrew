import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getcoffeeById, getAllcoffees } from "../../api/api";
import { useCart } from "../../context/CartContext";
import { Heart } from "lucide-react";

const weights = [100, 250, 500, 1000];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [weight, setWeight] = useState(100);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prod = await getcoffeeById(id);
        setProduct(prod);
        const all = await getAllcoffees();
        setAllProducts(all.filter((p) => p._id !== id));
      } catch (err) {
        toast.error("Product not found");
      }
    };
    fetchData();
  }, [id]);

  if (!product) return <div className="p-12 text-center text-gray-400">Loading...</div>;

  const totalPrice = Number(((product.pricePerGram || 1) * weight).toFixed(2));
  const imageSrc = product.image
    ? `http://localhost:5001/uploads/${product.image}`
    : "http://localhost:5001/uploads/placeholder.jpg";

  const handleBuyNow = () => {
    addToCart({
      id: product._id,
      title: product.name,
      pricePerGram: product.pricePerGram,
      weight,
      totalPrice,
      image: imageSrc,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart!`);
    navigate("/cart");
  };

  return (
    <div className="bg-[#0c0c0c] text-white min-h-screen px-6 md:px-16 py-14 space-y-24">
      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-14 items-center">
        <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-[#1f1f1f]">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full max-w-[400px] h-auto object-contain mx-auto rounded-xl shadow-md"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-[#f5f5f5]">{product.name}</h1>

          <div className="flex items-center justify-between">
            <select
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="px-4 py-2 bg-[#1a1a1a] text-white border border-gray-700 rounded-md text-sm focus:outline-none"
            >
              {weights.map((w) => (
                <option key={w} value={w}>
                  {w === 1000 ? "1kg" : `${w}g`}
                </option>
              ))}
            </select>

            <div className="text-right">
              <div className="text-xl font-semibold text-[#c6a27e]">Rs {totalPrice}</div>
              <div className={`text-sm ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>
          </div>

          <p className="text-sm text-[#c6a27e] font-medium">
            🚛 Ships Anywhere in Nepal • Fast Delivery Available
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
            <FeatureIcon label="Low Acidity" />
            <FeatureIcon label="Rich Aroma" />
            <FeatureIcon label="Farm Sourced" />
            <FeatureIcon label="Pure Roast" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => {
                addToCart({
                  id: product._id,
                  title: product.name,
                  pricePerGram: product.pricePerGram,
                  weight,
                  totalPrice,
                  image: imageSrc,
                  stock: product.stock,
                });
                toast.success(`${product.name} added to cart!`);
              }}
              className="w-full bg-[#c6a27e] hover:bg-[#b28c6b] text-black py-3 rounded-lg font-semibold transition"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full border border-[#c6a27e] text-[#c6a27e] py-3 rounded-lg font-semibold hover:bg-[#c6a27e]/10 transition"
            >
              Buy Now
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">About the Blend</h2>
            <div className="w-16 h-[2px] bg-[#c6a27e] mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
            {product.bulletPoints?.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 pt-3">
                {product.bulletPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-[#f5f5f5]">More from PureBrew</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {allProducts.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { _id, name, pricePerGram, stock, image } = product;
  const [weight, setWeight] = useState(100);
  const navigate = useNavigate();

  const imgSrc = image
    ? `http://localhost:5001/uploads/${image}`
    : "http://localhost:5001/uploads/placeholder.jpg";
  const price = Math.round(pricePerGram * weight);
  const originalPrice = Math.round(price * 1.02);
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

  const handleCardClick = () => navigate(`/product/${_id}`);

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className="bg-[#151515] rounded-xl overflow-hidden shadow-lg border border-[#2b2b2b] cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <span className="absolute top-2 left-2 bg-[#c6a27e] text-black text-xs font-bold px-2 py-0.5 rounded">
          FEATURED
        </span>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-white font-semibold text-base truncate">{name}</h3>
        <div className="flex justify-between items-center text-sm">
          <select
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#222] text-white border border-[#444] rounded-md px-2 py-1"
          >
            <option value={100}>100g</option>
            <option value={250}>250g</option>
            <option value={500}>500g</option>
            <option value={1000}>1kg</option>
          </select>
          <div className="text-right">
            <div className="text-[#c6a27e] font-semibold text-sm">Rs {price}</div>
            <div className="text-xs text-gray-400">Rs {pricePerGramDisplay}/g</div>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="w-full mt-3 bg-[#c6a27e] hover:bg-[#b28c6b] text-black text-sm font-bold py-2 rounded-lg transition"
        >
          🛒 {stock === 0 ? "Out of Stock" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}

function FeatureIcon({ label }) {
  return (
    <div className="flex flex-col items-center bg-[#1a1a1a] text-white py-3 px-4 rounded-xl border border-gray-700 shadow-inner">
      <div className="text-xl mb-1">☕</div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
