import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '../useExamStore';
import { Exam } from '../types';

const StudentExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { exams, submitResult } = useExamStore();
  const navigate = useNavigate();

  const exam: Exam | undefined = exams.find(e => e.id === examId);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!exam) return;
    // initialize answers
    const init: Record<string, any> = {};
    exam.questions.forEach(q => init[q.id] = q.type === 'mcq' ? null : '');
    setAnswers(init);
  }, [examId, exam]);

  if (!exam) return <div className="p-10 text-center">الاختبار غير موجود.</div>;

  const handleChange = (qid: string, val: any) => setAnswers(a => ({ ...a, [qid]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // auto-grade MCQs
      let total = 0;
      let max = 0;
      const answersArr: { questionId: string; answer: string | number }[] = [];
      exam.questions.forEach(q => {
        const ans = answers[q.id];
        if (q.points) max += q.points; else max += 1;
        if (q.type === 'mcq') {
          answersArr.push({ questionId: q.id, answer: String(ans ?? '') });
          if (typeof q.correctOptionIndex !== 'undefined' && ans !== null && Number(ans) === q.correctOptionIndex) {
            total += q.points ?? 1;
          }
        } else {
          answersArr.push({ questionId: q.id, answer: String(ans ?? '') });
        }
      });

      const studentPhone = sessionStorage.getItem('student_phone') || null;
      const studentName = sessionStorage.getItem('student_name') || null;

      await submitResult({ examId: exam.id, studentPhone, studentName, answers: answersArr, score: total, maxScore: max });
      setScore(total);
    } catch (err) {
      console.error(err);
      alert('فشل إرسال النتيجة');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{exam.title}</h1>
        <p className="text-sky-100 text-xl">{exam.description}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10">
        {score === null ? (
          <div className="bg-white p-6 rounded-2xl border">
            {exam.questions.map((q, idx) => (
              <div key={q.id} className="mb-6">
                {(!q.promptType || q.promptType === 'text') && (
                  <h4 className="font-bold mb-3 text-lg">{idx+1}. {q.prompt}</h4>
                )}
                {q.promptType === 'image' && q.promptImageUrl && (
                  <>
                    <p className="font-bold mb-2">{idx+1}.</p>
                    <div className="mb-4 flex justify-center">
                      <img src={q.promptImageUrl} alt={`سؤال ${idx+1}`} className="max-w-sm max-h-64 rounded-xl border" />
                    </div>
                  </>
                )}
                {q.type === 'mcq' && (
                  <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3">
                        <input type="radio" name={q.id} checked={String(answers[q.id]) === String(i)} onChange={()=>handleChange(q.id, i)} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type !== 'mcq' && (
                  <textarea className="w-full p-3 border rounded" value={answers[q.id] ?? ''} onChange={e=>handleChange(q.id, e.target.value)} />
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-sky-600 text-white rounded-xl">{submitting ? 'جاري الإرسال...' : 'إرسال'}</button>
              <button onClick={()=>navigate(-1)} className="px-4 py-2 bg-gray-100 rounded-xl">إلغاء</button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border text-center">
            <h3 className="text-2xl font-bold">تمت الإجابة</h3>
            <p className="mt-4">درجتك: {score} من {exam.questions.reduce((s,q)=>s+(q.points??1),0)}</p>
            <div className="mt-6">
              <button onClick={()=>navigate('/exams')} className="px-4 py-2 bg-sky-600 text-white rounded-xl">العودة للاختبارات</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamPage;
