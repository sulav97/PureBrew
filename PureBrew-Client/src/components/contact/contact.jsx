import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../../api/api";
import { motion } from "framer-motion";
import bg from "../../assets/cover.jpg";
import { verifyFormDataIntegrity, verifyExternalLinkIntegrity } from '../../utils/integrityUtils';

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "Do you sell organic coffee?",
      answer: "Yes, all our beans are 100% organic, handpicked, and sun-dried.",
    },
    {
      question: "Can I customize grind size for my order?",
      answer: "Absolutely. Select grind type before checkout: coarse, medium, fine, or espresso.",
    },
    {
      question: "Where do you source your beans from?",
      answer: "We work directly with farmers in Gulmi, Syangja, and other high-altitude regions of Nepal.",
    },
    {
      question: "Is international shipping available?",
      answer: "Currently, PureBrew ships across Nepal only. Global shipping coming soon.",
    },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Verify form data integrity before submission
    if (!verifyFormDataIntegrity(form)) {
      toast.error("Invalid form data detected. Please check your input.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, form);
      
      // ✅ Verify API response integrity
      if (response.data && response.data.msg) {
        toast.success(response.data.msg);
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={bg} alt="cover" className="w-full h-full object-cover opacity-20" />
      </div>

      {/* Hero Title */}
      <div className="relative z-10 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold"
        >
          Get in Touch with PureBrew
        </motion.h1>
        <p className="text-gray-300 mt-4">We're here to answer your queries, concerns, or collaborations.</p>
      </div>

      {/* Contact Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Info Box */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1a1a1a] p-8 rounded-2xl shadow-lg backdrop-blur-md space-y-6 border border-[#2c2c2c]"
        >
          <h2 className="text-2xl font-bold text-yellow-400">Contact Info</h2>
          <p className="text-sm text-gray-400">
            Our customer support team typically responds within 12 hours.
          </p>
          <ul className="space-y-3 text-sm">
            <li><strong>Email:</strong> purebrewbeans@gmail.com</li>
            <li><strong>Phone:</strong> 9825956956</li>
            <li><strong>Location:</strong> Dot Trade, Kapan, Kathmandu, Nepal</li>
            <li><strong>Hours:</strong> Mon–Fri, 9:00 AM to 6:00 PM</li>
          </ul>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ x: 40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 border border-[#2e2e2e] backdrop-blur-sm p-8 rounded-2xl shadow-xl space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-black/20 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-yellow-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-black/20 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-yellow-400"
            />
          </div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-black/20 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-yellow-400"
          />
          <textarea
            name="message"
            rows="4"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full bg-black/20 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-yellow-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-md transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center mb-10 text-yellow-400"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1e1e1e] rounded-lg border border-[#2e2e2e] p-6"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full text-left text-lg font-semibold text-white flex justify-between"
              >
                {faq.question}
                <span className="text-xl">{openFAQ === index ? "−" : "+"}</span>
              </button>
              {openFAQ === index && (
                <p className="mt-3 text-sm text-gray-400">{faq.answer}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Map with integrity verification */}
      <section className="relative z-10 px-6 pb-20">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold text-white mb-4"
        >
          Find Us On Map
        </motion.h3>
        <div className="overflow-hidden rounded-xl border border-[#2c2c2c]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.8098721310366!2d85.35553837534103!3d27.692567376192988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1bb297270d3f%3A0x7bce0075d98f7859!2sDot%20Trade!5e0!3m2!1sen!2snp!4v1719828582076!5m2!1sen!2snp"
            width="100%"
            height="320"
            allowFullScreen
            loading="lazy"
            className="w-full h-[320px] border-0"
            title="PureBrew Store Location"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
