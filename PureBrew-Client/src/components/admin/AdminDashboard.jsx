import React, { useState, useEffect } from "react";
import api, {
  getAllcoffees,
  getAllBookings,
  getAllUsers,
  createcoffee,
  updatecoffee,
  deletecoffee,
  updateBookingStatus,
  blockUser,
  unblockUser,
  getProfile,
  updateProfile,
} from "../../api/api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import coverImage from "../../assets/cover.jpg";

const sections = [
  { key: "overview", label: "Dashboard Overview" },
  { key: "products", label: "Product Management" },
  { key: "orders", label: "Order Management" },
  { key: "users", label: "User Management" },
  { key: "contacts", label: "Contact/Inquiry Management" },
  { key: "activity", label: "Activity Logs" },
  { key: "profile", label: "Admin Profile & Settings" },
];

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error) {
    return <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded mb-4">{error.toString()}</div>;
  }
  return React.cloneElement(children, { setError });
}

function DashboardOverview({ setError }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllBookings(),
      getAllUsers(),
      getAllcoffees(),
    ])
      .then(([orders, users, products]) => {
        setOrders(orders);
        setUsers(users);
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      });
  }, [setError]);

  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalUsers = users.length;
  const totalProducts = products.length;
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentOrders = sortedOrders.slice(0, 5);

  if (loading) return <div className="text-white text-center py-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Dashboard Overview</h2>
        <p className="text-gray-300">PureBrew Admin Control Center</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="Total Sales (Rs)" value={totalSales} />
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Total Products" value={totalProducts} />
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="border-b border-white/20 text-left text-sm uppercase tracking-wider">
                <th className="px-4 py-3 text-gray-300">Order ID</th>
                <th className="px-4 py-3 text-gray-300">User</th>
                <th className="px-4 py-3 text-gray-300">Product</th>
                <th className="px-4 py-3 text-gray-300">Total Price</th>
                <th className="px-4 py-3 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-300">{o._id.slice(-6)}</td>
                  <td className="px-4 py-3 text-white">{o.user?.name || "-"}</td>
                  <td className="px-4 py-3 text-white">{o.coffee?.name || "-"}</td>
                  <td className="px-4 py-3 text-white">Rs {o.totalPrice}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-800 text-white rounded-full text-xs uppercase tracking-wider">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm uppercase tracking-wider text-gray-300">{label}</div>
    </div>
  );
}

function ProductManagement({ setError }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", pricePerGram: "", stock: "", image: "" });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    getAllcoffees()
      .then(setProducts)
      .catch((err) => setError(err.message || "Failed to load products"))
      .finally(() => setLoading(false));
  };
  useEffect(fetchProducts, [setError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updatecoffee(editing, form);
        toast.success("Product updated.");
      } else {
        await createcoffee(form);
        toast.success("Product added.");
      }
      setForm({ name: "", description: "", pricePerGram: "", stock: "", image: "" });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to save product");
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      pricePerGram: product.pricePerGram,
      stock: product.stock,
      image: product.image,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setSaving(true);
    try {
      await deletecoffee(id);
      fetchProducts();
      toast.success("Product deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete product");
      toast.error(err.message || "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Product Management</h2>
        <p className="text-gray-300">Manage PureBrew Coffee Products</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Add/Edit Product</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Product Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Enter product name" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              required 
              disabled={saving} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Price Per Gram (Rs)</label>
            <input 
              name="pricePerGram" 
              value={form.pricePerGram} 
              onChange={handleChange} 
              placeholder="Enter price per gram" 
              type="number" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              required 
              disabled={saving} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Stock</label>
            <input 
              name="stock" 
              value={form.stock} 
              onChange={handleChange} 
              placeholder="Enter stock quantity" 
              type="number" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              required 
              disabled={saving} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Image Filename</label>
            <input 
              name="image" 
              value={form.image} 
              onChange={handleChange} 
              placeholder="e.g. arabica.jpg" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              required 
              disabled={saving} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Enter product description" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all h-24" 
              required 
              disabled={saving} 
            />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button 
              type="submit" 
              className="flex-1 bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50" 
              disabled={saving}
            >
              {saving ? "SAVING..." : editing ? "UPDATE PRODUCT" : "ADD PRODUCT"}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={() => { setEditing(null); setForm({ name: "", description: "", pricePerGram: "", stock: "", image: "" }); }} 
                className="px-6 py-4 text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Product Inventory</h3>
        {loading ? (
          <div className="text-white text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-gray-300 text-center py-8">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 text-gray-300">Product</th>
                  <th className="px-4 py-3 text-gray-300">Image</th>
                  <th className="px-4 py-3 text-gray-300">Price/Gram</th>
                  <th className="px-4 py-3 text-gray-300">Stock</th>
                  <th className="px-4 py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map((p) => {
                  const imgSrc = p.image
                    ? `http://localhost:5001/uploads/${p.image}`
                    : "http://localhost:5001/uploads/placeholder.jpg";
                  return (
                    <tr key={p._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3">
                        <img 
                          src={imgSrc} 
                          alt={p.name} 
                          className="h-12 w-12 object-cover rounded-lg border border-white/20"
                          onError={(e) => {
                            e.target.src = "http://localhost:5001/uploads/placeholder.jpg";
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-white">Rs {p.pricePerGram}</td>
                      <td className="px-4 py-3 text-white">{p.stock}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button 
                          onClick={() => handleEdit(p)} 
                          className="bg-gray-800 text-white px-3 py-1 rounded text-xs uppercase tracking-wider hover:bg-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id)} 
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs uppercase tracking-wider hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderManagement({ setError }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    getAllBookings()
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  };
  useEffect(fetchOrders, [setError]);

  const handleStatus = async (id, status) => {
    setSaving(true);
    try {
      await updateBookingStatus(id, status);
      fetchOrders();
      toast.success("Order status updated.");
    } catch (err) {
      setError(err.message || "Failed to update status");
      toast.error(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = ["pending", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Order Management</h2>
        <p className="text-gray-300">Track and Manage Customer Orders</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        {loading ? (
          <div className="text-white text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-300 text-center py-8">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 text-gray-300">Order ID</th>
                  <th className="px-4 py-3 text-gray-300">Customer</th>
                  <th className="px-4 py-3 text-gray-300">Product</th>
                  <th className="px-4 py-3 text-gray-300">Weight (g)</th>
                  <th className="px-4 py-3 text-gray-300">Qty</th>
                  <th className="px-4 py-3 text-gray-300">Total Price</th>
                  <th className="px-4 py-3 text-gray-300">Status</th>
                  <th className="px-4 py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-300">{o._id.slice(-6)}</td>
                    <td className="px-4 py-3 text-white">{o.user?.name || "-"}</td>
                    <td className="px-4 py-3 text-white">{o.coffee?.name || "-"}</td>
                    <td className="px-4 py-3 text-white">{o.weight}</td>
                    <td className="px-4 py-3 text-white">{o.quantity}</td>
                    <td className="px-4 py-3 text-white">Rs {o.totalPrice}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-800 text-white rounded-full text-xs uppercase tracking-wider">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-xs focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
                        value={o.status}
                        onChange={e => handleStatus(o._id, e.target.value)}
                        disabled={saving}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt} className="bg-gray-800">
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UserManagement({ setError }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };
  useEffect(fetchUsers, [setError]);

  const handleBlock = async (id, block) => {
    setSaving(true);
    try {
      if (block) {
        await blockUser(id);
        toast.success("User blocked.");
      } else {
        await unblockUser(id);
        toast.success("User unblocked.");
      }
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update user");
      toast.error(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">User Management</h2>
        <p className="text-gray-300">Manage Customer Accounts</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        {loading ? (
          <div className="text-white text-center py-8">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-300 text-center py-8">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 text-gray-300">User ID</th>
                  <th className="px-4 py-3 text-gray-300">Name</th>
                  <th className="px-4 py-3 text-gray-300">Email</th>
                  <th className="px-4 py-3 text-gray-300">Role</th>
                  <th className="px-4 py-3 text-gray-300">Status</th>
                  <th className="px-4 py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-300">{u._id.slice(-6)}</td>
                    <td className="px-4 py-3 text-white">{u.name}</td>
                    <td className="px-4 py-3 text-white">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-800 text-white rounded-full text-xs uppercase tracking-wider">
                        {u.isAdmin ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.blocked ? (
                        <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded-full text-xs uppercase tracking-wider">Blocked</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs uppercase tracking-wider">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : u.blocked ? (
                        <button 
                          onClick={() => handleBlock(u._id, false)} 
                          className="bg-gray-800 text-white px-3 py-1 rounded text-xs uppercase tracking-wider hover:bg-gray-700 transition-colors" 
                          disabled={saving}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBlock(u._id, true)} 
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs uppercase tracking-wider hover:bg-red-700 transition-colors" 
                          disabled={saving}
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactManagement({ setError }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContacts = () => {
    setLoading(true);
    axios.get("http://localhost:5001/api/contact", {
      withCredentials: true,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setContacts(res.data))
      .catch((err) => setError(err.response?.data?.msg || err.message || "Failed to load messages"))
      .finally(() => setLoading(false));
  };
  useEffect(fetchContacts, [setError]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setSaving(true);
    try {
      await axios.delete(`http://localhost:5001/api/contact/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchContacts();
      toast.success("Message deleted.");
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to delete message");
      toast.error(err.response?.data?.msg || err.message || "Failed to delete message");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Contact Management</h2>
        <p className="text-gray-300">Manage Customer Inquiries</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        {loading ? (
          <div className="text-white text-center py-8">Loading messages...</div>
        ) : contacts.length === 0 ? (
          <div className="text-gray-300 text-center py-8">No messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 text-gray-300">Name</th>
                  <th className="px-4 py-3 text-gray-300">Email</th>
                  <th className="px-4 py-3 text-gray-300">Message</th>
                  <th className="px-4 py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {contacts.map((c) => (
                  <tr key={c._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white">{c.name}</td>
                    <td className="px-4 py-3 text-white">{c.email}</td>
                    <td className="px-4 py-3 text-white max-w-xs truncate">{c.message}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleDelete(c._id)} 
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs uppercase tracking-wider hover:bg-red-700 transition-colors" 
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityLogs({ setError }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setLoading(true);
    const url = userFilter ? `/users/activity-logs?user=${userFilter}` : "/users/activity-logs";
    Promise.all([
      api.get(url),
      getAllUsers()
    ])
      .then(([logRes, users]) => {
        setLogs(Array.isArray(logRes.data) ? logRes.data : []);
        setUsers(users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load activity logs");
        setLoading(false);
      });
  }, [setError, userFilter]);

  if (!Array.isArray(logs)) return <div className="text-red-400 text-center py-8">Error: Activity logs data is not an array.</div>;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Activity Logs</h2>
        <p className="text-gray-300">System Activity Monitoring</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm text-gray-300 uppercase tracking-wider">Filter by user:</label>
          <select 
            value={userFilter} 
            onChange={e => setUserFilter(e.target.value)} 
            className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all"
          >
            <option value="" className="bg-gray-800">All Users</option>
            {users.map(u => <option key={u._id} value={u._id} className="bg-gray-800">{u.name} ({u.email})</option>)}
          </select>
        </div>
        
        {loading ? (
          <div className="text-white text-center py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-300 text-center py-8">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-white text-xs">
              <thead>
                <tr className="border-b border-white/20 text-left uppercase tracking-wider">
                  <th className="px-2 py-2 text-gray-300">Time</th>
                  <th className="px-2 py-2 text-gray-300">User</th>
                  <th className="px-2 py-2 text-gray-300">IP</th>
                  <th className="px-2 py-2 text-gray-300">Action</th>
                  <th className="px-2 py-2 text-gray-300">Method</th>
                  <th className="px-2 py-2 text-gray-300">URL</th>
                  <th className="px-2 py-2 text-gray-300">Info</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-2 py-2 text-gray-300 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-2 text-white">{
                      log.user && typeof log.user === 'object'
                        ? `${log.user.name || ''} (${log.user.email || log.user._id || ''})`
                        : log.user
                          ? log.user
                          : <span className="text-gray-400">Visitor</span>
                    }</td>
                    <td className="px-2 py-2 text-gray-300">{log.ip}</td>
                    <td className="px-2 py-2 text-white">{log.action}</td>
                    <td className="px-2 py-2 text-gray-300">{log.method}</td>
                    <td className="px-2 py-2 text-gray-300">{log.url}</td>
                    <td className="px-2 py-2 text-white">{log.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminProfileSettings({ setError }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ email: data.email, password: "" });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile");
        setLoading(false);
      });
  }, [setError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      await updateProfile(form);
      setSuccess("Profile updated successfully.");
      setForm(f => ({ ...f, password: "" }));
      toast.success("Profile updated.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) return <div className="text-white text-center py-8">Loading profile...</div>;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">Admin Profile & Settings</h2>
        <p className="text-gray-300">Manage Your Account</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Email</label>
            <input 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              type="email" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              required 
              disabled={saving} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">New Password</label>
            <input 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              type="password" 
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:outline-none transition-all" 
              placeholder="Leave blank to keep current password" 
              disabled={saving} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-700 transition-all duration-300 disabled:opacity-50" 
            disabled={saving}
          >
            {saving ? "UPDATING..." : "UPDATE PROFILE"}
          </button>
          {success && <div className="text-green-400 text-sm mt-2 text-center">{success}</div>}
        </form>
        
        <div className="mt-8 pt-8 border-t border-white/20">
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-red-700 transition-all duration-300"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={coverImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen">
        <Toaster position="top-right" />
        
        {/* Navigation Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-wider">PureBrew Admin</h1>
                <p className="text-gray-300 text-sm">Control Center</p>
              </div>
              <div className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} PureBrew
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={`px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    section === s.key
                      ? "bg-white/20 text-white border-b-2 border-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {section === "overview" && <ErrorBoundary><DashboardOverview /></ErrorBoundary>}
          {section === "products" && <ErrorBoundary><ProductManagement /></ErrorBoundary>}
          {section === "orders" && <ErrorBoundary><OrderManagement /></ErrorBoundary>}
          {section === "users" && <ErrorBoundary><UserManagement /></ErrorBoundary>}
          {section === "contacts" && <ErrorBoundary><ContactManagement /></ErrorBoundary>}
          {section === "activity" && <ErrorBoundary><ActivityLogs /></ErrorBoundary>}
          {section === "profile" && <ErrorBoundary><AdminProfileSettings /></ErrorBoundary>}
        </main>
      </div>
    </div>
  );
} 