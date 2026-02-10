import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="bg-blue-600 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Test Your LLM?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join developers and security teams using Aegis to validate AI deployments before production.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="bg-white text-blue-900 font-bold px-8 py-3 rounded-md hover:bg-gray-100 transition">
              Run Free Security Scan
            </Link>
            <button className="bg-transparent border border-blue-400 text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition">
              View Documentation
            </button>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default CTA;
