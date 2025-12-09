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
  const [priceFilter, setPriceFilter] = useState('all'); // all, <20, 20-50, >50
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
    document.title = 'Show you care - Gifticon';
  }, []);

  const loadProducts = async () => {
    try {
      // Mock data with extra attributes (prices in SGD)
      setProducts([
        { id: 1, name: 'Starbucks Gift Card S$50', price: 50, merchant: 'Starbucks', occasion: 'Thank You', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop' },
        { id: 2, name: 'CGV Movie Ticket', price: 15, merchant: 'CGV', occasion: 'Congrats', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop' },
        { id: 3, name: 'Coupang Gift Card S$100', price: 100, merchant: 'Coupang', occasion: 'Holiday', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop' },
        { id: 4, name: 'Olive Young Gift Card S$30', price: 30, merchant: 'Olive Young', occasion: 'Birthday', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop' },
        { id: 5, name: 'GS25 Convenience Store Card', price: 20, merchant: 'GS25', occasion: 'Anniversary', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
        { id: 6, name: 'Emart Gift Card S$50', price: 50, merchant: 'Emart', occasion: 'Holiday', image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=400&fit=crop' },
        { id: 7, name: 'Lotte Department Store S$80', price: 80, merchant: 'Lotte', occasion: 'Thank You', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop' },
        { id: 8, name: 'Shinsegae Gift Card S$60', price: 60, merchant: 'Shinsegae', occasion: 'Congrats', image: 'https://images.unsplash.com/photo-1555529908-3a8c9c4e0d4a?w=400&h=400&fit=crop' },
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
        (priceFilter === '<20' && p.price < 20) ||
        (priceFilter === '20-50' && p.price >= 20 && p.price <= 50) ||
        (priceFilter === '>50' && p.price > 50);
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
    const message = `I just purchased ${selectedProduct.name} via Show you care!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!selectedProduct) return;
    const message = `I just purchased ${selectedProduct.name} via Show you care!`;
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
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />

      {/* Header */}
      <div className="relative bg-brand-background/95 backdrop-blur-sm shadow-md sticky top-0 z-40 border-b border-brand-brown/20">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 tablet:px-6 laptop:px-8 desktop:px-12 py-2 xs:py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 xs:gap-3 sm:gap-4">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-brand-textSecondary hover:text-brand-brown transition-colors font-medium flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />
                <span className="hidden sm:inline text-xs xs:text-sm">Back</span>
              </button>
              <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl tablet:text-2xl laptop:text-3xl font-bold text-brand-orange truncate min-w-0">
                Gifticon
              </h1>
            </div>
            <button
              onClick={() => navigate('/network')}
              className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center gap-1 xs:gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <Network className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="hidden xs:inline">Network</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 py-4 xs:py-6 tablet:py-8">
        {/* Filters */}
        <div className="bg-brand-cardLight border border-brand-brown/20 rounded-xl p-3 xs:p-4 mb-4 xs:mb-6 grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-4 gap-3 xs:gap-4 shadow-sm">
          <div>
            <label className="block text-sm text-brand-textPrimary mb-1">Merchant</label>
            <select value={merchantFilter} onChange={(e)=>setMerchantFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
              <option value="all">All</option>
              {merchants.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textPrimary mb-1">Occasion</label>
            <select value={occasionFilter} onChange={(e)=>setOccasionFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
              <option value="all">All</option>
              {occasions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textPrimary mb-1">Price</label>
            <select value={priceFilter} onChange={(e)=>setPriceFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/50">
              <option value="all">All</option>
              <option value="<20">Below S$20</option>
              <option value="20-50">S$20 - S$50</option>
              <option value=">50">Above S$50</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-textPrimary mb-1">Search</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products..." className="w-full px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            <p className="mt-4 text-brand-textSecondary">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 desktop:grid-cols-5 desktop-lg:grid-cols-6 desktop-xl:grid-cols-7 desktop-2xl:grid-cols-8 gap-4 xs:gap-5 sm:gap-6 mb-8 xs:mb-12">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 xs:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-cardLight rounded-xl xs:rounded-2xl p-4 xs:p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-brand-brown/20 my-4">
            <button onClick={()=>setShowPaymentModal(false)} className="absolute top-3 xs:top-4 right-3 xs:right-4 text-brand-textSecondary hover:text-brand-brown transition-colors z-10">
              <X className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-brand-brown mb-1 pr-8 xs:pr-10">Checkout</h3>
            <p className="text-xs xs:text-sm text-brand-textSecondary mb-4 xs:mb-6 truncate pr-8 xs:pr-10">{selectedProduct.name}</p>
            <div className="space-y-3">
              <button onClick={()=>setPaymentMethod('paynow')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='paynow'?'border-brand-orange bg-brand-orange/10':'border-brand-brown/20 bg-white'} text-brand-brown`}>
                <Wallet className="w-5 h-5" /> PayNow
              </button>
              <button onClick={()=>setPaymentMethod('card')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='card'?'border-brand-orange bg-brand-orange/10':'border-brand-brown/20 bg-white'} text-brand-brown`}>
                <CreditCard className="w-5 h-5" /> Credit Card
              </button>
              <button onClick={()=>setPaymentMethod('wechat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${paymentMethod==='wechat'?'border-brand-orange bg-brand-orange/10':'border-brand-brown/20 bg-white'} text-brand-brown`}>
                <Bot className="w-5 h-5" /> WeChat Pay
              </button>
            </div>
            <button onClick={confirmPayment} disabled={!paymentMethod || isPaying} className="mt-6 w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight transition-colors disabled:opacity-50">
              {isPaying ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 xs:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-cardLight rounded-xl xs:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-brand-brown/20 my-4">
            {/* Fixed Header */}
            <div className="relative p-4 xs:p-6 sm:p-8 pb-3 xs:pb-4 flex-shrink-0 border-b border-brand-brown/20">
              <button onClick={closeShare} className="absolute top-3 xs:top-4 right-3 xs:right-4 text-brand-textSecondary hover:text-brand-brown transition-colors z-10">
                <X className="w-5 h-5 xs:w-6 xs:h-6" />
              </button>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-brand-brown mb-1 pr-8 xs:pr-10">Share your Gifticon</h3>
              <p className="text-xs xs:text-sm text-brand-textSecondary truncate pr-8 xs:pr-10">{selectedProduct.name}</p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 xs:p-6 sm:p-8 pt-4 xs:pt-6">
              <div className="space-y-6">
                {/* Select name card */}
                <div className="bg-white rounded-lg p-4 border border-brand-brown/20">
                  <div className="flex items-center gap-2 mb-3 text-brand-brown">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Send to Contact in Network</span>
                  </div>
                  <input value={contactQuery} onChange={(e)=>setContactQuery(e.target.value)} placeholder="Search name card..." className="w-full mb-3 px-3 py-2 rounded-lg bg-white border border-brand-brown/20 text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                  <div className="max-h-40 overflow-auto space-y-2">
                    {contactMatches.map(c => (
                      <button key={c.id} onClick={()=>alert(`Shared with ${c.name}`)} className="w-full text-left px-3 py-2 rounded-lg bg-brand-background hover:bg-brand-backgroundAlt text-brand-brown border border-brand-brown/20">
                        {c.name} <span className="text-brand-textSecondary">({c.phone})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other channels */}
                <div className="bg-white rounded-lg p-4 border border-brand-brown/20">
                  <div className="flex items-center gap-2 mb-3 text-brand-brown">
                    <Share2 className="w-5 h-5" />
                    <span className="font-semibold">Share via</span>
                  </div>
                  <div className="space-y-2">
                    <button onClick={shareToWhatsApp} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-background hover:bg-brand-backgroundAlt text-brand-brown border border-brand-brown/20">
                      <MessageSquare className="w-5 h-5" /> WhatsApp
                    </button>
                    <button onClick={shareViaSMS} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-background hover:bg-brand-backgroundAlt text-brand-brown border border-brand-brown/20">
                      <Phone className="w-5 h-5" /> SMS / Text
                    </button>
                    <button onClick={shareViaWeChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-background hover:bg-brand-backgroundAlt text-brand-brown border border-brand-brown/20">
                      <Bot className="w-5 h-5" /> WeChat
                    </button>
                  </div>
                </div>

                {/* QR for reference */}
                <div className="text-center">
                  <div className="inline-block bg-white p-3 rounded-lg border border-brand-brown/20">
                    <img src={qrCode} alt="QR" className="w-40 h-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gifticon;
