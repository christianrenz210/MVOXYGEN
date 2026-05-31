import React, { useState, useEffect, useRef, FormEventHandler } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Mail, Phone, MapPin, Send, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import AlertModal from '@/components/alert-modal';
import { type SharedData } from '@/types';

export default function Contact() {
    const { url, props: { auth } } = usePage<SharedData>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [footerVisible, setFooterVisible] = useState(false);
    const footerRef = useRef<HTMLElement | null>(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const currentPath = url || '';

    const handleContactSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Replace 'YOUR_FORM_ID' with your actual Formspree endpoint ID (e.g., 'mvoqyzxd')
            const response = await fetch('https://formspree.io/f/mbdbrakb', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactForm)
            });

            if (response.ok) {
                showAlert('Success', 'Thank you for your message! We will get back to you soon.', 'success');
                setContactForm({ name: '', email: '', message: '' });
            } else {
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    showAlert('Error', data["errors"].map((error: any) => error["message"]).join(", "), 'error');
                } else {
                    showAlert('Error', 'Oops! There was a problem submitting your form', 'error');
                }
            }
        } catch (error) {
            showAlert('Error', 'Oops! There was a problem submitting your form', 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                                    name="name"
                                    placeholder="Enter your name"
                                    value={contactForm.name}
                                    onChange={(e) => handleContactChange('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={contactForm.email}
                                    onChange={(e) => handleContactChange('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] mb-2">Your Message</label>
                                <textarea
                                    name="message"
                                    placeholder="Enter your message"
                                    value={contactForm.message}
                                    onChange={(e) => handleContactChange('message', e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[#1b1b18] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
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
                                    <span>Located in 0075  Rizal St. Conception General Tinio, Nueva Ecija</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>michael121617@yahoo.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>0977-330-5640</span>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Find us on the map</h3>
                            </div>
                            <div className="relative h-[300px]">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!4v1778994009914!6m8!1m7!1ssT8N6zkn9_-mQn5ikdOIgg!2m2!1d15.34547248835288!2d121.05133946643!3f189.67475997001995!4f-5.420223723212999!5f1.8704527111216254" 
                                    className="w-full h-full border-0"
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
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
                                        src="/images/mv-oxygen-logo.png"
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

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </>
    );
}
