import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Home, Gift, Search, Filter, Plus, X, Grid3x3, List, Building2, Mail, Phone, MapPin, Briefcase, Calendar, Linkedin, User } from 'lucide-react';
import { networkAPI } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import { normalizePhoneNumber } from '../utils/helpers';
import AddCardModal from '../components/AddCardModal';
import ConfirmModal from '../components/ConfirmModal';
import ErrorModal from '../components/ErrorModal';

const CardGrid = ({ cards, onSelect, onDelete }) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {cards.map(card => (
      <div key={card.id} className="relative bg-white rounded-lg border border-brand-brown/20 p-2" onClick={() => onSelect(card)}>
        {card.cardImageUrl && (
          <div className="w-full h-48 flex items-center justify-center bg-white rounded overflow-hidden">
            <img 
              src={card.cardImageUrl} 
              alt={card.cardOwnerName || 'Card'} 
              className="max-w-full max-h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button onClick={e => { e.stopPropagation(); onDelete(card.id); }} className="text-red-500 hover:text-red-400 transition-colors bg-white/90 rounded-full p-1 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const CardList = ({ cards, onSelect, onDelete }) => (
  <div className="bg-brand-cardLight rounded-xl shadow-lg border border-brand-brown/20 overflow-hidden">
    <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_1fr_80px] gap-3 p-3 border-b border-brand-brown/20 text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
      <div>Name</div><div>Company</div><div>Position</div><div>Phone</div><div>Email</div><div></div>
    </div>
    <div className="divide-y divide-brand-brown/20">
      {cards.map((card, index) => (
        <div key={card.id || `card-${index}`} onClick={() => onSelect(card)} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_80px] gap-3 p-3 hover:bg-brand-backgroundAlt cursor-pointer group items-center">
          <div className="min-w-0 font-semibold text-brand-brown truncate">{card.cardOwnerName || 'Unknown'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.companyName || '-'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.position || '-'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">
            {card.mobile 
              ? normalizePhoneNumber(card.mobile) 
              : card.phone 
                ? normalizePhoneNumber(card.phone) 
                : '-'}
          </div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.email || '-'}</div>
          <div className="flex justify-end">
            <button onClick={e => { e.stopPropagation(); onDelete(card.id); }} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);


const Network = () => {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { from: '/network' } });
  }, [navigate]);

  useEffect(() => {
    document.title = 'Show you care - Network';
    loadCards();
  }, []);

  useEffect(() => applyFilters(), [cards, searchQuery, filterBy]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await networkAPI.getCards();
      const cardsData = response?.data?.data || [];
      console.log('📋 Loaded cards:', cardsData.length, 'cards');
      if (cardsData.length > 0) {
        console.log('📋 Sample card data:', cardsData[0]);
      }
      
      // Normalize phone numbers when loading from backend
      const normalizedCards = cardsData.map(card => ({
        ...card,
        phone: card.phone ? normalizePhoneNumber(card.phone) : card.phone,
        mobile: card.mobile ? normalizePhoneNumber(card.mobile) : card.mobile,
      }));
      
      // Set cards with normalized phone numbers
      setCards(normalizedCards);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else {
        toast.error('Failed to load cards. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...cards];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => [c.cardOwnerName, c.companyName, c.email, c.phone, c.mobile].some(f => (f || '').toLowerCase().includes(q)));
    }
    if (filterBy === 'date') filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    else if (filterBy === 'name') filtered.sort((a,b)=>(a.cardOwnerName||'').localeCompare(b.cardOwnerName||''));
    else if (filterBy === 'company') filtered.sort((a,b)=>(a.companyName||'').localeCompare(b.companyName||''));
    setFilteredCards(filtered);
  };

  const handleSaveCard = async ({ file, cardData }) => {
    setUploading(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add the image file
      // For manual entry, file might be null - send empty Blob as per user request
      if (file) {
        formData.append('file', file);
        console.log('📎 Image file:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB', 'Type:', file.type);
      } else {
        // Manual entry without image - send empty Blob (FormData requires File/Blob, not string)
        const emptyBlob = new Blob([], { type: 'application/octet-stream' });
        formData.append('file', emptyBlob, '');
        console.log('📎 Manual entry mode - sending empty Blob for file field');
      }
      
      // Add card data as JSON string
      const cardJsonString = JSON.stringify(cardData);
      formData.append('card', cardJsonString);
      
      // Debug: Log FormData contents
      console.group('🚀 Sending Card Data to Backend (multipart/form-data)');
      console.log('Card JSON:', cardJsonString);
      console.log('File:', file ? `${file.name} (${(file.size / 1024).toFixed(2)} KB, type: ${file.type})` : 'No file');
      console.log('Card JSON size:', (new Blob([cardJsonString]).size / 1024).toFixed(2), 'KB');
      
      // Log FormData entries for debugging
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}:`, typeof value === 'string' && value.length > 200 ? value.substring(0, 200) + '...' : value);
        }
      }
      console.groupEnd();

      // Send as multipart/form-data
      await networkAPI.addCard(formData);
      await loadCards();
      setShowAddCardModal(false);
      toast.success('Business card added successfully! 🎉');
    } catch (err) {
      const response = err?.response;
      const backendCode = response?.data?.code;
      
      // Detailed error logging
      console.group('❌ Card Upload Error');
      console.log('HTTP Status:', response?.status);
      console.log('Backend Code:', backendCode);
      console.log('Backend Message:', response?.data?.message);
      console.log('Full Response Data:', response?.data);
      console.log('Error Object:', err);
      console.groupEnd();
      
      if (backendCode === '400001') {
        toast.error(
          'Required fields are missing. Please ensure all fields are filled in correctly.',
          { autoClose: 5000 }
        );
      } else if (backendCode === '500001') {
        // Log error details for debugging (not shown to user)
        console.error('❌ 500001 System Error');
        
        // Show user-friendly error message
        const backendMessage = response?.data?.message || 'A system error occurred';
        setErrorMessage(`Unable to upload your business card. ${backendMessage}. Please try again or contact support if the problem continues.`);
        setShowErrorModal(true);
      } else if (response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else if (!response) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        const errorMessage = response?.data?.message || 'Failed to add card. Please try again.';
        toast.error(errorMessage);
      }
      // Re-throw to let modal handle it if needed
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setCardToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;
    
    try {
      await networkAPI.deleteCard(cardToDelete);
      setCards(c => c.filter(x => x.id !== cardToDelete));
      toast.success('Card deleted successfully');
      setShowDeleteModal(false);
      setCardToDelete(null);
      // Close card preview if it's the deleted card
      if (selectedCard?.id === cardToDelete) {
        setSelectedCard(null);
      }
    } catch (err) {
      const response = err?.response;
      if (response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else {
        toast.error('Failed to delete card. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-brand-background/95 backdrop-blur-sm shadow-md border-b border-brand-brown/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => navigate('/')}
              className="flex items-center gap-2 text-brand-textSecondary hover:text-brand-brown transition-colors font-medium flex-shrink-0"
              >
              <Home className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="hidden sm:inline text-base">Home</span>
              </button>
            <img 
              src="/images/logo.png" 
              alt="Show you care" 
              onClick={() => navigate('/')}
              className="h-14 sm:h-16 md:h-18 lg:h-20 object-contain flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ maxWidth: 'clamp(140px, 22vw, 220px)' }}
            />
            <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
            <h1 className="text-2xl font-bold text-brand-orange truncate min-w-0">Network</h1>
            </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>navigate('/gifticon')} className="px-3 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight flex items-center gap-2"><Gift className="w-4 h-4"/>Gifticon</button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2.5 bg-brand-cardLight border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background hover:border-brand-orange/50 transition-colors flex items-center justify-center"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-brand-cardLight rounded-xl shadow-lg p-4 mb-6 border border-brand-brown/20 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-textSecondary w-5 h-5"/>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-3 py-2 border border-brand-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-brand-brown placeholder-brand-textSecondary"/>
            </div>
            <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-textSecondary hidden md:block"/>
            <select value={filterBy} onChange={e=>setFilterBy(e.target.value)} className="px-3 py-2 border border-brand-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-brand-brown">
                <option value="all">All</option>
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="company">Sort by Company</option>
              </select>
            <div className="flex items-center gap-1 border border-brand-brown/20 rounded-lg p-1 bg-white">
              <button onClick={()=>setViewMode('grid')} className={`p-2 rounded ${viewMode==='grid'?'bg-brand-orange text-brand-textOnDark':'text-brand-textSecondary hover:text-brand-brown'}`}><Grid3x3 className="w-5 h-5"/></button>
              <button onClick={()=>setViewMode('list')} className={`p-2 rounded ${viewMode==='list'?'bg-brand-orange text-brand-textOnDark':'text-brand-textSecondary hover:text-brand-brown'}`}><List className="w-5 h-5"/></button>
            </div>
            <button onClick={()=>setShowAddCardModal(true)} className="px-4 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight flex items-center gap-2"><Plus className="w-5 h-5"/>Add Card</button>
          </div>
        </div>

        {/* Cards */}
        {loading? <div className="text-center py-12 animate-spin">Loading...</div>
        : filteredCards.length===0? <div className="text-center py-12">No cards yet. <button onClick={()=>setShowAddCardModal(true)} className="text-brand-orange hover:underline">Add Your First Card</button></div>
        : viewMode==='grid'? <CardGrid cards={filteredCards} onSelect={setSelectedCard} onDelete={handleDeleteClick}/>
        : <CardList cards={filteredCards} onSelect={setSelectedCard} onDelete={handleDeleteClick}/>
        }
      </div>

      <AddCardModal
        visible={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onSave={handleSaveCard}
        uploading={uploading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCardToDelete(null);
        }}
        onConfirm={handleDeleteCard}
        title="Delete Card"
        message="Are you sure you want to delete this business card? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        title="Upload Error"
        message={errorMessage || 'An error occurred while uploading the image. Please try again.'}
        buttonText="Try Again"
      />

      {/* Card Preview Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-brand-cardLight rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl border border-brand-brown/20 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-brand-brown mb-6">Business Card Details</h2>

            {/* Card Image */}
            {selectedCard.cardImageUrl && (
              <div className="mb-6 bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center">
                <img
                  src={selectedCard.cardImageUrl}
                  alt={selectedCard.cardOwnerName || 'Business Card'}
                  className="max-w-full max-h-96 object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            )}

            {/* Card Information - Only: Name, Company, Position, Phone, Email */}
              <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCard.cardOwnerName && (
                  <div>
                    <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">Name</label>
                    <p className="text-lg font-bold text-brand-brown">{selectedCard.cardOwnerName}</p>
                  </div>
                )}
                {selectedCard.companyName && (
                  <div>
                    <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">Company</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-textSecondary" />
                      <p className="text-base text-brand-brown">{selectedCard.companyName}</p>
                    </div>
                  </div>
                )}
                {selectedCard.position && (
                  <div>
                    <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">Position</label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-textSecondary" />
                      <p className="text-base text-brand-brown">{selectedCard.position}</p>
                    </div>
                  </div>
                )}
                {(selectedCard.mobile || selectedCard.phone) && (
                    <div>
                    <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-textSecondary" />
                      <a 
                        href={`tel:${normalizePhoneNumber(selectedCard.mobile || selectedCard.phone).replace(/\s/g, '')}`} 
                        className="text-base text-brand-orange hover:underline"
                      >
                        {normalizePhoneNumber(selectedCard.mobile || selectedCard.phone)}
                      </a>
                    </div>
                  </div>
                )}
                {selectedCard.email && (
                  <div>
                    <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-textSecondary" />
                      <a href={`mailto:${selectedCard.email}`} className="text-base text-brand-orange hover:underline">
                        {selectedCard.email}
                      </a>
                </div>
              </div>
            )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-brand-brown/20">
              <button
                onClick={() => setSelectedCard(null)}
                className="flex-1 py-2.5 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDeleteClick(selectedCard.id)}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
