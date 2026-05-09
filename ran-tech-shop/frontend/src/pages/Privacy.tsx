import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => (
  <div className="min-h-screen bg-dark text-white">
    <div className="container mx-auto px-4 lg:px-6 py-16 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-primary text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-4xl md:text-5xl font-light mb-2 tracking-tight">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-12">Last updated: January 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>
            RAN Technology collects information you provide directly when creating an account,
            placing an order, or booking a repair, including your name, email, phone number,
            and shipping address. We also collect basic device and usage data (browser type,
            pages visited) to improve the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To process orders, repair bookings, and payments.</li>
            <li>To contact you about your order, repair status, or support requests.</li>
            <li>To improve our website, products, and services.</li>
            <li>To send promotional messages only if you have opted in.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">3. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We share data only with trusted partners
            who help us operate the business (payment processors, courier services) and only
            to the extent necessary to fulfil your request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">4. Data Security</h2>
          <p>
            We use industry-standard safeguards, including encryption in transit, hashed passwords, and
            access controls to protect your information. No system is 100% secure, so please
            choose a strong password and keep it private.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">5. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data at any time
            by emailing <a className="text-primary hover:underline" href="mailto:info@rantech.lk">info@rantech.lk</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">6. Contact</h2>
          <p>
            Questions about this policy? Reach us at{' '}
            <a className="text-primary hover:underline" href="mailto:info@rantech.lk">info@rantech.lk</a>{' '}
            or call 0773439842.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
