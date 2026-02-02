import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy – Jiome';
  }, []);

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-background/95 backdrop-blur border-b border-brand-brown/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-brand-brown/10 text-brand-brown transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/images/logo.png" alt="Jiome" className="h-8 w-auto object-contain" />
            <span className="font-semibold text-brand-brown">Jiome</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Privacy Policy</h1>
        <p className="text-sm text-brand-textSecondary mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-brand-textPrimary">
          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">1. Introduction</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              Jiome (“we”, “our”, or “us”) operates the Jiome application and related services, including the Gifticon (gift card) and Network (business card) features. We are committed to protecting your personal data in accordance with the Personal Data Protection Act 2012 (PDPA) of Singapore and other applicable laws.
            </p>
            <p className="text-brand-textSecondary leading-relaxed mt-3">
              This Privacy Policy explains what personal data we collect, how we use it, and your rights. By using our app or services, you consent to the practices described here. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">2. Data We Collect</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              We may collect the following categories of personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-textSecondary">
              <li><strong className="text-brand-brown">Account and identity:</strong> Phone number, name, email address (if you provide it), and profile information you enter or derive from business card uploads.</li>
              <li><strong className="text-brand-brown">Authentication:</strong> Data used to verify your identity (e.g. one-time passwords sent to your phone number).</li>
              <li><strong className="text-brand-brown">Business cards and network:</strong> Photos of business cards, extracted text (e.g. name, company, contact details), and any information you add or edit in your profile or network.</li>
              <li><strong className="text-brand-brown">Gifticon activity:</strong> Gift card purchases, redemption history, and related transaction data.</li>
              <li><strong className="text-brand-brown">Device and usage:</strong> Device type, browser, IP address, and how you use the app (e.g. pages visited, features used), where necessary for security and service improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">3. How We Use Your Data</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-textSecondary">
              <li>To create and manage your account and authenticate you (e.g. via phone and OTP).</li>
              <li>To provide Gifticon and Network features (e.g. storing business cards, processing gift card purchases).</li>
              <li>To improve our app, fix errors, and analyse usage in an aggregated way.</li>
              <li>To comply with legal obligations and protect our rights and the security of our users.</li>
              <li>To communicate with you about your account, important updates, or support, where necessary.</li>
            </ul>
            <p className="text-brand-textSecondary leading-relaxed mt-3">
              We will not use your personal data for purposes that are incompatible with those set out here without notifying you and, where required by law, obtaining your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">4. Legal Basis and Consent (PDPA)</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              Under the PDPA, we collect, use, and disclose your personal data based on your consent where applicable, and otherwise in line with permitted purposes under the PDPA (e.g. necessary for providing the service, legal compliance, or legitimate interests where appropriate). By signing up and using Jiome, you consent to our collection, use, and disclosure of your personal data as described in this policy. You may withdraw consent by contacting us; note that withdrawal may mean we can no longer provide certain services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">5. Sharing and Disclosure</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              We may share your personal data with service providers who assist us (e.g. cloud hosting, authentication, analytics). These providers are bound by contractual obligations to protect your data and use it only for the purposes we specify. We may also disclose data where required by law or to protect our rights and users’ safety. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">6. Cross-Border Transfer</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              Your data may be stored or processed in countries outside Singapore (e.g. where our or our providers’ servers are located). We take steps to ensure that such transfers comply with the PDPA and that your data remains protected (e.g. through contracts and safeguards required by law).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">7. Retention</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              We retain your personal data only for as long as necessary to fulfil the purposes in this policy, to comply with legal obligations, and to resolve disputes. When data is no longer needed, we will delete or anonymise it in a secure manner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">8. Security</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include secure transmission, access controls, and secure storage. No method of transmission or storage is completely secure; we encourage you to keep your account credentials safe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">9. Your Rights (including under PDPA)</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              Subject to applicable law (including the PDPA), you may:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brand-textSecondary">
              <li><strong className="text-brand-brown">Access:</strong> Request access to the personal data we hold about you.</li>
              <li><strong className="text-brand-brown">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-brand-brown">Deletion:</strong> Request deletion of your personal data, where we are not required to retain it by law.</li>
              <li><strong className="text-brand-brown">Withdraw consent:</strong> Withdraw consent for collection, use, or disclosure of your personal data, subject to legal and contractual restrictions.</li>
              <li><strong className="text-brand-brown">Complaints:</strong> Lodge a complaint with us or with the relevant data protection authority in Singapore (Personal Data Protection Commission).</li>
            </ul>
            <p className="text-brand-textSecondary leading-relaxed mt-3">
              To exercise these rights, please contact us using the details below. We will respond in line with the PDPA and our internal policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">10. Children</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              Our services are not directed at individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have collected a child’s data, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">11. Changes to This Policy</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              We may update this Privacy Policy from time to time. We will post the updated version in the app or on our website and indicate the “Last updated” date. Continued use of our services after changes constitutes acceptance of the updated policy. For material changes, we may notify you via the app or by email where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">12. Contact Us</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              For any questions about this Privacy Policy, your personal data, or to exercise your rights under the PDPA, please contact us:
            </p>
            <p className="text-brand-textSecondary leading-relaxed">
              <strong className="text-brand-brown">Jiome</strong><br />
              Email: support@jiomegroup.com
            </p>
            <p className="text-brand-textSecondary leading-relaxed mt-3">
              We are based in Singapore and will respond to your request in accordance with the PDPA.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-brown/10">
          <button
            onClick={() => navigate('/')}
            className="text-brand-orange font-medium hover:text-brand-orangeDark transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
