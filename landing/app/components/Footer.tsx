/**
 * CTA & Footer Component
 * Final call-to-action section and footer with links
 * Update SITE_CONFIG in constants.ts to change links and branding
 */

import Link from 'next/link';
import { SITE_CONFIG } from '../constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-green-light via-white to-accent-green-light border-t border-accent-green border-opacity-30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            Get Started Today
          </h2>
          <p className="mb-8 text-lg text-gray-600 max-w-2xl mx-auto">
            Download the CLI and generate your first SDK in minutes. Free, open-source, and fully owned by you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={SITE_CONFIG.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Download CLI
            </Link>
            <Link
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-accent-green text-accent-green font-semibold rounded-lg hover:bg-accent-green hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                {SITE_CONFIG.title}
              </h3>
              <p className="text-sm text-gray-400">
                AI-powered SDK generation for Web2 & Web3
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={SITE_CONFIG.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href={SITE_CONFIG.npm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Download CLI
                  </Link>
                </li>
                <li>
                  <Link
                    href={SITE_CONFIG.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Community
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={SITE_CONFIG.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@fostdev.com"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link
                    href={SITE_CONFIG.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    GitHub Issues
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={SITE_CONFIG.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Repository
                  </Link>
                </li>
                <li>
                  <a
                    href="https://opensource.org/licenses/MIT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    License (MIT)
                  </a>
                </li>
                <li>
                  <Link
                    href={SITE_CONFIG.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-accent-green transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
            <p>
              &copy; {currentYear} {SITE_CONFIG.title}. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link
                href={SITE_CONFIG.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-green transition-colors"
              >
                GitHub
              </Link>
              <Link
                href={SITE_CONFIG.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-green transition-colors"
              >
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
