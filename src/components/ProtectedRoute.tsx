import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'super_admin' | 'customer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but role doesn't match → redirect to appropriate dashboard
    if (requiredRole && profile?.role !== requiredRole) {
        // If they're an admin trying to visit customer page, send them to admin and vice versa
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
