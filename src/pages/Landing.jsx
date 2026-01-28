import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
    Moon,
    Sun,
    Globe,
    Zap,
    Shield,
    MessageSquare,
    Camera,
    ArrowRight,
    Layout,
    CheckCircle2,
    Heart
} from 'lucide-react';

const Landing = () => {
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            navigate('/');
        }
    }, [isSignedIn, navigate]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: MessageSquare,
            title: t('landing_feature_friends_title'),
            desc: t('landing_feature_friends_desc'),
            color: 'blue'
        },
        {
            icon: Camera,
            title: t('landing_feature_stories_title'),
            desc: t('landing_feature_stories_desc'),
            color: 'purple'
        },
        {
            icon: Shield,
            title: t('landing_feature_secure_title'),
            desc: t('landing_feature_secure_desc'),
            color: 'indigo'
        },
        {
            icon: Layout,
            title: t('landing_feature_responsive_title'),
            desc: t('landing_feature_responsive_desc'),
            color: 'pink'
        }
    ];

    return (
        <div className={`min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 overflow-x-hidden ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:rotate-12 transition-transform duration-300">
                            <Zap size={24} className="text-white fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">FRIENDS.</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Language Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                <Globe size={20} />
                                <span className="text-sm font-bold uppercase">{language}</span>
                            </button>
                            <div className="absolute top-full mt-2 right-0 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 overflow-hidden ring-1 ring-black/5 min-w-[120px]">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${language === 'en' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('ar')}
                                        className={`w-full text-right px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${language === 'ar' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        العربية
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Link to="/sign-in" className="hidden md:block px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            {t('nav_signin') || 'Sign In'}
                        </Link>

                        <Link to="/sign-in" className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0">
                            {t('landing_get_started')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left rtl:lg:text-right space-y-8 z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest animate-bounce-subtle">
                                <Zap size={16} className="fill-current" />
                                <span>The New Social Standard</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
                                {t('landing_hero_title')}
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                {t('landing_hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link to="/sign-up" className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                                    {t('landing_get_started')}
                                    <ArrowRight size={20} className={`${language === 'ar' ? 'rotate-180' : ''}`} />
                                </Link>
                                <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                    {t('landing_learn_more')}
                                </button>
                            </div>

                            <div className="pt-8 flex items-center justify-center lg:justify-start gap-6">
                                <div className="flex -space-x-3 rtl:space-x-reverse">
                                    {[1, 2, 3, 4].map(i => (
                                        <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 shadow-sm" />
                                    ))}
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-950 flex items-center justify-center text-xs font-black text-gray-500">
                                        +50k
                                    </div>
                                </div>
                                <div className="flex flex-col items-start rtl:items-end">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(i => <Zap key={i} size={14} className="fill-current" />)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-500">Trusted by over 50,000 users</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive UI Mockup */}
                        <div className="flex-1 relative z-10 w-full group">
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors duration-700"></div>
                            <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/20 dark:border-gray-800/40 rounded-[3rem] p-4 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:rotate-2 hover:scale-[1.02]">
                                <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <Layout size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                                    <div className="h-3 w-20 bg-gray-50 dark:bg-gray-900 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-900"></div>
                                        </div>
                                        <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8 overflow-hidden relative">
                                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                            <div className="relative flex flex-col items-center gap-4 text-white text-center">
                                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                    <Camera size={40} />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-40 bg-white/40 rounded-full mx-auto"></div>
                                                    <div className="h-3 w-24 bg-white/20 rounded-full mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-32 rounded-3xl bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                                                <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                            </div>
                                            <div className="h-32 rounded-3xl bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                                                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                                                    <Heart size={16} className="fill-current" />
                                                </div>
                                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                                                <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-gray-200/50 dark:shadow-black">
                                <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20`}>
                                    <feature.icon size={32} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Sub-hero / CTA */}
                    <div className="mt-40 relative rounded-[4rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative px-8 py-24 text-center space-y-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white max-w-4xl mx-auto leading-tight">
                                Ready to join the next generation of social interaction?
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/sign-up" className="w-full sm:w-auto px-12 py-6 bg-white text-primary rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                    {t('landing_get_started')}
                                </Link>
                                <button className="w-full sm:w-auto px-12 py-6 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xl hover:bg-white/20 transition-all">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Zap size={18} className="text-white fill-current" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">FRIENDS.</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <a href="#" className="hover:text-primary transition-colors">About</a>
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Contact</a>
                        </div>

                        <p className="text-sm font-bold text-gray-400 dark:text-gray-600">
                            © {new Date().getFullYear()} Friends Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
};

export default Landing;
