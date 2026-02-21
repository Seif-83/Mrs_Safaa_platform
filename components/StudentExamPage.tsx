import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '../useExamStore';
import { Exam } from '../types';

/* ─── Countdown Timer hook ───────────────────────────────────────── */
function useCountdown(totalSeconds: number | null, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const expiredRef = useRef(false);

  // Initialise once totalSeconds is known
  useEffect(() => {
    if (totalSeconds === null || totalSeconds <= 0) return;
    setSecondsLeft(totalSeconds);
    expiredRef.current = false;
  }, [totalSeconds]);

  // Tick every second
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft(s => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, onExpire]);

  return secondsLeft;
}

/* ─── Formats seconds → MM:SS ────────────────────────────────────── */
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* ═══════════════════════════════════════════════════════════════════ */
const StudentExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { exams, submitResult } = useExamStore();
  const navigate = useNavigate();

  const exam: Exam | undefined = exams.find(e => e.id === examId);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Initialise answers when exam loads
  useEffect(() => {
    if (!exam?.questions) return;
    const init: Record<string, any> = {};
    exam.questions.forEach(q => (init[q.id] = q.type === 'mcq' ? null : ''));
    setAnswers(init);
  }, [examId, exam]);

  /* ── Auto-submit when timer hits zero ────────────────────────── */
  const handleSubmit = useCallback(
    async (isAuto = false, currentAnswers?: Record<string, any>) => {
      if (submitting || score !== null) return;
      setSubmitting(true);
      if (isAuto) setAutoSubmitted(true);

      const usedAnswers = currentAnswers ?? answers;

      try {
        let total = 0;
        let max = 0;
        const answersArr: { questionId: string; answer: string | number }[] = [];

        (exam!.questions || []).forEach(q => {
          const ans = usedAnswers[q.id];
          const pts = q.points ?? 1;
          max += pts;

          if (q.type === 'mcq') {
            // Unanswered (null) → 0 points
            const answered = ans !== null && ans !== undefined;
            answersArr.push({ questionId: q.id, answer: String(ans ?? '') });
            if (answered && typeof q.correctOptionIndex !== 'undefined' && Number(ans) === q.correctOptionIndex) {
              total += pts;
            }
          } else {
            // Text answers are recorded, graded by teacher later (0 for now if empty)
            answersArr.push({ questionId: q.id, answer: String(ans ?? '') });
          }
        });

        const studentPhone = sessionStorage.getItem('student_phone') || null;
        const studentName = sessionStorage.getItem('student_name') || null;

        await submitResult({
          examId: exam!.id,
          studentPhone,
          studentName,
          answers: answersArr,
          score: total,
          maxScore: max,
        });
        setScore(total);
      } catch (err) {
        console.error(err);
        alert('فشل إرسال النتيجة');
      } finally {
        setSubmitting(false);
      }
    },
    [answers, exam, score, submitting, submitResult]
  );

  // Stable callback ref for the timer so it always uses latest answers
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const onTimerExpire = useCallback(() => {
    handleSubmit(true, answersRef.current);
  }, [handleSubmit]);

  const totalSeconds = exam?.timeLimitMinutes ? exam.timeLimitMinutes * 60 : null;
  const secondsLeft = useCountdown(score !== null ? null : totalSeconds, onTimerExpire);

  const handleChange = (qid: string, val: any) => setAnswers(a => ({ ...a, [qid]: val }));

  /* ── Not found ───────────────────────────────────────────────── */
  if (!exam) {
    return <div className="p-10 text-center font-bold text-xl">الاختبار غير موجود.</div>;
  }

  const maxScore = (exam.questions || []).reduce((s, q) => s + (q.points ?? 1), 0);

  /* ── Timer colour: red in last 60 s ─────────────────────────── */
  const timerUrgent = secondsLeft !== null && secondsLeft <= 60;
  const timerWarning = secondsLeft !== null && secondsLeft <= 180 && secondsLeft > 60;

  return (
    <div className="min-h-screen pb-24 relative z-10">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="science-gradient pt-28 pb-24 text-white text-center px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{exam.title}</h1>
        {exam.description && <p className="text-sky-100 text-lg">{exam.description}</p>}

        {/* Timer badge */}
        {secondsLeft !== null && score === null && (
          <div className={`
            inline-flex items-center gap-3 mt-6 px-6 py-3 rounded-2xl font-extrabold text-2xl shadow-lg
            transition-all duration-500
            ${timerUrgent ? 'bg-red-500 animate-pulse text-white' : timerWarning ? 'bg-amber-400 text-gray-900' : 'bg-white/20 text-white'}
          `}>
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span dir="ltr">{formatTime(secondsLeft)}</span>
          </div>
        )}

        {/* No time limit */}
        {!exam.timeLimitMinutes && (
          <div className="inline-block mt-6 bg-white/10 px-4 py-2 rounded-full text-sm opacity-80">
            ⏳ لا يوجد حد زمني لهذا الاختبار
          </div>
        )}
      </div>

      

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        {score === null ? (
          <>
            {/* Auto-submit notice */}
            {autoSubmitted && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 font-bold">
                ⏰ انتهى الوقت! تم إرسال الاختبار تلقائياً.
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border shadow-lg space-y-8">
              {(exam.questions || []).map((q, idx) => {
                const answered = answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '';
                return (
                  <div key={q.id} className={`pb-6 border-b last:border-b-0 ${answered ? '' : 'relative'}`}>
                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold
                        ${answered ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        {(!q.promptType || q.promptType === 'text') && (
                          <h4 className="font-bold text-lg text-gray-800 leading-relaxed">{q.prompt}</h4>
                        )}
                        {q.promptType === 'image' && q.promptImageUrl && (
                          <>
                            {q.prompt && <p className="font-bold mb-2 text-gray-700">{q.prompt}</p>}
                            <div className="mb-3 flex justify-center">
                              <img src={q.promptImageUrl} alt={`سؤال ${idx + 1}`}
                                className="max-w-sm max-h-64 rounded-xl border shadow-sm" />
                            </div>
                          </>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          النقاط: {q.points ?? 1}
                        </div>
                      </div>
                    </div>

                    {/* MCQ options */}
                    {q.type === 'mcq' && (
                      <div className="space-y-2 mr-11">
                        {q.options?.map((opt, i) => (
                          <label key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                              ${String(answers[q.id]) === String(i)
                                ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'}`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={String(answers[q.id]) === String(i)}
                              onChange={() => handleChange(q.id, i)}
                              className="accent-sky-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Text answer */}
                    {q.type !== 'mcq' && (
                      <textarea
                        className="w-full p-3 border border-gray-200 rounded-xl mr-0 focus:ring-2 focus:ring-sky-300 focus:border-sky-400 outline-none resize-none"
                        rows={3}
                        placeholder="اكتب إجابتك هنا..."
                        value={answers[q.id] ?? ''}
                        onChange={e => handleChange(q.id, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Submit bar */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60"
                >
                  {submitting ? '⏳ جاري الإرسال...' : '✅ إرسال الإجابات'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── Result screen ─────────────────────────────────────── */
          <div className="bg-white p-8 rounded-2xl border shadow-lg text-center">
            {autoSubmitted && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-sm">
                ⏰ تم الإرسال تلقائياً بعد انتهاء الوقت
              </div>
            )}
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">تمت الإجابة!</h3>
            <p className="text-gray-500 mb-6">شكراً لك، تم إرسال إجاباتك بنجاح.</p>

            {/* Score display */}
            <div className="inline-block bg-sky-50 border border-sky-200 rounded-2xl px-10 py-6 mb-6">
              <div className="text-5xl font-extrabold text-sky-700">{score}</div>
              <div className="text-gray-500 font-medium mt-1">من {maxScore} درجة</div>
              <div className="mt-2 w-full bg-sky-100 rounded-full h-3">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all"
                  style={{ width: `${maxScore > 0 ? Math.round((score / maxScore) * 100) : 0}%` }}
                />
              </div>
              <div className="text-sm text-sky-600 font-bold mt-2">
                {maxScore > 0 ? Math.round((score / maxScore) * 100) : 0}%
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors"
              >
                الرئيسية
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                العودة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamPage;
