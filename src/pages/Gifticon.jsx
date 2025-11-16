import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, QrCode, Share2, X, CreditCard, Wallet, MessageSquare, Users, Phone, Bot } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { generateQRCode } from '../utils/helpers';

const merchants = ['Starbucks', 'CGV', 'Coupang', 'Olive Young', 'GS25', 'Emart', 'Lotte', 'Shinsegae'];
const occasions = ['Birthday', 'Anniversary', 'Thank You', 'Congrats', 'Holiday'];

const mockContacts = [
  { id: 1, name: 'John Doe', phone: '+821012345678' },
  { id: 2, name: 'Jane Smith', phone: '+821098765432' },
  { id: 3, name: 'Michael Chen', phone: '+821055551234' },
  { id: 4, name: 'Sarah Kim', phone: '+821077778888' },
];

const Gifticon = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all'); // all, <20000, 20000-50000, >50000
  const [search, setSearch] = useState('');

  // Purchase and payment flow
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // paynow | card | wechat
  const [isPaying, setIsPaying] = useState(false);

  // Share flow
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [contactQuery, setContactQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Mock data with extra attributes
      setProducts([
        { id: 1, name: 'Starbucks Gift Card ₩50,000', price: 50000, merchant: 'Starbucks', occasion: 'Thank You', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop' },
        { id: 2, name: 'CGV Movie Ticket', price: 15000, merchant: 'CGV', occasion: 'Congrats', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop' },
        { id: 3, name: 'Coupang Gift Card ₩100,000', price: 100000, merchant: 'Coupang', occasion: 'Holiday', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop' },
        { id: 4, name: 'Olive Young Gift Card ₩30,000', price: 30000, merchant: 'Olive Young', occasion: 'Birthday', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop' },
        { id: 5, name: 'GS25 Convenience Store Card', price: 20000, merchant: 'GS25', occasion: 'Anniversary', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
        { id: 6, name: 'Emart Gift Card ₩50,000', price: 50000, merchant: 'Emart', occasion: 'Holiday', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=400&fit=crop' },
        { id: 7, name: 'Lotte Department Store ₩80,000', price: 80000, merchant: 'Lotte', occasion: 'Thank You', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop' },
        { id: 8, name: 'Shinsegae Gift Card ₩60,000', price: 60000, merchant: 'Shinsegae', occasion: 'Congrats', image: 'https://images.unsplash.com/photo-1555529908-3a8c9c4e0d4a?w=400&h=400&fit=crop' },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const byMerchant = merchantFilter === 'all' || p.merchant === merchantFilter;
      const byOccasion = occasionFilter === 'all' || p.occasion === occasionFilter;
      const byPrice =
        priceFilter === 'all' ||
        (priceFilter === '<20000' && p.price < 20000) ||
        (priceFilter === '20000-50000' && p.price >= 20000 && p.price <= 50000) ||
        (priceFilter === '>50000' && p.price > 50000);
      const bySearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return byMerchant && byOccasion && byPrice && bySearch;
    });
  }, [products, merchantFilter, occasionFilter, priceFilter, search]);

  const startPurchase = (product) => {
    setSelectedProduct(product);
    setPaymentMethod(null);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!paymentMethod) return;
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setShowPaymentModal(false);
      // generate QR and open share
      const qr = generateQRCode(`ORDER-${selectedProduct.id}-${Date.now()}`);
      setQrCode(qr);
      setShowShareModal(true);
    }, 1200);
  };

  const closeShare = () => {
    setShowShareModal(false);
    setSelectedProduct(null);
    setQrCode(null);
  };

  const shareToWhatsApp = () => {
    if (!selectedProduct) return;
    const message = `I just purchased ${selectedProduct.name} via Capo!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!selectedProduct) return;
    const message = `I just purchased ${selectedProduct.name} via Capo!`;
    window.location.href = `sms:&body=${encodeURIComponent(message)}`;
  };

  const shareViaWeChat = () => {
    alert('WeChat share will be integrated later.');
  };

  const contactMatches = useMemo(() => {
    if (!contactQuery) return mockContacts;
    return mockContacts.filter(c => c.name.toLowerCase().includes(contactQuery.toLowerCase()));
  }, [contactQuery]);

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />

      {/* Header */}
      <div className="relative bg-brand-background/80 backdrop-blur-sm shadow-md sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-brand-textSecondary hover:text-white transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
              <h1 className="text-2xl font-bold text-white">
                Capo <span className="text-brand-purplePrimary">Gifticon</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/network')}
              className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              Network
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-brand-cardDark border border-white/10 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-brand-textSecondary mb-1">Merchant</label>
            <select value={merchantFilter} onChange={(e)=>setMerchantFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
              <option value="all">All</option>
              {merchants.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textSecondary mb-1">Occasion</label>
            <select value={occasionFilter} onChange={(e)=>setOccasionFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
              <option value="all">All</option>
              {occasions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textSecondary mb-1">Price</label>
            <select value={priceFilter} onChange={(e)=>setPriceFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
              <option value="all">All</option>
              <option value="<20000">Below ₩20,000</option>
              <option value="20000-50000">₩20,000 - ₩50,000</option>
              <option value=">50000">Above ₩50,000</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textSecondary mb-1">Search</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-brand-textSecondary" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purplePrimary"></div>
            <p className="mt-4 text-brand-textSecondary">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPurchase={startPurchase}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-brand-cardDark rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-white/10">
            <button onClick={()=>setShowPaymentModal(false)} className="absolute top-4 right-4 text-brand-textSecondary hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-1">Checkout</h3>
            <p className="text-brand-textSecondary mb-6">{selectedProduct.name}</p>
            <div className="space-y-3">
              <button onClick={()=>setPaymentMethod('paynow')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='paynow'?'border-brand-purplePrimary bg-white/10':'border-white/10 bg-white/5'} text-white`}>
                <Wallet className="w-5 h-5" /> PayNow
              </button>
              <button onClick={()=>setPaymentMethod('card')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='card'?'border-brand-purplePrimary bg-white/10':'border-white/10 bg-white/5'} text-white`}>
                <CreditCard className="w-5 h-5" /> Credit Card
              </button>
              <button onClick={()=>setPaymentMethod('wechat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='wechat'?'border-brand-purplePrimary bg-white/10':'border-white/10 bg-white/5'} text-white`}>
                <Bot className="w-5 h-5" /> WeChat Pay
              </button>
            </div>
            <button onClick={confirmPayment} disabled={!paymentMethod || isPaying} className="mt-6 w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50">
              {isPaying ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-brand-cardDark rounded-2xl p-8 max-w-lg w-full relative shadow-2xl border border-white/10">
            <button onClick={closeShare} className="absolute top-4 right-4 text-brand-textSecondary hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-1">Share your Gifticon</h3>
            <p className="text-brand-textSecondary mb-6">{selectedProduct.name}</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Select name card */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3 text-white">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Send to Contact</span>
                </div>
                <input value={contactQuery} onChange={(e)=>setContactQuery(e.target.value)} placeholder="Search name card..." className="w-full mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-brand-textSecondary" />
                <div className="max-h-40 overflow-auto space-y-2">
                  {contactMatches.map(c => (
                    <button key={c.id} onClick={()=>alert(`Shared with ${c.name}`)} className="w-full text-left px-3 py-2 rounded-lg bg-white/0 hover:bg-white/10 text-white border border-white/10">
                      {c.name} <span className="text-brand-textSecondary">({c.phone})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other channels */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3 text-white">
                  <Share2 className="w-5 h-5" />
                  <span className="font-semibold">Share via</span>
                </div>
                <div className="space-y-2">
                  <button onClick={shareToWhatsApp} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/0 hover:bg-white/10 text-white border border-white/10">
                    <MessageSquare className="w-5 h-5" /> WhatsApp
                  </button>
                  <button onClick={shareViaSMS} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/0 hover:bg-white/10 text-white border border-white/10">
                    <Phone className="w-5 h-5" /> SMS / Text
                  </button>
                  <button onClick={shareViaWeChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/0 hover:bg-white/10 text-white border border-white/10">
                    <Bot className="w-5 h-5" /> WeChat
                  </button>
                </div>
              </div>
            </div>

            {/* QR for reference */}
            <div className="mt-6 text-center">
              <div className="inline-block bg-white/5 p-3 rounded-lg border border-white/10">
                <img src={qrCode} alt="QR" className="w-40 h-40" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gifticon;
