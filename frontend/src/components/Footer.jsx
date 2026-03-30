import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Explore */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Explore</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-[#2dd4a1] transition-colors">Our Mission</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#2dd4a1] transition-colors">Our Technology</Link></li>
              <li><Link to="/analyze" className="hover:text-[#2dd4a1] transition-colors">How It Works</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#2dd4a1] transition-colors">Sample Reports</Link></li>
              <li><a href="/?openCaseStudies=true" className="hover:text-[#2dd4a1] transition-colors">Case Studies</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Connect</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-[#2dd4a1] transition-colors">Contact Us</Link></li>
              <li><button onClick={() => setShowSupportModal(true)} className="hover:text-[#2dd4a1] transition-colors text-left">Partnership</button></li>
              <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-[#2dd4a1] transition-colors">Developer API</a></li>
              <li><button onClick={() => setShowSupportModal(true)} className="hover:text-[#2dd4a1] transition-colors text-left">Support Center</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Resources</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-[#2dd4a1] transition-colors">Documentation</a></li>
              <li><Link to="/analyze" className="hover:text-[#2dd4a1] transition-colors">Try Demo</Link></li>
              <li><Link to="/chat" className="hover:text-[#2dd4a1] transition-colors">AI Assistant</Link></li>
              <li><Link to="/signup" className="hover:text-[#2dd4a1] transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Sign Up for Updates */}
          <div>
            <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Stay Updated</h4>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Get the latest environmental insights and product updates.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@email.com"
                className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4a1] transition-colors text-sm"
                required
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#1f7a63] hover:bg-[#2dd4a1] text-white rounded-lg font-semibold transition-colors text-sm"
              >
                SIGN UP
              </button>
            </form>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h5 className="text-sm font-semibold text-gray-400 mb-4">FOLLOW US</h5>
              <div className="flex gap-4 justify-center sm:justify-start">
                {[
                  { icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z", label: "Twitter", url: "https://twitter.com" },
                  { icon: "M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z", label: "LinkedIn", url: "https://linkedin.com" },
                  { icon: "M12 0c-5.523 0-10 4.477-10 10 0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 18.163 22 14.418 22 10c0-5.523-4.477-10-10-10z", label: "GitHub", url: "https://github.com" },
                  { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", label: "Instagram", url: "https://instagram.com" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-[#1f7a63] rounded-full flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1f7a63] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold">GreenGPT</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>
              © 2026 GreenGPT. Environmental Intelligence Platform. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/contact" className="hover:text-[#2dd4a1] transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-[#2dd4a1] transition-colors">Terms of Service</Link>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#2dd4a1] transition-colors">Google Privacy</a>
              <Link to="/about" className="hover:text-[#2dd4a1] transition-colors">Accessibility</Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-600 text-center md:text-left">
            <p>
              GreenGPT is powered by Google Gemini AI. This platform is designed for environmental analysis and research purposes. 
              Data processing complies with international environmental data standards.
            </p>
          </div>
        </div>
      </div>

      {/* Partnership/Support Modal */}
      {showSupportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-linear-to-r from-[#1f7a63] to-[#155744] p-8">
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-3xl font-bold text-white mb-2">
                Partnership & Support
              </h2>
              <p className="text-white/90">
                Let's work together for a sustainable future
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Partnership Opportunities
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We collaborate with governments, NGOs, research institutions, and corporations to drive environmental impact. Whether you're looking to integrate our AI technology, co-develop solutions, or scale environmental initiatives, we'd love to explore partnership opportunities.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#2dd4a1]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Support & Assistance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our support team is here to help you maximize the value of GreenGPT. From technical assistance to best practices guidance, we're committed to your success in environmental analysis and reporting.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Get in touch with us:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/contact"
                      onClick={() => setShowSupportModal(false)}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-[#1f7a63] to-[#2dd4a1] hover:from-[#2dd4a1] hover:to-[#1f7a63] text-white rounded-xl font-semibold text-center transition-all transform hover:scale-105"
                    >
                      Contact Us
                    </Link>
                    <a
                      href="mailto:partnerships@greengpt.ai"
                      className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold text-center transition-all"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
