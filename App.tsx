
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PrepLevelCard from './components/PrepLevelCard';
import { PREP_LEVELS_DATA, VALID_ACCESS_CODES } from './constants';

const ScienceBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden science-grid">
      {/* Atom */}
      <div className="absolute top-[10%] left-[5%] animate-science-float text-sky-400/20">
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
          <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(45 12 12)"/>
          <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-45 12 12)"/>
          <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(90 12 12)"/>
        </svg>
      </div>
      
      {/* Microscope */}
      <div className="absolute bottom-[10%] right-[8%] animate-science-sway text-teal-400/20" style={{ animationDelay: '2s' }}>
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M6 18h8m-8-3h5m-2-3h2m-2-3h2m-6 9V4a2 2 0 012-2h1m2 0h1a2 2 0 012 2v1m-4 2l4 4m-4 0l4-4" />
          <path d="M12 18l3 3m0-3l-3 3M9 22h9" />
        </svg>
      </div>

      {/* DNA */}
      <div className="absolute top-[40%] right-[12%] animate-science-float text-sky-500/10" style={{ animationDelay: '4s' }}>
        <svg width="80" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M8 3c4 4 4 14 0 18M16 3c-4 4-4 14 0 18M8 7h8M8 12h8M8 17h8" />
        </svg>
      </div>

      {/* Flask */}
      <div className="absolute bottom-[40%] left-[10%] animate-science-pulse text-teal-500/20">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M9 3h6M10 3v15a2 2 0 002 2 2 2 0 002-2V3m-4 10h4" />
        </svg>
      </div>

      {/* Molecules / Bubbles */}
      <div className="absolute top-[20%] right-[40%] w-3 h-3 rounded-full bg-sky-300 animate-science-pulse"></div>
      <div className="absolute top-[25%] right-[42%] w-2 h-2 rounded-full bg-teal-300 animate-science-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[30%] left-[45%] w-4 h-4 rounded-full bg-sky-200 animate-science-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[15%] left-[25%] w-2 h-2 rounded-full bg-teal-200 animate-science-pulse" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
};

const HomePage: React.FC = () => (
  <div className="relative">
    <Hero />
    <section id="levels" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900">اختر المرحلة الدراسية</h2>
        <div className="mt-4 h-1.5 w-24 bg-sky-500 mx-auto rounded-full"></div>
        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
كل ما يحتاجه طالب المرحلة الإعدادية للتفوق في مادة العلوم في مكان واحد.        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {PREP_LEVELS_DATA.map(level => (
          <PrepLevelCard key={level.id} data={level} />
        ))}
      </div>
    </section>
  </div>
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

  if (!level) return <div className="p-20 text-center font-bold text-2xl">المرحلة غير موجودة.</div>;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = accessCode.trim();
    if (VALID_ACCESS_CODES.includes(trimmedCode)) {
      setIsUnlocked(true);
      setError('');
      sessionStorage.setItem(`unlocked_${levelId}`, 'true');
    } else {
      setError('كود التفعيل غير صحيح، يرجى المحاولة مرة أخرى.');
    }
  };

  const showLockGate = type === 'videos' && !isUnlocked;

  return (
    <div className="min-h-screen pb-32 relative z-10">
      <div className="science-gradient pt-32 pb-48 text-white text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4">{level.titleAr}</h1>
        <p className="text-sky-100 text-2xl">{type === 'videos' ? '🎥 فيديوهات الشرح' : '📚 مذكرات الشرح'}</p>
        <Link to="/" className="mt-8 inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all">
          ← العودة للرئيسية
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32">
        {showLockGate ? (
          <div className="bg-glass rounded-[2.5rem] shadow-2xl p-10 md:p-16 text-center max-w-xl mx-auto border border-white/50">
            <div className="w-24 h-24 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-sky-600 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">المحتوى محمي</h2>
            <p className="text-gray-500 mb-10 text-lg">يرجى إدخال الكود الخاص بك للبدء في مشاهدة الحصص.</p>
            
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="أدخل كود التفعيل"
                className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-center text-xl font-bold focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-sm"
              />
              {error && <p className="text-red-500 font-bold">{error}</p>}
              <button
                type="submit"
                className="w-full py-5 science-gradient text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform active:scale-95"
              >
                تفعيل الآن
              </button>
            </form>
            <p className="mt-6 text-sm text-gray-400">إذا لم يكن لديك كود، يرجى التواصل مع الأستاذة صفاء للحصول على كود خاص بك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {level.lessons.map(lesson => (
              <div key={lesson.id} className="bg-glass rounded-[2rem] shadow-xl overflow-hidden border border-white/50 flex flex-col hover:shadow-2xl transition-all group">
                {type === 'videos' ? (
                  <div className="aspect-video bg-black relative">
                    <iframe 
                      className="w-full h-full" 
                      src={lesson.videoUrl} 
                        title={lesson.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-48 bg-teal-50 flex items-center justify-center text-teal-600">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{lesson.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-8">{lesson.description}</p>
                  {type === 'notes' && (
                    <a 
                      href={lesson.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal-600/20"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
      <div className="min-h-screen flex flex-col relative bg-slate-50">
        <ScienceBackground />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/level/:levelId/videos" element={<ContentPage type="videos" />} />
            <Route path="/level/:levelId/notes" element={<ContentPage type="notes" />} />
          </Routes>
        </main>
        
        <footer className="bg-gray-900 text-gray-400 py-20 px-4 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-right">
            <div>
              <h3 className="text-white text-2xl font-extrabold mb-4">الأستاذة صفاء إسماعيل</h3>
              <p className="text-lg">رحلتك نحو التميز في مادة العلوم تبدأ من هنا.</p>
            </div>
            <div className="flex justify-center gap-8">
              <a href="https://www.facebook.com/share/16t9uVs1Q1/" className="hover:text-sky-400 transition-colors text-xl">الفيس بوك</a>
              <a href="https://youtube.com/@safaaesmail7729?si=7Pw4o4EbbIpmhgAc" className="hover:text-red-500 transition-colors text-xl">اليوتيوب</a>
              <a href="https://wa.me/201222966617" className="hover:text-green-500 transition-colors text-xl">الواتس اب</a>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة الأستاذة صفاء إسماعيل التعليمية
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
