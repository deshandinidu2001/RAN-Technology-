import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const RepairContact: React.FC = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    device: '',
    issue: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-fill name & email when the user is logged in. Only seed empty fields so
  // a customer who manually edits either input keeps their changes.
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
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      device: '',
      issue: '',
      message: '',
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactChannels = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Walk In',
      value: 'Monaragala, Sri Lanka',
      sub: 'Mon-Sat 9 AM - 7 PM',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'info@rantech.lk',
      sub: 'Repair quotes and booking support',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Phone',
      value: '0773439842',
      sub: 'Repair desk and service updates',
    },
  ];

  const faqs = [
    { q: 'How long does a typical repair take?', a: 'Most screen replacements take 1-2 hours. Complex motherboard repairs may take 1-3 business days. We provide an estimated timeline during diagnosis.' },
    { q: 'Do you offer a warranty on repairs?', a: 'Yes, all repairs come with a 90-day warranty covering parts and labor. If the same issue recurs, we fix it at no extra charge.' },
    { q: 'Can I track my repair status?', a: 'Absolutely. Once you book a repair, you receive a tracking link via email and SMS with real-time updates.' },
    { q: 'What devices do you repair?', a: 'We repair smartphones, laptops, tablets, gaming consoles, and desktops. We also offer hardware upgrades like RAM, SSD, and GPU installations.' },
    { q: 'Do I need an appointment?', a: 'Walk-ins are welcome, but booking online guarantees a time slot and lets us prepare the right parts in advance.' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-black overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="repairContactGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#repairContactGrid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-6">
          <div className="max-w-5xl">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-px bg-white mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 uppercase tracking-[0.4em] text-xs mb-4"
            >
              RAN Repair / Contact
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight"
            >
              Get in touch,
              <br />
              <span className="text-white/40">get it fixed.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/50 text-lg mt-8 max-w-xl leading-relaxed"
            >
              Describe your device issue and we will reply with next steps, repair options, and a clear estimate.
            </motion.p>

            {/* Contact channels */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10"
            >
              {contactChannels.map((ch, i) => (
                <motion.div
                  key={i}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="bg-black p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-white/40">{ch.icon}</span>
                    <span className="text-white/40 text-xs uppercase tracking-widest">{ch.label}</span>
                  </div>
                  <p className="text-white font-medium">{ch.value}</p>
                  <p className="text-white/30 text-sm mt-1">{ch.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-12 gap-16">
              {/* Left - context */}
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-black/30 text-xs uppercase tracking-widest">Send a Message</span>
                  <h2 className="text-3xl font-black text-black mt-4 mb-6">
                    Describe your issue
                  </h2>
                  <p className="text-black/50 leading-relaxed mb-8">
                    Provide as much detail as possible — device model, the issue, and when it started. We'll respond with next steps.
                  </p>

                  <div className="space-y-4">
                    {[
                      'Free initial diagnosis',
                      'No-obligation repair quote',
                      'Same-day response guaranteed',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 border border-black flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-black/60 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right - form */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-8"
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border border-black p-12 text-center"
                    >
                      <div className="w-16 h-16 border-2 border-black flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-black mb-2">Message Sent</h3>
                      <p className="text-black/50">We'll review your issue and get back within 2 hours.</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-black/40 text-xs uppercase tracking-widest mb-2">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-0 py-3 bg-transparent border-b border-black/20 text-black placeholder-black/20 focus:outline-none focus:border-black transition-colors"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-black/40 text-xs uppercase tracking-widest mb-2">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-0 py-3 bg-transparent border-b border-black/20 text-black placeholder-black/20 focus:outline-none focus:border-black transition-colors"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-black/40 text-xs uppercase tracking-widest mb-2">Device</label>
                          <input
                            type="text"
                            name="device"
                            value={formData.device}
                            onChange={handleChange}
                            required
                            className="w-full px-0 py-3 bg-transparent border-b border-black/20 text-black placeholder-black/20 focus:outline-none focus:border-black transition-colors"
                            placeholder="iPhone 15 Pro"
                          />
                        </div>
                        <div>
                          <label className="block text-black/40 text-xs uppercase tracking-widest mb-2">Issue Type</label>
                          <select
                            name="issue"
                            value={formData.issue}
                            onChange={handleChange}
                            required
                            className="w-full px-0 py-3 bg-transparent border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors"
                          >
                            <option value="">Select issue</option>
                            <option value="screen">Screen Repair</option>
                            <option value="battery">Battery Replacement</option>
                            <option value="motherboard">Motherboard Issue</option>
                            <option value="software">Software Problem</option>
                            <option value="upgrade">Hardware Upgrade</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-black/40 text-xs uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full px-0 py-3 bg-transparent border-b border-black/20 text-black placeholder-black/20 focus:outline-none focus:border-black transition-colors resize-none"
                          placeholder="Describe the issue in detail..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black text-white py-4 font-semibold text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
        </div>
      </section>

      {/* FAQ - Accordion style */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <span className="text-white/30 text-xs uppercase tracking-widest">Support</span>
              <h2 className="text-4xl font-black text-white mt-4">Common Questions</h2>
            </motion.div>

            <div className="space-y-px">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full text-left py-6 border-b border-white/10 flex items-center justify-between group"
                  >
                    <span className="text-white font-medium group-hover:text-white/80 transition-colors pr-8">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: activeFaq === index ? 45 : 0 }}
                      className="text-white/40 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="py-4 text-white/40 text-sm leading-relaxed border-b border-white/5">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map / Location */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 min-h-[420px] border border-black/10 overflow-hidden">
            {/* Embedded map */}
            <div className="relative bg-black aspect-[4/3] lg:aspect-auto">
              <iframe
                title="RAN Repair Desk — Monaragala, Sri Lanka"
                src="https://www.google.com/maps?q=Monaragala,+Sri+Lanka&z=12&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/70 to-transparent">
                <p className="text-white font-bold text-base">RAN Repair Desk</p>
                <p className="text-white/50 text-xs mt-0.5">Monaragala · Uva Province, Sri Lanka</p>
              </div>
            </div>

            {/* Info panel */}
            <div className="flex items-center p-12 lg:p-16">
              <div>
                <h3 className="text-2xl font-black text-black mb-4">Visit Our Lab</h3>
                <p className="text-black/50 leading-relaxed mb-6">
                  Walk in for a free diagnosis during business hours. No appointment needed for
                  quick assessments. We serve customers across Monaragala, Wellawaya, Buttala
                  and surrounding areas.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-black/30 w-20">Address</span>
                    <span className="text-black">Monaragala, Sri Lanka</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-black/30 w-20">Hours</span>
                    <span className="text-black">Mon-Sat: 9 AM - 7 PM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-black/30 w-20">Phone</span>
                    <span className="text-black">0773439842</span>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps?q=Monaragala,+Sri+Lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-black/85 transition-colors"
                >
                  Get Directions
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RepairContact;
