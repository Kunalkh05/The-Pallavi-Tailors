// Book Appointment Page - The Pallavi Tailors
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

const SERVICE_OPTIONS = [
    { value: 'Bridal Blouse Stitching', icon: 'styler', desc: 'Custom bridal blouse with embroidery' },
    { value: 'Designer Kurti', icon: 'checkroom', desc: 'Tailored designer kurti in your style' },
    { value: 'Saree Customization', icon: 'auto_awesome', desc: 'Perfect drape and custom blouse' },
    { value: 'Alterations & Fittings', icon: 'content_cut', desc: 'Expert alterations for perfect fit' },
    { value: 'Lehenga Stitching', icon: 'diamond', desc: 'Grand lehenga with detailed work' },
    { value: 'General Consultation', icon: 'chat', desc: 'Discuss your requirements' },
];

export function BookAppointment() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        service_type: location.state?.service_type || '',
        preferred_date: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.service_type) {
            toast('Please select a service', 'error');
            return;
        }
        setIsLoading(true);

        const { error } = await supabase.from('appointments').insert({
            user_id: profile?.id,
            name: profile?.name || 'Guest',
            email: profile?.email || '',
            phone: profile?.phone || null,
            service_type: form.service_type,
            preferred_date: form.preferred_date || null,
            message: form.message || null,
            status: 'Pending',
        });

        if (error) {
            toast('Failed to book appointment: ' + error.message, 'error');
        } else {
            toast('🎉 Appointment booked successfully! We\'ll confirm soon.', 'success');
            setTimeout(() => navigate('/dashboard'), 2000);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-4 py-20">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blush/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            </div>

            {/* Floating petals */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="petal" style={{
                        left: `${15 + i * 22}%`, top: '-20px',
                        width: `${8 + i * 3}px`, height: `${8 + i * 3}px`,
                        animationDelay: `${i * 3}s`, animationDuration: `${12 + i * 2}s`, opacity: 0.3,
                    }} />
                ))}
            </div>

            <div className="w-full max-w-4xl relative z-10">
                <div className="glass-card p-10 opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                            </div>
                            <span className="font-display text-lg font-bold text-white">The Pallavi Tailors</span>
                        </div>
                        <h1 className="font-display text-3xl md:text-4xl font-medium text-gradient-rosegold mb-2">Book Your Appointment</h1>
                        <p className="text-muted-rose/50 text-sm">Select your service and preferred date. We'll confirm within 24 hours.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Service Selection */}
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-4 font-semibold">Select Service</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {SERVICE_OPTIONS.map((service) => (
                                    <button
                                        key={service.value}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, service_type: service.value }))}
                                        className={`text-left p-4 rounded-xl border transition-all duration-300 group ${form.service_type === service.value
                                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                                            : 'border-white/10 bg-surface hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`material-symbols-outlined text-lg ${form.service_type === service.value ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`}>
                                                {service.icon}
                                            </span>
                                            <span className={`text-sm font-bold ${form.service_type === service.value ? 'text-primary' : 'text-white'}`}>
                                                {service.value}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{service.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Message */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Preferred Date</label>
                                <input
                                    type="date"
                                    value={form.preferred_date}
                                    onChange={(e) => setForm(p => ({ ...p, preferred_date: e.target.value }))}
                                    className="input-glass"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Special Requests</label>
                                <input
                                    type="text"
                                    value={form.message}
                                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                                    placeholder="Any special requirements..."
                                    className="input-glass"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                            <div className="text-xs text-muted-rose/60 leading-relaxed">
                                <p>Booking as <span className="text-white font-semibold">{profile?.name}</span> ({profile?.email})</p>
                                <p className="mt-1">You'll receive a confirmation notification once our team reviews your appointment.</p>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading || !form.service_type}
                                className="btn-primary flex-1 !rounded-xl !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Booking...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        Confirm Booking <span className="material-symbols-outlined text-lg">check</span>
                                    </span>
                                )}
                            </button>
                            <Link to="/" className="btn-outline !py-3.5 !px-6">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
