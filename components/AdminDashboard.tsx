
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { levels, addLesson, removeLesson, resetToDefaults } = useContentStore();
    const [activeTab, setActiveTab] = useState<PrepLevel>('1st-prep');
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ levelId: string; lessonId: string } | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newPdfUrl, setNewPdfUrl] = useState('');
    const [newDescription, setNewDescription] = useState('');

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
        });

        // Reset form
        setNewTitle('');
        setNewVideoUrl('');
        setNewPdfUrl('');
        setNewDescription('');
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

    const tabs: { id: PrepLevel; label: string }[] = [
        { id: '1st-prep', label: 'الصف الأول' },
        { id: '2nd-prep', label: 'الصف الثاني' },
        { id: '3rd-prep', label: 'الصف الثالث' },
    ];

    return (
        <div className="min-h-screen pb-20 relative z-10">
            {/* Header */}
            <div className="science-gradient pt-28 pb-20 text-white text-center px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3">لوحة تحكم المعلم</h1>
                <p className="text-sky-100 text-xl">إدارة الفيديوهات والمذكرات لكل مرحلة دراسية</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full transition-all text-sm"
                    >
                        🔄 استعادة الافتراضي
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500/80 hover:bg-red-500 px-5 py-2 rounded-full transition-all text-sm"
                    >
                        🚪 تسجيل الخروج
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
                <div className="bg-glass rounded-2xl shadow-lg p-2 flex gap-2 mb-8 border border-white/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${activeTab === tab.id
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
                        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{activeLevel.titleAr}</h2>
                                <p className="text-gray-500 mt-1">{activeLevel.lessons.length} دروس مسجلة</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 ${showAddForm
                                    ? 'bg-gray-200 text-gray-700'
                                    : 'science-gradient text-white shadow-lg shadow-sky-500/20 hover:shadow-xl'
                                    }`}
                            >
                                {showAddForm ? (
                                    <><span className="text-2xl">✕</span> إلغاء</>
                                ) : (
                                    <><span className="text-2xl">+</span> إضافة درس جديد</>
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
                                                    </div>
                                                </div>
                                            </div>
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
