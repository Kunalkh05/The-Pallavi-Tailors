import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const { error: authError } = await signUp(email, password, name, phone);
            if (authError) {
                setError(authError.message);
            } else {
                setSuccess('Account created! Please check your email to confirm, then sign in.');
                toast('Account created successfully! 🎉', 'success');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300";

    return (
        <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-4 py-20">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-blush/8 rounded-full blur-[120px]"></div>
            </div>

            {/* Floating petals */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="petal" style={{
                        left: `${10 + i * 20}%`, top: '-20px',
                        width: `${8 + i * 3}px`, height: `${8 + i * 3}px`,
                        animationDelay: `${i * 2}s`, animationDuration: `${11 + i * 2}s`, opacity: 0.3,
                    }} />
                ))}
            </div>

            <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row items-center gap-12">
                {/* Register Card — solid visible card */}
                <div
                    className="w-full lg:w-3/5 rounded-3xl p-10 border border-primary/20"
                    style={{
                        background: 'linear-gradient(145deg, #3d1f38 0%, #2a1428 50%, #1e0e1e 100%)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(232,168,124,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-xl">checkroom</span>
                            </div>
                            <span className="font-display text-lg font-bold text-white">The Pallavi Tailors</span>
                        </div>
                        <h1 className="font-display text-3xl font-medium text-gradient-rosegold mb-2">Create Account</h1>
                        <p className="text-muted-rose/50 text-sm">Join The Pallavi Tailors to curate your personal style journey.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Full Name</label>
                                <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Phone Number</label>
                                <input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Email Address</label>
                            <input type="email" placeholder="info@pallavitailors.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className={inputClass} />
                            <p className="text-xs text-muted-rose/40 mt-1.5">Minimum 6 characters</p>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full btn-primary !rounded-xl !py-3.5 !text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    Start Curating <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-xs uppercase tracking-widest text-muted-rose/40 font-semibold">or</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Google Sign-Up */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 disabled:opacity-50"
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.0 24.0 0 000 21.56l7.98-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-muted-rose/50 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-semibold">Sign In</Link>
                    </p>
                </div>

                {/* Right side — decorative quote card */}
                <div className="hidden lg:flex w-2/5 flex-col items-center justify-center">
                    <div
                        className="p-8 rounded-3xl text-center border border-white/10"
                        style={{ background: 'linear-gradient(145deg, rgba(60,30,55,0.6), rgba(35,15,35,0.8))' }}
                    >
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-6"></div>
                        <p className="font-display text-2xl italic text-white/80 leading-relaxed mb-6">
                            "A beautifully tailored outfit will never go out of style."
                        </p>
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-4"></div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-bold">— The Pallavi Tailors</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
