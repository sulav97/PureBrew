import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getProfile } from "../../api/api";
import toast from "react-hot-toast";
import Payment from "../Payment/Payment";
import { v4 as uuidv4 } from "uuid";
import { generateEsewaSignature } from "../../utils/esewaSignature";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateWeight,
  } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const esewaFormRef = useRef(null);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setAddress(data.address || "");
        setPhone(data.phone || "");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to fetch profile info");
      });
  }, []);

  const weightOptions = [100, 250, 500, 1000];
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.totalPrice || 0) * Number(item.quantity || 1),
    0
  );
  const shipping = cartItems.length > 0 ? 20 : 0;
  const total = subtotal + shipping;

  const handlePaymentSuccess = () => {
    setShowModal(true);
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  return (
    <div className="bg-[#111] text-white min-h-screen px-4 py-12 md:px-20 font-sans tracking-wide">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold uppercase tracking-wider">
            PureBrew Cart
          </h1>
          <p
            onClick={() => navigate("/")}
            className="text-sm underline text-[#c6a27e] cursor-pointer hover:text-yellow-500"
          >
            ← Continue Shopping
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-[#1b1b1b] rounded-xl p-6 shadow-lg space-y-6 border border-[#2a2a2a]">
            <h2 className="text-2xl font-semibold border-b border-[#333] pb-3">
              Bag Summary
            </h2>
            {cartItems.length === 0 ? (
              <div className="text-gray-400 text-center text-lg py-10">
                Your coffee bag is empty.
              </div>
            ) : (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div
                    key={item.id + "-" + item.weight}
                    className="grid sm:grid-cols-[100px_1fr] gap-6 border-b border-[#333] pb-6"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded-xl border border-[#444]"
                    />
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={item.weight}
                          onChange={(e) =>
                            updateWeight(item.id, item.weight, Number(e.target.value))
                          }
                          className="px-3 py-1 rounded-md text-sm bg-[#222] border border-[#555]"
                        >
                          {weightOptions.map((w) => (
                            <option key={w} value={w}>
                              {w === 1000 ? "1kg" : `${w}g`}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-400">Weight</span>

                        <div className="flex items-center gap-2 border border-[#444] px-2 py-1 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.weight, Math.max(1, item.quantity - 1))
                            }
                            className="text-sm px-2 hover:text-[#c6a27e]"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.weight, item.quantity + 1)
                            }
                            className="text-sm px-2 hover:text-[#c6a27e]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-[#c6a27e] text-base font-semibold">
                        Rs {Number(item.totalPrice || 0) * Number(item.quantity || 1)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.weight)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="bg-[#1b1b1b] rounded-xl p-6 shadow-lg space-y-6 border border-[#2a2a2a]">
            <h2 className="text-2xl font-semibold mb-3 border-b border-[#333] pb-2">
              Checkout
            </h2>

            {/* Shipping */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Delivery Address"
                className="w-full px-4 py-2 bg-[#111] border border-[#444] rounded-md text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full px-4 py-2 bg-[#111] border border-[#444] rounded-md text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Rs {shipping}</span>
              </div>
              <div className="flex justify-between text-[#c6a27e] font-bold text-base pt-1 border-t border-[#333] mt-2">
                <span>Total</span>
                <span>Rs {total}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <h4 className="text-sm font-medium mb-2">Select Payment</h4>
              <div className="space-y-2">
                {["cod", "khalti", "esewa"].map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>
                      {method === "cod" && "Cash on Delivery"}
                      {method === "khalti" && "Khalti"}
                      {method === "esewa" && "eSewa"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {/* Payment Form */}
            {paymentMethod !== "esewa" && (
              <Payment
                cart={cartItems}
                address={address}
                contact={phone}
                paymentMethod={paymentMethod}
                total={total}
                setError={setError}
                setLoading={setLoading}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {paymentMethod === "esewa" && cartItems.length > 0 && (() => {
              const transaction_uuid = uuidv4();
              const { signedFieldNames, signature } = generateEsewaSignature({
                total_amount: total,
                transaction_uuid,
                product_code: "EPAYTEST",
              });

              return (
                <form
                  ref={esewaFormRef}
                  action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                  method="POST"
                >
                  <input type="hidden" name="amount" value={subtotal} />
                  <input type="hidden" name="tax_amount" value="0" />
                  <input type="hidden" name="total_amount" value={total} />
                  <input type="hidden" name="transaction_uuid" value={transaction_uuid} />
                  <input type="hidden" name="product_code" value="EPAYTEST" />
                  <input type="hidden" name="product_service_charge" value="0" />
                  <input type="hidden" name="product_delivery_charge" value={shipping} />
                  <input type="hidden" name="success_url" value="http://localhost:5174/paymentsuccess" />
                  <input type="hidden" name="failure_url" value="http://localhost:5174/paymentfailure" />
                  <input type="hidden" name="signed_field_names" value={signedFieldNames} />
                  <input type="hidden" name="signature" value={signature} />

                  <button
                    type="submit"
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                  >
                    Pay with eSewa
                  </button>
                </form>
              );
            })()}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
            <div className="bg-[#222] text-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center space-y-2">
              <h3 className="text-xl font-semibold">Thank you!</h3>
              <p className="text-sm text-gray-300">Redirecting to PureBrew home...</p>
              <div className="w-full h-1.5 bg-gray-600 rounded overflow-hidden mt-3">
                <div className="h-full bg-yellow-500 animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
