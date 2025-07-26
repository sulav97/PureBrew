import React from "react";
import logo from "../../assets/aboutus.png";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const About = () => {
  const beanFacts = [
    { name: "Arabica", caffeine: "80–140 mg", strength: "Mild" },
    { name: "Robusta", caffeine: "140–200 mg", strength: "Strong" },
    { name: "Liberica", caffeine: "100–150 mg", strength: "Bold" },
    { name: "Excelsa", caffeine: "100–140 mg", strength: "Tangy" },
  ];

  return (
    <div className="bg-gradient-to-b from-[#1f1f1f] via-[#1a1a1a] to-black text-white min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src={logo}
          alt="PureBrew Logo"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold tracking-tight"
          >
            PureBrew Coffee
          </motion.h1>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
            Awaken your senses with premium Nepali beans roasted to perfection.
          </p>
        </div>
      </div>

      {/* Features */}
      <section className="py-20 px-6 bg-[#111111]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[
            {
              title: "Sourced from Altitude",
              desc: "Hand-picked beans from Himalayan terrain for natural flavor strength.",
            },
            {
              title: "Roasted Fresh Daily",
              desc: "Small-batch roasting ensures every sip is aromatic, rich, and satisfying.",
            },
            {
              title: "Sustainable Impact",
              desc: "Fair partnerships with Nepali farmers to promote ethical growth.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (i + 1) }}
              className="bg-[#1a1a1a] p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              <Star className="mx-auto text-yellow-400 mb-4" size={28} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-12 py-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1f1f1f] p-8 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Our Mission</h2>
          <p className="text-gray-300">
            Deliver world-class beans that empower local farmers, preserve Nepali coffee heritage,
            and give you an unmatched sensory experience.
          </p>
        </motion.div>
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1f1f1f] p-8 rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Our Vision</h2>
          <p className="text-gray-300">
            To be Nepal’s most trusted specialty coffee exporter — rooted in excellence,
            traceability, and innovation.
          </p>
        </motion.div>
      </section>

      {/* Bean Table */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-10"
        >
          Coffee Bean Caffeine Guide
        </motion.h2>
        <div className="overflow-x-auto bg-[#1a1a1a] backdrop-blur-sm rounded-xl border border-[#333] shadow-lg">
          <table className="min-w-full text-sm text-gray-200">
            <thead className="bg-[#292929]">
              <tr>
                <th className="px-6 py-4 text-left">Bean Type</th>
                <th className="px-6 py-4 text-left">Caffeine (8oz cup)</th>
                <th className="px-6 py-4 text-left">Taste Profile</th>
              </tr>
            </thead>
            <tbody>
              {beanFacts.map((bean, i) => (
                <tr key={bean.name} className={i % 2 === 0 ? "bg-[#1f1f1f]" : "bg-[#242424]"}>
                  <td className="px-6 py-4 font-medium">{bean.name}</td>
                  <td className="px-6 py-4">{bean.caffeine}</td>
                  <td className="px-6 py-4">{bean.strength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t border-[#222]">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-sm"
        >
          © 2025 PureBrew Beans — Grown with pride in Nepal. Roasted for the world.
        </motion.p>
      </section>
    </div>
  );
};

export default About;
