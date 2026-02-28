import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollReveal, useStaggerReveal, useTilt, useCountUp } from '../hooks/useScrollAnimation';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

// Floating petals component
function FloatingPetals() {
    const petals = Array.from({ length: 8 }, (_, i) => ({
        left: `${10 + i * 12}%`,
        delay: `${i * 1.8}s`,
        duration: `${10 + i * 2}s`,
        size: 8 + (i % 3) * 6,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {petals.map((p, i) => (
                <div
                    key={i}
                    className="petal"
                    style={{
                        left: p.left,
                        top: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        opacity: 0.4,
                    }}
                />
            ))}
        </div>
    );
}

// Section header component
function SectionHeader({ label, title, light = false }: { label: string; title: string; light?: boolean }) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} className="scroll-reveal text-center mb-16">
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4">{label}</p>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-display font-medium mb-5 ${light ? 'text-slate-900' : 'text-gradient-rosegold'}`}>{title}</h2>
            <div className="gold-divider"></div>
        </div>
    );
}

// Contact form section
function ContactSection() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const { toast } = useToast();
    const ref = useScrollReveal();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSending(true);
        const { error } = await supabase.from('contact_messages').insert({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            message: form.message,
        });
        if (error) {
            toast('Failed to send message. Please try again.', 'error');
        } else {
            toast('Message sent! We\'ll get back to you soon.', 'success');
            setSent(true);
            setForm({ name: '', email: '', phone: '', message: '' });
        }
        setSending(false);
    };

    return (
        <section id="contact" className="section-padding bg-card relative overflow-hidden cv-auto">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blush/5 rounded-full blur-[120px]"></div>

            <div className="mx-auto max-w-7xl relative z-10">
                <SectionHeader label="Get In Touch" title="Contact Us" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div ref={ref} className="scroll-reveal space-y-8">
                        <p className="text-muted-rose/70 text-lg leading-relaxed">
                            Have a question about our services, or want to schedule a consultation? We'd love to hear from you.
                        </p>
                        <div className="space-y-5">
                            {[
                                { icon: 'location_on', label: 'Visit Us', value: 'Mumbai, Maharashtra, India' },
                                { icon: 'call', label: 'Call Us', value: '+91 98765 43210' },
                                { icon: 'mail', label: 'Email Us', value: 'info@pallavitailors.com' },
                                { icon: 'schedule', label: 'Working Hours', value: 'Mon - Sat: 10 AM - 8 PM' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">{item.label}</p>
                                        <p className="text-white font-medium">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass-card p-8">
                        {sent ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-5xl text-green-400 mb-4">check_circle</span>
                                <h3 className="font-display text-2xl font-medium text-white mb-2">Message Sent!</h3>
                                <p className="text-muted-rose/60 mb-6">We'll get back to you within 24 hours.</p>
                                <button onClick={() => setSent(false)} className="btn-outline !text-sm">Send Another Message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Name</label>
                                        <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Your Name" className="input-glass" disabled={sending} />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Phone</label>
                                        <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+91 9876543210" className="input-glass" disabled={sending} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Email</label>
                                    <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        placeholder="your@email.com" className="input-glass" disabled={sending} />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.2em] text-muted-rose/60 mb-2.5 font-semibold">Message</label>
                                    <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        rows={4} placeholder="Tell us what you're looking for..."
                                        className="input-glass resize-none" disabled={sending} />
                                </div>
                                <button type="submit" disabled={sending} className="w-full btn-primary !rounded-xl !py-3.5 disabled:opacity-50">
                                    {sending ? (
                                        <span className="inline-flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            Send Message <span className="material-symbols-outlined text-lg">send</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Home() {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState<any>(null);
    const featuresRef = useStaggerReveal(3, 150);
    const servicesRef = useStaggerReveal(4, 120);
    const galleryRef = useStaggerReveal(4, 100);
    const stepsRef = useStaggerReveal(3, 200);
    const aboutImageRef = useScrollReveal(0.2);
    const aboutTextRef = useScrollReveal(0.2);
    const timelineRef = useScrollReveal(0.1);
    const statsCard = useTilt(6);
    const yearsCount = useCountUp(25, 2000);
    const clientsCount = useCountUp(5000, 2500);

    return (
        <div className="flex flex-col bg-surface text-slate-100 overflow-x-hidden">

            {/* ═══════════════════ HERO — CINEMATIC PARALLAX ═══════════════════ */}
            <section className="relative h-screen min-h-[700px] w-full overflow-hidden perspective-container">
                {/* Layer 1: Background */}
                <div className="absolute inset-0 z-0 parallax-layer">
                    <div
                        className="h-full w-full bg-cover bg-center bg-no-repeat transform scale-125 animate-pan-image"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBZROWhlLDRSvQd0-DACZRmMDMXZ_hIw_ByYg_PtLUWBPbk5WwVtG6TQZ5SibXUKTKCIe-vCPK8nDDbP5NeFIf-Civ2rKt3jOnXJ1fyLcn9fIhcE0R-JVX_hap6uJQus3w785FmEceONKPsvyvl46aztDC6CDqgEAE1L57sWHQXU-r5WOoA5LnHXmi6MKxsgQYCOhKEBih96BpW1KIHKWtCkhUDEEZU3BuUTFlg1BKW4AWtfg1VIwphCepwqpREax4PSFge8b5u9Y')" }}
                    />
                    {/* Cinematic color overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-[#3a0020]/40 to-surface/95"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-surface/40 via-transparent to-surface/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                </div>

                {/* Layer 2: Floating Petals */}
                <FloatingPetals />

                {/* Layer 3: Hero Content */}
                <div className="relative z-20 flex h-full w-full items-center justify-center px-4">
                    <div className="flex max-w-5xl flex-col items-center text-center preserve-3d">
                        {/* Badge */}
                        <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary backdrop-blur-md">
                                ✦ Bespoke Couture & Ethnic Wear ✦
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="mb-6 font-display text-6xl font-medium tracking-tight md:text-7xl lg:text-9xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                            <span className="bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] text-transparent bg-clip-text animate-text-shimmer drop-shadow-sm">The Pallavi</span>
                            <br />
                            <span className="text-white/90">Tailors</span>
                        </h1>

                        {/* Decorative Line */}
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}></div>

                        {/* Tagline */}
                        <p className="mb-12 max-w-2xl font-display text-xl italic text-blush/80 md:text-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                            Crafting Confidence, One Stitch at a Time.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col gap-4 sm:flex-row opacity-0 animate-fade-in-up" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-primary rounded-full blur-md opacity-0 group-hover:opacity-40 animate-pulse-ring transition-opacity duration-500"></div>
                                <Link to="/register" className="btn-primary relative text-lg whitespace-nowrap">
                                    <span>Book Your Stitching</span>
                                    <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                                </Link>
                            </div>
                            <a href="#gallery" className="btn-outline">
                                <span>Explore Designs</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-primary/50 font-semibold">Scroll</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-primary/50 to-transparent animate-bounce"></div>
                </div>
            </section>

            {/* ═══════════════════ FEATURES — 3D GLASS CARDS ═══════════════════ */}
            <section className="section-padding bg-surface relative cv-auto">
                <div className="mx-auto max-w-7xl">
                    <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: 'straighten', title: 'Precise Measurements', text: 'Our master tailors ensure the perfect fit for your unique silhouette.' },
                            { icon: 'diamond', title: 'Premium Materials', text: 'Sourced from the finest mills to provide luxury you can feel.' },
                            { icon: 'local_shipping', title: 'Timely Delivery', text: 'Respecting your time with punctual service for every occasion.' },
                        ].map((f, i) => (
                            <div key={i} className="stagger-child scroll-reveal glass-card p-8 group animate-gentle-tilt" style={{ transitionDelay: `${i * 150}ms`, animationDelay: `${i * 2}s` }}>
                                <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10">
                                    <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                                </div>
                                <h3 className="mb-3 font-display text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                                <p className="text-sm text-muted-rose/70 leading-relaxed">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ SERVICES — CINEMATIC CARDS ═══════════════════ */}
            <section id="services" className="section-padding bg-surface relative cv-auto">
                <div className="mx-auto max-w-7xl">
                    <SectionHeader label="What We Offer" title="Our Services" />

                    <div ref={servicesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Bridal Blouse Stitching', icon: 'styler', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-T8-Sn9YCMwGEJABP52d2pNp8W0Rfe_x3clCqSXQqxjqn4pjF2WQYknBcf2FoAYsPU0OdNcvChb9K9lhxGKTjSJpO7bvqGAe7mDq3jwsCFfQMX7H2KQr-HxiAAKQ6_0qgxrNAkm1cPQNkFpRlcPZbJvyLsHuXPnF7M95U_gIDpCr0SvX-bKU1h-_tTiSqhfxPwMJgQjLMoFhO9iXvfGGCWNjfGRaUlpT6FNyGT0K36apwZkPcfTDq6W5rVmhb_WF6Nx', price: 'Starts at ₹4,999', desc: 'Custom bridal blouse with heavy hand-embroidery (maggam work), perfect fitting, and premium lining. Designed specifically for your big day.' },
                            { title: 'Designer Kurti', icon: 'checkroom', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVjH_cJ14fWuW0N27bpWHXzWn3F5H11h2GvZRBVLuatbMpKz4J-9QBVfZlzijKFNYi3RMBw_8SkKqzN5J2JBh3Xr3Jh3qS0EXBA_1xUQjqYFfCqJEVlhZA_Y_QGVzG_cF1q3RHaKEFOPhAspHe_kp7-pu_0ZK4R', price: 'Starts at ₹1,499', desc: 'Tailored designer kurti in your preferred style (A-line, Anarkali, straight cut) with customized neck designs and expert finishing.' },
                            { title: 'Saree Customization', icon: 'auto_awesome', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBZROWhlLDRSvQd0-DACZRmMDMXZ_hIw_ByYg_PtLUWBPbk5WwVtG6TQZ5SibXUKTKCIe-vCPK8nDDbP5NeFIf-Civ2rKt3jOnXJ1fyLcn9fIhcE0R-JVX_hap6uJQus3w785FmEceONKPsvyvl46aztDC6CDqgEAE1L57sWHQXU-r5WOoA5LnHXmi6MKxsgQYCOhKEBih96BpW1KIHKWtCkhUDEEZU3BuUTFlg1BKW4AWtfg1VIwphCepwqpREax4PSFge8b5u9Y', price: 'Starts at ₹2,499', desc: 'Complete saree styling including perfect drape fall and picot stitching, custom hand-made tassels, and a beautifully stitched matching blouse.' },
                            { title: 'Alterations & Fittings', icon: 'content_cut', img: 'https://images.unsplash.com/photo-1574360773950-8b1b1aa80cdd?auto=format&fit=crop&q=80&w=800', price: 'Starts at ₹199', desc: 'Expert alterations for that perfect showroom fit on any ethnic wear, western wear, or precious heirloom garments.' },
                        ].map((service, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedService(service)}
                                className="stagger-child scroll-reveal group relative h-[420px] overflow-hidden rounded-2xl cursor-pointer"
                                style={{ transitionDelay: `${idx * 120}ms` }}
                            >
                                <img src={service.img} alt={service.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-[1s] ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="absolute inset-2 border border-transparent group-hover:border-primary/20 rounded-xl transition-all duration-700"></div>
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary backdrop-blur-sm border border-primary/10">
                                        <span className="material-symbols-outlined text-xl">{service.icon}</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold drop-shadow-md mb-1">{service.title}</h3>
                                    <span className="inline-flex items-center gap-1 mt-3 text-primary uppercase tracking-[0.2em] text-[10px] font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        Discover More <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Service Detail Modal */}
                    {selectedService && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }} onClick={() => setSelectedService(null)}>
                            {/* Backdrop */}
                            <div className="absolute inset-0 bg-surface/80 backdrop-blur-md"></div>

                            {/* Modal Content */}
                            <div
                                className="relative w-full max-w-lg bg-surface-light rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 opacity-0 animate-fade-in-up md:animate-scale-in"
                                style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Header Image */}
                                <div className="h-48 sm:h-64 relative w-full">
                                    <img src={selectedService.img} alt={selectedService.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-light via-surface-light/20 to-transparent"></div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setSelectedService(null)}
                                        className="absolute top-4 right-4 size-10 flex items-center justify-center rounded-full bg-surface/40 text-white hover:bg-primary transition-all duration-300 backdrop-blur-md border border-white/10 shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 sm:p-8 relative -mt-8 bg-surface-light rounded-t-[2rem]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                                            <span className="material-symbols-outlined">{selectedService.icon}</span>
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">{selectedService.title}</h3>
                                    </div>

                                    <div className="inline-flex items-center gap-2 mb-6 bg-blush/20 text-primary-dark px-3 py-1.5 rounded-lg border border-primary/20">
                                        <span className="material-symbols-outlined text-sm">sell</span>
                                        <p className="font-bold text-sm tracking-wide">{selectedService.price}</p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-slate-600 text-base leading-relaxed">
                                            {selectedService.desc}
                                        </p>
                                        <ul className="text-sm text-slate-500 space-y-2">
                                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Detailed consultation & measurement</li>
                                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Premium quality threads & lining</li>
                                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Free minor alterations within 7 days</li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => {
                                            document.body.style.overflow = ''; // Reset scroll just in case
                                            navigate('/book', { state: { service_type: selectedService.title } })
                                        }}
                                        className="w-full btn-primary !bg-surface !text-primary hover:!bg-primary hover:!text-white !rounded-xl !py-4 flex justify-between items-center group transition-all duration-300 shadow-xl shadow-primary/20"
                                    >
                                        <span className="font-semibold text-lg drop-shadow-sm">Book This Service</span>
                                        <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════ MEASUREMENT EXPERIENCE — LAYERED DEPTH ═══════════════════ */}
            <section className="section-padding bg-surface-light text-slate-900 relative overflow-hidden cv-auto">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blush/10 rounded-full blur-[100px]"></div>

                <div className="mx-auto max-w-7xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div ref={aboutTextRef} className="scroll-reveal w-full lg:w-1/2 space-y-8">
                            <p className="text-primary-dark uppercase tracking-[0.3em] text-xs font-semibold">The Experience</p>
                            <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-900">Precision in Every Detail</h2>
                            <p className="text-slate-600 text-lg leading-relaxed">Experience our premium, guided measurement process. Designed to be effortless and extremely precise, ensuring your garment is tailored to perfection.</p>

                            <div ref={stepsRef} className="space-y-4">
                                {[
                                    { step: '01', title: 'Guided Visual Form', text: 'Clear illustrations showing exactly where to measure.', icon: 'straighten' },
                                    { step: '02', title: 'Secure Digital Profile', text: 'Save your measurements securely for all future orders.', icon: 'lock' },
                                    { step: '03', title: 'Expert Tailor Review', text: 'Our master tailors review your profile before processing.', icon: 'verified' },
                                ].map((item, idx) => (
                                    <div key={idx} className="stagger-child scroll-reveal flex gap-5 items-start group p-5 rounded-2xl hover:bg-primary/5 transition-all duration-300" style={{ transitionDelay: `${idx * 200}ms` }}>
                                        <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-dark transition-colors">{item.title}</h4>
                                            <p className="text-slate-500 text-sm mt-1">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/register" className="btn-primary !bg-surface !text-primary !shadow-surface/20">
                                Create Your Profile
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Interactive UI Mockup — Floating in 3D space */}
                        <div className="w-full lg:w-1/2 relative perspective-container">
                            <div className="animate-float-slow">
                                <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-2xl shadow-primary/5 relative z-10">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                        <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                                            <span className="material-symbols-outlined text-lg">straighten</span>
                                        </div>
                                        <h3 className="text-lg font-display font-bold text-slate-900">Bust Measurement</h3>
                                        <span className="ml-auto text-xs bg-primary/10 text-primary-dark font-bold px-3 py-1.5 rounded-full">Step 2 of 6</span>
                                    </div>
                                    <div className="flex justify-center mb-8">
                                        <div className="w-48 h-56 rounded-2xl bg-gradient-to-b from-blush/20 to-slate-50 border border-slate-200 relative flex items-center justify-center">
                                            <svg viewBox="0 0 100 200" className="w-24 h-40 text-muted-rose/30" fill="currentColor">
                                                <path d="M30 40 Q50 20 70 40 Q80 80 70 120 Q50 160 30 120 Q20 80 30 40 Z" />
                                            </svg>
                                            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-primary flex items-center justify-center">
                                                <div className="bg-primary text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/20">BUST</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Measurement (Inches)</label>
                                            <input type="text" value="34.5" readOnly className="w-full border border-slate-200 rounded-xl py-3 px-4 text-2xl font-display bg-slate-50 focus:outline-none focus:border-primary" />
                                        </div>
                                        <button className="w-full btn-primary !rounded-xl !py-3.5 !text-sm">Save & Continue</button>
                                    </div>
                                </div>
                            </div>
                            {/* Depth shadow */}
                            <div className="absolute -bottom-4 left-8 right-8 h-16 bg-primary/5 rounded-[2rem] blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ GALLERY — DEPTH LAYERS ═══════════════════ */}
            <section id="gallery" className="section-padding bg-surface cv-auto">
                <div className="mx-auto max-w-7xl">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <SectionHeader label="Portfolio" title="Masterpiece Gallery" />
                        </div>
                    </div>

                    <div ref={galleryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { name: 'Bridal Opulence', cat: 'Saree', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-T8-Sn9YCMwGEJABP52d2pNp8W0Rfe_x3clCqSXQqxjqn4pjF2WQYknBcf2FoAYsPU0OdNcvChb9K9lhxGKTjSJpO7bvqGAe7mDq3jwsCFfQMX7H2KQr-HxiAAKQ6_0qgxrNAkm1cPQNkFpRlcPZbJvyLsHuXPnF7M95U_gIDpCr0SvX-bKU1h-_tTiSqhfxPwMJgQjLMoFhO9iXvfGGCWNjfGRaUlpT6FNyGT0K36apwZkPcfTDq6W5rVmhb_WF6Nx' },
                            { name: 'Midnight Silk', cat: 'Lehenga', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVjH_cJ14fWuW0N27bpWHXzWn3F5H11h2GvZRBVLuatbMpKz4J-9QBVfZlzijKFNYi3RMBw_8SkKqzN5J2JBh3Xr3Jh3qS0EXBA_1xUQjqYFfCqJEVlhZA_Y_QGVzG_cF1q3RHaKEFOPhAspHe_kp7-pu_0ZK4R' },
                            { name: 'Royal Heritage', cat: 'Kurti', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBZROWhlLDRSvQd0-DACZRmMDMXZ_hIw_ByYg_PtLUWBPbk5WwVtG6TQZ5SibXUKTKCIe-vCPK8nDDbP5NeFIf-Civ2rKt3jOnXJ1fyLcn9fIhcE0R-JVX_hap6uJQus3w785FmEceONKPsvyvl46aztDC6CDqgEAE1L57sWHQXU-r5WOoA5LnHXmi6MKxsgQYCOhKEBih96BpW1KIHKWtCkhUDEEZU3BuUTFlg1BKW4AWtfg1VIwphCepwqpREax4PSFge8b5u9Y' },
                            { name: 'Golden Hour', cat: 'Blouse', img: 'https://images.unsplash.com/photo-1574360773950-8b1b1aa80cdd?auto=format&fit=crop&q=80&w=800' }
                        ].map((item, idx) => (
                            <div key={idx} className="stagger-child scroll-reveal group relative h-96 overflow-hidden rounded-2xl cursor-pointer" style={{ transitionDelay: `${idx * 100}ms` }}>
                                <img src={item.img} alt={item.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out" />
                                <div className="absolute inset-0 bg-surface/10 group-hover:bg-surface/50 transition-colors duration-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent"></div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary/90 text-surface text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-sm">{item.cat}</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h4 className="text-xl font-display font-bold text-white mb-2">{item.name}</h4>
                                    <div className="w-8 h-[2px] bg-primary mb-2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
                                    <p className="text-primary/70 text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">Bespoke Design</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ ORDER TRACKING — GLOWING TIMELINE ═══════════════════ */}
            <section className="section-padding bg-card relative overflow-hidden cv-auto">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]"></div>

                <div className="mx-auto max-w-5xl relative z-10">
                    <SectionHeader label="Track Your Order" title="The Creation Journey" />

                    <div ref={timelineRef} className="scroll-reveal relative mt-8">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-0 right-0 h-[2px] bg-white/5 hidden md:block"></div>
                        <div className="absolute top-6 left-0 w-[40%] h-[2px] bg-gradient-to-r from-primary to-primary/30 hidden md:block"></div>

                        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                            {['Order Placed', 'Pattern Cutting', 'Stitching', 'Trial Fitting', 'Ready', 'Delivered'].map((stage, idx) => {
                                const isDone = idx < 2;
                                const isActive = idx === 2;
                                return (
                                    <div key={idx} className="flex flex-col items-center group">
                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 transition-all duration-700
                                            ${isActive ? 'bg-primary border-primary shadow-[0_0_25px_rgba(232,168,124,0.4)] animate-glow-pulse' :
                                                isDone ? 'bg-primary border-primary' : 'bg-surface border-white/10 group-hover:border-white/20'}
                                        `}>
                                            {isDone ? (
                                                <span className="material-symbols-outlined text-surface text-lg">check</span>
                                            ) : isActive ? (
                                                <span className="material-symbols-outlined text-surface text-lg">content_cut</span>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                            )}
                                        </div>
                                        <p className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold max-w-[80px] text-center transition-colors ${isActive ? 'text-primary' : isDone ? 'text-white' : 'text-white/30'}`}>{stage}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-center mt-14">
                        <Link to="/login" className="btn-outline inline-flex">
                            <span className="material-symbols-outlined text-lg">track_changes</span>
                            Track Your Order
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ ABOUT — PARALLAX DEPTH ═══════════════════ */}
            <section id="about" className="section-padding bg-surface cv-auto">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div ref={aboutTextRef} className="scroll-reveal-left w-full lg:w-1/2">
                            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4">Our Story</p>
                            <h2 className="text-4xl md:text-5xl font-display font-medium text-gradient-rosegold mb-6">A Legacy of Elegance</h2>
                            <div className="w-16 h-[2px] bg-gradient-to-r from-primary to-transparent mb-8"></div>
                            <p className="text-muted-rose/70 mb-6 leading-relaxed text-base">
                                Founded on the principles of immaculate craftsmanship and cultural heritage, The Pallavi Tailors elevates traditional tailoring to high couture. Every stitch is a deliberate choice, every measurement a commitment to perfection.
                            </p>
                            <p className="text-muted-rose/70 mb-8 leading-relaxed text-base">
                                We believe that true luxury is deeply personal. Your wardrobe should be an extension of your identity, meticulously crafted to fit not just your form, but your essence.
                            </p>

                            {/* Testimonial */}
                            <div className="glass-card p-6">
                                <p className="font-display text-xl italic text-white/90 mb-4">"The fit is absolute perfection. It feels like a second skin designed specifically for me."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-lg">person</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-widest text-white">Ananya Sharma</p>
                                        <div className="flex text-primary text-xs mt-1">★★★★★</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div ref={aboutImageRef} className="scroll-reveal-right w-full lg:w-1/2 relative">
                            <img src="https://images.unsplash.com/photo-1574360773950-8b1b1aa80cdd?auto=format&fit=crop&q=80&w=800" alt="Master Tailor at work" loading="lazy" className="w-full h-[520px] object-cover rounded-3xl relative z-10" />
                            {/* Floating stats card */}
                            <div ref={statsCard} className="absolute bottom-8 left-8 glass-strong text-white p-6 rounded-2xl z-20 shadow-2xl">
                                <div className="flex gap-8">
                                    <div>
                                        <p ref={yearsCount.ref} className="font-display text-4xl font-bold text-primary">{yearsCount.count}+</p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-rose/70 mt-1">Years</p>
                                    </div>
                                    <div className="w-[1px] bg-white/10"></div>
                                    <div>
                                        <p ref={clientsCount.ref} className="font-display text-4xl font-bold text-primary">{clientsCount.count}+</p>
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-rose/70 mt-1">Happy Clients</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative glow */}
                            <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ CONTACT — GLASS FORM ═══════════════════ */}
            <ContactSection />

            {/* ═══════════════════ FOOTER — GLASS ═══════════════════ */}
            <footer className="glass border-t border-white/5">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                                    <span className="material-symbols-outlined !text-xl">checkroom</span>
                                </div>
                                <h2 className="font-display text-xl font-bold text-white">The Pallavi Tailors</h2>
                            </div>
                            <p className="text-muted-rose/60 text-sm leading-relaxed max-w-md">Crafting confidence since 2001. Premium bespoke tailoring for sarees, blouses, lehengas, and ethnic wear.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-4">Quick Links</h4>
                            <ul className="space-y-3 text-sm text-muted-rose/60">
                                <li><a href="#services" className="hover:text-primary transition-colors duration-300">Services</a></li>
                                <li><a href="#gallery" className="hover:text-primary transition-colors duration-300">Gallery</a></li>
                                <li><Link to="/dashboard" className="hover:text-primary transition-colors duration-300">Track Order</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-4">Contact</h4>
                            <ul className="space-y-3 text-sm text-muted-rose/60">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">call</span> +91 98765 43210</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">mail</span> info@pallavitailors.com</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">location_on</span> Mumbai, India</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-rose/40">
                        © 2026 The Pallavi Tailors. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
