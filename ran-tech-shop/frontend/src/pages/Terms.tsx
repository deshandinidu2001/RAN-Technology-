import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => (
  <div className="min-h-screen bg-dark text-white">
    <div className="container mx-auto px-4 lg:px-6 py-16 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-primary text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-4xl md:text-5xl font-light mb-2 tracking-tight">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-12">Last updated: January 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using rantech.lk you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">2. Orders &amp; Payments</h2>
          <p>
            All orders are subject to product availability and price confirmation. We reserve
            the right to refuse or cancel orders for any reason, including pricing errors or
            suspected fraud. Payment is required at checkout via the supported methods.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">3. Repair Services</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Repair bookings are confirmed once a time slot is reserved and acknowledged.</li>
            <li>Diagnostic findings may lead to a revised quote; you may decline at no charge except return shipping.</li>
            <li>Repaired devices come with a 90-day warranty on the specific repair performed, excluding new damage.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">4. Returns &amp; Refunds</h2>
          <p>
            Unused products may be returned within 7 days of delivery in original packaging.
            Custom builds and opened software are non-refundable. Refunds are processed within
            7-14 business days to the original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">5. User Accounts</h2>
          <p>
            You are responsible for keeping your account credentials secure and for all
            activity under your account. Notify us immediately if you suspect unauthorised use.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
          <p>
            RAN Technology is not liable for indirect, incidental, or consequential damages
            arising from the use of our site, products, or services, except where prohibited
            by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">7. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after
            changes are posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">8. Contact</h2>
          <p>
            For questions about these Terms, email{' '}
            <a className="text-primary hover:underline" href="mailto:info@rantech.lk">info@rantech.lk</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Terms;
