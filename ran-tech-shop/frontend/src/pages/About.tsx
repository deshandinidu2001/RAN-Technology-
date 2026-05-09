import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

const About: React.FC = () => {
  const stats = [
    { number: '10K+', label: 'Products sold' },
    { number: '25', label: 'Districts served' },
    { number: '99%', label: 'Satisfaction' },
    { number: '500+', label: 'Products curated' },
  ];

  const principles = [
    {
      n: '01',
      title: 'Quality first',
      body: 'Every product is hand-tested by our team before it ever reaches your doorstep.',
    },
    {
      n: '02',
      title: 'Customer obsessed',
      body: 'A real human is always one message away — no bots, no scripts, no waiting.',
    },
    {
      n: '03',
      title: 'Built for tinkerers',
      body: 'From entry rigs to flagship builds, we stock what enthusiasts actually want.',
    },
    {
      n: '04',
      title: 'Honest pricing',
      body: 'We source direct, cut middlemen, and pass the savings on. No hidden fees.',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Founded', body: 'Started in a small Monaragala workshop.' },
    { year: '2021', title: '1K customers', body: 'First thousand orders shipped.' },
    { year: '2022', title: 'Catalogue x10', body: '500+ SKUs across every category.' },
    { year: '2023', title: 'Islandwide', body: 'Tracked delivery to all 25 districts.' },
    { year: '2024', title: '10K orders', body: 'A milestone — and a beginning.' },
  ];

  const perks = [
    { title: 'Expert curation', desc: 'Real reviews from people who use the gear daily.' },
    { title: 'Same-day dispatch', desc: 'Order before 4 PM, it ships the same day.' },
    { title: 'Secure checkout', desc: 'Bank-grade encryption on every transaction.' },
    { title: '30-day returns', desc: 'Hassle-free returns on every purchase.' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[200px] bg-[#F7B500]/[0.04] -top-40 -right-40" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[180px] bg-[#FF6B35]/[0.025] bottom-0 left-1/4" />
      </div>

      {/* ── Hero ── editorial split */}
      <section className="relative pt-32 pb-20">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <motion.div {...fade} className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-px bg-[#F7B500]" />
                <span className="text-[#F7B500] text-[11px] tracking-[0.25em] uppercase font-medium">
                  About RAN Tech
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
                Premium tech,
                <br />
                <span className="text-white/40">delivered with</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                  intent.
                </span>
              </h1>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.15 }} className="lg:col-span-4">
              <p className="text-white/45 text-base leading-relaxed mb-6">
                Founded by tech enthusiasts, for tech enthusiasts. We curate the best hardware from the
                world's leading brands and deliver it islandwide — with the kind of care big retailers forgot.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-[#F7B500] transition-colors group"
              >
                Browse the shop
                <span className="w-6 h-px bg-current group-hover:w-10 transition-all" />
              </Link>
            </motion.div>
          </div>

          {/* Stats ticker */}
          <motion.div
            {...fade}
            transition={{ delay: 0.25 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden"
          >
            {stats.map((s, i) => (
              <div key={i} className="bg-[#0A0A0B] p-7 hover:bg-[#111114] transition-colors">
                <div className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-white/30">
                  {s.number}
                </div>
                <div className="text-white/35 text-xs mt-2 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission / Manifesto ── */}
      <section className="py-24">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-12 gap-10">
            <motion.div {...fade} className="lg:col-span-4">
              <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-4">
                — Our Mission
              </p>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                Making premium tech{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                  accessible to everyone.
                </span>
              </h2>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.1 }} className="lg:col-span-7 lg:col-start-6">
              <p className="text-white/55 text-lg leading-relaxed mb-6">
                Sri Lanka's tech landscape was built for resellers — not for the people actually using the gear.
                Inflated margins, opaque sourcing, support that disappears the moment you click checkout.
              </p>
              <p className="text-white/35 text-base leading-relaxed">
                We started RAN to do it differently. Source direct. Stock thoughtfully. Ship fast.
                Treat every customer like the one we'd want to be. That's the whole playbook.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Principles ── numbered list */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div {...fade} className="mb-14">
            <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-3">
              — What We Stand For
            </p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">Four principles.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-2">
            {principles.map((p, i) => (
              <motion.div
                key={i}
                {...fade}
                transition={{ delay: i * 0.06 }}
                className="group flex gap-6 py-8 border-t border-white/[0.06] hover:border-[#F7B500]/30 transition-colors"
              >
                <span className="text-[#F7B500]/50 text-xs font-mono pt-1 group-hover:text-[#F7B500] transition-colors">
                  {p.n}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
                    {p.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── horizontal rail */}
      <section className="py-24">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div {...fade} className="mb-14 max-w-2xl">
            <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-3">
              — The Journey
            </p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Five years.{' '}
              <span className="text-white/35">Still just getting started.</span>
            </h2>
          </motion.div>

          {/* Desktop rail */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-[18px] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="grid grid-cols-5 gap-6">
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    {...fade}
                    transition={{ delay: i * 0.08 }}
                    className="relative"
                  >
                    <div className="flex justify-center mb-6">
                      <span className="w-3 h-3 rounded-full bg-[#F7B500] ring-4 ring-[#0A0A0B] relative z-10" />
                    </div>
                    <div className="text-center">
                      <div className="text-[#F7B500] text-xs font-mono mb-1">{m.year}</div>
                      <div className="text-white font-bold text-sm mb-1.5">{m.title}</div>
                      <div className="text-white/30 text-xs leading-relaxed">{m.body}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile stacked */}
          <div className="md:hidden space-y-5">
            {milestones.map((m, i) => (
              <motion.div key={i} {...fade} transition={{ delay: i * 0.05 }} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full bg-[#F7B500] mt-1.5" />
                  {i < milestones.length - 1 && <span className="w-px flex-1 bg-white/10 mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="text-[#F7B500] text-xs font-mono">{m.year}</div>
                  <div className="text-white font-bold text-sm">{m.title}</div>
                  <div className="text-white/30 text-xs">{m.body}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why RAN ── two-col with perks */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div {...fade}>
              <p className="text-white/25 text-[11px] tracking-[0.2em] uppercase font-medium mb-3">
                — Why RAN
              </p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Not just another{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                  tech store.
                </span>
              </h2>
              <p className="text-white/40 leading-relaxed mb-8 max-w-md">
                We combine expert curation with genuine care. The result: a shopping experience built around
                the people who actually use the gear.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-[#0A0A0B] text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Browse Products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-3">
              {perks.map((p, i) => (
                <motion.div
                  key={i}
                  {...fade}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#111114] border border-white/[0.05] rounded-2xl p-6 hover:border-[#F7B500]/20 hover:-translate-y-1 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F7B500]/10 flex items-center justify-center text-[#F7B500] mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{p.title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── full-width banner */}
      <section className="py-20">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div
            {...fade}
            className="relative rounded-3xl overflow-hidden border border-white/[0.05] bg-[#0F0F11]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7B500]/[0.08] via-transparent to-[#FF6B35]/[0.06]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-5">
                Ready to upgrade
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
                  your setup?
                </span>
              </h2>
              <p className="text-white/40 max-w-md mx-auto mb-9">
                Explore our curated collection of premium tech from the world's leading brands.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/shop"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-[#0A0A0B] text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                >
                  Start Shopping
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/contact"
                  className="px-7 py-3 rounded-xl border border-white/10 text-white/80 text-sm font-bold hover:bg-white/5 hover:border-white/20 transition-all inline-flex items-center justify-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
