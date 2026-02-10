import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            Guardian AI LLM
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#product"
            className="text-gray-400 hover:text-white transition"
          >
            Product
          </a>
          <a
            href="#solutions"
            className="text-gray-400 hover:text-white transition"
          >
            Solutions
          </a>
          <a
            href="#pricing"
            className="text-gray-400 hover:text-white transition"
          >
            Pricing
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-bold hover:text-white text-gray-300 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30"
            >
              Sign Up
            </Link>
          </div>

          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30"
          >
            Start Scan
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
