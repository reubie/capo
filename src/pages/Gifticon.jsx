import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, QrCode, Share2, X } from 'lucide-react';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { gifticonAPI } from '../utils/api';
import { generateQRCode } from '../utils/helpers';

const Gifticon = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedProduct, setPurchasedProduct] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    loadProducts();
    loadPurchaseHistory();
  }, []);

  const loadProducts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await gifticonAPI.getProducts();
      // setProducts(response.data);
      
      // Mock data with images
      setProducts([
        { 
          id: 1, 
          name: 'Starbucks Gift Card ₩50,000', 
          price: 50000, 
          image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop'
        },
        { 
          id: 2, 
          name: 'CGV Movie Ticket', 
          price: 15000, 
          image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop'
        },
        { 
          id: 3, 
          name: 'Coupang Gift Card ₩100,000', 
          price: 100000, 
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop'
        },
        { 
          id: 4, 
          name: 'Olive Young Gift Card ₩30,000', 
          price: 30000, 
          image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop'
        },
        { 
          id: 5, 
          name: 'GS25 Convenience Store Card', 
          price: 20000, 
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
        },
        { 
          id: 6, 
          name: 'Emart Gift Card ₩50,000', 
          price: 50000, 
          image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=400&fit=crop'
        },
        { 
          id: 7, 
          name: 'Lotte Department Store ₩80,000', 
          price: 80000, 
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
        },
        { 
          id: 8, 
          name: 'Shinsegae Gift Card ₩60,000', 
          price: 60000, 
          image: 'https://images.unsplash.com/photo-1555529908-3a8c9c4e0d4a?w=400&h=400&fit=crop'
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await gifticonAPI.getPurchaseHistory();
      // setPurchaseHistory(response.data);
      
      // Mock data
      setPurchaseHistory([
        { id: 1, productName: 'Starbucks Gift Card', price: 50000, date: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    }
  };

  const handlePurchase = async (product) => {
    try {
      // TODO: Replace with actual API call
      // const response = await gifticonAPI.purchase(product.id);
      // const qrData = response.data.qrCode;
      
      console.log('Purchasing product:', product.id);
      
      // Generate QR code
      const qrData = generateQRCode(`GIFTCON-${product.id}-${Date.now()}`);
      setQrCode(qrData);
      setPurchasedProduct(product);
      
      // Add to purchase history
      setPurchaseHistory(prev => [
        {
          id: Date.now(),
          productName: product.name,
          price: product.price,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    if (purchasedProduct && qrCode) {
      const message = `I just purchased ${purchasedProduct.name} from Capo 靠谱!`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handleCloseQR = () => {
    setPurchasedProduct(null);
    setQrCode(null);
  };

  return (
    <div className="min-h-screen bg-[#F5E6D3]">
      {/* Background Image with subtle overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />
      
      {/* Header */}
      <div className="relative bg-[#F5E6D3]/95 backdrop-blur-sm shadow-md sticky top-0 z-40 border-b border-[#8B4513]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[#8B4513] hover:text-[#A0522D] transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
              <h1 className="text-2xl font-bold text-[#8B4513]">
                Capo <span className="text-[#5C4033]">Gifticon</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/network')}
              className="px-4 py-2 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              Network
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
            <p className="mt-4 text-[#8B4513]/70">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>

            {/* Purchase History */}
            <div className="bg-[#F5E6D3] rounded-xl shadow-lg p-6 border border-[#8B4513]/20">
              <h2 className="text-xl font-bold text-[#8B4513] mb-4">Purchase History</h2>
              {purchaseHistory.length === 0 ? (
                <p className="text-[#8B4513]/60 text-center py-8">No purchase history yet</p>
              ) : (
                <div className="space-y-3">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors border border-[#8B4513]/10"
                    >
                      <div>
                        <p className="font-medium text-[#8B4513]">{purchase.productName}</p>
                        <p className="text-sm text-[#8B4513]/60">
                          {new Date(purchase.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-[#8B4513]">
                        ₩{purchase.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {purchasedProduct && qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#F5E6D3] rounded-2xl p-8 max-w-md w-full relative shadow-2xl border-2 border-[#8B4513]/30">
            <button
              onClick={handleCloseQR}
              className="absolute top-4 right-4 text-[#8B4513] hover:text-[#A0522D] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <QrCode className="w-16 h-16 text-[#8B4513] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#8B4513] mb-2">Purchase Successful!</h3>
              <p className="text-[#8B4513]/70 mb-6">{purchasedProduct.name}</p>
              <div className="bg-white p-4 rounded-lg border-2 border-[#8B4513]/30 mb-6 inline-block">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-3 bg-[#8B4513] text-white font-bold rounded-lg hover:bg-[#A0522D] transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gifticon;
