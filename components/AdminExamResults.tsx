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
    const rows = [['studentName','studentPhone','score','maxScore','submittedAt']];
    results.forEach(r => rows.push([r.studentName || '', r.studentPhone || '', String(r.score), String(r.maxScore), new Date(r.submittedAt).toLocaleString()]));
    const csv = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
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
    const avg = results.reduce((s,r)=>s+(r.score||0),0) / results.length;
    const max = Math.max(...results.map(r=>r.score||0));
    const min = Math.min(...results.map(r=>r.score||0));
    return { avg, max, min };
  };

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">نتائج الاختبارات</h1>
        <p className="text-sky-100 text-xl">عرض وتصدير نتائج الطلبة</p>
        <button onClick={() => navigate(-1)} className="mt-8 inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all">
          ← العودة للخلف
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-glass rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <h3 className="font-bold mb-3">الاختبار</h3>
              <div className="space-y-2">
                {exams.map(e => (
                  <button key={e.id} onClick={()=>setSelected(e.id)} className={`w-full text-right p-2 rounded ${selected===e.id? 'bg-sky-100':'bg-white'}`}>{e.title}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="font-bold mb-2">نتائج {exams.find(x=>x.id===selected)?.title ?? ''}</h3>
              <div className="mb-3 flex gap-2">
                <button onClick={exportCSV} className="px-3 py-2 bg-sky-600 text-white rounded">تصدير CSV</button>
                <div className="px-3 py-2 bg-gray-100 rounded">محاولات: {results.length}</div>
                <div className="px-3 py-2 bg-gray-100 rounded">متوسط: {stats().avg.toFixed(1)}</div>
                <div className="px-3 py-2 bg-gray-100 rounded">الأعلى: {stats().max}</div>
                <div className="px-3 py-2 bg-gray-100 rounded">الأدنى: {stats().min}</div>
              </div>

              {loading && <div>جاري التحميل...</div>}
              {!loading && results.length === 0 && <div className="p-6 bg-white rounded">لا توجد نتائج للعرض</div>}

              {!loading && results.length > 0 && (
                <div className="overflow-auto bg-white rounded p-4">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-sm text-gray-600"><th>الاسم</th><th>الهاتف</th><th>الدرجة</th><th>الحد الأقصى</th><th>الوقت</th></tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.id} className="border-t text-sm"><td>{r.studentName}</td><td>{r.studentPhone}</td><td>{r.score}</td><td>{r.maxScore}</td><td>{new Date(r.submittedAt).toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExamResults;
