const Features = () => {
  const features = [
    {
      icon: "🎯",
      title: "Prompt Injection Testing",
      desc: "Automated detection of jailbreaks, role manipulation, and instruction override attacks across 100+ attack vectors.",
      color: "from-red-500/10 to-orange-500/10 border-red-500/20"
    },
    {
      icon: "🔒",
      title: "RAG Security Analysis",
      desc: "Test for vector poisoning, context manipulation, and adversarial passage injection in retrieval systems.",
      color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
    },
    {
      icon: "⚡",
      title: "Agent Permission Audits",
      desc: "Validate tool access controls, detect privilege escalation attempts, and audit multi-agent interactions.",
      color: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
    }
  ];

  const stats = [
    { value: "0 Code", label: "REQUIRED TO START" },
    { value: "100%", label: "OWASP COVERAGE" },
    { value: "5 Min", label: "AVERAGE SCAN TIME" },
    { value: "OWASP", label: "TOP 10 ALIGNED" }
  ];

  return (
    <section className="bg-[#020617] py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-3">How It Works</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-6">Zero-Code Security Testing</h3>
          <p className="text-gray-400 text-xl leading-relaxed max-w-3xl mx-auto">
            Just provide your LLM endpoint. We automatically run hundreds of adversarial tests and generate a comprehensive security report.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {features.map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-gradient-to-br ${item.color} backdrop-blur-sm p-8 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
              <p className="text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-gray-800 rounded-2xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-3">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
