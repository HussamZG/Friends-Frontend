import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Globe, Sun, Moon, Settings as SettingsIcon, Heart } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Settings = () => {
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { soundEnabled, setSoundEnabled } = useNotification();

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

                    {/* Notification Settings */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('settings_notifications')}</h2>
                        <div className="card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${soundEnabled ? 'bg-indigo-50 dark:bg-indigo-500/10 text-primary' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                    <Heart size={24} className={soundEnabled ? 'fill-primary' : ''} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('settings_sound_enabled')}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings_sound_desc')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`w-14 h-8 rounded-full transition-all relative ${soundEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${soundEnabled ? (language === 'ar' ? 'right-7' : 'left-7') : (language === 'ar' ? 'right-1' : 'left-1')}`}></div>
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
                                    ? 'border-primary bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-primary'
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
                                    ? 'border-primary bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-primary'
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
