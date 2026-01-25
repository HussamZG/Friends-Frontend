import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <Ghost size={120} className="text-primary relative animate-bounce duration-1000" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {t('page_not_found') || 'Oops! Page not found'}
            </h2>

            <p className="text-gray-500 max-w-md mb-10 text-lg">
                {t('404_desc') || "The page you're looking for doesn't exist or has been moved. Don't worry, even the best explorers get lost sometimes."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
                >
                    <Home size={20} />
                    <span>{t('back_home') || 'Back to Home'}</span>
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                >
                    <ArrowLeft size={20} />
                    <span>{t('go_back') || 'Go Back'}</span>
                </button>
            </div>

            <div className="mt-20 flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full bg-indigo-200 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
            </div>
        </div>
    );
};

export default NotFound;
