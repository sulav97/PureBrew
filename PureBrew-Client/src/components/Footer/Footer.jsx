import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import beans from "../../assets/loogoo.png"; // Optional floating bean logo

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f] text-gray-200 px-6 sm:px-8 lg:px-16 pt-28 pb-10 relative overflow-hidden">

      {/* Floating Quote - moved lower so it’s not hidden */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 text-sm rounded-full font-semibold shadow-md animate-pulse z-50">
        Brewed with Passion · Delivered with Precision
      </div>

      {/* Optional Floating Beans Logo */}
      <img 
        src={beans} 
        alt="Floating Beans" 
        className="absolute bottom-4 right-4 w-24 opacity-20 animate-float z-0 pointer-events-none" 
      />

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Story */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-yellow-400 tracking-widest">PureBrew</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Elevating your coffee rituals with ethically sourced beans from across the globe.
          </p>
          <div className="flex gap-4 mt-3 text-xl text-gray-500">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400"><FaInstagram /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400"><FaTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-yellow-400"><FaYoutube /></a>
          </div>
        </div>

        {/* Explore Menu */}
        <div className="text-sm space-y-2">
          <h3 className="uppercase text-yellow-400 text-xs font-semibold mb-2 tracking-wider">Explore</h3>
          <Link to="/allproducts" className="block hover:text-yellow-300">All Beans</Link>
          <Link to="/" className="block hover:text-yellow-300">Home</Link>
          <Link to="/cart" className="block hover:text-yellow-300">Your Cart</Link>
        </div>

        {/* Company Info */}
        <div className="text-sm space-y-2">
          <h3 className="uppercase text-yellow-400 text-xs font-semibold mb-2 tracking-wider">Company</h3>
          <Link to="/about" className="block hover:text-yellow-300">About PureBrew</Link>
          <Link to="/contact" className="block hover:text-yellow-300">Contact</Link>
        </div>

        {/* Brew Tip - Simple & Effective */}
        <div className="text-sm space-y-4">
          <h3 className="uppercase text-yellow-400 text-xs font-semibold tracking-wider">Brew Tip</h3>
          <p className="text-gray-400">
            For a perfect pour-over, bloom your grounds for 30 seconds before a slow spiral pour.
          </p>
          <p className="italic text-gray-500">– The PureBrew Team</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800 mt-16 pt-6 text-center text-xs text-gray-500 space-y-2">
        <div>© {new Date().getFullYear()} PureBrew Ecom. Bold Beans. Bold Life.</div>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/cookie-settings" className="hover:underline">Cookie Settings</Link>
          <Link to="/terms" className="hover:underline">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
