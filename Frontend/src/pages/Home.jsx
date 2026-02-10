import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CTA from '../components/CTA';

const Home = () => {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-900 mt-12 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Aegis Security Systems. Protecting AI deployments worldwide.</p>
      </footer>
    </main>
  );
};

export default Home;
