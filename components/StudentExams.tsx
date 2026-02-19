import React from 'react';
import { Link } from 'react-router-dom';
import { useExamStore } from '../useExamStore';

const StudentExams: React.FC = () => {
  const { exams, isLoading } = useExamStore();

  const studentLevel = sessionStorage.getItem('student_level');
  if (!studentLevel) {
    return (
      <div className="p-10 text-center">يرجى تسجيل الدخول كطالب لعرض الاختبارات.</div>
    );
  }

  const available = exams.filter(e => e.published && e.levelId === studentLevel);

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">الاختبارات المتاحة</h1>
        <p className="text-sky-100 text-xl">اختر اختباراً لقياس مستواك</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading && <div>جاري التحميل...</div>}
          {!isLoading && available.length === 0 && (
            <div className="p-10 bg-white rounded-xl text-center">لا توجد اختبارات منشورة لمرحلتك.</div>
          )}
          {available.map(ex => (
            <div key={ex.id} className="p-6 bg-white rounded-2xl border flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl">{ex.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{ex.description}</p>
                <p className="text-xs text-gray-400 mt-2">أسئلة: {ex.questions?.length ?? 0} • زمن: {ex.timeLimitMinutes ?? 'غير محدد'}</p>
              </div>
              <div className="mt-4">
                <Link to={`/exam/${ex.id}`} className="px-4 py-3 bg-sky-600 text-white rounded-xl">ابدأ الاختبار</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentExams;
