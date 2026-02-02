
import React from 'react';

interface HeroProps {
  onStartNowClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartNowClick }) => {
  const handleContactWhatsApp = () => {
    const phoneNumber = '201222966617';
    const message = 'مرحباً، أود الاستفسار عن منصة ماما';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-32">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-right">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block">تعلم العلوم بمتعة مع</span>
              <span className="block text-sky-600 mt-2">الأستاذة صفاء إسماعيل</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              منصة تعليمية متكاملة لطلاب المرحلة الإعدادية. شروحات مبسطة، فيديوهات تفاعلية، ومذكرات شاملة لكل درس.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-right lg:mx-0 flex flex-wrap gap-4 justify-center lg:justify-start">
              <button onClick={onStartNowClick} className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-2xl text-white science-gradient hover:shadow-lg transition-all transform hover:-translate-y-1">
                ابدأ الدراسة الآن
              </button>
              <button onClick={handleContactWhatsApp} className="inline-flex items-center px-8 py-3 border-2 border-sky-100 text-base font-medium rounded-2xl text-sky-700 bg-sky-50 hover:bg-sky-100 transition-all">
                تواصل معنا
              </button>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-3xl shadow-2xl overflow-hidden ring-8 ring-white">
              <img
                className="w-full object-cover"
                src="/sections/logo2.jpg"
                alt="Science Classroom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
