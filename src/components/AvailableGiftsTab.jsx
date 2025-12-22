import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';
import ProductCard from './ProductCard';
import { gifticonAPI } from '../utils/api';
import { generateQRCode } from '../utils/helpers';
import { logout } from '../utils/auth';

const AvailableGiftsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     Filters (UI)
  ========================= */
  const [titleOptions, setTitleOptions] = useState([]);
  const [descOptions, setDescOptions] = useState([]);
  const [titleFilter, setTitleFilter] = useState('all');
  const [descFilter, setDescFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [search, setSearch] = useState('');

  /* =========================
     Purchase Flow State
  ========================= */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [isPaying, setIsPaying] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  /* =========================
     Load Gifts
  ========================= */
  useEffect(() => {
    loadAvailableGifts();
  }, []);

  const loadAvailableGifts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gifticonAPI.getAvailableGifts();
      if (res.data?.code === '200' && Array.isArray(res.data.data)) {
        const gifts = res.data.data.map(g => ({
          id: g.giftTemplateId,
          name: g.title || 'No Title',
          description: g.description || 'No Description',
          price: Number(g.price) || 0,
          image: g.image || '',
        }));
        setProducts(gifts);
        setTitleOptions([...new Set(gifts.map(g => g.name))].sort());
        setDescOptions([...new Set(gifts.map(g => g.description))].sort());
      } else {
        setProducts([]);
        setTitleOptions([]);
        setDescOptions([]);
      }
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? 'Session expired. Please log in again.'
          : 'Failed to load gifts. Please try again later.';
      setError(msg);
      if (err.response?.status === 403) {
        setTimeout(() => logout(), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Filtering Logic
  ========================= */
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesTitle = titleFilter === 'all' || p.name === titleFilter;
      const matchesDesc = descFilter === 'all' || p.description === descFilter;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === '<20' && p.price < 20) ||
        (priceFilter === '20-50' && p.price >= 20 && p.price <= 50) ||
        (priceFilter === '>50' && p.price > 50);
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesTitle && matchesDesc && matchesPrice && matchesSearch;
    });
  }, [products, titleFilter, descFilter, priceFilter, search]);

  /* =========================
     Purchase Flow
  ========================= */
  const startPurchase = product => {
    setSelectedProduct(product);
    setPaymentMethod(null);
    setShowPaymentModal(true);
  };

  const proceedToReceipt = () => {
    if (!paymentMethod) return;
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct || !paymentMethod) return;

    setIsPaying(true);
    try {
      await gifticonAPI.purchaseGift(selectedProduct.id);

      if (paymentMethod === 'paynow') {
        const qr = generateQRCode(`PAYNOW-${selectedProduct.id}-${Date.now()}`);
        setQrCode(qr);
      }

      setShowReceiptModal(false);
      setSelectedProduct(null);
      setPaymentMethod(null);
      setQrCode(null);

      alert('Purchase successful!');
    } catch {
      alert('Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <>
      {/* FILTERS */}
      <div className="bg-brand-cardLight border border-brand-brown/20 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-4 gap-4 shadow-sm">
        <div>
          <label className="block text-sm text-brand-textPrimary mb-1">Title</label>
          <input
            list="titles"
            value={titleFilter === 'all' ? '' : titleFilter}
            onChange={e => setTitleFilter(e.target.value || 'all')}
            placeholder="Filter by title..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          />
          <datalist id="titles">
            {titleOptions.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm text-brand-textPrimary mb-1">Description</label>
          <input
            list="descriptions"
            value={descFilter === 'all' ? '' : descFilter}
            onChange={e => setDescFilter(e.target.value || 'all')}
            placeholder="Filter by description..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          />
          <datalist id="descriptions">
            {descOptions.map(d => <option key={d} value={d} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm text-brand-textPrimary mb-1">Price</label>
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          >
            <option value="all">All</option>
            <option value="<20">Below S$20</option>
            <option value="20-50">S$20 - S$50</option>
            <option value=">50">Above S$50</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-brand-textPrimary mb-1">Search</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
          />
        </div>
      </div>

      {/* PRODUCT LIST */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-brand-textSecondary py-12">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 desktop:grid-cols-5 gap-4 mb-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onPurchase={startPurchase} />
          ))}
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setShowPaymentModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Purchase {selectedProduct.name}</h2>

            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`w-full py-2 rounded-lg border ${paymentMethod === 'credit' ? 'border-brand-orange bg-brand-orange/10' : ''}`}
              >
                <CreditCard className="inline w-4 h-4 mr-2" /> Credit/Debit Card
              </button>
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full py-2 rounded-lg border ${paymentMethod === 'wallet' ? 'border-brand-orange bg-brand-orange/10' : ''}`}
              >
                <Wallet className="inline w-4 h-4 mr-2" /> Wallet / eWallet
              </button>
              <button
                onClick={() => setPaymentMethod('paynow')}
                className={`w-full py-2 rounded-lg border ${paymentMethod === 'paynow' ? 'border-brand-orange bg-brand-orange/10' : ''}`}
              >
                PayNow / QR
              </button>
            </div>

            {/* Dynamic Payment Forms */}
            {paymentMethod === 'credit' && (
              <div className="mt-4 space-y-3">
                <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border rounded-lg"/>
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-2 border rounded-lg"/>
                  <input type="text" placeholder="CVV" className="w-1/2 px-3 py-2 border rounded-lg"/>
                </div>
                <input type="text" placeholder="Cardholder Name" className="w-full px-3 py-2 border rounded-lg"/>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="mt-4 space-y-3">
                <input type="text" placeholder="Wallet ID / Mobile" className="w-full px-3 py-2 border rounded-lg"/>
                <input type="text" placeholder="OTP (if required)" className="w-full px-3 py-2 border rounded-lg"/>
              </div>
            )}

            {paymentMethod === 'paynow' && (
              <div className="mt-4 text-center">
                <p className="mb-2">Scan this QR to pay via PayNow:</p>
                <img
                  src={generateQRCode(`PAYNOW-${selectedProduct.id}-${Date.now()}`)}
                  alt="PayNow QR"
                  className="mx-auto w-40 h-40"
                />
              </div>
            )}

            <button
              onClick={proceedToReceipt}
              disabled={!paymentMethod}
              className="mt-4 w-full py-3 bg-brand-orange text-white font-bold rounded-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 text-center relative">
            <button className="absolute top-3 right-3" onClick={() => setShowReceiptModal(false)}>
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">Confirm Purchase</h2>
            <p className="mb-1"><strong>{selectedProduct.name}</strong></p>
            <p className="mb-1">Price: S${selectedProduct.price}</p>
            <p className="mb-1">Payment: {paymentMethod}</p>

            {paymentMethod === 'paynow' && qrCode && (
              <img src={qrCode} alt="PayNow QR" className="mx-auto w-40 h-40 mt-3"/>
            )}

            <button
              onClick={confirmPurchase}
              disabled={isPaying}
              className="w-full py-3 bg-brand-orange text-white font-bold rounded-lg mt-4"
            >
              {isPaying ? 'Processing…' : 'Buy Now'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableGiftsTab;
