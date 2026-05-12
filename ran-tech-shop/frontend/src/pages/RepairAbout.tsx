import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const RepairAbout: React.FC = () => {
  const [activeValue, setActiveValue] = useState(0);

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Started as a small laptop repair desk in Monaragala' },
    { year: '2021', title: '1,000 Repairs', description: 'Completed our first thousand device repairs' },
    { year: '2022', title: 'Certified Team', description: 'Expanded into board-level repair and diagnostics' },
    { year: '2023', title: 'Upgrade Lab', description: 'Launched hardware upgrade and custom build services' },
    { year: '2024', title: '5-Star Rated', description: 'Achieved consistent 5-star customer satisfaction' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Precision',
      description: 'Every repair follows strict diagnostic protocols. We identify root causes, not just symptoms.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Speed',
      description: 'Most repairs completed same-day. We respect your time and keep you updated at every step.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-3.06A1.5 1.5 0 015 10.82V6.18a1.5 1.5 0 011.32-1.49l5.1-3.06a1.5 1.5 0 011.16 0l5.1 3.06A1.5 1.5 0 0119 6.18v4.64a1.5 1.5 0 01-1.32 1.49l-5.1 3.06a1.5 1.5 0 01-1.16 0z" />
        </svg>
      ),
      title: 'Transparency',
      description: 'No hidden charges. We quote before we repair and explain every cost clearly.',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
      title: 'Quality Parts',
      description: 'We use only genuine and OEM-grade components. Every repair backed by a 90-day warranty.',
    },
  ];

  const stats = [
    { number: '15K+', label: 'Devices Repaired' },
    { number: '98%', label: 'Fix Rate' },
    { number: '4.9', label: 'Average Rating' },
    { number: '24h', label: 'Avg Turnaround' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-black overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-black text-white overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="repairAboutGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#repairAboutGrid)" />
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
              RAN Repair / About
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] tracking-tight"
            >
              We fix what
              <br />
              <span className="text-white/40">others can't.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/50 text-lg mt-8 max-w-xl leading-relaxed"
            >
              Expert device repair, hardware upgrades, and custom build support. Built on careful diagnostics and honest service since 2020.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-black p-6 text-center">
                  <div className="text-3xl md:text-4xl font-black text-white">{stat.number}</div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission - Split layout */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 min-h-[560px] border border-black/10">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="relative overflow-hidden bg-black"
          >
            <img
              src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=800&fit=crop"
              alt="Repair workshop"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <span className="text-white/40 text-xs uppercase tracking-widest">Est. 2020</span>
              <p className="text-white text-2xl font-bold mt-1">Monaragala, Sri Lanka</p>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center p-10 lg:p-16"
          >
            <div>
              <span className="text-black/30 text-xs uppercase tracking-widest">Our Mission</span>
              <h2 className="text-4xl font-black text-black mt-4 mb-8 leading-tight">
                Making tech repair
                <br />accessible & honest.
              </h2>
              <div className="space-y-6 text-black/60 leading-relaxed">
                <p>
                  RAN was founded on a simple belief: device repair shouldn't be mysterious or overpriced. Our certified technicians diagnose and fix with full transparency, so you always know what's happening with your device.
                </p>
                <p>
                  From cracked screens to motherboard-level repairs, we handle it all in-house. No outsourcing, no guesswork, just skilled hands and the right tools.
                </p>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="h-px bg-black/20 mt-10 origin-left"
              />
            </div>
          </motion.div>
        </div>
        </div>
      </section>

      {/* Values - Interactive cards */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="text-white/30 text-xs uppercase tracking-widest">What Drives Us</span>
            <h2 className="text-4xl font-black text-white mt-4">Core Values</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-px bg-white/10">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setActiveValue(index)}
                className={`bg-black p-10 cursor-pointer transition-all duration-500 group ${
                  activeValue === index ? 'bg-white text-black' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-14 h-14 border flex items-center justify-center mb-6 transition-colors duration-500 ${
                  activeValue === index ? 'border-black text-black' : 'border-white/20 text-white/60 group-hover:border-white/40'
                }`}>
                  {value.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors duration-500 ${
                  activeValue === index ? 'text-black' : 'text-white'
                }`}>
                  {value.title}
                </h3>
                <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                  activeValue === index ? 'text-black/60' : 'text-white/40'
                }`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-black/30 text-xs uppercase tracking-widest">Our Story</span>
            <h2 className="text-4xl font-black text-black mt-4">The Journey</h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-start gap-8 mb-12 last:mb-0 group"
              >
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-3xl font-black text-black group-hover:text-black/40 transition-colors">
                    {milestone.year}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="w-3 h-3 bg-black group-hover:scale-150 transition-transform" />
                  <div className="absolute top-4 left-[5px] w-px h-full bg-black/10 group-last:hidden" />
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-black mb-1">{milestone.title}</h3>
                  <p className="text-black/50 text-sm">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="container mx-auto px-4 lg:px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              Device broken?
              <br />
              <span className="text-white/40">We'll handle it.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/50 mb-10 max-w-lg mx-auto"
            >
              Book a repair online and get a free diagnostic. Most repairs completed within 24 hours.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/repair">
                <Button variant="primary" size="lg" className="bg-white text-black border-white hover:bg-white/90">
                  Book a Repair
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Link to="/repair-contact">
                <Button variant="ghost" size="lg" className="border border-white/20 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RepairAbout;
