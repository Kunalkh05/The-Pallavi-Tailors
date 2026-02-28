// Customer Dashboard - The Pallavi Tailors — Real-Time
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

interface Order {
    id: string;
    dress_type: string;
    status: string;
    delivery_date: string | null;
    created_at: string;
    notes: string | null;
}

interface Measurements {
    id?: string;
    bust: string;
    waist: string;
    hip: string;
    shoulder: string;
    sleeve_length: string;
}

interface Appointment {
    id: string;
    service_type: string;
    preferred_date: string | null;
    message: string | null;
    status: string;
    created_at: string;
}

const STATUS_PROGRESS: Record<string, number> = {
    'Order Confirmed': 15,
    'Cutting': 30,
    'Stitching': 55,
    'Trial': 75,
    'Ready': 90,
    'Delivered': 100,
};

const STATUS_COLORS: Record<string, string> = {
    'Order Confirmed': 'text-yellow-400',
    'Cutting': 'text-orange-400',
    'Stitching': 'text-primary',
    'Trial': 'text-blue-400',
    'Ready': 'text-green-400',
    'Delivered': 'text-slate-400',
};

const APPT_STATUS_COLORS: Record<string, string> = {
    'Pending': 'text-yellow-400 bg-yellow-400/10',
    'Confirmed': 'text-green-400 bg-green-400/10',
    'Completed': 'text-slate-400 bg-slate-400/10',
    'Cancelled': 'text-red-400 bg-red-400/10',
};

const SERVICE_OPTIONS = [
    'Bridal Blouse Stitching',
    'Designer Kurti',
    'Saree Customization',
    'Alterations & Fittings',
    'Lehenga Stitching',
    'General Consultation',
];

export function CustomerDashboard() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [measurements, setMeasurements] = useState<Measurements>({ bust: '', waist: '', hip: '', shoulder: '', sleeve_length: '' });
    const [hasMeasurements, setHasMeasurements] = useState(false);
    const [editingMeasurements, setEditingMeasurements] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'appointments'>('orders');
    const [showBooking, setShowBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState({ service_type: SERVICE_OPTIONS[0], preferred_date: '', message: '' });
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!profile) return;
        const { data } = await supabase
            .from('orders')
            .select('id, dress_type, status, delivery_date, created_at, notes')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        setOrders(data || []);
    }, [profile]);

    const fetchAppointments = useCallback(async () => {
        if (!profile) return;
        const { data } = await supabase
            .from('appointments')
            .select('id, service_type, preferred_date, message, status, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });
        setAppointments(data || []);
    }, [profile]);

    const fetchMeasurements = useCallback(async () => {
        if (!profile) return;
        const { data: mData } = await supabase
            .from('measurements')
            .select('*')
            .eq('user_id', profile.id)
            .single();

        if (mData) {
            setMeasurements({
                id: mData.id,
                bust: mData.bust?.toString() || '',
                waist: mData.waist?.toString() || '',
                hip: mData.hip?.toString() || '',
                shoulder: mData.shoulder?.toString() || '',
                sleeve_length: mData.sleeve_length?.toString() || '',
            });
            setHasMeasurements(true);
        }
    }, [profile]);

    useEffect(() => {
        if (!profile) return;

        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchOrders(), fetchAppointments(), fetchMeasurements()]);
            setLoading(false);
        };
        loadAll();

        // ─── Real-time subscription for orders ───
        const ordersChannel = supabase
            .channel('customer-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${profile.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new as Order;
                        setOrders(prev => [newOrder, ...prev]);
                        toast(`New order placed: ${newOrder.dress_type}`, 'info');
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as Order;
                        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
                        toast(`Order "${updated.dress_type}" updated to: ${updated.status}`, 'success');
                    } else if (payload.eventType === 'DELETE') {
                        const deleted = payload.old as { id: string };
                        setOrders(prev => prev.filter(o => o.id !== deleted.id));
                        toast('An order was removed.', 'info');
                    }
                }
            )
            .subscribe();

        // ─── Real-time subscription for appointments ───
        const appointmentsChannel = supabase
            .channel('customer-appointments')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'appointments',
                    filter: `user_id=eq.${profile.id}`,
                },
                (payload) => {
                    const updated = payload.new as Appointment;
                    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
                    toast(`Appointment ${updated.status}: ${updated.service_type}`, 'success');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(appointmentsChannel);
        };
    }, [profile, fetchOrders, fetchAppointments, fetchMeasurements, toast]);

    const handleSaveMeasurements = async () => {
        if (!profile) return;
        setSaving(true);

        const payload = {
            user_id: profile.id,
            bust: measurements.bust ? parseFloat(measurements.bust) : null,
            waist: measurements.waist ? parseFloat(measurements.waist) : null,
            hip: measurements.hip ? parseFloat(measurements.hip) : null,
            shoulder: measurements.shoulder ? parseFloat(measurements.shoulder) : null,
            sleeve_length: measurements.sleeve_length ? parseFloat(measurements.sleeve_length) : null,
        };

        if (hasMeasurements && measurements.id) {
            const { error } = await supabase.from('measurements').update(payload).eq('id', measurements.id);
            if (error) {
                toast('Failed to update measurements', 'error');
            } else {
                toast('Measurements updated successfully!', 'success');
            }
        } else {
            const { data, error } = await supabase.from('measurements').insert(payload).select().single();
            if (error) {
                toast('Failed to save measurements', 'error');
            } else {
                if (data) setMeasurements(prev => ({ ...prev, id: data.id }));
                setHasMeasurements(true);
                toast('Measurements saved successfully!', 'success');
            }
        }

        setSaving(false);
        setEditingMeasurements(false);
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setBookingLoading(true);

        const { error } = await supabase.from('appointments').insert({
            user_id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            service_type: bookingForm.service_type,
            preferred_date: bookingForm.preferred_date || null,
            message: bookingForm.message || null,
            status: 'Pending',
        });

        if (error) {
            toast('Failed to book appointment: ' + error.message, 'error');
        } else {
            toast('Appointment booked! We\'ll confirm soon.', 'success');
            setShowBooking(false);
            setBookingForm({ service_type: SERVICE_OPTIONS[0], preferred_date: '', message: '' });
            fetchAppointments();
        }
        setBookingLoading(false);
    };

    const activeOrders = orders.filter(o => o.status !== 'Delivered');
    const completedOrders = orders.filter(o => o.status === 'Delivered');

    const measurementFields = [
        { key: 'bust', label: 'Bust' },
        { key: 'waist', label: 'Waist' },
        { key: 'hip', label: 'Hips' },
        { key: 'shoulder', label: 'Shoulder' },
        { key: 'sleeve_length', label: 'Sleeve Length' },
    ] as const;

    return (
        <div className="min-h-screen bg-surface pt-24 pb-16 px-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    <div>
                        <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-2">Dashboard</p>
                        <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">Welcome, {profile?.name || 'Guest'}</h1>
                        <p className="text-muted-rose/60">Track your orders and manage your wardrobe.</p>
                    </div>
                    <button onClick={() => setShowBooking(true)} className="btn-primary !py-2.5 !px-5 !text-sm">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        Book Appointment
                    </button>
                </div>

                {/* Booking Modal */}
                {showBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowBooking(false)}>
                        <div className="card-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display text-xl font-bold text-white">Book Appointment</h2>
                                <button onClick={() => setShowBooking(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Service Type</label>
                                    <select value={bookingForm.service_type} onChange={e => setBookingForm(p => ({ ...p, service_type: e.target.value }))}
                                        className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
                                        {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Preferred Date</label>
                                    <input type="date" value={bookingForm.preferred_date} onChange={e => setBookingForm(p => ({ ...p, preferred_date: e.target.value }))}
                                        className="input-glass" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Message (optional)</label>
                                    <textarea value={bookingForm.message} onChange={e => setBookingForm(p => ({ ...p, message: e.target.value }))}
                                        rows={3} placeholder="Any special requirements..."
                                        className="input-glass resize-none" />
                                </div>
                                <button type="submit" disabled={bookingLoading} className="btn-primary w-full !rounded-xl mt-2 disabled:opacity-60">
                                    {bookingLoading ? (
                                        <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-lg">check</span> Confirm Booking</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    {[
                        { label: 'Active Orders', value: loading ? '—' : String(activeOrders.length), icon: 'shopping_bag', color: 'text-primary' },
                        { label: 'Completed', value: loading ? '—' : String(completedOrders.length), icon: 'check_circle', color: 'text-green-400' },
                        { label: 'Appointments', value: loading ? '—' : String(appointments.length), icon: 'calendar_month', color: 'text-blue-400' },
                        { label: 'Saved Profiles', value: hasMeasurements ? '1' : '0', icon: 'person', color: 'text-yellow-400' },
                    ].map((stat, i) => (
                        <div key={i} className="card-dark flex items-center gap-4">
                            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Selector */}
                <div className="flex gap-1 mb-8 bg-surface/50 border border-white/5 rounded-xl p-1 w-fit opacity-0 animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                    {(['orders', 'appointments'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:text-white'}`}>
                            {tab === 'orders' ? '📦 Orders' : '📅 Appointments'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 card-dark opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        {activeTab === 'orders' ? (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-lg">local_shipping</span>
                                    </div>
                                    <h2 className="font-display text-xl font-bold text-white">Order Tracking</h2>
                                    <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{orders.length} total</span>
                                    <span className="ml-auto text-[10px] uppercase tracking-widest text-green-400/80 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Live
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">shopping_bag</span>
                                        <p className="text-slate-400 font-display mb-1">No orders yet</p>
                                        <p className="text-slate-500 text-sm">Your orders will appear here once placed.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-surface rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-white font-bold">{order.dress_type}</p>
                                                        <p className="text-slate-500 text-xs mt-0.5">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] || 'text-slate-400'} bg-primary/10 px-3 py-1 rounded-full`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-1.5">
                                                    <div
                                                        className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                                                        style={{ width: `${STATUS_PROGRESS[order.status] || 10}%` }}
                                                    />
                                                </div>
                                                {order.notes && (
                                                    <p className="text-slate-500 text-xs mt-2 italic">Note: {order.notes}</p>
                                                )}
                                                {order.delivery_date && (
                                                    <p className="text-slate-500 text-xs mt-2">
                                                        Expected: {new Date(order.delivery_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                                    </div>
                                    <h2 className="font-display text-xl font-bold text-white">My Appointments</h2>
                                    <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{appointments.length} total</span>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">calendar_month</span>
                                        <p className="text-slate-400 font-display mb-1">No appointments yet</p>
                                        <p className="text-slate-500 text-sm">Click "Book Appointment" to schedule a consultation.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments.map((appt) => (
                                            <div key={appt.id} className="bg-surface rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-white font-bold">{appt.service_type}</p>
                                                        <p className="text-slate-500 text-xs mt-0.5">
                                                            Booked: {new Date(appt.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${APPT_STATUS_COLORS[appt.status] || 'text-slate-400 bg-slate-400/10'}`}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                                {appt.preferred_date && (
                                                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-sm">event</span>
                                                        Preferred: {new Date(appt.preferred_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                                {appt.message && <p className="text-slate-500 text-xs mt-2 italic">{appt.message}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Measurements */}
                    <div className="card-dark opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-lg">straighten</span>
                            </div>
                            <h2 className="font-display text-xl font-bold text-white">My Measurements</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : editingMeasurements ? (
                            <div className="space-y-3">
                                {measurementFields.map((m) => (
                                    <div key={m.key} className="flex justify-between items-center bg-surface rounded-xl px-4 py-2 border border-white/5">
                                        <span className="text-slate-400 text-sm">{m.label}</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={measurements[m.key]}
                                            onChange={e => setMeasurements(prev => ({ ...prev, [m.key]: e.target.value }))}
                                            className="w-20 bg-transparent text-right text-white font-bold font-display focus:outline-none focus:border-b focus:border-primary"
                                            placeholder='—"'
                                        />
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-4">
                                    <button onClick={handleSaveMeasurements} disabled={saving} className="btn-primary flex-1 !rounded-xl !py-3 !text-sm disabled:opacity-60">
                                        {saving ? (
                                            <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-lg">save</span> Save</>
                                        )}
                                    </button>
                                    <button onClick={() => setEditingMeasurements(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl py-3 text-sm font-semibold hover:bg-white/10 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {measurementFields.map((m) => (
                                        <div key={m.key} className="flex justify-between items-center bg-surface rounded-xl px-4 py-3 border border-white/5">
                                            <span className="text-slate-400 text-sm">{m.label}</span>
                                            <span className="text-white font-bold font-display">
                                                {measurements[m.key] ? `${measurements[m.key]}"` : '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setEditingMeasurements(true)} className="btn-primary w-full mt-6 !rounded-xl !py-3 !text-sm">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    {hasMeasurements ? 'Update Measurements' : 'Add Measurements'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
