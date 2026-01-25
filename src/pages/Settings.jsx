import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Globe, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="max-w-xl mx-auto">
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <SettingsIcon className="text-primary" size={24} />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings_title')}</h1>
                </div>

                <div className="space-y-8">
                    {/* Theme Settings */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('settings_theme')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => theme === 'dark' && toggleTheme()}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${theme === 'light'
                                    ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Sun size={24} className="text-orange-500" />
                                    <span className={`font-semibold ${theme === 'light' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                                </div>
                                {theme === 'light' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </button>

                            <button
                                onClick={() => theme === 'light' && toggleTheme()}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${theme === 'dark'
                                    ? 'border-primary bg-indigo-50/10 ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Moon size={24} className="text-indigo-400" />
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
                                </div>
                                {theme === 'dark' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </button>
                        </div>
                    </div>

                    {/* Language Settings */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('settings_language')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings_select_language')}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language === 'en'
                                    ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇺🇸</span>
                                    <span className={`font-semibold ${language === 'en' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>English</span>
                                </div>
                                {language === 'en' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </button>

                            <button
                                onClick={() => setLanguage('ar')}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${language === 'ar'
                                    ? 'border-primary bg-indigo-50 ring-1 ring-primary'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇸🇦</span>
                                    <span className={`font-semibold ${language === 'ar' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>العربية</span>
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
