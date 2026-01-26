import { SignInButton } from '@clerk/clerk-react';
import { ArrowRight, Globe, Shield, Users, Sparkles, MessageCircle, Heart, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-[#0f111a] text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Gradients & Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse duration-[8000ms]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[100px] animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-0 left-1/3 w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex justify-between items-center px-6 py-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                    <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/25" />
                    <span>Friends.</span>
                </div>
                <SignInButton mode="modal">
                    <button className="px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/30 rounded-full bg-white/5 backdrop-blur-sm">
                        Sign In
                    </button>
                </SignInButton>

                <button
                    onClick={toggleTheme}
                    className="ml-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center pb-20">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-white/10 transition-colors cursor-default hover:scale-105 transform">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span className="text-xs font-bold tracking-wide text-gray-200 uppercase">The Future of Social</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-100">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Connect Beyond</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2">Boundaries.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Experience a premium social space designed for meaningful connections. Share your world, discover new stories, and engage in real-time.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <SignInButton mode="modal">
                        <button className="group relative px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <span className="relative flex items-center gap-3">
                                Get Started with Google
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </SignInButton>
                    <button className="px-8 py-4 text-gray-300 font-semibold text-lg hover:text-white transition-colors">
                        Learn more
                    </button>
                </div>

                {/* Feature Cards / Floating Elements */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <FeatureCard
                        icon={Globe}
                        title="Global Reach"
                        desc="Connect with friends across the world without limits."
                        color="bg-blue-500"
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Secure & Private"
                        desc="Your data is yours. Experience privacy-first social networking."
                        color="bg-green-500"
                    />
                    <FeatureCard
                        icon={Users}
                        title="Vibrant Community"
                        desc="Join thousands of creators and thinkers sharing daily."
                        color="bg-pink-500"
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="group relative p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
        <div className={`absolute top-0 right-0 p-32 ${color} rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

export default Landing;
