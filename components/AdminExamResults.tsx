import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../useExamStore';
import { ExamResult } from '../types';

const AdminExamResults: React.FC = () => {
  const navigate = useNavigate();
  const { exams, getResultsForExam } = useExamStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (selected) load(selected); }, [selected]);

  const load = async (examId: string) => {
    setLoading(true);
    try {
      const res = await getResultsForExam(examId);
      setResults(res as ExamResult[]);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!results || results.length === 0) return alert('لا توجد نتائج للتصدير');
    const rows = [['studentName', 'studentPhone', 'score', 'maxScore', 'submittedAt']];
    results.forEach(r => rows.push([r.studentName || '', r.studentPhone || '', String(r.score), String(r.maxScore), new Date(r.submittedAt).toLocaleString()]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = () => {
    if (results.length === 0) return { avg: 0, max: 0, min: 0 };
    const avg = results.reduce((s, r) => s + (r.score || 0), 0) / results.length;
    const max = Math.max(...results.map(r => r.score || 0));
    const min = Math.min(...results.map(r => r.score || 0));
    return { avg, max, min };
  };

  const selectedExam = exams.find(x => x.id === selected);

  return (
    <div className="min-h-screen pb-20 relative z-10">
      {/* Header */}
      <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">نتائج الاختبارات</h1>
        <p className="text-sky-100 text-lg md:text-xl">عرض وتصدير نتائج الطلبة</p>
        <button onClick={() => navigate(-1)} className="mt-6 inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all text-sm md:text-base">
          ← العودة للخلف
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 -mt-10">
        <div className="bg-glass rounded-2xl p-4 sm:p-6 shadow-lg">

          {/* --- Exam selector: dropdown on mobile, sidebar on desktop --- */}
          <div className="flex flex-col md:grid md:grid-cols-4 md:gap-6">

            {/* Mobile: dropdown */}
            <div className="md:hidden mb-4">
              <label className="font-bold block mb-2 text-gray-700">اختر الاختبار</label>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm font-medium text-gray-800"
                >
                  <span>{selectedExam?.title ?? 'اختر...'}</span>
                  <svg className={`w-5 h-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {exams.length === 0 && <div className="p-3 text-gray-400 text-center">لا توجد اختبارات</div>}
                    {exams.map(e => (
                      <button
                        key={e.id}
                        onClick={() => { setSelected(e.id); setMenuOpen(false); }}
                        className={`w-full text-right px-4 py-3 border-b last:border-b-0 text-sm font-medium transition-colors ${selected === e.id ? 'bg-sky-50 text-sky-700' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: sidebar list */}
            <div className="hidden md:block md:col-span-1">
              <h3 className="font-bold mb-3 text-gray-700">الاختبار</h3>
              <div className="space-y-2">
                {exams.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e.id)}
                    className={`w-full text-right p-3 rounded-xl text-sm font-medium transition-all border ${selected === e.id ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {e.title}
                  </button>
                ))}
                {exams.length === 0 && <div className="text-gray-400 text-sm p-2">لا توجد اختبارات</div>}
              </div>
            </div>

            {/* Results panel */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedExam ? `نتائج ${selectedExam.title}` : 'اختر اختباراً لعرض نتائجه'}
                </h3>
                {selected && (
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    تصدير CSV
                  </button>
                )}
              </div>

              {/* Stats cards */}
              {selected && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'محاولات', value: results.length, color: 'bg-violet-50 text-violet-700 border-violet-100' },
                    { label: 'متوسط', value: stats().avg.toFixed(1), color: 'bg-sky-50 text-sky-700 border-sky-100' },
                    { label: 'الأعلى', value: stats().max, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                    { label: 'الأدنى', value: stats().min, color: 'bg-rose-50 text-rose-700 border-rose-100' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                      <div className="text-2xl font-extrabold">{s.value}</div>
                      <div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                </div>
              )}

              {/* Empty */}
              {!loading && selected && results.length === 0 && (
                <div className="p-10 bg-white rounded-2xl text-center text-gray-400 border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-medium">لا توجد نتائج لهذا الاختبار حتى الآن</p>
                </div>
              )}

              {!loading && !selected && (
                <div className="p-10 bg-white rounded-2xl text-center text-gray-400 border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-medium">اختر اختباراً من القائمة لعرض نتائجه</p>
                </div>
              )}

              {/* Results Table — desktop */}
              {!loading && results.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-right text-sm">
                      <thead>
                        <tr className="bg-sky-600 text-white">
                          <th className="px-4 py-3 font-bold rounded-tr-2xl">#</th>
                          <th className="px-4 py-3 font-bold">الاسم</th>
                          <th className="px-4 py-3 font-bold">الهاتف</th>
                          <th className="px-4 py-3 font-bold">الدرجة</th>
                          <th className="px-4 py-3 font-bold">الحد الأقصى</th>
                          <th className="px-4 py-3 font-bold rounded-tl-2xl">الوقت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => (
                          <tr key={r.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-sky-50/50'}`}>
                            <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{r.studentName || '—'}</td>
                            <td className="px-4 py-3 text-gray-600" dir="ltr">{r.studentPhone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg">{r.score}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.maxScore}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.submittedAt).toLocaleString('ar-EG')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: card list */}
                  <div className="sm:hidden space-y-3">
                    {results.map((r, idx) => (
                      <div key={r.id} className={`rounded-2xl border p-4 ${idx % 2 === 0 ? 'bg-white border-gray-100' : 'bg-sky-50/60 border-sky-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                          <span className="bg-sky-100 text-sky-700 font-extrabold text-lg px-3 py-1 rounded-xl">
                            {r.score} / {r.maxScore}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <span className="font-bold text-gray-800">{r.studentName || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📱</span>
                            <span className="text-gray-600 text-sm" dir="ltr">{r.studentPhone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🕐</span>
                            <span className="text-gray-400 text-xs">{new Date(r.submittedAt).toLocaleString('ar-EG')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExamResults;
