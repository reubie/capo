import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Search, Filter, Plus, Upload, X, Grid3x3, List, Building2, Mail, Phone, Calendar } from 'lucide-react';
import CardPreview from '../components/CardPreview';
import { networkAPI } from '../utils/api';

const Network = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'date', 'name', 'company'
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadCards();
    document.title = 'Show you care - Network';
  }, []);

  useEffect(() => {
    filterCards();
  }, [searchQuery, filterBy, cards]);

  const loadCards = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await networkAPI.getCards();
      // setCards(response.data);
      
      // Mock data with images
      const mockCards = [
        {
          id: 1,
          name: 'John Doe',
          company: 'Tech Corp',
          email: 'john@techcorp.com',
          phone: '010-1234-5678',
          date: new Date().toISOString(),
          image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop',
        },
        {
          id: 2,
          name: 'Jane Smith',
          company: 'Design Studio',
          email: 'jane@designstudio.com',
          phone: '010-9876-5432',
          date: new Date(Date.now() - 86400000).toISOString(),
          image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=200&fit=crop',
        },
        {
          id: 3,
          name: 'Michael Chen',
          company: 'Global Solutions',
          email: 'michael@globalsolutions.com',
          phone: '010-5555-1234',
          date: new Date(Date.now() - 172800000).toISOString(),
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop',
        },
        {
          id: 4,
          name: 'Sarah Kim',
          company: 'Creative Agency',
          email: 'sarah@creative.com',
          phone: '010-7777-8888',
          date: new Date(Date.now() - 259200000).toISOString(),
          image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&h=200&fit=crop',
        },
        {
          id: 5,
          name: 'David Park',
          company: 'Innovation Labs',
          email: 'david@innovation.com',
          phone: '010-2222-3333',
          date: new Date(Date.now() - 345600000).toISOString(),
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
        },
        {
          id: 6,
          name: 'Lisa Wong',
          company: 'Digital Marketing',
          email: 'lisa@digitalmarketing.com',
          phone: '010-4444-5555',
          date: new Date(Date.now() - 432000000).toISOString(),
          image: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=300&h=200&fit=crop',
        },
      ];
      setCards(mockCards);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load cards:', error);
      setLoading(false);
    }
  };

  const filterCards = () => {
    let filtered = [...cards];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.name?.toLowerCase().includes(query) ||
          card.company?.toLowerCase().includes(query) ||
          card.email?.toLowerCase().includes(query) ||
          card.phone?.includes(query)
      );
    }

    // Apply filter
    if (filterBy === 'date') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filterBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (filterBy === 'company') {
      filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    }

    setFilteredCards(filtered);
  };

  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCard = async () => {
    if (!cardImage) {
      alert('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('card', cardImage);
      
      // TODO: Replace with actual API call
      // const response = await networkAPI.addCard(formData);
      // setCards(prev => [response.data, ...prev]);
      
      console.log('Uploading business card');
      
      // Simulate API call
      setTimeout(() => {
        const newCard = {
          id: Date.now(),
          name: 'New Contact',
          company: 'Company Name',
          email: 'email@example.com',
          phone: '010-0000-0000',
          date: new Date().toISOString(),
          image: cardPreview,
        };
        setCards(prev => [newCard, ...prev]);
        setCardImage(null);
        setCardPreview(null);
        setShowUploadModal(false);
        setUploading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to upload card:', error);
      alert('Failed to upload card. Please try again.');
      setUploading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await networkAPI.deleteCard(cardId);
      
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Background Image with subtle overlay */}
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
                Show you <span className="text-yellow-400">care</span> <span className="text-brand-purplePrimary">Network</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/gifticon')}
              className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors flex items-center gap-2"
            >
              <Gift className="w-4 h-4 mr-2" />
              Gifticon
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-brand-cardDark rounded-xl shadow-lg p-4 mb-6 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-textSecondary w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, company, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-textSecondary" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white"
              >
                <option value="all">All</option>
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="company">Sort by Company</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border border-white/10 rounded-lg p-1 bg-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-brand-purplePrimary text-white'
                    : 'text-brand-textSecondary hover:text-white hover:bg-white/10'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-purplePrimary text-white'
                    : 'text-brand-textSecondary hover:text-white hover:bg-white/10'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Card
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purplePrimary"></div>
            <p className="mt-4 text-brand-textSecondary">Loading cards...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-brand-cardDark rounded-xl shadow-lg p-12 text-center border border-white/10">
            <p className="text-brand-textSecondary text-lg mb-4">
              {searchQuery ? 'No cards found matching your search' : 'No business cards yet'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Card
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <CardPreview
                key={card.id}
                card={card}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        ) : (
          <div className="bg-brand-cardDark rounded-xl shadow-lg border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/10">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="flex-shrink-0">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-12 h-12 rounded object-cover border border-white/10"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23111113" width="48" height="48"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-brand-textSecondary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {card.name || 'Unknown'}
                    </h3>
                    {card.company && (
                      <p className="text-sm text-brand-textSecondary truncate">
                        {card.company}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {card.date && (
                      <p className="text-xs text-brand-textSecondary">
                        {new Date(card.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-brand-cardDark rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-white/10">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setCardImage(null);
                setCardPreview(null);
              }}
              className="absolute top-4 right-4 text-brand-textSecondary hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Business Card</h2>
            {cardPreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={cardPreview}
                    alt="Business card preview"
                    className="w-full h-64 object-contain rounded-lg border border-white/10"
                  />
                  <button
                    onClick={() => {
                      setCardImage(null);
                      setCardPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddCard}
                  disabled={uploading}
                  className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing...' : 'Add Card'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCardUpload}
                    className="hidden"
                    id="card-upload-modal"
                  />
                  <label
                    htmlFor="card-upload-modal"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-4 bg-brand-purplePrimary/10 rounded-full">
                      <Upload className="w-8 h-8 text-brand-purplePrimary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Click to upload or take a photo
                      </p>
                      <p className="text-xs text-brand-textSecondary mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Preview Modal (for list view) */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-brand-cardDark rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl border border-white/10">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-brand-textSecondary hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              {selectedCard.image && (
                <div className="flex-shrink-0">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.name}
                    className="w-full md:w-64 h-auto rounded-lg border border-white/10 object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23111113" width="256" height="256"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedCard.name || 'Unknown'}
                </h2>
                {selectedCard.company && (
                  <div className="flex items-center gap-2 text-brand-textSecondary mb-3">
                    <Building2 className="w-5 h-5" />
                    <span>{selectedCard.company}</span>
                  </div>
                )}
                {selectedCard.email && (
                  <div className="flex items-center gap-2 text-brand-textSecondary mb-3">
                    <Mail className="w-5 h-5" />
                    <span>{selectedCard.email}</span>
                  </div>
                )}
                {selectedCard.phone && (
                  <div className="flex items-center gap-2 text-brand-textSecondary mb-3">
                    <Phone className="w-5 h-5" />
                    <span>{selectedCard.phone}</span>
                  </div>
                )}
                {selectedCard.date && (
                  <div className="flex items-center gap-2 text-brand-textSecondary mb-4">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(selectedCard.date).toLocaleDateString()}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    handleDeleteCard(selectedCard.id);
                    setSelectedCard(null);
                  }}
                  className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                >
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
