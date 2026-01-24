import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const Settings = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="max-w-xl mx-auto">
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <Globe className="text-primary" size={24} />
                    <h1 className="text-2xl font-bold text-gray-900">{t('settings_title')}</h1>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('settings_language')}</h2>
                        <p className="text-sm text-gray-500 mb-4">{t('settings_select_language')}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language === 'en'
                                        ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇺🇸</span>
                                    <span className={`font-semibold ${language === 'en' ? 'text-primary' : 'text-gray-700'}`}>English</span>
                                </div>
                                {language === 'en' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </button>

                            <button
                                onClick={() => setLanguage('ar')}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language === 'ar'
                                        ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇸🇦</span>
                                    <span className={`font-semibold ${language === 'ar' ? 'text-primary' : 'text-gray-700'}`}>العربية</span>
                                </div>
                                {language === 'ar' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
