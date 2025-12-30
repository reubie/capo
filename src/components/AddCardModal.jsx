import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { extractTextFromImage, extractEmail, extractPhone, extractName, extractCompany, extractDepartment, extractPosition, extractCompanyAddress, extractLinkedIn } from '../utils/ocr';
import { validateEmail } from '../utils/helpers';

const AddCardModal = ({ visible, onClose, onSave, uploading }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    cardOwnerName: '',
    companyName: '',
    department: '',
    position: '',
    phone: '',
    mobile: '',
    email: '',
    companyAddress: '',
    linkedIn: '',
    cardImageUrl: '',
    ocrText: ''
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setActiveTab('upload');
      setCardImage(null);
      setCardPreview(null);
      setProcessingOCR(false);
      setShowForm(false);
      setFormData({
        cardOwnerName: '',
        companyName: '',
        department: '',
        position: '',
        phone: '',
        mobile: '',
        email: '',
        companyAddress: '',
        linkedIn: '',
        cardImageUrl: '',
        ocrText: ''
      });
      setFieldErrors({});
      setTouchedFields({});
    }
  }, [visible]);

  // Handle tab switch
  const handleTabSwitch = (tab) => {
    if (processingOCR) {
      toast.warning('Please wait for OCR processing to complete');
      return;
    }
    setActiveTab(tab);
    if (tab === 'manual') {
      setShowForm(true);
    } else if (tab === 'upload' && !cardPreview) {
      setShowForm(false);
    }
  };

  // Handle card image upload
  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setCardImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result;
      setCardPreview(preview);
    };
    reader.readAsDataURL(file);
  };

  // Process OCR when image is uploaded
  const handleProcessOCR = async () => {
    if (!cardImage) {
      toast.error('Please select an image first');
      return;
    }

    setProcessingOCR(true);
    try {
      const ocrText = await extractTextFromImage(cardImage);
      
      // Extract data from OCR
      const extractedData = {
        cardOwnerName: extractName(ocrText) || '',
        companyName: extractCompany(ocrText) || '',
        department: extractDepartment(ocrText) || '',
        position: extractPosition(ocrText) || '',
        phone: extractPhone(ocrText) || '',
        mobile: extractPhone(ocrText) || '',
        email: extractEmail(ocrText) || '',
        companyAddress: extractCompanyAddress(ocrText) || '',
        linkedIn: extractLinkedIn(ocrText) || '',
        cardImageUrl: cardPreview || '',
        ocrText: ocrText || ''
      };

      setFormData(extractedData);
      setShowForm(true);
      toast.success('Card information extracted! Please review and fill in any missing fields.');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text from image. You can still enter the information manually.');
      // Still show form for manual entry
      setFormData(prev => ({
        ...prev,
        cardImageUrl: cardPreview || '',
        ocrText: 'OCR extraction failed'
      }));
      setShowForm(true);
    } finally {
      setProcessingOCR(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Validate on change
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'email') {
      if (!value || !value.trim()) {
        error = 'Email is required';
      } else if (!validateEmail(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (requiredFields.includes(name)) {
      if (!value || !value.trim()) {
        const fieldLabels = {
          cardOwnerName: 'Name',
          companyName: 'Company name',
          department: 'Department',
          position: 'Position',
          phone: 'Phone',
          mobile: 'Mobile',
          companyAddress: 'Company address',
          ocrText: 'OCR text',
          cardImageUrl: 'Card image',
          linkedIn: 'LinkedIn'
        };
        error = `${fieldLabels[name] || name} is required`;
      }
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Check if field is missing/empty
  const isFieldMissing = (fieldName) => {
    const value = formData[fieldName];
    return !value || !value.trim();
  };

  // Required fields (all except ocrText and cardImageUrl which are optional in manual mode)
  const requiredFields = [
    'cardOwnerName',
    'companyName',
    'department',
    'position',
    'phone',
    'mobile',
    'email',
    'companyAddress',
    'linkedIn'
  ];
  
  // Optional fields (only required when using upload/OCR flow)
  const optionalFields = ['ocrText', 'cardImageUrl'];

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const fieldLabels = {
      cardOwnerName: 'Name',
      companyName: 'Company name',
      department: 'Department',
      position: 'Position',
      phone: 'Phone',
      mobile: 'Mobile',
      email: 'Email',
      companyAddress: 'Company address',
      ocrText: 'OCR text',
      cardImageUrl: 'Card image',
      linkedIn: 'LinkedIn'
    };

    // Validate all required fields
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        errors[field] = `${fieldLabels[field] || field} is required`;
        isValid = false;
      }
    });

    // Validate email format
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate URL formats
    if (formData.linkedIn && formData.linkedIn.trim()) {
      try {
        const url = formData.linkedIn.startsWith('http') 
          ? formData.linkedIn 
          : `https://${formData.linkedIn}`;
        new URL(url);
      } catch {
        errors.linkedIn = 'Please enter a valid LinkedIn URL';
        isValid = false;
      }
    }

    // Validate cardImageUrl - only required in upload mode, optional in manual mode
    // But if provided, must be valid format
    if (activeTab === 'upload' && (!formData.cardImageUrl || !formData.cardImageUrl.trim())) {
      errors.cardImageUrl = 'Card image is required when uploading. Please upload an image.';
      isValid = false;
    } else if (formData.cardImageUrl && formData.cardImageUrl.trim()) {
      const isDataUrl = formData.cardImageUrl.startsWith('data:image');
      const isHttpUrl = formData.cardImageUrl.startsWith('http');
      if (!isDataUrl && !isHttpUrl) {
        errors.cardImageUrl = 'Please provide a valid image URL (data URL or http/https URL)';
        isValid = false;
      }
    }

    // OCR text is optional in manual mode, but if provided should be validated
    // In upload mode, it should be auto-filled from OCR
    if (activeTab === 'upload' && (!formData.ocrText || !formData.ocrText.trim())) {
      errors.ocrText = 'OCR text is required when uploading. Please process the image first.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const touched = {};
    allFields.forEach(field => {
      touched[field] = true;
    });
    setTouchedFields(touched);

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    // Prepare card data - send empty strings for optional fields if not provided
    const cardData = {
      cardOwnerName: formData.cardOwnerName.trim(),
      companyName: formData.companyName.trim(),
      department: formData.department.trim(),
      position: formData.position.trim(),
      phone: formData.phone.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      companyAddress: formData.companyAddress.trim(),
      linkedIn: formData.linkedIn.trim(),
      // Optional fields - send empty string if not provided (for manual entry)
      cardImageUrl: formData.cardImageUrl?.trim() || '',
      ocrText: formData.ocrText?.trim() || ''
    };

    try {
      await onSave(cardData);
    } catch (error) {
      // Error handling is done in parent component
      throw error;
    }
  };

  // Render field with validation
  const renderField = (name, label, type = 'text', placeholder = '', required = true) => {
    const isMissing = isFieldMissing(name);
    const isTouched = touchedFields[name];
    const hasError = fieldErrors[name];

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-brand-brown">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-lg border ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : isMissing && isTouched
              ? 'border-orange-300 focus:ring-orange-500'
              : 'border-brand-brown/20 focus:ring-brand-orange/50'
          } focus:outline-none focus:ring-2 bg-white text-brand-brown placeholder-brand-textSecondary`}
        />
        {hasError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {hasError}
          </p>
        )}
        {isMissing && isTouched && !hasError && (
          <p className="text-xs text-orange-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            This field is required
          </p>
        )}
      </div>
    );
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-brand-cardLight rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl border border-brand-brown/20 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={processingOCR || uploading}
          className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-brand-brown mb-6">Add Business Card</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-brand-brown/20">
          <button
            onClick={() => handleTabSwitch('upload')}
            disabled={processingOCR || uploading}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-brand-textSecondary hover:text-brand-brown'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Card
            </div>
          </button>
          <button
            onClick={() => handleTabSwitch('manual')}
            disabled={processingOCR || uploading}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-brand-textSecondary hover:text-brand-brown'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manual Entry
            </div>
          </button>
        </div>

        {/* Upload Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {!showForm ? (
              <>
                {!cardPreview ? (
                  <div className="border border-dashed border-brand-brown/30 rounded-lg p-8 text-center hover:border-brand-brown/50 transition-colors bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCardUpload}
                      className="hidden"
                      id="card-upload"
                      disabled={processingOCR || uploading}
                    />
                    <label
                      htmlFor="card-upload"
                      className={`cursor-pointer flex flex-col items-center gap-3 ${
                        processingOCR || uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="p-4 bg-brand-orange/10 rounded-full">
                        <Upload className="w-8 h-8 text-brand-orange" />
                      </div>
                      <p className="text-sm font-medium text-brand-brown">
                        Click to upload or take a photo
                      </p>
                      <p className="text-xs text-brand-textSecondary mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={cardPreview}
                        alt="Card preview"
                        className="w-full h-64 object-contain rounded-lg border border-brand-brown/20 bg-white"
                      />
                      <button
                        onClick={() => {
                          setCardPreview(null);
                          setCardImage(null);
                          setFormData(prev => ({ ...prev, cardImageUrl: '' }));
                        }}
                        disabled={processingOCR || uploading}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-brand-brown" />
                      </button>
                    </div>
                    <button
                      onClick={handleProcessOCR}
                      disabled={processingOCR || uploading}
                      className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingOCR ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing OCR...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          Extract Information from Card
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {cardPreview && (
                  <div className="relative">
                    <img
                      src={cardPreview}
                      alt="Card preview"
                      className="w-full h-48 object-contain rounded-lg border border-brand-brown/20 bg-white"
                    />
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Information extracted from card</p>
                      <p className="text-xs">
                        Please review the extracted information below. All fields marked with{' '}
                        <span className="text-red-500 font-medium">*</span> are required.
                        Fill in any missing fields before saving.
                      </p>
                    </div>
                  </div>
                </div>
                {renderForm()}
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Tab Content */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Enter information manually</p>
                  <p className="text-xs">
                    Fill in all the business card details below. All fields marked with{' '}
                    <span className="text-red-500 font-medium">*</span> are required.
                  </p>
                </div>
              </div>
            </div>
            {renderForm()}
          </div>
        )}

        {/* Form Actions */}
        {showForm && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-brand-brown/20">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-2.5 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || processingOCR}
              className="flex-1 py-2.5 px-4 bg-brand-orange text-brand-textOnDark rounded-lg font-bold hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Card'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render form fields
  function renderForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('cardOwnerName', 'Full Name', 'text', 'John Doe', true)}
          {renderField('companyName', 'Company Name', 'text', 'Acme Corporation', true)}
          {renderField('position', 'Position/Title', 'text', 'Senior Manager', true)}
          {renderField('department', 'Department', 'text', 'Sales & Marketing', true)}
          {renderField('email', 'Email', 'email', 'john.doe@company.com', true)}
          {renderField('phone', 'Phone', 'tel', '+65 1234 5678', true)}
          {renderField('mobile', 'Mobile', 'tel', '+65 9123 4567', true)}
          {renderField('linkedIn', 'LinkedIn Profile', 'url', 'https://linkedin.com/in/johndoe', true)}
        </div>
        {renderField('companyAddress', 'Company Address', 'text', '123 Business Street, Singapore 123456', true)}
        {/* OCR Text field - only shown/required in upload mode */}
        {activeTab === 'upload' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-brand-brown">
              OCR Text <span className="text-red-500 ml-1">*</span>
              <span className="text-xs text-brand-textSecondary ml-2 font-normal">(Auto-filled from image)</span>
            </label>
            <textarea
              name="ocrText"
              value={formData.ocrText}
              onChange={handleInputChange}
              placeholder="OCR text will be auto-filled after processing image..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                fieldErrors.ocrText
                  ? 'border-red-500 focus:ring-red-500'
                  : isFieldMissing('ocrText') && touchedFields.ocrText
                  ? 'border-orange-300 focus:ring-orange-500'
                  : 'border-brand-brown/20 focus:ring-brand-orange/50'
              } focus:outline-none focus:ring-2 bg-white text-brand-brown placeholder-brand-textSecondary resize-none`}
            />
            {fieldErrors.ocrText && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.ocrText}
              </p>
            )}
            {isFieldMissing('ocrText') && touchedFields.ocrText && !fieldErrors.ocrText && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Process the image to extract OCR text
              </p>
            )}
          </div>
        )}
        {/* Card Image URL field - only shown/required in upload mode */}
        {activeTab === 'upload' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-brand-brown">
              Card Image URL <span className="text-red-500 ml-1">*</span>
              <span className="text-xs text-brand-textSecondary ml-2 font-normal">(Auto-filled when image is uploaded)</span>
            </label>
            <input
              type="text"
              name="cardImageUrl"
              value={formData.cardImageUrl}
              onChange={handleInputChange}
              placeholder="Image URL (auto-filled when uploading image)"
              className={`w-full px-3 py-2 rounded-lg border ${
                fieldErrors.cardImageUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : isFieldMissing('cardImageUrl') && touchedFields.cardImageUrl
                  ? 'border-orange-300 focus:ring-orange-500'
                  : 'border-brand-brown/20 focus:ring-brand-orange/50'
              } focus:outline-none focus:ring-2 bg-white text-brand-brown placeholder-brand-textSecondary`}
            />
            {fieldErrors.cardImageUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.cardImageUrl}
              </p>
            )}
            {isFieldMissing('cardImageUrl') && touchedFields.cardImageUrl && !fieldErrors.cardImageUrl && (
              <p className="text-xs text-orange-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Upload an image to auto-fill this field
              </p>
            )}
          </div>
        )}
      </form>
    );
  }
};

export default AddCardModal;

