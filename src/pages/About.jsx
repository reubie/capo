import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail } from 'lucide-react';
import ContactModal from '../components/ContactModal';

const SUPPORT_EMAIL = 'support@jiomegroup.com';

const COMPANY_DESCRIPTION = [
  'We are a cross-functional team with deep expertise in technology and finance, spanning experience across underdeveloped, developing, and developed markets.',
  'Our platform and mobile application address everyday challenges to enable seamless business operations and financial inclusion. By simplifying routine tasks, we deliver enhanced environmental and behavioral experiences that bridge gaps for individuals and companies alike.',
  'Our diverse backgrounds and global market knowledge position us to create solutions that work across different economic contexts and user needs.',
];

const About = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    document.title = 'About – Jiome';
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
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Company description</h1>
        <p className="text-sm text-brand-textSecondary mb-8">Jiome by Jiome Group</p>

        <div className="space-y-6 text-brand-textPrimary">
          {COMPANY_DESCRIPTION.map((paragraph, i) => (
            <p key={i} className="text-brand-textSecondary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <section className="mt-10 pt-6 border-t border-brand-brown/10">
          <h2 className="text-lg font-semibold text-brand-brown mb-2">Contact</h2>
          <p className="text-brand-textSecondary text-sm mb-2">
            Questions? Get in touch:
          </p>
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="inline-flex items-center gap-2 text-brand-orange font-medium hover:underline"
          >
            <Mail className="w-4 h-4" />
            {SUPPORT_EMAIL}
          </button>
        </section>

        <ContactModal visible={showContactModal} onClose={() => setShowContactModal(false)} />

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

export default About;
