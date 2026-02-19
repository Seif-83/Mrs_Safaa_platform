import React from 'react';

interface State {
  hasError: boolean;
  error: any | null;
  info: any | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: any, info: any) {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 border">
            <h2 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-gray-600 mb-4">للاستكشاف السريع، قم بنسخ الخطأ المرفق وأرسله لي.</p>
            <div className="mb-4">
              <details className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">عرض تفاصيل الخطأ</summary>
                <pre className="text-xs mt-2">{String(this.state.error && this.state.error.stack) || String(this.state.error)}</pre>
                <pre className="text-xs mt-2">{String(this.state.info && this.state.info.componentStack)}</pre>
              </details>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-600 text-white rounded">إعادة تحميل الصفحة</button>
              <button onClick={() => { this.setState({ hasError: false, error: null, info: null }); }} className="px-4 py-2 bg-gray-100 rounded">إخفاء</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
