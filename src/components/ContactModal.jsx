import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Mail, Send } from 'lucide-react';

const SUPPORT_EMAIL = 'support@jiomegroup.com';

const ContactModal = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const buildMailto = () => {
    const subject = `Jiome Contact from ${name || 'Visitor'}`.trim();
    const body = [
      `Name: ${name || '(not provided)'}`,
      `Email (reply to): ${email || '(not provided)'}`,
      '',
      'Message:',
      message || '(no message)',
    ].join('\n');
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = buildMailto();
    window.location.href = mailtoLink;
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
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
            We’ll use your email to reply. Your email client will open to send to {SUPPORT_EMAIL}.
          </p>

          {sent ? (
            <div className="p-4 bg-brand-orange/10 border border-brand-orange/30 rounded-xl text-brand-brown">
              <p className="font-medium mb-1">Your email client should have opened.</p>
              <p className="text-sm text-brand-textSecondary mb-4">
                Send the email to contact us. If it didn’t open, try again below.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm text-brand-orange font-medium hover:underline"
              >
                Fill form again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-modal-name" className="block text-sm font-medium text-brand-brown mb-1">
                  Your name
                </label>
                <input
                  id="contact-modal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                />
              </div>
              <div>
                <label htmlFor="contact-modal-email" className="block text-sm font-medium text-brand-brown mb-1">
                  Your email <span className="text-brand-orange">*</span>
                </label>
                <input
                  id="contact-modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  required
                  className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                />
              </div>
              <div>
                <label htmlFor="contact-modal-message" className="block text-sm font-medium text-brand-brown mb-1">
                  Message <span className="text-brand-orange">*</span>
                </label>
                <textarea
                  id="contact-modal-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-y"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-brand-orange text-brand-textOnDark font-medium rounded-lg hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-sm text-brand-textSecondary">
            Or email directly:{' '}
            <button
              type="button"
              onClick={async () => {
                const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Jiome support')}`;
                try {
                  await navigator.clipboard.writeText(SUPPORT_EMAIL);
                  toast.success('Email address copied. Open your email app (Gmail, Yahoo, etc.) and paste in the To field.');
                } catch {
                  toast.info(`Email: ${SUPPORT_EMAIL}. Open your email app and add this address.`);
                }
                window.location.href = mailto;
              }}
              className="text-brand-orange font-medium hover:underline inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </button>
            <span className="block mt-1 text-xs text-brand-textSecondary">Copies address and tries to open your email app. If it doesn’t open, paste the address in Gmail/Yahoo/Outlook.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
