import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Intersection Observer hook for scroll-triggered animations.
 * Adds 'visible' class to elements when they enter the viewport.
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    observer.unobserve(el); // Only animate once
                }
            },
            { threshold, rootMargin: '0px 0px -60px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}

/**
 * Batch scroll reveal for multiple children with staggered delays.
 */
export function useStaggerReveal(count: number, staggerMs = 100) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const children = container.querySelectorAll('.stagger-child');

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    children.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * staggerMs);
                    });
                    observer.unobserve(container);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [count, staggerMs]);

    return containerRef;
}

/**
 * 3D Tilt effect on mouse move — GPU-accelerated.
 */
export function useTilt(intensity = 8) {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(10px)`;
    }, [intensity]);

    const handleMouseLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.willChange = 'transform';

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return ref;
}

/**
 * Parallax scroll — moves element based on scroll position.
 * speed: 0.1 (subtle) to 0.5 (dramatic)
 */
export function useParallax(speed = 0.2) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const scrolled = window.innerHeight - rect.top;
                    const offset = scrolled * speed;
                    el.style.transform = `translate3d(0, ${offset}px, 0)`;
                    ticking = false;
                });
                ticking = true;
            }
        };

        el.style.willChange = 'transform';
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return ref;
}

/**
 * Mouse-follow glow effect.
 */
export function useMouseGlow() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--glow-x', `${x}px`);
            el.style.setProperty('--glow-y', `${y}px`);
        };

        el.addEventListener('mousemove', handleMouseMove);
        return () => el.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return ref;
}

/**
 * Simple counter animation for stats.
 */
export function useCountUp(target: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const start = Date.now();
                    const animate = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}
