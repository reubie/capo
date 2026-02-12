import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { toast } from 'react-toastify';
import { ChevronLeft, Mail, Send, CheckCircle } from 'lucide-react';

const SUPPORT_EMAIL = 'support@jiomegroup.com';
const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xzdaepvb';

function ContactFormBlock({ onCopyMailto, onSendAnother }) {
  const [state, handleSubmit] = useForm(FORM_ID);

  if (state.succeeded) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Message sent successfully.</p>
            <p className="text-sm text-green-700 mt-1">We’ll reply to your email as soon as we can.</p>
            {onSendAnother && (
              <button type="button" onClick={onSendAnother} className="mt-3 text-sm text-green-700 font-medium hover:underline">
                Send another message
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-brand-brown mb-1">
            Your email <span className="text-brand-orange">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="e.g. you@example.com"
            required
            disabled={state.submitting}
            className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange disabled:opacity-60"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-600 text-sm mt-1 block" />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-brand-brown mb-1">
            Message <span className="text-brand-orange">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="How can we help?"
            required
            rows={5}
            disabled={state.submitting}
            className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-y disabled:opacity-60"
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-600 text-sm mt-1 block" />
        </div>
        {(state.errors && state.errors.length > 0 && !state.errors.find(e => e.field)) && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again or email us directly.</p>
        )}
        <button
          type="submit"
          disabled={state.submitting}
          className="w-full py-3 px-4 bg-brand-orange text-brand-textOnDark font-medium rounded-lg hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state.submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send message
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-sm text-brand-textSecondary">
        Or email directly:{' '}
        <button
          type="button"
          onClick={onCopyMailto}
          className="text-brand-orange font-medium hover:underline inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          {SUPPORT_EMAIL}
        </button>
      </p>
    </>
  );
}

const Contact = () => {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    document.title = 'Contact – Jiome';
  }, []);

  const handleCopyAndMailto = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success('Email address copied.');
    } catch {
      toast.info(`Email: ${SUPPORT_EMAIL}`);
    }
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Jiome support')}`;
  };

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
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Contact us</h1>
        <p className="text-brand-textSecondary text-sm mb-6">
          Send a message and we’ll reply to your email.
        </p>

        <ContactFormBlock key={formKey} onCopyMailto={handleCopyAndMailto} onSendAnother={() => setFormKey((k) => k + 1)} />

        <div className="mt-10 pt-6 border-t border-brand-brown/10">
          <button onClick={() => navigate('/')} className="text-brand-orange font-medium hover:text-brand-orangeDark transition-colors">
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default Contact;
