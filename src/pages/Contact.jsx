import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, Mail, Send } from 'lucide-react';

const SUPPORT_EMAIL = 'support@jiomegroup.com';

const Contact = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Contact – Jiome';
  }, []);

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
          Send us a message. Your email client will open so you can send to {SUPPORT_EMAIL}. We’ll use your email to reply.
        </p>

        {sent ? (
          <div className="p-4 bg-brand-orange/10 border border-brand-orange/30 rounded-xl text-brand-brown">
            <p className="font-medium mb-1">Your email client should have opened.</p>
            <p className="text-sm text-brand-textSecondary">
              Complete and send the email to contact us. If it didn’t open, use the button below to try again.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-3 text-sm text-brand-orange font-medium hover:underline"
            >
              Fill form again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-brand-brown mb-1">
                Your name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-brand-brown mb-1">
                Your email <span className="text-brand-orange">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. you@example.com"
                required
                className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              />
              <p className="text-xs text-brand-textSecondary mt-1">So we can reply to you.</p>
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-brand-brown mb-1">
                Message <span className="text-brand-orange">*</span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                required
                rows={5}
                className="w-full px-4 py-3 border border-brand-brown/20 rounded-lg bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-y"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-orange text-brand-textOnDark font-medium rounded-lg hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Open email to send
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-brand-textSecondary">
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

export default Contact;
