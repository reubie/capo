import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, Wallet } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import ProductCard from './ProductCard';
import { gifticonAPI } from '../utils/api';
import { generateQRCode } from '../utils/helpers';

const AvailableGiftsTab = () => {
  /* =========================
     State
  ========================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [titleOptions, setTitleOptions] = useState([]);
  const [descOptions, setDescOptions] = useState([]);

  const [titleFilter, setTitleFilter] = useState('all');
  const [descFilter, setDescFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Purchase & share
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  /* =========================
     Load Gifts
  ========================= */
  useEffect(() => {
    fetchAvailableGifts();
  }, []);

  const fetchAvailableGifts = async () => {
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
          image: '',
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
      if (err.response?.status !== 403) {
        console.error('Failed to load gifts:', err);
        setError('Failed to load gifts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Filtering
  ========================= */
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesTitle =
        titleFilter === 'all' || p.name === titleFilter;

      const matchesDesc =
        descFilter === 'all' || p.description === descFilter;

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
     Purchase Flow (Mock)
  ========================= */
  const startPurchase = product => {
    setSelectedProduct(product);
    setPaymentMethod(null);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!paymentMethod || !selectedProduct) return;

    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setShowPaymentModal(false);

      const qr = generateQRCode(`ORDER-${selectedProduct.id}-${Date.now()}`);
      setQrCode(qr);
      setShowShareModal(true);
    }, 1200);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedProduct(null);
    setQrCode(null);
  };

  /* =========================
     Share Actions
  ========================= */
  const shareToWhatsApp = () => {
    if (!selectedProduct) return;
    const msg = `I just purchased ${selectedProduct.name} via Show you care!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!selectedProduct) return;
    const msg = `I just purchased ${selectedProduct.name} via Show you care!`;
    window.location.href = `sms:&body=${encodeURIComponent(msg)}`;
  };

  /* =========================
     Render
  ========================= */
  return (
    <>
      {/* Filters */}
      <div className="bg-brand-cardLight border border-brand-brown/20 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
        {/* Title Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-brand-textSecondary mb-1">Title</label>
          <Listbox value={titleFilter} onChange={setTitleFilter}>
            <div className="relative">
              <Listbox.Button className="border border-brand-brown/30 rounded-lg px-3 py-2 w-full text-left text-sm text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                {titleFilter === 'all' ? 'All Titles' : titleFilter}
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full bg-white border border-brand-brown/30 rounded-lg shadow-lg z-50 max-h-60 overflow-auto text-sm">
                <Listbox.Option key="all" value="all" className="cursor-pointer px-3 py-2 hover:bg-brand-orange/10">
                  All Titles
                </Listbox.Option>
                {titleOptions.map(t => (
                  <Listbox.Option key={t} value={t} className="cursor-pointer px-3 py-2 hover:bg-brand-orange/10">
                    {t}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {/* Description Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-brand-textSecondary mb-1">Description</label>
          <Listbox value={descFilter} onChange={setDescFilter}>
            <div className="relative">
              <Listbox.Button className="border border-brand-brown/30 rounded-lg px-3 py-2 w-full text-left text-sm text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
                {descFilter === 'all' ? 'All Descriptions' : descFilter}
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full bg-white border border-brand-brown/30 rounded-lg shadow-lg z-50 max-h-60 overflow-auto text-sm">
                <Listbox.Option key="all" value="all" className="cursor-pointer px-3 py-2 hover:bg-brand-orange/10">
                  All Descriptions
                </Listbox.Option>
                {descOptions.map(d => (
                  <Listbox.Option key={d} value={d} className="cursor-pointer px-3 py-2 hover:bg-brand-orange/10">
                    {d}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-brand-textSecondary mb-1">Price</label>
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="border border-brand-brown/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-sm text-brand-brown"
          >
            <option value="all">All Prices</option>
            <option value="<20">Below S$20</option>
            <option value="20-50">S$20 - S$50</option>
            <option value=">50">Above S$50</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-brand-textSecondary mb-1">Search</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="border border-brand-brown/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-sm text-brand-brown"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">Loading products…</div>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-brand-textSecondary py-12">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} onPurchase={startPurchase} />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <div className="modal">
          <div className="modal-card">
            <button onClick={() => setShowPaymentModal(false)} className="modal-close">
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Purchase {selectedProduct.name}
            </h2>

            <button onClick={() => setPaymentMethod('credit')} className="pay-btn">
              <CreditCard /> Credit Card
            </button>

            <button onClick={() => setPaymentMethod('wallet')} className="pay-btn">
              <Wallet /> Wallet
            </button>

            <button
              onClick={confirmPayment}
              disabled={!paymentMethod || isPaying}
              className="confirm-btn"
            >
              {isPaying ? 'Processing…' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedProduct && (
        <div className="modal">
          <div className="modal-card">
            <button onClick={closeShareModal} className="modal-close">
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">Share</h2>

            {qrCode && <img src={qrCode} alt="QR" className="mx-auto mb-4 w-40" />}

            <button onClick={shareToWhatsApp} className="share-btn whatsapp">
              Share via WhatsApp
            </button>
            <button onClick={shareViaSMS} className="share-btn sms">
              Share via SMS
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableGiftsTab;
