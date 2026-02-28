// Admin Dashboard - The Pallavi Tailors — Real-Time
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

interface Order {
    id: string;
    dress_type: string;
    fabric_type: string | null;
    price: number | null;
    status: string;
    delivery_date: string | null;
    urgency_level: string;
    notes: string | null;
    created_at: string;
    user_id: string;
    customer_name?: string;
}

interface Appointment {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    service_type: string;
    preferred_date: string | null;
    message: string | null;
    status: string;
    created_at: string;
    user_id: string | null;
}

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    created_at: string;
}

const STATUS_OPTIONS = ['Order Confirmed', 'Cutting', 'Stitching', 'Trial', 'Ready', 'Delivered'];
const APPT_STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_COLORS: Record<string, string> = {
    'Order Confirmed': 'text-yellow-400 bg-yellow-400/10',
    'Cutting': 'text-orange-400 bg-orange-400/10',
    'Stitching': 'text-primary bg-primary/10',
    'Trial': 'text-blue-400 bg-blue-400/10',
    'Ready': 'text-green-400 bg-green-400/10',
    'Delivered': 'text-slate-400 bg-slate-400/10',
};

const APPT_STATUS_COLORS: Record<string, string> = {
    'Pending': 'text-yellow-400 bg-yellow-400/10',
    'Confirmed': 'text-green-400 bg-green-400/10',
    'Completed': 'text-blue-400 bg-blue-400/10',
    'Cancelled': 'text-red-400 bg-red-400/10',
};

export function AdminDashboard() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'appointments' | 'messages'>('orders');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [newOrder, setNewOrder] = useState({ customerEmail: '', dress_type: '', fabric_type: '', price: '', delivery_date: '', urgency_level: 'Normal', notes: '' });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Computed metrics
    const metrics = {
        pending: orders.filter(o => o.status === 'Order Confirmed').length,
        inProgress: orders.filter(o => ['Cutting', 'Stitching', 'Trial'].includes(o.status)).length,
        completed: orders.filter(o => ['Ready', 'Delivered'].includes(o.status)).length,
        revenue: orders.reduce((sum, o) => sum + (o.price || 0), 0),
        pendingAppts: appointments.filter(a => a.status === 'Pending').length,
    };

    const fetchOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, users!orders_user_id_fkey(name)')
            .order('created_at', { ascending: false });

        if (error) {
            const { data: fallbackData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            setOrders((fallbackData || []).map(o => ({ ...o, customer_name: 'Unknown' })));
        } else {
            setOrders((data || []).map((o: any) => ({
                ...o,
                customer_name: o.users?.name || 'Unknown',
            })));
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false });
        setAppointments(data || []);
    }, []);

    const fetchMessages = useCallback(async () => {
        const { data } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
        setMessages(data || []);
    }, []);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchOrders(), fetchAppointments(), fetchMessages()]);
            setLoading(false);
        };
        loadAll();

        // ─── Real-time: Orders ───
        const ordersChannel = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    toast('📦 New order received!', 'info');
                    fetchOrders();
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new as Order;
                    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
                } else if (payload.eventType === 'DELETE') {
                    const deleted = payload.old as { id: string };
                    setOrders(prev => prev.filter(o => o.id !== deleted.id));
                }
            })
            .subscribe();

        // ─── Real-time: Appointments ───
        const appointmentsChannel = supabase
            .channel('admin-appointments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
                const newAppt = payload.new as Appointment;
                setAppointments(prev => [newAppt, ...prev]);
                toast(`📅 New appointment from ${newAppt.name}!`, 'info');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(appointmentsChannel);
        };
    }, [fetchOrders, fetchAppointments, fetchMessages, toast]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            toast('Failed to update status', 'error');
            return;
        }

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast(`Status updated to: ${newStatus}`, 'success');
    };

    const handleDeleteOrder = async (orderId: string, dressType: string) => {
        if (!confirm(`Delete order "${dressType}"? This cannot be undone.`)) return;

        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
            toast('Failed to delete order: ' + error.message, 'error');
            return;
        }
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast(`Order "${dressType}" deleted.`, 'success');
    };

    const handleApptStatusChange = async (apptId: string, newStatus: string) => {
        const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', apptId);
        if (error) {
            toast('Failed to update appointment', 'error');
            return;
        }
        setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
        toast(`Appointment ${newStatus}`, 'success');
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        const { data: customerData, error: customerError } = await supabase
            .from('users')
            .select('id')
            .eq('email', newOrder.customerEmail)
            .single();

        if (customerError || !customerData) {
            setFormError('Customer not found. Make sure they have an account.');
            setFormLoading(false);
            return;
        }

        const { error } = await supabase.from('orders').insert({
            user_id: customerData.id,
            business_id: profile?.business_id || null,
            dress_type: newOrder.dress_type,
            fabric_type: newOrder.fabric_type || null,
            price: newOrder.price ? parseFloat(newOrder.price) : null,
            delivery_date: newOrder.delivery_date || null,
            urgency_level: newOrder.urgency_level,
            notes: newOrder.notes || null,
            status: 'Order Confirmed',
        });

        if (error) {
            setFormError(error.message);
            setFormLoading(false);
            return;
        }

        toast('Order created successfully!', 'success');
        setFormLoading(false);
        setShowNewOrder(false);
        setNewOrder({ customerEmail: '', dress_type: '', fabric_type: '', price: '', delivery_date: '', urgency_level: 'Normal', notes: '' });
        fetchOrders();
    };

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val.toFixed(0)}`;
    };

    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-surface pt-24 pb-16 px-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    <div>
                        <p className="text-primary uppercase tracking-widest text-xs font-semibold mb-2">Admin Panel</p>
                        <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">Tailor Dashboard</h1>
                        <p className="text-slate-400">Welcome back, <span className="text-white font-semibold">{profile?.name || 'Admin'}</span>
                            <span className="ml-2 text-[10px] uppercase tracking-widest text-green-400/80 inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Live
                            </span>
                        </p>
                    </div>
                    <button onClick={() => setShowNewOrder(true)} className="btn-primary !py-2.5 !px-5 !text-sm">
                        <span className="material-symbols-outlined text-lg">add</span>
                        New Order
                    </button>
                </div>

                {/* New Order Modal */}
                {showNewOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNewOrder(false)}>
                        <div className="card-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }} onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display text-xl font-bold text-white">Create New Order</h2>
                                <button onClick={() => setShowNewOrder(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleCreateOrder} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Customer Email</label>
                                    <input type="email" required value={newOrder.customerEmail} onChange={e => setNewOrder(p => ({ ...p, customerEmail: e.target.value }))}
                                        className="input-glass"
                                        placeholder="customer@email.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Dress Type</label>
                                        <input type="text" required value={newOrder.dress_type} onChange={e => setNewOrder(p => ({ ...p, dress_type: e.target.value }))}
                                            className="input-glass"
                                            placeholder="e.g., Bridal Blouse" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Fabric Type</label>
                                        <input type="text" value={newOrder.fabric_type} onChange={e => setNewOrder(p => ({ ...p, fabric_type: e.target.value }))}
                                            className="input-glass"
                                            placeholder="e.g., Silk" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Price (₹)</label>
                                        <input type="number" step="0.01" value={newOrder.price} onChange={e => setNewOrder(p => ({ ...p, price: e.target.value }))}
                                            className="input-glass"
                                            placeholder="2500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Delivery Date</label>
                                        <input type="date" value={newOrder.delivery_date} onChange={e => setNewOrder(p => ({ ...p, delivery_date: e.target.value }))}
                                            className="input-glass" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Urgency</label>
                                        <select value={newOrder.urgency_level} onChange={e => setNewOrder(p => ({ ...p, urgency_level: e.target.value }))}
                                            className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors">
                                            <option value="Normal">Normal</option>
                                            <option value="Urgent">Urgent</option>
                                            <option value="Express">Express</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Notes</label>
                                        <input type="text" value={newOrder.notes} onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))}
                                            className="input-glass"
                                            placeholder="Special instructions" />
                                    </div>
                                </div>
                                <button type="submit" disabled={formLoading} className="btn-primary w-full !rounded-xl mt-2 disabled:opacity-60">
                                    {formLoading ? (
                                        <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-lg">add</span> Create Order</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    {[
                        { label: 'Pending', value: loading ? '—' : String(metrics.pending), icon: 'pending', accent: 'text-yellow-400' },
                        { label: 'In Progress', value: loading ? '—' : String(metrics.inProgress), icon: 'content_cut', accent: 'text-primary' },
                        { label: 'Completed', value: loading ? '—' : String(metrics.completed), icon: 'check_circle', accent: 'text-green-400' },
                        { label: 'Revenue', value: loading ? '—' : formatCurrency(metrics.revenue), icon: 'payments', accent: 'text-blue-400' },
                        { label: 'Appointments', value: loading ? '—' : String(metrics.pendingAppts), icon: 'calendar_month', accent: 'text-rose-400' },
                    ].map((metric, i) => (
                        <div key={i} className="card-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`material-symbols-outlined ${metric.accent}`}>{metric.icon}</span>
                            </div>
                            <p className="text-2xl font-display font-bold text-white">{metric.value}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">{metric.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Selector */}
                <div className="flex gap-1 mb-6 bg-surface/50 border border-white/5 rounded-xl p-1 w-fit opacity-0 animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                    {([
                        { key: 'orders' as const, label: '📦 Orders', count: orders.length },
                        { key: 'appointments' as const, label: '📅 Appointments', count: appointments.filter(a => a.status === 'Pending').length },
                        { key: 'messages' as const, label: '💬 Messages', count: messages.length },
                    ]).map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.key ? 'bg-primary/15 text-primary' : 'text-slate-400 hover:text-white'}`}>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ─── ORDERS TAB ─── */}
                {activeTab === 'orders' && (
                    <div className="card-dark opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                                </div>
                                <h2 className="font-display text-xl font-bold text-white">All Orders</h2>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['All', ...STATUS_OPTIONS].map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-slate-400 text-sm">Loading orders...</p>
                                </div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">inbox</span>
                                <p className="text-slate-400 text-lg font-display mb-2">
                                    {filterStatus === 'All' ? 'No orders yet' : `No "${filterStatus}" orders`}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Dress Type</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Customer</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Fabric</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Price</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Status</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold">Due</th>
                                            <th className="pb-3 text-xs uppercase tracking-widest text-slate-400 font-semibold"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 text-sm text-white font-bold">
                                                    {order.dress_type}
                                                    {order.urgency_level !== 'Normal' && (
                                                        <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{order.urgency_level}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-sm text-slate-300">{order.customer_name}</td>
                                                <td className="py-4 text-sm text-slate-300">{order.fabric_type || '—'}</td>
                                                <td className="py-4 text-sm text-slate-300">{order.price ? `₹${order.price}` : '—'}</td>
                                                <td className="py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${STATUS_COLORS[order.status] || 'text-slate-400 bg-slate-400/10'}`}
                                                    >
                                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-4 text-sm text-slate-400">
                                                    {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
                                                </td>
                                                <td className="py-4">
                                                    <button onClick={() => handleDeleteOrder(order.id, order.dress_type)}
                                                        className="text-slate-500 hover:text-red-400 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── APPOINTMENTS TAB ─── */}
                {activeTab === 'appointments' && (
                    <div className="card-dark opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                            </div>
                            <h2 className="font-display text-xl font-bold text-white">Appointments</h2>
                            <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{appointments.length} total</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">calendar_month</span>
                                <p className="text-slate-400 text-lg font-display">No appointments yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appt) => (
                                    <div key={appt.id} className="bg-surface rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="text-white font-bold text-lg">{appt.name}</p>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${APPT_STATUS_COLORS[appt.status] || 'text-slate-400 bg-slate-400/10'}`}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">checkroom</span> {appt.service_type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">mail</span> {appt.email}
                                                    </span>
                                                    {appt.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">call</span> {appt.phone}
                                                        </span>
                                                    )}
                                                    {appt.preferred_date && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">event</span>
                                                            {new Date(appt.preferred_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {appt.message && <p className="text-slate-500 text-sm mt-2 italic">"{appt.message}"</p>}
                                            </div>
                                            <select value={appt.status} onChange={(e) => handleApptStatusChange(appt.id, e.target.value)}
                                                className="bg-surface border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary">
                                                {APPT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── MESSAGES TAB ─── */}
                {activeTab === 'messages' && (
                    <div className="card-dark opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-lg">chat</span>
                            </div>
                            <h2 className="font-display text-xl font-bold text-white">Contact Messages</h2>
                            <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{messages.length} total</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">chat_bubble</span>
                                <p className="text-slate-400 text-lg font-display">No messages yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className="bg-surface rounded-xl p-5 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-white font-bold">{msg.name}</p>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(msg.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-xs text-slate-400 mb-3">
                                            <span>{msg.email}</span>
                                            {msg.phone && <span>{msg.phone}</span>}
                                        </div>
                                        <p className="text-slate-300 text-sm">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
