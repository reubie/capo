import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronLeft, Trash2, Mail, AlertTriangle } from 'lucide-react';
import { hasValidToken } from '../utils/auth';
import { authAPI } from '../utils/api';
import { logout } from '../utils/auth';
import ConfirmModal from '../components/ConfirmModal';

const SUPPORT_EMAIL = 'support@jiomegroup.com';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isLoggedIn = hasValidToken();

  useEffect(() => {
    document.title = 'Delete account – Jiome';
  }, []);

  const handleRequestDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await authAPI.deleteAccount();
      // Clear profile picture from localStorage (local data tied to account)
      localStorage.removeItem('profilePicture');
      toast.success('Your account and associated data have been deleted.');
      logout(); // Clears token and redirects to home
      return;
    } catch (err) {
      setDeleting(false);
      setShowConfirm(false);
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      if (status === 403) {
        toast.error('Session expired. Please log in again and try again.');
        navigate('/login', { replace: true, state: { from: '/delete-account' } });
        return;
      }
      if (status === 404 || status === 501 || code === 'NOT_IMPLEMENTED') {
        toast.error('Account deletion is not available yet. Please contact support.');
        return;
      }
      if (err?.message === 'Network Error' || !err?.response) {
        toast.error('Network error. Please check your connection and try again.');
        return;
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete account.';
      toast.error(msg);
    }
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
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Delete Your Account</h1>
        <p className="text-sm text-brand-textSecondary mb-8">
          This page explains how to request deletion of your Jiome account and associated data. This information is provided for Google Play Store compliance.
        </p>

        {/* App / developer name (Play Store requirement) */}
        <section className="mb-8 p-4 bg-brand-cardLight rounded-xl border border-brand-brown/20">
          <h2 className="text-lg font-semibold text-brand-brown mb-2">App & developer</h2>
          <p className="text-brand-textSecondary">
            <strong className="text-brand-brown">Jiome</strong> (Gifticon & Network) — by Jiome Group. You can request account deletion as described below.
          </p>
        </section>

        {/* Steps to request deletion (Play Store requirement) */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-brand-brown mb-4">
            Steps to request account deletion
          </h2>
          <ol className="list-decimal list-inside space-y-4 text-brand-textSecondary">
            <li>
              <strong className="text-brand-brown">Log in</strong> to Jiome with your phone number and password (or register if you do not have an account).
            </li>
            <li>
              Open <strong className="text-brand-brown">Profile</strong> (profile icon in the app).
            </li>
            <li>
              Tap <strong className="text-brand-brown">Delete account</strong> (or open this page when logged in and use the button below).
            </li>
            <li>
              Confirm that you want to permanently delete your account and associated data.
            </li>
            <li>
              After confirmation, your account and the data we hold about you will be deleted in line with our retention policy below.
            </li>
          </ol>
        </section>

        {/* Data deleted / retained and retention (Play Store requirement) */}
        <section className="mb-8 p-4 bg-brand-cardLight rounded-xl border border-brand-brown/20">
          <h2 className="text-lg font-semibold text-brand-brown mb-3">
            Data we delete and data we may retain
          </h2>
          <p className="text-brand-textSecondary mb-3">
            When you request account deletion, we will permanently delete the following, where we hold it:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-brand-textSecondary mb-4">
            <li>Account and profile (phone, name, email, password hash)</li>
            <li>Your business card and contact details</li>
            <li>Business cards you have added in Network</li>
            <li>Gifticon purchase and gift history linked to your account</li>
            <li>Profile picture and any other data you provided in the app</li>
          </ul>
          <p className="text-brand-textSecondary mb-3">
            We may retain some data for a limited time only when required by law or for legitimate purposes (e.g. fraud prevention, legal claims):
          </p>
          <ul className="list-disc pl-6 space-y-1 text-brand-textSecondary">
            <li>Backups may be kept for a short period (e.g. up to 90 days) before permanent deletion.</li>
            <li>Anonymised or aggregated data that no longer identifies you may be retained for analytics.</li>
            <li>Data we are legally obliged to keep will be retained for the period required by law.</li>
          </ul>
        </section>

        {/* Action when logged in */}
        {isLoggedIn ? (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-brand-brown mb-3">Request deletion now</h2>
            <p className="text-brand-textSecondary mb-4">
              You are logged in. You can request permanent deletion of your account and associated data using the button below. This action cannot be undone.
            </p>
            <button
              onClick={handleRequestDelete}
              disabled={deleting}
              className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? 'Deleting...' : 'Request account deletion'}
            </button>
          </section>
        ) : (
          <section className="mb-8 p-4 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
            <p className="text-brand-brown font-medium mb-2">You are not logged in</p>
            <p className="text-brand-textSecondary text-sm mb-4">
              To request account deletion, log in first. Then open Profile and tap &quot;Delete account&quot;, or return to this page and use the &quot;Request account deletion&quot; button.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/login', { state: { from: '/delete-account' } })}
                className="px-4 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
              >
                Back to Home
              </button>
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="pt-6 border-t border-brand-brown/10">
          <h2 className="text-lg font-semibold text-brand-brown mb-2">Need help?</h2>
          <p className="text-brand-textSecondary text-sm mb-2">
            If you cannot delete your account from the app or have questions, contact us:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-brand-orange font-medium hover:underline"
          >
            <Mail className="w-4 h-4" />
            {SUPPORT_EMAIL}
          </a>
        </section>

        <div className="mt-10 pt-6 border-t border-brand-brown/10">
          <button
            onClick={() => navigate('/')}
            className="text-brand-orange font-medium hover:text-brand-orangeDark transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </main>

      <ConfirmModal
        visible={showConfirm}
        onClose={() => !deleting && setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete account permanently?"
        message="This will permanently delete your Jiome account and all associated data (profile, business cards, Gifticon history). This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Yes, delete my account'}
        cancelText="Cancel"
        confirmDisabled={deleting}
        icon={AlertTriangle}
        confirmButtonColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default DeleteAccount;
