import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Gift, Search, Filter, Plus, Upload, X, Grid3x3, List, Building2 } from 'lucide-react';
import { networkAPI } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import { extractTextFromImage, extractEmail, extractPhone, extractName, extractCompany, extractDepartment, extractPosition, extractCompanyAddress } from '../utils/ocr';

const CardGrid = ({ cards, onSelect, onDelete }) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {cards.map(card => (
      <div key={card.id} className="relative" onClick={() => onSelect(card)}>
        <img src={card.cardImageUrl || ''} alt={card.cardOwnerName || 'Card'} className="w-full h-48 object-cover rounded-lg border border-brand-brown/20" />
        <div className="absolute top-2 right-2">
          <button onClick={e => { e.stopPropagation(); onDelete(card.id); }} className="text-red-500 hover:text-red-400">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const CardList = ({ cards, onSelect, onDelete }) => (
  <div className="bg-brand-cardLight rounded-xl shadow-lg border border-brand-brown/20 overflow-hidden">
    <div className="hidden md:grid md:grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_120px_50px] gap-3 p-3 border-b border-brand-brown/20 text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
      <div></div><div>Name</div><div>Company</div><div>Phone</div><div>Email</div><div>Address</div><div>Date</div><div></div>
    </div>
    <div className="divide-y divide-brand-brown/20">
      {cards.map(card => (
        <div key={card.id} onClick={() => onSelect(card)} className="grid grid-cols-[60px_1fr] md:grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_120px_50px] gap-3 p-3 hover:bg-brand-backgroundAlt cursor-pointer group items-center">
          <div className="flex-shrink-0">
            {card.cardImageUrl ? (
              <img src={card.cardImageUrl} alt={card.cardOwnerName} className="w-12 h-12 rounded object-cover border border-brand-brown/20" />
            ) : (
              <div className="w-12 h-12 rounded bg-white border border-brand-brown/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand-textSecondary" />
              </div>
            )}
          </div>
          <div className="min-w-0 font-semibold text-brand-brown truncate">{card.cardOwnerName || 'Unknown'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.companyName || '-'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.phone || card.mobile || '-'}</div>
          <div className="hidden md:block min-w-0 text-xs text-brand-textSecondary truncate">{card.email || '-'}</div>
          <div className="hidden lg:block min-w-0 text-xs text-brand-textSecondary truncate">{card.companyAddress || '-'}</div>
          <div className="hidden md:block text-right text-xs text-brand-textSecondary">{card.createdAt ? new Date(card.createdAt).toLocaleDateString() : '-'}</div>
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

const UploadModal = ({ visible, onClose, cardImage, setCardImage, cardPreview, setCardPreview, handleAddCard, uploading }) => {
  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    setCardImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCardPreview(reader.result);
    reader.readAsDataURL(file);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-brand-cardLight rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-brand-brown/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-brand-brown mb-4">Add Business Card</h2>
        {cardPreview ? (
          <div className="space-y-4">
            <img src={cardPreview} alt="Preview" className="w-full h-64 object-contain rounded-lg border border-brand-brown/20" />
            <button onClick={handleAddCard} disabled={uploading} className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? 'Processing...' : 'Add Card'}
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-brand-brown/30 rounded-lg p-8 text-center hover:border-brand-brown/50 transition-colors bg-white">
            <input type="file" accept="image/*" onChange={handleCardUpload} className="hidden" id="card-upload-modal" />
            <label htmlFor="card-upload-modal" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="p-4 bg-brand-orange/10 rounded-full"><Upload className="w-8 h-8 text-brand-orange" /></div>
              <p className="text-sm font-medium text-brand-brown">Click to upload or take a photo</p>
              <p className="text-xs text-brand-textSecondary mt-1">PNG, JPG up to 5MB</p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

const Network = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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
      setCards(response?.data?.data || []);
    } catch (err) {
      if (err.response?.status === 403) navigate('/login', { replace: true });
      else alert('Failed to load cards');
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

  const handleAddCard = async () => {
    if (!cardImage) return alert('Please select an image');
    setUploading(true);
    try {
      const ocrText = await extractTextFromImage(cardImage);
      const cardData = {
        cardOwnerName: extractName(ocrText),
        companyName: extractCompany(ocrText),
        department: extractDepartment(ocrText),
        position: extractPosition(ocrText),
        phone: extractPhone(ocrText),
        mobile: extractPhone(ocrText),
        email: extractEmail(ocrText),
        companyAddress: extractCompanyAddress(ocrText),
        cardImageUrl: cardPreview,
        ocrText
      };
      const formData = new FormData();
      formData.append('card', cardImage);
      Object.entries(cardData).forEach(([k,v])=>formData.append(k,v||''));
      await networkAPI.addCard(formData);
      await loadCards();
      setShowUploadModal(false); setCardImage(null); setCardPreview(null);
    } catch { alert('Failed to add card'); } finally { setUploading(false); }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await networkAPI.deleteCard(id); setCards(c=>c.filter(x=>x.id!==id)); } catch { alert('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-brand-background/95 backdrop-blur-sm shadow-md border-b border-brand-brown/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={()=>location.state?.from?navigate(-1):navigate('/gifticon')} className="flex items-center gap-1 text-brand-textSecondary hover:text-brand-brown transition-colors font-medium flex-shrink-0">
              <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline text-sm">Back</span>
            </button>
            <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
            <h1 className="text-2xl font-bold text-brand-orange truncate min-w-0">Network</h1>
          </div>
          <button onClick={()=>navigate('/gifticon')} className="px-3 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight flex items-center gap-2"><Gift className="w-4 h-4"/>Gifticon</button>
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
            <button onClick={()=>setShowUploadModal(true)} className="px-4 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight flex items-center gap-2"><Plus className="w-5 h-5"/>Add Card</button>
          </div>
        </div>

        {/* Cards */}
        {loading? <div className="text-center py-12 animate-spin">Loading...</div>
        : filteredCards.length===0? <div className="text-center py-12">No cards yet. <button onClick={()=>setShowUploadModal(true)}>Add Your First Card</button></div>
        : viewMode==='grid'? <CardGrid cards={filteredCards} onSelect={setSelectedCard} onDelete={handleDeleteCard}/>
        : <CardList cards={filteredCards} onSelect={setSelectedCard} onDelete={handleDeleteCard}/>
        }
      </div>

      <UploadModal visible={showUploadModal} onClose={()=>{setShowUploadModal(false);setCardImage(null);setCardPreview(null);}} cardImage={cardImage} setCardImage={setCardImage} cardPreview={cardPreview} setCardPreview={setCardPreview} handleAddCard={handleAddCard} uploading={uploading}/>
    </div>
  );
};

export default Network;
