import { useState, useEffect } from 'react';
import { useUser, useAuth, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Google as GoogleIcon } from 'lucide-react'; // Google icon might not exist in Lucide, checking... Lucide doesn't have Google. using text or just "G".
// Actually, I'll use a generic specialized SVG or just text for simplicity/reliability.
import { ArrowRight, Globe, Users, Shield } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent cursor-pointer">
                    Friends.
                </div>
                <SignInButton mode="modal">
                    <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                        Sign In
                    </button>
                </SignInButton>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>

                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase">
                        <Globe size={16} />
                        <span>Connect Globally</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                        Your World, <br />
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Closer Together.</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Share moments, connect with friends, and discover new communities in a premium space designed for meaningful interactions.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <SignInButton mode="modal">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-200">
                                <span>Continue with Google</span>
                                <ArrowRight size={20} />
                            </button>
                        </SignInButton>
                    </div>

                    <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 text-gray-400 opacity-60">
                        <div className="flex flex-col items-center gap-2">
                            <Users size={24} />
                            <span className="font-bold text-sm uppercase tracking-widest">Community</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Shield size={24} />
                            <span className="font-bold text-sm uppercase tracking-widest">Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
                            <Globe size={24} />
                            <span className="font-bold text-sm uppercase tracking-widest">Global</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
                &copy; 2026 Friends Social. All rights reserved.
            </footer>
        </div>
    );
};

export default Landing;
