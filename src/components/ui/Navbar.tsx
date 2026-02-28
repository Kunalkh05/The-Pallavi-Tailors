import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export function Navbar() {
    const { user, profile, signOut } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Don't show navbar on dashboards
    if (location.pathname.startsWith('/admin') || location.pathname === '/dashboard') return null;

    const isHome = location.pathname === '/';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'py-3 bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-surface/50'
                : 'py-5 bg-transparent'
            }`}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 border border-primary/20 group-hover:bg-primary/25 transition-colors duration-300">
                        <span className="material-symbols-outlined text-primary !text-lg">checkroom</span>
                    </div>
                    <span className="font-display text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">
                        The Pallavi Tailors
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {isHome ? (
                        <>
                            {['Home', 'Services', 'Gallery', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                                    className="relative text-sm text-white/70 hover:text-primary transition-colors duration-300 font-medium py-1 group"
                                >
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
                                </a>
                            ))}
                        </>
                    ) : (
                        <Link to="/" className="text-sm text-white/70 hover:text-primary transition-colors duration-300 font-medium">Home</Link>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to={profile?.role === 'admin' || profile?.role === 'super_admin' ? '/admin' : '/dashboard'}
                                className="text-sm text-white/70 hover:text-primary transition-colors duration-300 font-medium"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="text-sm text-muted-rose/50 hover:text-primary transition-colors duration-300"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-white/70 hover:text-primary transition-colors duration-300 font-medium">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary !py-2.5 !px-5 !text-sm">
                                Book Appointment
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white/70 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {mobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass-strong mt-2 mx-4 rounded-2xl p-6 animate-fade-in-scale" style={{ animationDuration: '0.3s' }}>
                    <div className="flex flex-col gap-4">
                        {isHome && ['Home', 'Services', 'Gallery', 'Contact'].map((item) => (
                            <a
                                key={item}
                                href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white/80 hover:text-primary transition-colors py-2 text-sm font-medium"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="h-[1px] bg-white/10 my-2"></div>
                        {user ? (
                            <>
                                <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-primary py-2 text-sm font-medium">Dashboard</Link>
                                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="text-left text-muted-rose/50 hover:text-primary py-2 text-sm">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-primary py-2 text-sm font-medium">Sign In</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary !py-2.5 !text-sm text-center">Book Appointment</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
