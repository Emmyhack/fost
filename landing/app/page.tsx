/**
 * Landing Page
 * Main page for FOST - Web3 SDK Generation Platform
 */

import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import CodeExamples from './components/CodeExamples';
import AIExplainer from './components/AIExplainer';
import Footer from './components/Footer';
import { Navbar } from './components/navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Hero Section */}
      <Hero />

      {/* Divider with accent */}
      <div className="flex justify-center px-4">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Divider */}
      <div className="flex justify-center px-4">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Divider */}
      <div className="flex justify-center px-4">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
      </div>

      {/* Code Examples Section */}
      <CodeExamples />

      {/* Divider */}
      <div className="flex justify-center px-4">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
      </div>

      {/* AI Explainer & FAQ Section */}
      <AIExplainer />

      {/* Divider */}
      <div className="flex justify-center px-4">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent"></div>
      </div>

      {/* CTA & Footer */}
      <Footer />
      </main>
    </>
  );
}
