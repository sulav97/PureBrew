import React, { useState, useEffect } from "react";
import { getUserBookings } from "../../api/api";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    getUserBookings()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
        setLoading(false);
      });
  }, []);

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelModal(true);
    setCancelReason("");
  };

  const confirmCancel = () => {
    setOrders((prev) => prev.filter((order) => order._id !== selectedOrderId));
    setCancelModal(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white px-6 py-12 md:px-16 font-sans">
      <h1 className="text-3xl font-extrabold tracking-tight text-center mb-10 border-b border-[#2d2d2d] pb-4">
        My Orders – PureBrew
      </h1>

      {loading ? (
        <div className="text-center text-gray-400 text-lg">Fetching your orders...</div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders placed yet.</div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const img = order.coffee?.image
              ? `http://localhost:5001/uploads/${order.coffee.image}`
              : "http://localhost:5001/uploads/placeholder.jpg";

            return (
              <div
                key={order._id}
                className="bg-[#1c1c1c] border border-[#2b2b2b] p-6 rounded-2xl shadow-sm transition hover:shadow-md"
              >
                <div className="grid md:grid-cols-5 gap-6 items-center">
                  <div className="col-span-1">
                    <img
                      src={img}
                      alt={order.coffee?.name}
                      className="w-full h-28 object-cover rounded-xl border border-[#333]"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <p className="text-lg font-semibold">{order.coffee?.name}</p>
                    <div className="text-sm text-gray-400">Order ID: #{order._id.slice(-6)}</div>
                    <div className="flex gap-4 text-sm">
                      <div>Qty: {order.quantity}</div>
                      <div>Weight: {order.weight}g</div>
                    </div>
                    <div className="text-[#c6a27e] font-bold text-sm">
                      Rs {order.totalPrice}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2 text-sm">
                    <p className="text-gray-400">
                      <span className="text-white font-medium">Address:</span> {order.address}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-medium">Phone:</span> {order.phone}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${
                        order.status === "pending"
                          ? "text-yellow-400"
                          : order.status === "shipped"
                          ? "text-blue-500"
                          : order.status === "delivered"
                          ? "text-green-400"
                          : order.status === "cancelled"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                      {order.status === "pending" && (
                        <button
                          onClick={() => openCancelModal(order._id)}
                          className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center px-4">
          <div className="bg-[#1e1e1e] text-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl border border-[#333]">
            <h2 className="text-xl font-semibold">Cancel Order</h2>
            <p className="text-sm text-gray-400">
              Please select a reason for cancelling this order:
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full mt-2 bg-[#2a2a2a] border border-[#444] text-white text-sm px-3 py-2 rounded-md focus:outline-none"
            >
              <option value="">-- Select Reason --</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded border border-gray-600 text-sm hover:bg-[#2b2b2b]"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason}
                className={`px-4 py-2 text-sm rounded ${
                  cancelReason
                    ? "bg-[#c6a27e] text-black hover:bg-[#b4946d]"
                    : "bg-[#555] cursor-not-allowed text-gray-300"
                }`}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrder;
