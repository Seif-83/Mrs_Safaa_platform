
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContentStore } from '../useContentStore';
import { PrepLevel } from '../types';

// Converts any YouTube URL format to embed format
function convertToEmbedUrl(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();

    // Already in embed format
    if (trimmed.includes('youtube.com/embed/')) return trimmed;

    // Regular watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // Short URL: https://youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // Return as-is if not a recognized YouTube format
    return trimmed;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { levels, addLesson, removeLesson, updateLesson, resetToDefaults } = useContentStore();
    const [activeTab, setActiveTab] = useState<PrepLevel>('1st-prep');
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ levelId: string; lessonId: string } | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [editingLesson, setEditingLesson] = useState<{ levelId: string; lessonId: string } | null>(null);

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newPdfUrl, setNewPdfUrl] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newIsPublic, setNewIsPublic] = useState(true);
    // Codes generation state
    const [codesModalOpen, setCodesModalOpen] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [generateCount, setGenerateCount] = useState<number>(5);
    const [generatedCodesPreview, setGeneratedCodesPreview] = useState<string[]>([]);

    // Auth guard
    useEffect(() => {
        if (sessionStorage.getItem('admin_authenticated') !== 'true') {
            navigate('/admin-login');
        }
    }, [navigate]);

    const activeLevel = levels.find(l => l.id === activeTab);

    const handleAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const lessonId = `${activeTab.charAt(0)}-${Date.now()}`;
        addLesson(activeTab, {
            id: lessonId,
            title: newTitle.trim(),
            videoUrl: convertToEmbedUrl(newVideoUrl),
            pdfUrl: newPdfUrl.trim(),
            description: newDescription.trim(),
            code: newIsPublic ? '' : newCode.trim(),
            codes: newIsPublic ? [] : (newCode.trim() ? [{ value: newCode.trim(), used: false }] : [])
        });

        // Reset form
        setNewTitle('');
        setNewVideoUrl('');
        setNewPdfUrl('');
        setNewDescription('');
        setNewCode('');
        setNewIsPublic(true);
        setShowAddForm(false);
        showSuccess('تم إضافة الدرس بنجاح ✓');
    };

    const handleDelete = () => {
        if (deleteConfirm) {
            removeLesson(deleteConfirm.levelId, deleteConfirm.lessonId);
            setDeleteConfirm(null);
            showSuccess('تم حذف الدرس بنجاح ✓');
        }
    };

    const openEditLesson = (levelId: string, lessonId: string) => {
        const lesson = levels.find(l => l.id === levelId)?.lessons.find(ls => ls.id === lessonId);
        if (lesson) {
            setNewTitle(lesson.title);
            setNewVideoUrl(lesson.videoUrl || '');
            setNewPdfUrl(lesson.pdfUrl || '');
            setNewDescription(lesson.description || '');
            setNewCode(lesson.code || '');
            setEditingLesson({ levelId, lessonId });
        }
    };

    const handleEditLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLesson || !newTitle.trim()) return;

        updateLesson(editingLesson.levelId, editingLesson.lessonId, {
            title: newTitle.trim(),
            videoUrl: convertToEmbedUrl(newVideoUrl),
            pdfUrl: newPdfUrl.trim(),
            description: newDescription.trim(),
            code: newCode.trim(),
        });

        setEditingLesson(null);
        setNewTitle('');
        setNewVideoUrl('');
        setNewPdfUrl('');
        setNewDescription('');
        setNewCode('');
        showSuccess('تم تحديث الدرس بنجاح ✓');
    };

    const handleReset = () => {
        resetToDefaults();
        setShowResetConfirm(false);
        showSuccess('تم استعادة المحتوى الافتراضي ✓');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('admin_authenticated');
        navigate('/');
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    // Helpers for codes
    const randomCode = (len = 8) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let out = '';
        for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
        return out;
    };

    const generateUniqueCodes = (count: number, existing: string[] = []) => {
        const set = new Set(existing);
        const out: string[] = [];
        while (out.length < count) {
            const c = randomCode(8);
            if (!set.has(c) && !out.includes(c)) out.push(c);
        }
        return out;
    };

    const openCodesForLesson = (lessonId: string) => {
        setSelectedLessonId(lessonId);
        setGeneratedCodesPreview([]);
        setGenerateCount(5);
        setCodesModalOpen(true);
    };

    const handleGenerate = () => {
        if (!selectedLessonId) return;
        const lesson = activeLevel?.lessons.find(l => l.id === selectedLessonId);
        const existing = lesson?.codes?.map(c => c.value) ?? [];
        const newCodes = generateUniqueCodes(generateCount, existing);

        const merged = [
            ...(lesson?.codes ?? []),
            ...newCodes.map(v => ({ value: v, used: false }))
        ];

        // Update in DB
        updateLesson(activeTab, selectedLessonId, { codes: merged });
        setGeneratedCodesPreview(newCodes);
        showSuccess('تم توليد الأكواد بنجاح ✓');
    };

    const toggleCodeUsed = (lessonId: string, codeValue: string) => {
        const lesson = activeLevel?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        const updatedCodes = (lesson.codes ?? []).map(c => c.value === codeValue ? { ...c, used: !c.used } : c);
        updateLesson(activeTab, lessonId, { codes: updatedCodes });
    };

    const tabs: { id: PrepLevel; label: string }[] = [
        { id: '1st-prep', label: 'الصف الأول' },
        { id: '2nd-prep', label: 'الصف الثاني' },
        { id: '3rd-prep', label: 'الصف الثالث' },
    ];

    return (
        <div className="min-h-screen pb-20 relative z-10">
            {/* Header */}
            <div className="science-gradient pt-20 md:pt-28 pb-16 md:pb-20 text-white text-center px-4">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-3">لوحة تحكم المعلم</h1>
                <p className="text-sky-100 text-base md:text-xl">إدارة الفيديوهات والمذكرات لكل مرحلة دراسية</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 md:gap-4">
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 rounded-full transition-all text-xs md:text-sm"
                    >
                        🔄 استعادة
                    </button>
                    <Link
                        to="/admin/students"
                        className="bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 rounded-full transition-all text-xs md:text-sm"
                    >
                        👥 الطلاب
                    </Link>
                    <Link
                        to="/admin/exams"
                        className="bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 rounded-full transition-all text-xs md:text-sm"
                    >
                        📝 اختبارات
                    </Link>
                    <Link
                        to="/admin/exam-results"
                        className="bg-white/10 hover:bg-white/20 px-3 md:px-5 py-2 rounded-full transition-all text-xs md:text-sm"
                    >
                        📊 النتائج
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/80 hover:bg-red-500 px-3 md:px-5 py-2 rounded-full transition-all text-xs md:text-sm"
                    >
                        🚪 خروج
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10">
                {/* Success message */}
                {successMsg && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl text-center font-bold text-lg animate-fade-in">
                        {successMsg}
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-glass rounded-2xl shadow-lg p-1 md:p-2 flex gap-1 md:gap-2 mb-8 border border-white/50 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
                            className={`flex-1 py-3 md:py-4 px-2 md:px-4 rounded-xl font-bold text-xs md:text-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'science-gradient text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Active Level Content */}
                {activeLevel && (
                    <div className="bg-glass rounded-[2rem] shadow-xl border border-white/50 overflow-hidden">
                        {/* Level Header */}
                        <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{activeLevel.titleAr}</h2>
                                <p className="text-gray-500 mt-1 text-sm md:text-base">{activeLevel.lessons.length} دروس مسجلة</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={`px-4 md:px-8 py-2 md:py-4 rounded-2xl font-bold text-sm md:text-lg transition-all flex items-center gap-2 md:gap-3 whitespace-nowrap ${showAddForm
                                    ? 'bg-gray-200 text-gray-700'
                                    : 'science-gradient text-white shadow-lg shadow-sky-500/20 hover:shadow-xl'
                                    }`}
                            >
                                {showAddForm ? (
                                    <><span className="text-xl md:text-2xl">✕</span> <span className="hidden sm:inline">إلغاء</span></>
                                ) : (
                                    <><span className="text-xl md:text-2xl">+</span> <span className="hidden sm:inline">إضافة درس جديد</span><span className="sm:hidden">جديد</span></>
                                )}
                            </button>
                        </div>

                        {/* Add Form */}
                        {showAddForm && (
                            <div className="p-8 bg-sky-50/50 border-b border-sky-100 animate-fade-in">
                                <form onSubmit={handleAddLesson} className="space-y-5 max-w-2xl mx-auto">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">📝 إضافة درس جديد</h3>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">عنوان الدرس *</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            placeholder="مثال: المادة وخواصها"
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-right"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">رابط الفيديو (YouTube)</label>
                                        <input
                                            type="text"
                                            value={newVideoUrl}
                                            onChange={e => setNewVideoUrl(e.target.value)}
                                            placeholder="الصق رابط اليوتيوب هنا"
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-left"
                                            dir="ltr"
                                        />
                                        <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">يقبل أي صيغة: youtube.com/watch?v=... أو youtu.be/... أو youtube.com/embed/...</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">رابط المذكرة (PDF)</label>
                                        <input
                                            type="text"
                                            value={newPdfUrl}
                                            onChange={e => setNewPdfUrl(e.target.value)}
                                            placeholder="https://example.com/file.pdf أو /filename.pdf"
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-left"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">وصف الدرس</label>
                                        <textarea
                                            value={newDescription}
                                            onChange={e => setNewDescription(e.target.value)}
                                            placeholder="وصف مختصر عن محتوى الدرس"
                                            rows={3}
                                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none text-right"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input id="newIsPublic" type="checkbox" checked={newIsPublic} onChange={e=>setNewIsPublic(e.target.checked)} className="w-4 h-4" />
                                        <label htmlFor="newIsPublic" className="text-gray-700">اجعل الدرس عاماً (لا يتطلب كود)</label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 science-gradient text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform active:scale-95"
                                    >
                                        ✓ إضافة الدرس
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Lessons Table */}
                        <div className="p-6">
                            {activeLevel.lessons.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-xl font-bold">لا توجد دروس حالياً</p>
                                    <p className="mt-2">اضغط "إضافة درس جديد" لإضافة أول درس</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeLevel.lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-bold text-gray-900">{lesson.title}</h4>
                                                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{lesson.description}</p>
                                                    <div className="flex gap-4 mt-2 text-xs">
                                                        {lesson.videoUrl && (
                                                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">🎥 فيديو</span>
                                                        )}
                                                        {lesson.pdfUrl && (
                                                            <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full font-medium">📄 مذكرة</span>
                                                        )}
                                                        {lesson.code && (
                                                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                                🔒 كود: {lesson.code}
                                                            </span>
                                                        )}
                                                        {/* Single-use codes badge */}
                                                        {lesson.codes && lesson.codes.length > 0 && (
                                                            <span className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                                🎟️ غير مستعملة: {(lesson.codes.filter(c=>!c.used)).length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditLesson(activeTab, lesson.id)}
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                                                >
                                                    ✏️ تعديل
                                                </button>
                                                <button
                                                    onClick={() => openCodesForLesson(lesson.id)}
                                                    className="px-4 py-2 bg-violet-50 text-violet-600 rounded-xl font-bold hover:bg-violet-100 transition-all flex items-center gap-2 opacity-80"
                                                >
                                                    🎟️ أكواد
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ levelId: activeTab, lessonId: lesson.id })}
                                                    className="px-5 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2 opacity-70 group-hover:opacity-100"
                                                >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">تأكيد الحذف</h3>
                        <p className="text-gray-500 mb-8">هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
                            >
                                حذف الدرس
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lesson Modal */}
            {editingLesson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-3xl font-bold text-gray-900">تعديل الدرس</h3>
                            <button
                                onClick={() => {
                                    setEditingLesson(null);
                                    setNewTitle('');
                                    setNewVideoUrl('');
                                    setNewPdfUrl('');
                                    setNewDescription('');
                                    setNewCode('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditLesson} className="space-y-4">
                            <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="عنوان الدرس" value={newTitle} onChange={e=>setNewTitle(e.target.value)} required />
                            <textarea className="w-full p-3 border border-gray-200 rounded-xl resize-none" rows={3} placeholder="وصف الدرس" value={newDescription} onChange={e=>setNewDescription(e.target.value)} />
                            <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="رابط الفيديو (YouTube)" value={newVideoUrl} onChange={e=>setNewVideoUrl(e.target.value)} />
                            <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="رابط المذكرة (PDF)" value={newPdfUrl} onChange={e=>setNewPdfUrl(e.target.value)} />
                            <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="كود الوصول (اختياري)" value={newCode} onChange={e=>setNewCode(e.target.value)} />

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingLesson(null);
                                        setNewTitle('');
                                        setNewVideoUrl('');
                                        setNewPdfUrl('');
                                        setNewDescription('');
                                        setNewCode('');
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 science-gradient text-white rounded-2xl font-bold hover:shadow-lg"
                                >
                                    ✓ حفظ التعديلات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Codes Modal */}
            {codesModalOpen && selectedLessonId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full text-right shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold">🎟️ إدارة أكواد الدرس</h3>
                                <p className="text-gray-500">حوّل رابط الفيديو إلى أكواد وصول مرة واحدة لكل طالب</p>
                            </div>
                            <button onClick={() => setCodesModalOpen(false)} className="text-gray-400">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">عدد الأكواد</label>
                                <input
                                    type="number"
                                    value={generateCount}
                                    onChange={e => setGenerateCount(Math.max(1, Number(e.target.value) || 1))}
                                    className="w-40 p-3 bg-white border border-gray-200 rounded-xl outline-none"
                                />
                                <button onClick={handleGenerate} className="mx-4 px-5 py-3 bg-violet-600 text-white rounded-xl font-bold">توليد</button>
                            </div>

                            {/* Preview generated */}
                            {generatedCodesPreview.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-bold mb-2">الأكواد المولدة حديثاً</p>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedCodesPreview.map(c => (
                                            <div key={c} className="px-3 py-2 bg-white border rounded-lg text-sm flex items-center gap-2">
                                                <span className="font-mono">{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Existing codes list */}
                            <div className="bg-white border rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold mb-2">جميع الأكواد لهذا الدرس</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                        onClick={() => {
                                            // copy all codes (value + used flag)
                                            const lesson = activeLevel?.lessons.find(l => l.id === selectedLessonId);
                                            const codes = lesson?.codes ?? [];
                                            if (codes.length === 0) {
                                                showSuccess('لا توجد أكواد للنسخ');
                                                return;
                                            }
                                            const text = codes.map(c => `${c.value}${c.used ? ' (مستخدم)' : ''}`).join('\n');
                                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                navigator.clipboard.writeText(text).then(() => showSuccess('تم نسخ جميع الأكواد ✓')).catch(() => showSuccess('فشل نسخ الأكواد'));
                                            } else {
                                                // fallback
                                                const ta = document.createElement('textarea');
                                                ta.value = text;
                                                document.body.appendChild(ta);
                                                ta.select();
                                                try { document.execCommand('copy'); showSuccess('تم نسخ جميع الأكواد ✓'); } catch { showSuccess('فشل نسخ الأكواد'); }
                                                document.body.removeChild(ta);
                                            }
                                        }}
                                        className="px-3 py-1 bg-sky-50 text-sky-600 rounded-md text-sm"
                                        >
                                            نسخ الكل
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (!selectedLessonId) return;
                                                if (!confirm('هل تريد جعل هذا الفيديو عاماً وإزالة جميع الأكواد؟')) return;
                                                updateLesson(activeTab, selectedLessonId, { codes: [], code: '' });
                                                setGeneratedCodesPreview([]);
                                                showSuccess('تم جعل الفيديو عاماً وإزالة جميع الأكواد ✓');
                                            }}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                                        >
                                            اجعل الفيديو عاماً
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-auto">
                                    {(activeLevel?.lessons.find(l=>l.id===selectedLessonId)?.codes ?? []).map(c => (
                                        <div key={c.value} className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono">{c.value}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${c.used ? 'bg-gray-200 text-gray-600' : 'bg-green-50 text-green-700'}`}>{c.used ? 'مستخدم' : 'غير مستخدم'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigator.clipboard?.writeText(c.value)} className="px-3 py-1 bg-sky-50 text-sky-600 rounded-md">نسخ</button>
                                                <button onClick={() => toggleCodeUsed(selectedLessonId, c.value)} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-md">تبديل حالة</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🔄</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">استعادة المحتوى الافتراضي</h3>
                        <p className="text-gray-500 mb-8">سيتم حذف جميع التعديلات واستعادة المحتوى الأصلي. هل أنت متأكد؟</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all"
                            >
                                استعادة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
