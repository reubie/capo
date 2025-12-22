import React, { useEffect, useState } from 'react';
import { X, Share2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { gifticonAPI } from '../utils/api';
import { generateQRCode } from '../utils/helpers';

const PurchasedGiftsTab = () => {
  /* =========================
     State
  ========================= */
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedGift, setSelectedGift] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  /* =========================
     Load Purchased Gifts
  ========================= */
  useEffect(() => {
    fetchPurchasedGifts();
  }, []);

  const fetchPurchasedGifts = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await gifticonAPI.getPurchasedGifts();

      if (res.data?.code === '200' && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(g => ({
          id: g.giftId,
          name: g.title || 'No Title',
          description: g.description || 'No Description',
          price: Number(g.price) || 0,
          image: g.image || '',
          giftCode: g.giftCode,
        }));

        setGifts(mapped);
      } else {
        setGifts([]);
      }
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Failed to load purchased gifts:', err);
        setError('Failed to load purchased gifts.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Share Flow
  ========================= */
  const openShare = gift => {
    setSelectedGift(gift);
    setQrCode(
      generateQRCode(
        gift.giftCode || `GIFT-${gift.id}-${Date.now()}`
      )
    );
    setShowShareModal(true);
  };

  const closeShare = () => {
    setShowShareModal(false);
    setSelectedGift(null);
    setQrCode(null);
  };

  const shareToWhatsApp = () => {
    if (!selectedGift) return;
    const msg = `You've received a gift: ${selectedGift.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!selectedGift) return;
    const msg = `You've received a gift: ${selectedGift.name}`;
    window.location.href = `sms:&body=${encodeURIComponent(msg)}`;
  };

  const shareViaWeChat = () => {
    if (!selectedGift) return;
    alert('WeChat sharing is coming soon!');
  };

  const shareViaEmail = () => {
    if (!selectedGift) return;
    const subject = `You've received a gift! 🎁`;
    const body = `Hi,\n\nYou've received a gift: ${selectedGift.name}\n\nEnjoy!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  /* =========================
     Render
  ========================= */
  return (
    <>
      {loading ? (
        <div className="text-center py-12">Loading gifts…</div>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : gifts.length === 0 ? (
        <p className="text-center text-brand-textSecondary py-12">
          You haven’t purchased any gifts yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gifts.map(gift => (
            <div key={gift.id} className="relative group">
              {/* Card */}
              <ProductCard product={gift} hidePurchase />

              {/* Share Icon */}
              <button
                onClick={() => openShare(gift)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 border border-brand-brown/20 rounded-full p-2 shadow-sm hover:bg-brand-orange/10"
                title="Share gift"
              >
                <Share2 size={16} className="text-brand-brown" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button className="absolute top-3 right-3" onClick={closeShare}>
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Share Gift: {selectedGift.name}</h2>

            {qrCode && (
              <img src={qrCode} alt="Gift QR" className="mx-auto mb-4 w-40 h-40" />
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={shareToWhatsApp}
                className="py-2 bg-green-500 text-white rounded-lg"
              >
                Share via WhatsApp
              </button>

              <button
                onClick={shareViaSMS}
                className="py-2 bg-blue-500 text-white rounded-lg"
              >
                Share via SMS
              </button>

              <button
                onClick={shareViaWeChat}
                className="py-2 bg-gray-500 text-white rounded-lg"
              >
                Share via WeChat
              </button>

              <button
                onClick={shareViaEmail}
                className="py-2 bg-purple-500 text-white rounded-lg"
              >
                Share via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchasedGiftsTab;
