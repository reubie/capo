import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import { extractTextFromImage, extractEmail, extractPhone, extractMobile, extractName, extractCompany, extractDepartment, extractPosition, extractCompanyAddress, extractLinkedIn } from '../utils/ocr';
import { validateEmail, normalizePhoneNumber } from '../utils/helpers';
import { compressBusinessCardImage } from '../utils/imageCompression';
import { autoCropBusinessCard, dataURLtoFile } from '../utils/cardDetection';
import ErrorModal from './ErrorModal';

const AddCardModal = ({ visible, onClose, onSave, uploading }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [processingCrop, setProcessingCrop] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const processedImageRef = useRef(null);
  
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
    cardImageUrl: ''
  });

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Prevent browser default drop behavior when modal is open
  useEffect(() => {
    const handleGlobalDrop = (e) => {
      // Only prevent default if modal is visible
      if (visible) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleGlobalDragOver = (e) => {
      // Only prevent default if modal is visible
      if (visible) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (visible) {
      document.addEventListener('drop', handleGlobalDrop, false);
      document.addEventListener('dragover', handleGlobalDragOver, false);
    }

    return () => {
      document.removeEventListener('drop', handleGlobalDrop, false);
      document.removeEventListener('dragover', handleGlobalDragOver, false);
    };
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setActiveTab('upload');
      setCardImage(null);
      setCardPreview(null);
      setProcessingOCR(false);
      setShowForm(false);
      setIsDragging(false);
      dragCounterRef.current = 0;
      processedImageRef.current = null;
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
        cardImageUrl: ''
      });
      setFieldErrors({});
      setTouchedFields({});
      setErrorModal({ visible: false, title: '', message: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [visible]);

  // Process OCR when image is uploaded
  const handleProcessOCR = useCallback(async () => {
    if (!cardImage) {
      return;
    }

    setProcessingOCR(true);
    try {
      const ocrText = await extractTextFromImage(cardImage);
      
      // Log raw OCR text
      console.group('📄 OCR Extraction Results');
      console.log('Raw OCR Text:');
      console.log(ocrText);
      console.log('---');
      
      // Extract data from OCR (ocrText is used internally but not stored in formData)
      const extractedPhone = extractPhone(ocrText) || '';
      const extractedMobile = extractMobile(ocrText) || '';
      
      const extractedData = {
        cardOwnerName: extractName(ocrText) || '',
        companyName: extractCompany(ocrText) || '',
        department: extractDepartment(ocrText) || '',
        position: extractPosition(ocrText) || '',
        phone: extractedPhone,
        // Use phone as fallback if mobile is not found
        mobile: extractedMobile || extractedPhone,
        email: extractEmail(ocrText) || '',
        companyAddress: extractCompanyAddress(ocrText) || '',
        linkedIn: extractLinkedIn(ocrText) || '',
        cardImageUrl: cardPreview || ''
      };
      
      // Log extracted fields
      console.log('Extracted Fields:');
      console.log('  Name:', extractedData.cardOwnerName || '(not found)');
      console.log('  Company:', extractedData.companyName || '(not found)');
      console.log('  Position:', extractedData.position || '(not found)');
      console.log('  Department:', extractedData.department || '(not found)');
      console.log('  Phone:', extractedData.phone || '(not found)');
      console.log('  Mobile:', extractedData.mobile || '(not found)');
      console.log('  Email:', extractedData.email || '(not found)');
      console.log('  Address:', extractedData.companyAddress || '(not found)');
      console.log('  LinkedIn:', extractedData.linkedIn || '(not found)');
      console.groupEnd();

      setFormData(extractedData);
      setShowForm(true);
      // No success toast - user can see the extracted data in the form
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text from image. You can still enter the information manually.');
      // Still show form for manual entry
      setFormData(prev => ({
        ...prev,
        cardImageUrl: cardPreview || ''
      }));
      setShowForm(true);
    } finally {
      setProcessingOCR(false);
    }
  }, [cardImage, cardPreview]);

  // Auto-process OCR when image is uploaded
  useEffect(() => {
    if (cardImage && cardPreview && activeTab === 'upload' && !showForm && !processingOCR) {
      // Only process if we haven't processed this image yet
      if (processedImageRef.current !== cardPreview) {
        processedImageRef.current = cardPreview;
        // Use setTimeout to avoid calling during render
        const timeoutId = setTimeout(() => {
          handleProcessOCR();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [cardImage, cardPreview, activeTab, showForm, processingOCR, handleProcessOCR]);

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

  // Process file (shared by drag & drop and file input)
  const processFile = async (file) => {
    if (!file) return false;

    if (file.size > 5 * 1080 * 1080) {
      toast.error('Image size should be less than 5MB');
      return false;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return false;
    }

    setProcessingCrop(true);
    
    try {
      // Step 1: Auto-detect and crop business card (removes background)
      const { croppedDataUrl, crop, warnings, quality } = await autoCropBusinessCard(file);
      
      // Check for critical errors that need modal display
      const criticalErrors = warnings?.filter(w => w.severity === 'error') || [];
      const hasCriticalErrors = criticalErrors.length > 0;
      
      // Display critical errors in modal (not toast)
      if (hasCriticalErrors) {
        const errorMessages = criticalErrors.map(w => {
          let msg = w.message;
          if (w.suggestion) {
            msg += `\n\n${w.suggestion}`;
          }
          return msg;
        }).join('\n\n');
        
        setErrorModal({
          visible: true,
          title: 'Card Detection Issue',
          message: errorMessages
        });
        
        // Still proceed with the image, but user is aware of the issue
      }
      
      // Display non-critical warnings as toasts (only if no critical errors)
      if (!hasCriticalErrors && warnings && warnings.length > 0) {
        warnings.forEach(warning => {
          if (warning.severity === 'warning') {
            toast.warning(warning.message, { autoClose: 4000 });
          }
          // Skip info messages - no need to show them
        });
      }
      
      // Log quality metrics for debugging
      if (quality) {
        console.log('📊 Card Detection Quality:', {
          blurScore: quality.blurScore,
          isBlurry: quality.isBlurry,
          isTooSmall: quality.isTooSmall,
          confidence: quality.detectionConfidence
        });
      }
      
      // Convert cropped data URL back to File for OCR and compression
      const croppedFile = dataURLtoFile(croppedDataUrl, file.name);
      
      // Step 2: Use cropped image for preview
      setCardPreview(croppedDataUrl);
      
      // Step 3: Keep cropped file for OCR (better accuracy on cropped card)
      setCardImage(croppedFile);
      
      // Step 4: Compress cropped image for backend
      try {
        const compressedDataUrl = await compressBusinessCardImage(croppedFile);
        setFormData(prev => ({ ...prev, cardImageUrl: compressedDataUrl }));
      } catch (error) {
        console.error('Image compression error:', error);
        // Fallback to cropped image if compression fails
        setFormData(prev => ({ ...prev, cardImageUrl: croppedDataUrl }));
      }
      
      // No success message - user can see the result in the preview
    } catch (error) {
      console.error('Auto-crop error:', error);
      
      // Show error modal for detection failure
      setErrorModal({
        visible: true,
        title: 'Card Detection Failed',
        message: 'Could not automatically detect the business card in the image. The full image will be used instead.\n\nTips for better detection:\n• Ensure the card is clearly visible\n• Make sure all edges of the card are in the frame\n• Use good lighting\n• Hold the camera steady'
      });
      
      // Fallback: use original image
      setCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result;
        setCardPreview(preview);
      };
      reader.readAsDataURL(file);
      
      // Compress original for backend
      try {
        const compressedDataUrl = await compressBusinessCardImage(file);
        setFormData(prev => ({ ...prev, cardImageUrl: compressedDataUrl }));
      } catch (error) {
        console.error('Image compression error:', error);
        const reader2 = new FileReader();
        reader2.onloadend = () => {
          setFormData(prev => ({ ...prev, cardImageUrl: reader2.result }));
        };
        reader2.readAsDataURL(file);
      }
    } finally {
      setProcessingCrop(false);
    }
    
    return true;
  };

  // Handle card image upload from file input
  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    // Get files from dataTransfer
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Process the file
      processFile(file);
      // Clear dataTransfer
      if (e.dataTransfer) {
        e.dataTransfer.clearData();
      }
    }
    
    return false;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Normalize phone numbers when user types
    let normalizedValue = value;
    if (name === 'phone' || name === 'mobile') {
      normalizedValue = normalizePhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: normalizedValue }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    // Validate on change
    validateField(name, normalizedValue);
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
          companyAddress: 'Company address'
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

  // Required fields (department and LinkedIn are optional, cardImageUrl and ocrText are handled internally)
  const requiredFields = [
    'cardOwnerName',
    'companyName',
    'position',
    'phone',
    'mobile',
    'email',
    'companyAddress'
  ];

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
      cardImageUrl: 'Card image'
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

    // Validate LinkedIn URL format (optional field, but if provided should be valid)
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

    // Validate cardImageUrl - required in upload mode
    if (activeTab === 'upload' && (!formData.cardImageUrl || !formData.cardImageUrl.trim())) {
      errors.cardImageUrl = 'Card image is required when uploading. Please upload an image.';
      isValid = false;
    }

    // OCR text is processed internally but not validated - it's sent as empty string to backend

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

    // Prepare card data - send null for optional fields if not provided (instead of empty string)
    // Helper to convert empty strings to null for optional fields
    const toNullIfEmpty = (value) => {
      if (!value || typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    };

    // Prepare card JSON data (without image - image is sent as separate file)
    // Note: cardImageUrl is a deleted field, do not include it
    // Note: ocrText is set to empty string as backend database has length limits
    const cardJsonData = {
      cardOwnerName: formData.cardOwnerName.trim(),
      companyName: formData.companyName.trim(),
      department: toNullIfEmpty(formData.department), // Optional: send null if empty
      position: formData.position.trim(),
      phone: normalizePhoneNumber(formData.phone.trim()),
      mobile: normalizePhoneNumber(formData.mobile.trim()),
      email: formData.email.trim(),
      companyAddress: formData.companyAddress.trim(),
      linkedIn: toNullIfEmpty(formData.linkedIn), // Optional: send null if empty
      ocrText: '' // Set to empty string - backend database has length limits
    };

    // Log payload for debugging
    console.log('🔍 Card JSON Data:', cardJsonData);
    console.log('🔍 Card Image File:', cardImage);
    console.log('🔍 LinkedIn value type:', typeof cardJsonData.linkedIn, 'value:', cardJsonData.linkedIn);
    console.log('🔍 Department value type:', typeof cardJsonData.department, 'value:', cardJsonData.department);
    console.log('🔍 OCR Text: (empty string - backend database has length limits)');

    // Validate that file is provided for upload tab
    if (!cardImage && activeTab === 'upload') {
      toast.error('Please upload an image file. The API requires a file for card registration.');
      return;
    }

    // For manual entry, we can proceed without a file
    // The parent component will handle sending empty string or null for the file field
    try {
      // Pass both the file and card data to parent
      // For manual entry, file will be null/undefined, parent should handle it
      await onSave({
        file: cardImage || null, // null for manual entry without image
        cardData: cardJsonData // JSON data without image
      });
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
        {isMissing && isTouched && !hasError && required && (
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
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 md:p-16 text-center transition-colors bg-white min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-brand-orange bg-brand-orange/5'
                        : 'border-brand-brown/30 hover:border-brand-brown/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCardUpload}
                      className="hidden"
                      id="card-upload"
                      disabled={processingOCR || uploading}
                    />
                    <label
                      htmlFor="card-upload"
                      onDragOver={(e) => {
                        // Allow drop to bubble up to parent
                        e.stopPropagation();
                      }}
                      className={`cursor-pointer flex flex-col items-center gap-3 ${
                        processingOCR || uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="p-4 bg-brand-orange/10 rounded-full">
                        {isDragging ? (
                          <Upload className="w-8 h-8 text-brand-orange" />
                        ) : (
                          <Camera className="w-8 h-8 text-brand-orange" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-brand-brown">
                        {isDragging
                          ? 'Drop image here'
                          : 'Click to upload, drag & drop, or take a photo'}
                      </p>
                      <p className="text-xs text-brand-textSecondary mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center">
                      <img
                        src={cardPreview}
                        alt="Card preview"
                        className="max-w-full max-h-64 object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                      <button
                        onClick={() => {
                          setCardPreview(null);
                          setCardImage(null);
                          setFormData(prev => ({ ...prev, cardImageUrl: '' }));
                          setShowForm(false);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        disabled={processingCrop || processingOCR || uploading}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <X className="w-4 h-4 text-brand-brown" />
                      </button>
                    </div>
                    {(processingCrop || processingOCR) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">
                              {processingCrop 
                                ? 'Detecting business card and removing background...'
                                : 'Processing image and extracting information...'}
                            </p>
                            <p className="text-xs mt-1">This may take a few moments</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {cardPreview && (
                  <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center">
                    <img
                      src={cardPreview}
                      alt="Card preview"
                      className="max-w-full max-h-48 object-contain"
                      style={{ mixBlendMode: 'multiply' }}
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
      
      {/* Error Modal for critical card detection issues */}
      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
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
          {renderField('department', 'Department', 'text', 'Sales & Marketing', false)}
          {renderField('email', 'Email', 'email', 'john.doe@company.com', true)}
          {renderField('phone', 'Phone', 'tel', '+65 1234 5678', true)}
          {renderField('mobile', 'Mobile', 'tel', '+65 9123 4567', true)}
          {renderField('linkedIn', 'LinkedIn Profile', 'url', 'https://linkedin.com/in/johndoe', false)}
        </div>
        {renderField('companyAddress', 'Company Address', 'text', '123 Business Street, Singapore 123456', true)}
        {/* OCR text is processed internally but not displayed to user - sent as empty string to backend */}
        {/* cardImageUrl is now hidden from user - auto-filled when image is uploaded */}
      </form>
    );
  }
};

export default AddCardModal;
