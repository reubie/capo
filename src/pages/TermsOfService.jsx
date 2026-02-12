import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import ContactModal from '../components/ContactModal';

const CONTACT_EMAIL = 'support@jiomegroup.com';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    document.title = 'Terms of Service – Jiome';
  }, []);

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
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
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Terms of Service</h1>
        <p className="text-sm text-brand-textSecondary mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-brand-textPrimary">
          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">1. Acceptance</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              These Terms of Service (“Terms”) govern your use of the Jiome application and related services (“Service”), including Gifticon (gift cards) and Network (business cards), operated by Jiome Group (“we”, “us”, or “our”). By accessing or using the Service, you agree to these Terms and our <button type="button" onClick={() => navigate('/privacy-policy')} className="text-brand-orange font-medium hover:underline">Privacy Policy</button>. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">2. Description of Service</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              Jiome provides a platform for gift card (Gifticon) and business card (Network) management. We may change, suspend, or discontinue features at any time. We will use reasonable efforts to notify you of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">3. Accounts and Eligibility</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              You must be at least 18 years old and able to form a binding contract to use the Service. You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate information and notify us of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">4. Acceptable Use</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-brand-textSecondary">
              <li>Violate any law or third-party rights</li>
              <li>Upload false, offensive, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems or other accounts</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use the Service for fraud or misleading others</li>
            </ul>
            <p className="text-brand-textSecondary leading-relaxed mt-3">
              We may suspend or terminate your account if you breach these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">5. Intellectual Property</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              The Service, including its design, text, graphics, and software (excluding content you provide), is owned by Jiome Group or its licensors. You may not copy, modify, or create derivative works without our permission. You retain ownership of content you submit; you grant us a license to use it to operate and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">6. Disclaimer</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              The Service is provided “as is” and “as available”. We do not warrant that it will be uninterrupted, error-free, or secure. To the extent permitted by law, we disclaim all warranties, express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">7. Limitation of Liability</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              To the maximum extent permitted by law, Jiome Group and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages, or loss of data or profits, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the twelve months before the claim (or SGD 100 if none).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">8. Governing Law</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              These Terms are governed by the laws of Singapore. Any dispute shall be subject to the exclusive jurisdiction of the courts of Singapore.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">9. Changes</h2>
            <p className="text-brand-textSecondary leading-relaxed">
              We may update these Terms from time to time. We will post the updated version and update the “Last updated” date. Continued use of the Service after changes constitutes acceptance. For material changes, we may notify you via the app or by email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-brown mb-3">10. Contact</h2>
            <p className="text-brand-textSecondary leading-relaxed mb-3">
              For questions about these Terms or the Service:
            </p>
            <p className="text-brand-textSecondary">
              <strong className="text-brand-brown">Jiome Group</strong><br />
<button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-2 text-brand-orange font-medium hover:underline mt-1 text-left"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              {CONTACT_EMAIL}
            </button>
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-brown/10 flex flex-wrap gap-4">
          <button onClick={() => navigate('/')} className="text-brand-orange font-medium hover:text-brand-orangeDark transition-colors">
            ← Back to Home
          </button>
          <button onClick={() => navigate('/privacy-policy')} className="text-brand-textSecondary text-sm hover:text-brand-brown transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => setShowContactModal(true)} className="text-brand-textSecondary text-sm hover:text-brand-brown transition-colors">
            Contact
          </button>
        </div>
      </main>

      <ContactModal visible={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default TermsOfService;
