
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isStudentLoggedIn = sessionStorage.getItem('student_logged_in') === 'true';
  const studentName = sessionStorage.getItem('student_name') || '';

  const handleStudentLogout = () => {
    sessionStorage.removeItem('student_logged_in');
    sessionStorage.removeItem('student_name');
    sessionStorage.removeItem('student_phone');
    setIsMenuOpen(false);
    navigate('/');
    // Force re-render
    window.location.reload();
  };

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

          <div className="hidden md:flex items-center space-x-reverse space-x-6">
            <Link to="/" className="text-gray-600 hover:text-sky-600 font-medium transition-colors">الرئيسية</Link>
            <a href="#levels" onClick={handleScrollToLevels} className="text-gray-600 hover:text-sky-600 font-medium transition-colors">المراحل الدراسية</a>
            {isStudentLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sky-600 font-bold text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {studentName}
                </span>
                <button
                  onClick={handleStudentLogout}
                  className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  خروج
                </button>
              </div>
            ) : (
              <Link to="/student-login" className="bg-gradient-to-r from-sky-500 to-teal-400 text-white px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-sky-500/30 transition-all">
                تسجيل الدخول
              </Link>
            )}
            <Link to="/admin-login" className="text-gray-400 hover:text-sky-600 font-medium transition-colors text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              لوحة التحكم
            </Link>
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
          {isStudentLoggedIn ? (
            <div className="flex items-center justify-between py-2 px-4">
              <span className="text-sky-600 font-bold">{studentName}</span>
              <button onClick={handleStudentLogout} className="text-red-500 text-sm font-bold">خروج</button>
            </div>
          ) : (
            <Link to="/student-login" onClick={() => setIsMenuOpen(false)} className="block text-right text-lg font-medium text-sky-600 py-2 px-4 rounded-xl bg-sky-50 transition-all">
              تسجيل الدخول
            </Link>
          )}
          <Link to="/admin-login" onClick={() => setIsMenuOpen(false)} className="block text-right text-sm font-medium text-gray-400 hover:text-sky-600 py-2 px-4 rounded-xl hover:bg-sky-50 transition-all">
            ⚙️ لوحة التحكم
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
