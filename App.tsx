
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PrepLevelCard from './components/PrepLevelCard';
import { PREP_LEVELS_DATA, VALID_ACCESS_CODES } from './constants';

const HomePage: React.FC = () => (
  <>
    <Hero />
    <section id="levels" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">اختر المرحلة الدراسية</h2>
        <div className="mt-4 h-1 w-20 bg-sky-500 mx-auto rounded-full"></div>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          كل ما يحتاجه طالب المرحلة الإعدادية للتفوق في مادة العلوم في مكان واحد.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {PREP_LEVELS_DATA.map(level => (
          <PrepLevelCard key={level.id} data={level} />
        ))}
      </div>
    </section>

    {/* Featured Section */}
    
  </>
);

const ContentPage: React.FC<{ type: 'videos' | 'notes' }> = ({ type }) => {
  const { levelId } = useParams<{ levelId: string }>();
  const level = PREP_LEVELS_DATA.find(l => l.id === levelId);
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  // Persist unlock status in session storage
  useEffect(() => {
    const unlocked = sessionStorage.getItem(`unlocked_${levelId}`);
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, [levelId]);

  if (!level) return <div className="p-20 text-center">المرحلة غير موجودة.</div>;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = accessCode.trim();
    if (VALID_ACCESS_CODES.includes(trimmedCode)) {
      setIsUnlocked(true);
      setError('');
      sessionStorage.setItem(`unlocked_${levelId}`, 'true');
    } else {
      setError('كود التفعيل غير صحيح، يرجى المحاولة مرة أخرى أو التواصل مع الإدارة.');
    }
  };

  const showLockGate = type === 'videos' && !isUnlocked;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="science-gradient pt-24 pb-40 text-white text-center px-4">
        <h1 className="text-4xl font-bold mb-4">{level.titleAr}</h1>
        <p className="text-sky-100 text-xl">{type === 'videos' ? 'قسم فيديوهات الشرح' : 'قسم مذكرات الشرح'}</p>
        <Link to="/" className="mt-6 inline-block text-white/80 hover:text-white transition-colors">
          ← العودة للرئيسية
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24">
        {showLockGate ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-xl mx-auto border border-sky-100">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">محتوى مغلق</h2>
            <p className="text-gray-500 mb-8">يرجى إدخال أحد أكواد التفعيل الممنوحة لك للوصول إلى فيديوهات الشرح.</p>
            
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="أدخل كود التفعيل"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button
                type="submit"
                className="w-full py-4 science-gradient text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all transform active:scale-95"
              >
                تفعيل المحتوى
              </button>
            </form>
            <p className="mt-6 text-sm text-gray-400">إذا لم يكن لديك كود، يرجى التواصل مع الأستاذة صفاء للحصول على كود خاص بك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {level.lessons.map(lesson => (
              <div key={lesson.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                {type === 'videos' ? (
                  <div className="aspect-video bg-black">
                    <iframe 
                      className="w-full h-full" 
                      src={lesson.videoUrl} 
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-48 bg-teal-50 flex items-center justify-center text-teal-600">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">{lesson.description}</p>
                  {type === 'notes' && (
                    <a 
                      href={lesson.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      فتح المذكرة
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/level/:levelId/videos" element={<ContentPage type="videos" />} />
            <Route path="/level/:levelId/notes" element={<ContentPage type="notes" />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-900 text-gray-400 py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <h3 className="text-white text-xl font-bold mb-2">الأستاذة صفاء إسماعيل</h3>
              <p>خبيرة مادة العلوم للمرحلة الإعدادية</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">فيسبوك</a>
              <a href="#" className="hover:text-white transition-colors">يوتيوب</a>
              <a href="#" className="hover:text-white transition-colors">واتساب</a>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
