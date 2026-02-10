import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">
              AI Security Testing Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1]">
            Secure Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              AI Frontier
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
            Automated security scanning for LLMs, RAG systems, and AI agents.
            Test for prompt injections, data leakage, and OWASP Top 10 vulnerabilities.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-900/70"
            >
              Start Free Scan
            </Link>
            <button className="border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-900/50 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200">
              View Demo
            </button>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-[#020617] flex items-center justify-center text-white font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Trusted by <span className="text-white font-bold">200+</span> AI teams
            </p>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">

            {/* Mock Terminal */}
            <div className="bg-[#0B1120] rounded-lg border border-gray-800 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">$</span>
                  <span className="text-gray-400">guardian-ai scan --endpoint https://api.myapp.com</span>
                </div>
                <div className="text-blue-400">⚡ Running security tests...</div>
                <div className="text-yellow-500">⚠️  Found 3 vulnerabilities</div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">✗</span>
                  <span className="text-gray-400">Prompt injection detected</span>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 bg-blue-600 rounded-xl p-4 shadow-2xl shadow-blue-900/50 border border-blue-500">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🛡️</div>
                <div>
                  <div className="text-white font-bold text-sm">Protected</div>
                  <div className="text-blue-200 text-xs">OWASP Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;