
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScrollToLevels = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById('levels');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-teal-500">
              Mrs. Safaa Esmail
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-reverse space-x-8">
            <Link to="/" className="text-gray-600 hover:text-sky-600 font-medium transition-colors">الرئيسية</Link>
            <a href="#levels" onClick={handleScrollToLevels} className="text-gray-600 hover:text-sky-600 font-medium transition-colors">المراحل الدراسية</a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700 p-2 transition-transform duration-300" style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with smooth animation */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isMenuOpen ? '200px' : '0px', opacity: isMenuOpen ? 1 : 0 }}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-right text-lg font-medium text-gray-700 hover:text-sky-600 py-2 px-4 rounded-xl hover:bg-sky-50 transition-all">
            الرئيسية
          </Link>
          <a href="#levels" onClick={handleScrollToLevels} className="block text-right text-lg font-medium text-gray-700 hover:text-sky-600 py-2 px-4 rounded-xl hover:bg-sky-50 transition-all">
            المراحل الدراسية
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
