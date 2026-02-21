import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

// Extending from a typed base to workaround useDefineForClassFields: false
class ErrorBoundary extends (Component as new (props: ErrorBoundaryProps) => Component<ErrorBoundaryProps, ErrorBoundaryState>) {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false, error: null, info: null } as ErrorBoundaryState;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info);
    (this as any).setState({ hasError: true, error, info });
  }

  render() {
    const state = (this as any).state as ErrorBoundaryState;
    const children = (this as any).props?.children;

    if (state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 border">
            <h2 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-gray-600 mb-4">للاستكشاف السريع، قم بنسخ الخطأ المرفق وأرسله لي.</p>
            <div className="mb-4">
              <details className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">عرض تفاصيل الخطأ</summary>
                <pre className="text-xs mt-2">{String(state.error?.stack) || String(state.error)}</pre>
                <pre className="text-xs mt-2">{String(state.info?.componentStack)}</pre>
              </details>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-600 text-white rounded">إعادة تحميل الصفحة</button>
              <button onClick={() => { (this as any).setState({ hasError: false, error: null, info: null }); }} className="px-4 py-2 bg-gray-100 rounded">إخفاء</button>
            </div>
          </div>
        </div>
      );
    }

    return children ?? null;
  }
}

export default ErrorBoundary;
