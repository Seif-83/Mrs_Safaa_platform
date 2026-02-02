
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const handleScrollToLevels = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
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
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
