import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'customer' | 'admin' | 'super_admin';
    business_id: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
    signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: AuthError | Error | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);
    const initialized = useRef(false);

    // Fetch user profile from the public.users table
    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as UserProfile;
        } catch (e) {
            console.error('Failed to fetch profile:', e);
            return null;
        }
    }

    useEffect(() => {
        // If Supabase isn't configured, nothing to do (loading is already false)
        if (!isSupabaseConfigured) return;

        // Prevent double-initialization in StrictMode
        if (initialized.current) return;
        initialized.current = true;

        // Get the initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);

            if (s?.user) {
                fetchProfile(s.user.id).then((p) => {
                    setProfile(p);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        }).catch((err) => {
            console.error('Failed to get session:', err);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    const p = await fetchProfile(newSession.user.id);
                    setProfile(p);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            return { error: new Error('Supabase is not configured. Please update .env with valid credentials.') as AuthError | Error };
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, name: string, phone?: string) => {
        if (!isSupabaseConfigured) {
            return { error: new Error('Supabase is not configured. Please update .env with valid credentials.') };
        }
        // 1. Create an auth user — pass name/phone as metadata for the DB trigger fallback
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone: phone || null },
            },
        });
        if (authError) return { error: authError };

        // 2. Create/update profile row in public.users (upsert to handle trigger race)
        if (data.user) {
            // Small delay to let the auth session propagate
            await new Promise(resolve => setTimeout(resolve, 500));

            const { error: profileError } = await supabase.from('users').upsert({
                id: data.user.id,
                name,
                email,
                phone: phone || null,
                role: 'customer',
            }, { onConflict: 'id' });

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // Don't fail registration — the DB trigger should have created a basic profile
                console.warn('Profile upsert failed, but the DB trigger may have created a basic profile.');
            }
        }

        return { error: null };
    };

    const signOut = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const signInWithGoogle = async () => {
        if (!isSupabaseConfigured) {
            return { error: new Error('Supabase is not configured.') };
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard',
            },
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
