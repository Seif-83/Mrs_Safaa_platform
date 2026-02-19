import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../useExamStore';
import { useContentStore } from '../useContentStore';
import { PrepLevel } from '../types';

const AdminExams: React.FC = () => {
  const navigate = useNavigate();
  const { exams, createExam, updateExam, deleteExam } = useExamStore();
  const { levels } = useContentStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [levelId, setLevelId] = useState<PrepLevel>('1st-prep');
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const genId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const addQuestion = () => {
    setQuestions(qs => [...qs, {
      id: genId(),
      type: 'mcq',
      prompt: '',
      promptType: 'text', // 'text' or 'image'
      promptImageUrl: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      points: 1
    }]);
  };

  const updateQuestion = (id: string, patch: any) => {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
  };

  const removeQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id));

  const handleCreate = async () => {
    if (!title.trim() || questions.length === 0) return alert('يرجى إدخال عنوان وتساؤل واحد على الأقل');
    setSaving(true);
    try {
      await createExam({
        title: title.trim(),
        description: description.trim(),
        levelId,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          promptType: q.promptType || 'text',
          promptImageUrl: q.promptImageUrl || '',
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          points: q.points
        })),
        timeLimitMinutes: timeLimit,
        published: false
      });
      setTitle(''); setDescription(''); setQuestions([]);
      alert('تم إنشاء الاختبار');
    } catch (err) {
      console.error(err);
      alert('فشل إنشاء الاختبار');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pb-20 relative z-10">
      <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">إدارة الاختبارات</h1>
        <p className="text-sky-100 text-xl">أنشئ اختبارات لتتبع مستوى الطلاب</p>
        <button onClick={() => navigate(-1)} className="mt-8 inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all">
          ← العودة للخلف
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-glass rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">إنشاء اختبار جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-3 rounded-xl border" placeholder="عنوان الاختبار" value={title} onChange={e=>setTitle(e.target.value)} />
            <select className="p-3 rounded-xl border" value={levelId} onChange={e=>setLevelId(e.target.value as PrepLevel)}>
              {levels.map(l => <option key={l.id} value={l.id}>{l.titleAr}</option>)}
            </select>
            <input type="number" min={1} className="p-3 rounded-xl border" placeholder="زمن الاختبار (دقائق)" value={timeLimit ?? ''} onChange={e=>setTimeLimit(e.target.value ? Number(e.target.value) : null)} />
            <input className="p-3 rounded-xl border col-span-2" placeholder="وصف الاختبار (اختياري)" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">الأسئلة</h4>
              <button onClick={addQuestion} className="px-4 py-2 bg-sky-600 text-white rounded-xl">أضف سؤال</button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 border rounded-xl bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <strong>سؤال {idx+1}</strong>
                    <button onClick={() => removeQuestion(q.id)} className="text-red-500 text-sm">حذف</button>
                  </div>

                  {/* Prompt Type Toggle */}
                  <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`type-${q.id}`} checked={q.promptType !== 'image'} onChange={()=>updateQuestion(q.id, { promptType: 'text' })} />
                      <span className="text-sm">نص</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`type-${q.id}`} checked={q.promptType === 'image'} onChange={()=>updateQuestion(q.id, { promptType: 'image' })} />
                      <span className="text-sm">صورة</span>
                    </label>
                  </div>

                  {/* Text or Image Prompt */}
                  {q.promptType !== 'image' ? (
                    <input className="w-full p-2 border rounded mt-2 mb-3" placeholder="نص السؤال" value={q.prompt} onChange={e=>updateQuestion(q.id, { prompt: e.target.value })} />
                  ) : (
                    <div className="mt-2 mb-3">
                      <input type="file" accept="image/*" className="w-full p-2 border rounded" onChange={e=>{
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            updateQuestion(q.id, { promptImageUrl: dataUrl });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      {q.promptImageUrl && (
                        <div className="mt-2 p-2 bg-gray-50 rounded flex items-center justify-center">
                          <img src={q.promptImageUrl} alt="preview" className="max-w-xs max-h-32 rounded" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <input className="flex-1 p-2 border rounded" value={opt} onChange={e=>{
                          const newOpts = [...q.options]; newOpts[i] = e.target.value; updateQuestion(q.id, { options: newOpts });
                        }} />
                        <label className="text-sm">صحيح
                          <input type="radio" name={`correct-${q.id}`} checked={q.correctOptionIndex===i} onChange={()=>updateQuestion(q.id, { correctOptionIndex: i })} className="mx-2" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">النقاط:</label>
                    <input type="number" min={0} value={q.points} onChange={e=>updateQuestion(q.id, { points: Number(e.target.value) })} className="p-2 border rounded w-24" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleCreate} disabled={saving} className="px-6 py-3 bg-green-600 text-white rounded-xl">{saving ? 'جاري الحفظ...' : 'إنشاء الاختبار'}</button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-glass rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">الاختبارات المنشأة</h3>
          <div className="space-y-3">
            {exams.length === 0 && <div className="text-gray-500">لا توجد اختبارات بعد.</div>}
            {exams.map(ex => (
              <div key={ex.id} className="p-4 bg-white rounded-xl border flex items-center justify-between">
                <div>
                  <div className="font-bold">{ex.title}</div>
                  <div className="text-sm text-gray-500">المرحلة: {ex.levelId} • أسئلة: {ex.questions?.length ?? 0}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async ()=>{ await updateExam(ex.id, { published: !ex.published }); alert('تم التحديث'); }} className="px-3 py-2 bg-sky-50 text-sky-600 rounded-md">{ex.published ? 'إلغاء النشر' : 'نشر'}</button>
                  <button onClick={async ()=>{ if(confirm('حذف الاختبار؟')){ await deleteExam(ex.id); alert('تم الحذف'); } }} className="px-3 py-2 bg-red-50 text-red-600 rounded-md">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExams;
