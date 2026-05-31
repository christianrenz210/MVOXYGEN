import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { type SharedData } from '@/types';

export default function FAQ() {
    const { url, props: { auth } } = usePage<SharedData>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [visibleFaqItems, setVisibleFaqItems] = useState<Set<number>>(new Set());
    const [footerVisible, setFooterVisible] = useState(false);
    const faqRefs = useRef<(HTMLElement | null)[]>([]);
    const footerRef = useRef<HTMLElement | null>(null);

    const currentPath = url || '';

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target.getAttribute('data-faq-index')) {
                        const index = parseInt(entry.target.getAttribute('data-faq-index') || '0');
                        if (entry.isIntersecting) {
                            setVisibleFaqItems((prev) => new Set(prev).add(index));
                        }
                    } else if (entry.target.getAttribute('data-footer')) {
                        if (entry.isIntersecting) {
                            setFooterVisible(true);
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        faqRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            faqRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);

    return (
        <>
            <Head title="FAQ - MV Oxygen Trading">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex flex-col items-center bg-[#FDFDFC] pt-20 pb-20 px-6 text-[#1b1b18] lg:px-8 dark:bg-[#0a0a0a]">
                <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 pt-4 pb-3 text-sm bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-[#0a0a0a]/95 dark:border-gray-800 transition-all duration-300 ease-in-out">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="images/mv-oxygen-logo.png"
                                alt="MV Oxygen Trading Logo"
                                className="w-10 h-10"
                            />
                            <span className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">MV Oxygen Trading</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
                            <a
                                href="/"
                                className={`inline-block px-5 py-1.5 text-sm leading-normal transition-colors ${
                                    currentPath === '/'
                                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400'
                                }`}
                            >
                                Home
                            </a>
                            <Link
                                href="/faq"
                                className={`inline-block px-5 py-1.5 text-sm leading-normal transition-colors ${
                                    currentPath === '/faq'
                                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400'
                                }`}
                            >
                                FAQ
                            </Link>
                            <Link
                                href="/contact"
                                className={`inline-block px-5 py-1.5 text-sm leading-normal transition-colors ${
                                    currentPath === '/contact'
                                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                        : 'text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400'
                                }`}
                            >
                                Contact
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-block px-5 py-1.5 text-sm leading-normal transition-colors ${
                                        currentPath === '/dashboard'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                                            : 'text-[#1b1b18] border border-[#19140035] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            ) : null}
                        </div>

                        {/* Auth Buttons */}
                        {auth.user ? null : (
                            <div className="hidden lg:flex items-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm bg-blue-600 px-5 py-2 text-sm leading-normal text-white hover:bg-blue-700 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-blue-600 bg-white px-5 py-2 text-sm leading-normal text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-md text-[#1b1b18] dark:text-[#EDEDEC] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95"
                        >
                            <svg className="w-6 h-6 transition-all duration-300 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" className="text-[#1b1b18] dark:text-[#EDEDEC]" />
                                ) : (
                                    <>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16" className={isMenuOpen ? "rotate-45 translate-y-2.5" : ""} />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" className={isMenuOpen ? "opacity-0" : ""} />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" className={isMenuOpen ? "-rotate-45 -translate-y-2.5" : ""} />
                                    </>
                                )}
                            </svg>
                        </button>
                    </nav>

                    {/* Mobile Menu */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col space-y-3 animate-fadeIn">
                                <a
                                    href="/"
                                    className="inline-block px-5 py-2 text-sm leading-normal text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400 transition-colors"
                                >
                                    Home
                                </a>
                                <Link
                                    href="/faq"
                                    className="inline-block px-5 py-2 text-sm leading-normal text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400 transition-colors"
                                >
                                    FAQ
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-block px-5 py-2 text-sm leading-normal text-[#1b1b18] hover:text-blue-600 dark:text-[#EDEDEC] dark:hover:text-blue-400 transition-colors"
                                >
                                    Contact
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-block rounded-sm bg-blue-600 px-5 py-2 text-sm leading-normal text-white hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-block rounded-sm border border-blue-600 bg-white px-5 py-2 text-sm leading-normal text-blue-600 hover:bg-blue-50 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                {/* Header */}
                <header className="max-w-4xl mx-auto text-center mb-12 animate-fadeInUp">
                    <h1 className="text-4xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-[#706f6c] dark:text-[#A1A09A] text-lg">
                        Everything you need to know about our oxygen tank rental services
                    </p>
                </header>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* FAQ Item 1 */}
                    <div
                        ref={(el) => (faqRefs.current[0] = el)}
                        data-faq-index="0"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${visibleFaqItems.has(0) ? 'animate-fadeInUp' : 'opacity-0'
                            }`}
                        style={{ animationDelay: visibleFaqItems.has(0) ? '0.1s' : '0s' }}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                            className="w-full text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                How do I rent an oxygen tank?
                            </h3>
                            <svg
                                className={`w-5 h-5 text-[#706f6c] dark:text-[#A1A09A] transition-transform duration-200 ${openFaq === 1 ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openFaq === 1 && (
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A] animate-fadeIn">
                                Simply register for an account, browse our available tanks, and select rental period that suits your needs. We offer flexible rental options from daily to monthly plans.
                            </p>
                        )}
                    </div>

                    {/* FAQ Item 2 */}
                    <div
                        ref={(el) => (faqRefs.current[1] = el)}
                        data-faq-index="1"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${visibleFaqItems.has(1) ? 'animate-fadeInUp' : 'opacity-0'
                            }`}
                        style={{ animationDelay: visibleFaqItems.has(1) ? '0.2s' : '0s' }}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                            className="w-full text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                What types of oxygen tanks do you offer?
                            </h3>
                            <svg
                                className={`w-5 h-5 text-[#706f6c] dark:text-[#A1A09A] transition-transform duration-200 ${openFaq === 2 ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openFaq === 2 && (
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A] animate-fadeIn">
                                We offer various sizes of medical-grade oxygen tanks including portable cylinders (5L, 10L) and larger stationary tanks (20L, 50L) suitable for home and clinical use.
                            </p>
                        )}
                    </div>

                    {/* FAQ Item 3 */}
                    <div
                        ref={(el) => (faqRefs.current[2] = el)}
                        data-faq-index="2"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${visibleFaqItems.has(2) ? 'animate-fadeInUp' : 'opacity-0'
                            }`}
                        style={{ animationDelay: visibleFaqItems.has(2) ? '0.3s' : '0s' }}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                            className="w-full text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                How do I request a refill?
                            </h3>
                            <svg
                                className={`w-5 h-5 text-[#706f6c] dark:text-[#A1A09A] transition-transform duration-200 ${openFaq === 3 ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openFaq === 3 && (
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A] animate-fadeIn">
                                Through our dashboard, you can easily request refills for your rented tanks. We monitor tank levels and provide timely delivery services to ensure you never run out of oxygen.
                            </p>
                        )}
                    </div>

                    {/* FAQ Item 4 */}
                    <div
                        ref={(el) => (faqRefs.current[3] = el)}
                        data-faq-index="3"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${visibleFaqItems.has(3) ? 'animate-fadeInUp' : 'opacity-0'
                            }`}
                        style={{ animationDelay: visibleFaqItems.has(3) ? '0.4s' : '0s' }}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                            className="w-full text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                Is delivery available?
                            </h3>
                            <svg
                                className={`w-5 h-5 text-[#706f6c] dark:text-[#A1A09A] transition-transform duration-200 ${openFaq === 4 ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openFaq === 4 && (
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A] animate-fadeIn">
                                Yes, we offer delivery services within Metro Manila and surrounding areas. Delivery fees may apply depending on your location. Same-day delivery is available for emergency requests.
                            </p>
                        )}
                    </div>

                    {/* FAQ Item 5 */}
                    <div
                        ref={(el) => (faqRefs.current[4] = el)}
                        data-faq-index="4"
                        className={`bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${visibleFaqItems.has(4) ? 'animate-fadeInUp' : 'opacity-0'
                            }`}
                        style={{ animationDelay: visibleFaqItems.has(4) ? '0.5s' : '0s' }}
                    >
                        <button
                            onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
                            className="w-full text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                What safety measures should I follow?
                            </h3>
                            <svg
                                className={`w-5 h-5 text-[#706f6c] dark:text-[#A1A09A] transition-transform duration-200 ${openFaq === 5 ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openFaq === 5 && (
                            <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A] animate-fadeIn">
                                Keep tanks upright, away from heat sources and open flames. Ensure proper ventilation in the usage area. Our team provides comprehensive safety guidelines with every rental.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <footer
                ref={footerRef}
                data-footer="true"
                className={`bg-gray-900 text-white py-12 w-full transition-all duration-700 ${footerVisible ? 'animate-fadeInUp' : 'opacity-0'
                    }`}
            >
                <div className="px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Company Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="images/mv-oxygen-logo.png"
                                        alt="MV Oxygen Trading Logo"
                                        className="w-8 h-8"
                                    />
                                    <span className="text-lg font-semibold">MV Oxygen Trading</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    Oxygen Tank Rental & Refill Management System
                                </p>
                                <div className="flex items-center gap-4 mt-6">
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                    <a href="mailto:michael121617@yahoo.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Email">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-gray-200">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>
                                        <a href="/" className="hover:text-white transition-colors">Home</a>
                                    </li>
                                    <li>
                                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                                    </li>
                                    {!auth.user ? (
                                        <>
                                            <li>
                                                <Link href={route('login')} className="hover:text-white transition-colors">Log in</Link>
                                            </li>
                                            <li>
                                                <Link href={route('register')} className="hover:text-white transition-colors">Register</Link>
                                            </li>
                                        </>
                                    ) : (
                                        <li>
                                            <Link href={route('dashboard')} className="hover:text-white transition-colors">Dashboard</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-gray-200">Contact Info</h4>
                                <ul className="space-y-3 text-sm text-gray-400">
                                    <li className="flex items-start gap-3">
                                        <svg className="w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>0075 Rizal St. Conception General Tinio, Nueva Ecija</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>michael121617@yahoo.com</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>0977-330-5640</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                            © 2026 MV Oxygen Trading. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
