import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-fill name & email when the user is logged in
  useEffect(() => {
    if (user) {
      setFormData((p) => ({
        ...p,
        name: p.name || user.name || '',
        email: p.email || user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/contact' } });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: '',
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const channels = [
    {
      label: 'Email',
      value: 'support@rantech.com',
      sub: 'sales@rantech.com',
      href: 'mailto:support@rantech.com',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Phone',
      value: '070 343 9842',
      sub: 'Mon-Fri · 9AM - 8PM',
      href: 'tel:0703439842',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2A16 16 0 013 5z" />
        </svg>
      ),
    },
    {
      label: 'Visit',
      value: 'Monaragala',
      sub: 'Uva Province, Sri Lanka',
      href: '#map',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Hours',
      value: 'Open today · 9AM - 8PM',
      sub: 'Sat-Sun · 10AM - 6PM',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const faqs = [
    { q: 'What are your shipping options?', a: 'Standard (3-5 days), express (1-2 days), and same-day delivery within Sri Lanka.' },
    { q: 'What is your return policy?', a: 'We accept returns within 30 days of purchase for unused items in original packaging. Full refund guaranteed.' },
    { q: 'How can I track my order?', a: "Once shipped, you'll receive an email and SMS with tracking info to monitor delivery in real-time." },
    { q: 'Do you offer warranty on products?', a: 'All products come with manufacturer warranty. Extended plans available on select items.' },
    { q: 'Do you provide repair services?', a: 'Yes, laptop, desktop, smartphone, and peripheral repairs. Visit the Repair page or call 070 343 9842.' },
  ];

  const inputCls =
    'w-full px-4 py-3.5 bg-transparent border-b border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#F7B500] transition-colors';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[200px] bg-[#F7B500]/[0.04] -top-40 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[180px] bg-[#FF6B35]/[0.025] bottom-0 right-0" />
      </div>

      {/* ── Hero ── editorial header */}
      <section className="relative pt-32 pb-16">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-4xl">
            <motion.div {...fade} className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-[#F7B500]" />
              <span className="text-[#F7B500] text-[11px] tracking-[0.25em] uppercase font-medium">
                Get In Touch
              </span>
            </motion.div>
            <motion.h1
              {...fade}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight"
            >
              Let's start a{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                conversation.
              </span>
            </motion.h1>
            <motion.p
              {...fade}
              transition={{ delay: 0.1 }}
              className="text-white/40 text-base md:text-lg leading-relaxed max-w-xl mt-8"
            >
              Whether it's a question about an order, a quote on a custom build, or just a hello. We
              read every message and reply within 24 hours.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── Channels ── inline list */}
      <section className="py-10 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04] rounded-2xl overflow-hidden">
            {channels.map((c, i) => (
              <motion.a
                key={i}
                href={c.href}
                {...fade}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0A0A0B] hover:bg-[#111114] p-6 group transition-colors"
              >
                <div className="flex items-center gap-2 mb-4 text-white/30 group-hover:text-[#F7B500] transition-colors">
                  {c.icon}
                  <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
                    {c.label}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm mb-1 group-hover:text-[#F7B500] transition-colors">
                  {c.value}
                </p>
                <p className="text-white/30 text-xs">{c.sub}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── split layout */}
      <section className="py-24">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left intro */}
            <motion.div {...fade} className="lg:col-span-5">
              <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-4">
                Send a Message
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
                Drop us a line.
                <br />
                <span className="text-white/35">We'll write back.</span>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-sm">
                For urgent queries, give us a call. Otherwise, fill out the form and we'll respond
                within one business day.
              </p>

              <div className="border-t border-white/[0.06] pt-8">
                <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase mb-4">
                  Follow Us
                </p>
                <div className="flex gap-2">
                  {[
                    { letter: 'F', label: 'Facebook' },
                    { letter: 'X', label: 'Twitter' },
                    { letter: 'I', label: 'Instagram' },
                    { letter: 'L', label: 'LinkedIn' },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label={s.label}
                      className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 text-xs font-bold hover:border-[#F7B500]/40 hover:text-[#F7B500] hover:-translate-y-0.5 transition-all"
                    >
                      {s.letter}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div {...fade} transition={{ delay: 0.1 }} className="lg:col-span-7">
              <div className="bg-[#0F0F11] border border-white/[0.06] rounded-3xl p-8 md:p-10 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#F7B500]/[0.04] rounded-full blur-3xl pointer-events-none" />

                <AnimatePresence mode="wait">
                  {!isAuthenticated ? (
                    <motion.div
                      key="auth"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 relative"
                    >
                      <div className="w-16 h-16 bg-[#F7B500]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#F7B500]/20">
                        <svg className="w-7 h-7 text-[#F7B500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3m-9 4h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V5a4 4 0 10-8 0v2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Login required</h3>
                      <p className="text-white/35 text-sm mb-6">
                        Please log in to send us a message.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { from: '/contact' } })}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-[#0A0A0B] text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        Log in to continue
                      </button>
                    </motion.div>
                  ) : submitted ? (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 relative"
                    >
                      <div className="w-16 h-16 bg-[#F7B500]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#F7B500]/20">
                        <svg
                          className="w-7 h-7 text-[#F7B500]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Message sent.</h3>
                      <p className="text-white/35 text-sm">
                        We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6 relative"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white/35 text-[10px] uppercase tracking-[0.2em] mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputCls}
                            placeholder="Deshan Dinidu"
                          />
                        </div>
                        <div>
                          <label className="block text-white/35 text-[10px] uppercase tracking-[0.2em] mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputCls}
                            placeholder="deshandinidu@gmail.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/35 text-[10px] uppercase tracking-[0.2em] mb-2">
                          Subject
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className={inputCls}
                        >
                          <option value="" className="bg-[#0F0F11]">
                            Select a subject
                          </option>
                          <option value="general" className="bg-[#0F0F11]">
                            General Inquiry
                          </option>
                          <option value="support" className="bg-[#0F0F11]">
                            Technical Support
                          </option>
                          <option value="sales" className="bg-[#0F0F11]">
                            Sales Question
                          </option>
                          <option value="returns" className="bg-[#0F0F11]">
                            Returns & Refunds
                          </option>
                          <option value="other" className="bg-[#0F0F11]">
                            Other
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/35 text-[10px] uppercase tracking-[0.2em] mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className={`${inputCls} resize-none`}
                          placeholder="Tell us what's on your mind…"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-[#0A0A0B] text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section id="map" className="py-12">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div
            {...fade}
            className="bg-[#0F0F11] border border-white/[0.05] rounded-3xl overflow-hidden relative"
          >
            <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/8] relative">
              <iframe
                title="RAN Tech Shop, Monaragala"
                src="https://www.google.com/maps?q=Monaragala,+Sri+Lanka&z=13&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                style={{ filter: 'invert(0.92) hue-rotate(180deg) saturate(0.6) brightness(0.95) contrast(0.95)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11]/70 to-transparent">
                <p className="text-white font-bold text-base">RAN Tech Shop</p>
                <p className="text-white/45 text-xs">Monaragala · Uva Province, Sri Lanka</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-12 gap-12">
            <motion.div {...fade} className="lg:col-span-4">
              <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-3">
                Support
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">
                Frequently asked.
              </h2>
              <p className="text-white/35 text-sm leading-relaxed">
                Quick answers to the things customers ask us most. Still stuck?{' '}
                <a href="#" className="text-[#F7B500] hover:underline">
                  Drop us a message
                </a>
                .
              </p>
            </motion.div>

            <div className="lg:col-span-8 lg:col-start-5">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  {...fade}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-white/[0.06] last:border-b"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full text-left py-5 flex items-center justify-between gap-4 group"
                  >
                    <span className="text-white font-medium text-base group-hover:text-[#F7B500] transition-colors">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: activeFaq === i ? 45 : 0 }}
                      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#F7B500] flex-shrink-0 group-hover:border-[#F7B500]/40 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-12 text-white/45 text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
