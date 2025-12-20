import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { gifticonAPI } from '../utils/api';

const PurchasedGiftsTab = () => {
  const [myGifts, setMyGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPurchasedGifts();
  }, []);

  const loadPurchasedGifts = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await gifticonAPI.getPurchasedGifts();

      if (res.data?.code === '200' && Array.isArray(res.data.data)) {
        setMyGifts(
          res.data.data.map((g) => ({
            id: g.giftId,
            name: g.title || 'No Title',
            description: g.description || 'No Description',
            price: g.price || 0,
            image: '',
          }))
        );
      } else {
        setMyGifts([]);
      }
    } catch (err) {
      /**
       * Let interceptor handle 401 / 403
       */
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError('Failed to load your gifts.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center py-12">Loading your gifts...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-12">{error}</p>;
  }

  if (myGifts.length === 0) {
    return <p className="text-center py-12">You have not purchased any gifts yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-6">
      {myGifts.map((gift) => (
        <ProductCard key={gift.id} product={gift} />
      ))}
    </div>
  );
};

export default PurchasedGiftsTab;
