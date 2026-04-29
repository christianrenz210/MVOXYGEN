import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, FormEventHandler } from 'react';
import { type SharedData } from '@/types';

export default function Contact() {
    const { auth, url } = usePage<SharedData>().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [footerVisible, setFooterVisible] = useState(false);
    const footerRef = useRef<HTMLElement | null>(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });

    const currentPath = url || '';

    const handleContactSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // Handle contact form submission
        console.log('Contact form submitted:', contactForm);
        // You can add actual form submission logic here
        alert('Thank you for your message! We will get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
    };

    const handleContactChange = (field: string, value: string) => {
        setContactForm(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target.getAttribute('data-footer')) {
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

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);

    return (
        <>
            <Head title="Contact - MV Oxygen Trading">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex flex-col items-center bg-[#FDFDFC] pt-20 px-6 text-[#1b1b18] lg:px-8 dark:bg-[#0a0a0a]">
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
                        Contact Us
                    </h1>
                    <p className="text-[#706f6c] dark:text-[#A1A09A] text-lg">
                        Get in touch with us for any questions or concerns
                    </p>
                </header>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-fadeInUp">
                        <h3 className="text-xl font-semibold mb-6 text-[#1b1b18] dark:text-[#EDEDEC]">Send us a Message</h3>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">Your Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={contactForm.name}
                                    onChange={(e) => handleContactChange('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">Your Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={contactForm.email}
                                    onChange={(e) => handleContactChange('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">Your Message</label>
                                <textarea
                                    placeholder="Enter your message"
                                    value={contactForm.message}
                                    onChange={(e) => handleContactChange('message', e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="space-y-6">
                        {/* Company Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/images/mv-oxygen-logo.png"
                                    alt="MV Oxygen Trading Logo"
                                    className="w-10 h-10"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">MV Oxygen Trading</h3>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Oxygen Tank Rental & Refill Services</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Located in </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>contact@mvoxygen.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+63 912 345 6789</span>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Find us on the map</h3>
                            </div>
                            <div className="relative h-[300px]">
                                {/* <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3847.5302633465744!2d121.04813007011415!3d15.347742237171778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33972300634ae665%3A0x1fe9ddec2dc8a12a!2sLily%E2%80%99s%20Merchandise!5e0!3m2!1sen!2sph!4v1775918142505!5m2!1sen!2sph" 
                                    width="600" 
                                    height="450" 
                                    style={{ border: '0', width: '100%', height: '100%' }} 
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer
                ref={footerRef}
                data-footer="true"
                className={`bg-gray-900 text-white py-8 w-full transition-all duration-700 ${footerVisible ? 'animate-fadeInUp' : 'opacity-0'
                    }`}
            >
                <div className="px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="images/mv-oxygen-logo.png"
                                alt="MV Oxygen Trading Logo"
                                className="w-8 h-8"
                            />
                            <span className="text-lg font-semibold">MV Oxygen Trading</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Oxygen Tank Rental & Refill Management System
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-700 text-gray-500 text-sm">
                            © 2026 MV Oxygen Trading. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
