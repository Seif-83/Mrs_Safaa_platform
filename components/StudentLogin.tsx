
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../useStudentStore';

const StudentLogin: React.FC = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { registerStudent } = useStudentStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError('يرجى إدخال الاسم ورقم الهاتف');
            return;
        }

        // Validate phone number (Egyptian format)
        const phoneClean = phone.trim().replace(/\s/g, '');
        if (phoneClean.length < 10) {
            setError('يرجى إدخال رقم هاتف صحيح');
            return;
        }

        setIsSubmitting(true);
        try {
            await registerStudent(name.trim(), phoneClean);
            // Store in session so we know the student is logged in
            sessionStorage.setItem('student_logged_in', 'true');
            sessionStorage.setItem('student_name', name.trim());
            sessionStorage.setItem('student_phone', phoneClean);
            navigate('/');
        } catch (err) {
            setError('حدث خطأ، يرجى المحاولة مرة أخرى');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
            <div className="bg-glass rounded-[2.5rem] shadow-2xl p-10 md:p-16 text-center max-w-md w-full border border-white/50">
                {/* Student Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-500/30">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
                <p className="text-gray-500 mb-10 text-lg">أدخل بياناتك للوصول إلى المحتوى التعليمي</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            placeholder="الاسم بالكامل بالعربي"
                            className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-center text-lg font-bold focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-sm"
                            autoFocus
                        />
                    </div>
                    <div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setError(''); }}
                            placeholder="رقم الهاتف"
                            className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-center text-lg font-bold focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all shadow-sm"
                            dir="ltr"
                        />
                    </div>
                    {error && <p className="text-red-500 font-bold animate-fade-in">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 science-gradient text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform active:scale-95 disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                جاري التسجيل...
                            </span>
                        ) : (
                            'دخول'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-400">بيانات التسجيل تُستخدم للمتابعة مع المعلم فقط.</p>
            </div>
        </div>
    );
};

export default StudentLogin;
