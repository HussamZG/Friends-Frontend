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
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:rotate-12 transition-all duration-300">
                            <Zap size={24} className="text-white fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">FRIENDS.</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 backdrop-blur-md"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Language Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 backdrop-blur-md">
                                <Globe size={20} />
                                <span className="text-sm font-bold uppercase">{language}</span>
                            </button>
                            <div className={`absolute top-full mt-2 ${language === 'ar' ? 'left-0' : 'right-0'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0`}>
                                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 overflow-hidden ring-1 ring-black/5 min-w-[140px]">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${language === 'en' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        English
                                        {language === 'en' && <CheckCircle2 size={14} />}
                                    </button>
                                    <button
                                        onClick={() => setLanguage('ar')}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${language === 'ar' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                    >
                                        {language === 'ar' && <CheckCircle2 size={14} />}
                                        العربية
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Link to="/sign-in" className="hidden md:block px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                            {t('nav_signin')}
                        </Link>

                        <Link to="/sign-in" className="relative group overflow-hidden px-8 py-2.5 text-sm font-black text-white rounded-xl transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_100%] group-hover:animate-shimmer transition-all"></div>
                            <span className="relative z-10">{t('landing_get_started')}</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left rtl:lg:text-right space-y-10 z-10">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] animate-bounce-subtle border border-primary/10">
                                <Zap size={14} className="fill-current" />
                                <span>The New Social Standard</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tight">
                                <span className="block">{t('landing_hero_title').split('.')[0]}</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Beyond Limits.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-90">
                                {t('landing_hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                                <Link to="/sign-up" className="group relative w-full sm:w-auto px-12 py-5 bg-primary overflow-hidden rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.3)]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                    <span className="relative text-white">{t('landing_get_started')}</span>
                                    <ArrowRight size={22} className={`relative text-white transition-transform duration-300 group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                </Link>
                                <button className="w-full sm:w-auto px-12 py-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:border-primary/30">
                                    {t('landing_learn_more')}
                                </button>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                <div className="flex -space-x-3 rtl:space-x-reverse">
                                    {[1, 2, 3, 4].map(i => (
                                        <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="" className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 shadow-xl" />
                                    ))}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-950 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-400">
                                        +50k
                                    </div>
                                </div>
                                <div className="flex flex-col items-start rtl:items-end">
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(i => <Zap key={i} size={14} className="fill-current" />)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-500/80 uppercase tracking-widest">Trusted by Community</span>
                                </div>
                            </div>
                        </div>

                        {/* Premium 3D Hero Illustration */}
                        <div className="flex-1 relative z-10 w-full group perspective-1000">
                            <div className="absolute inset-x-0 -bottom-10 h-20 bg-primary/20 blur-[100px] rounded-full"></div>
                            <div className="relative rounded-[4rem] p-2 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-2xl transition-all duration-700 group-hover:rotate-1-3d">
                                <img
                                    src="/hero-illustration.webp"
                                    alt="Premium Social Connectivity Illustration"
                                    className="w-full h-auto rounded-[3.8rem] shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:-translate-y-4"
                                />

                                {/* Floating Badges */}
                                <div className="absolute -top-10 -right-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800 hidden md:block animate-float animation-delay-500 hover:scale-110 transition-transform cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div className="pr-4">
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-wider">Status</div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Secure & Encrypted</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-6 -left-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl border border-white/50 dark:border-gray-800 hidden md:block animate-float hover:scale-110 transition-transform cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                                            <Heart size={24} className="fill-current" />
                                        </div>
                                        <div className="pr-4">
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-wider">Engagement</div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">1.2M+ Reactions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-48 space-y-20">
                        <div className="text-center space-y-4">
                            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Experience Social Brilliance</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl mx-auto">Everything you need in a modern social network, crafted with precision.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, i) => (
                                <div key={i} className="group p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-indigo-500/10">
                                    <div className={`w-16 h-16 rounded-2xl mb-10 flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 bg-gradient-to-br from-primary to-indigo-600 shadow-xl shadow-primary/20`}>
                                        <feature.icon size={30} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-[1.6]">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sub-hero / CTA */}
                    <div className="mt-48 relative rounded-[4.5rem] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-700 to-primary bg-[length:200%_100%] group-hover:animate-gradient transition-all duration-1000"></div>
                        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative px-8 py-28 text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black text-white max-w-5xl mx-auto leading-[1.1] tracking-tighter">
                                Ready for the next generation of social connection?
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/sign-up" className="group w-full sm:w-auto px-14 py-6 bg-white text-primary rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_25px_50px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
                                    {t('landing_get_started')}
                                    <ArrowRight size={24} className="transition-transform group-hover:translate-x-1" />
                                </Link>
                                <button className="w-full sm:w-auto px-14 py-6 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-[2rem] font-black text-xl hover:bg-white/20 transition-all">
                                    Join Community
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Premium Multi-column Footer */}
            <footer className="relative mt-20 pb-16 pt-32 overflow-hidden border-t border-gray-100 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-950/30">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">
                        {/* Brand Column */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Zap size={22} className="text-white fill-current" />
                                </div>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">FRIENDS.</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Designing the future of social connectivity. Beautifully crafted, securely built, and community focused.
                            </p>
                            <div className="flex items-center gap-4">
                                {[Globe, Shield, MessageSquare, Camera].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all hover:-translate-y-1 shadow-sm">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Product</h4>
                            <ul className="space-y-4">
                                {['Features', 'Marketplace', 'Mobile App', 'Security'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-500 dark:text-gray-400 font-bold hover:text-primary dark:hover:text-primary transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Company</h4>
                            <ul className="space-y-4">
                                {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-500 dark:text-gray-400 font-bold hover:text-primary dark:hover:text-primary transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter Column */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Subscribe</h4>
                            <p className="text-gray-500 dark:text-gray-400 font-semibold">Join 10,000+ creators for weekly updates.</p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-gray-900 dark:text-white"
                                />
                                <button className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                            © {new Date().getFullYear()} Friends Inc. High-Performance Social.
                        </p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="text-xs font-black text-gray-400 dark:text-gray-600 hover:text-primary transition-colors">English (US)</a>
                            <a href="#" className="text-xs font-black text-gray-400 dark:text-gray-600 hover:text-primary transition-colors">Status: Operational</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-bounce-subtle { animation: bounce-subtle 4s ease-in-out infinite; }
                .animate-shimmer { animation: shimmer 3s infinite linear; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .perspective-1000 { perspective: 1000px; }
                .group-hover\\:rotate-1-3d:hover { transform: rotateX(2deg) rotateY(-2deg) scale(1.02); }
            `}} />
        </div>
    );
};

export default Landing;
