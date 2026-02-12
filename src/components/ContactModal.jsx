import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { toast } from 'react-toastify';
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const SUPPORT_EMAIL = 'support@jiomegroup.com';
const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || 'xzdaepvb';

function ContactFormContent({ onClose, onCopyMailto }) {
  const [state, handleSubmit] = useForm(FORM_ID);

  if (state.succeeded) {
    return (
      <>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Message sent successfully.</p>
              <p className="text-sm text-green-700 mt-1">We’ll reply to your email as soon as we can.</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
        >
          Close
        </button>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-modal-email" className="block text-sm font-medium text-brand-brown mb-1">
            Your email <span className="text-brand-orange">*</span>
          </label>
          <input
            id="contact-modal-email"
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
          <label htmlFor="contact-modal-message" className="block text-sm font-medium text-brand-brown mb-1">
            Message <span className="text-brand-orange">*</span>
          </label>
          <textarea
            id="contact-modal-message"
            name="message"
            placeholder="How can we help?"
            required
            rows={4}
            disabled={state.submitting}
            className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-y disabled:opacity-60"
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-600 text-sm mt-1 block" />
        </div>
        {(state.errors && state.errors.length > 0 && !state.errors.find(e => e.field)) && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again or email us directly.</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={state.submitting}
            className="flex-1 py-3 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.submitting}
            className="flex-1 py-3 px-4 bg-brand-orange text-brand-textOnDark font-medium rounded-lg hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state.submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm text-brand-textSecondary">
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

const ContactModal = ({ visible, onClose }) => {
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  const handleCopyAndMailto = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success('Email address copied.');
    } catch {
      toast.info(`Email: ${SUPPORT_EMAIL}`);
    }
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Jiome support')}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-brand-cardLight rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-brown/20 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-brand-textSecondary hover:text-brand-brown transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 pt-10">
          <h2 className="text-xl font-bold text-brand-brown mb-1">Get in touch</h2>
          <p className="text-brand-textSecondary text-sm mb-4">
            We will reply to your email.
          </p>

          <ContactFormContent key={formKey} onClose={handleClose} onCopyMailto={handleCopyAndMailto} />
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
