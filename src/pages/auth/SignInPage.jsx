import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Loader2, Chrome, ArrowRight, Sparkles } from 'lucide-react';

const SignInPage = () => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;

        setLoading(true);
        setError("");

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                navigate("/");
            } else {
                console.log(result);
            }
        } catch (err) {
            setError(err.errors[0]?.message || "An error occurred during sign in.");
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        if (!isLoaded) return;
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err) {
            setError(err.errors[0]?.message || "An error occurred during Google sign in.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f111a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse duration-[8000ms]"></div>
                <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px] animate-pulse duration-[10000ms]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Back to Home</span>
                </Link>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                                <Sparkles size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Welcome Back</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">Sign In</h1>
                            <p className="text-gray-400 font-medium">Connect with your friends again.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium placeholder:text-gray-600"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-4">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors mr-2">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all font-medium placeholder:text-gray-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-gray-900 font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/10"></div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Or continue with</span>
                            <div className="h-px flex-1 bg-white/10"></div>
                        </div>

                        <button
                            onClick={signInWithGoogle}
                            type="button"
                            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Chrome size={20} />
                            Continue with Google
                        </button>

                        <p className="mt-10 text-center text-gray-400 font-medium">
                            Don't have an account?{" "}
                            <Link to="/sign-up" className="text-white font-black hover:text-indigo-400 transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
