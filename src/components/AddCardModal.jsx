import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { extractTextFromImage, extractEmail, extractPhone, extractMobile, extractName, extractCompany, extractDepartment, extractPosition, extractCompanyAddress, extractLinkedIn } from '../utils/ocr';
import { validateEmail, normalizePhoneNumber, normalizeImageUrl } from '../utils/helpers';
import { formatAsYouType, validatePhoneNumber as validatePhoneNumberLib, getCountryFromPhoneNumber, formatPhoneForBackend } from '../utils/phoneUtils';
import { detectUserCountrySync } from '../utils/countryDetection';
import { compressBusinessCardImage } from '../utils/imageCompression';
import { autoCropBusinessCard, dataURLtoFile } from '../utils/cardDetection';
import { generateBusinessCard, generateBusinessCardFile } from '../utils/businessCardGenerator';
import ErrorModal from './ErrorModal';

const AddCardModal = ({ visible, onClose, onSave, uploading, initialData = null, initialTab = null }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera', 'upload', or 'manual'
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [generatedCardPreview, setGeneratedCardPreview] = useState(null); // Generated card preview for manual entry
  const [originalImage, setOriginalImage] = useState(null); // Original image for crop adjustment
  const [processingOCR, setProcessingOCR] = useState(false);
  const [processingCrop, setProcessingCrop] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });
  const [showCropAdjustment, setShowCropAdjustment] = useState(false);
  const [crop, setCrop] = useState(null); // Crop coordinates for react-image-crop
  const [completedCrop, setCompletedCrop] = useState(null); // Final crop after user confirms
  const [cropImageRef, setCropImageRef] = useState(null); // Reference to image element for crop
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const processedImageRef = useRef(null);
  const modalRef = useRef(null);
  const dropZoneRef = useRef(null);
  
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
  
  // Get detected country for phone formatting
  const [detectedCountry, setDetectedCountry] = useState(null);
  
  useEffect(() => {
    // Detect country on mount for phone number formatting
    const country = detectUserCountrySync();
    setDetectedCountry(country);
  }, []);

  // Prevent browser default drop behavior when modal is open, but allow drops within modal
  useEffect(() => {
    const handleGlobalDrop = (e) => {
      // Only prevent default if modal is visible AND drop is outside the modal
      if (visible && modalRef.current) {
        // Check if the drop target is within the modal
        const isWithinModal = modalRef.current.contains(e.target);
        if (!isWithinModal) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleGlobalDragOver = (e) => {
      // Only prevent default if modal is visible AND drag is outside the modal
      if (visible && modalRef.current) {
        // Check if the drag target is within the modal
        const isWithinModal = modalRef.current.contains(e.target);
        if (!isWithinModal) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    if (visible) {
      // Use capture phase to handle before local handlers
      document.addEventListener('drop', handleGlobalDrop, true);
      document.addEventListener('dragover', handleGlobalDragOver, true);
    }

    return () => {
      document.removeEventListener('drop', handleGlobalDrop, true);
      document.removeEventListener('dragover', handleGlobalDragOver, true);
    };
  }, [visible]);

  // Reset state when modal closes OR initialize with existing data when opening for edit
  useEffect(() => {
    if (!visible) {
      // Reset everything when modal closes
      setActiveTab('camera');
      setCardImage(null);
      setCardPreview(null);
      setGeneratedCardPreview(null);
      setOriginalImage(null);
      setProcessingOCR(false);
      setShowForm(false);
      setIsDragging(false);
      setShowCropAdjustment(false);
      setCrop(null);
      setCompletedCrop(null);
      setCropImageRef(null);
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
    } else if (visible && initialData) {
      // Pre-populate form with existing data when opening for edit
      console.log('📝 Loading existing card data for editing:', initialData);
      console.log('📝 InitialData (full object):', JSON.stringify(initialData, null, 2));
      console.log('📝 InitialData keys:', Object.keys(initialData));
      console.log('📝 InitialData entries:', Object.entries(initialData));
      
      // Log each field individually to see what's actually there
      console.log('📝 Field check:', {
        cardOwnerName: initialData.cardOwnerName,
        companyName: initialData.companyName,
        department: initialData.department,
        position: initialData.position,
        phone: initialData.phone,
        mobile: initialData.mobile,
        email: initialData.email,
        companyAddress: initialData.companyAddress,
        linkedIn: initialData.linkedIn,
        cardImageUrl: initialData.cardImageUrl
      });
      
      // Populate form with all available data from initialData
      // Use actual values from initialData, preserving empty strings vs undefined
      // Normalize image URL to fix Azure blob storage path resolution (%2F → /)
      const normalizedImageUrl = initialData.cardImageUrl ? normalizeImageUrl(initialData.cardImageUrl) : '';
      
      const existingFormData = {
        cardOwnerName: initialData.cardOwnerName ?? '',
        companyName: initialData.companyName ?? '',
        department: initialData.department ?? '',
        position: initialData.position ?? '',
        phone: initialData.phone ?? '',
        mobile: initialData.mobile ?? '',
        email: initialData.email ?? '',
        companyAddress: initialData.companyAddress ?? '',
        linkedIn: initialData.linkedIn ?? '',
        cardImageUrl: normalizedImageUrl
      };
      
      console.log('📝 Populating form with:', existingFormData);
      console.log('📝 FormData (stringified):', JSON.stringify(existingFormData, null, 2));
      
      // Set form data - this will populate the form fields
      setFormData(existingFormData);
      
      // Clear generated preview since we have existing data
      setGeneratedCardPreview(null);
      
      // If there's an existing card image, show it as preview (using normalized URL)
      if (normalizedImageUrl) {
        setCardPreview(normalizedImageUrl);
        // Don't set cardImage (File object) - let user upload new one if they want
        setCardImage(null);
      } else {
        // No existing image - clear preview
        setCardPreview(null);
        setCardImage(null);
      }
      
      // Use initialTab prop if provided, otherwise default based on context
      if (initialTab) {
        // If initialTab is provided (e.g., 'upload' for changing card image)
        setActiveTab(initialTab);
        // If changing card image, show form immediately so user can see/edit existing data
        // User can upload new image and form will update
      setShowForm(true);
      } else {
        // Default to 'manual' tab when editing form data
        setActiveTab('manual');
        setShowForm(true);
      }
      
      // Clear any previous errors
      setFieldErrors({});
      setTouchedFields({});
    }
  }, [visible, initialData, initialTab]);

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

      // Set form data with extracted values
      // Note: This will replace any existing form data, which is expected after OCR extraction
      // User can then manually edit the extracted data
      setFormData(extractedData);
      setShowForm(true);
      
      console.log('📝 Form data set after OCR extraction, ready for manual editing');
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
    if (cardImage && cardPreview && (activeTab === 'camera' || activeTab === 'upload') && !showForm && !processingOCR) {
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

  // Regenerate card preview for manual entry when formData changes
  useEffect(() => {
    if (activeTab === 'manual' && showForm) {
      const { cardOwnerName, companyName, position, email, mobile, phone, companyAddress } = formData;
      // Only generate if at least name, company, and email are present
      if (cardOwnerName && companyName && email) {
        // Generate preview asynchronously
        generateBusinessCard({
          cardOwnerName: cardOwnerName,
          position: position,
          companyName: companyName,
          email: email,
          mobile: mobile,
          phone: phone,
          companyAddress: companyAddress,
        })
          .then((generatedDataUrl) => {
            setGeneratedCardPreview(generatedDataUrl);
          })
          .catch((error) => {
            console.error('Error generating card preview:', error);
            // Don't set preview on error - user will see empty preview
            setGeneratedCardPreview(null);
          });
      } else {
        // Clear preview if required fields are missing
        setGeneratedCardPreview(null);
      }
    }
  }, [formData, activeTab, showForm]);

  // Handle tab switch
  const handleTabSwitch = (tab) => {
    if (processingOCR) {
      toast.warning('Please wait for OCR processing to complete');
      return;
    }
    setActiveTab(tab);
    if (tab === 'manual') {
      setShowForm(true);
    } else if (tab === 'camera' || tab === 'upload') {
      // If we have a preview from initialData but no uploaded file, allow upload
      // If we have a new uploaded file, keep showing the form
      if (cardPreview && !cardImage && initialData) {
        // Editing mode: existing image shown, but keep form visible so user can edit
        // Don't hide form - user should be able to see and edit existing data
        setShowForm(true);
      } else if (!cardPreview && !cardImage) {
        // No image at all - hide form until image is uploaded
        setShowForm(false);
      } else {
        // Has image (new upload) - show form
        setShowForm(true);
      }
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

    // Reset processed ref when uploading a new file (in case we're replacing an existing image)
    processedImageRef.current = null;
    
    setProcessingCrop(true);
    
    try {
      // Step 1: Store original image for crop adjustment
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalDataUrl = reader.result;
        setOriginalImage(originalDataUrl);
        
        try {
          // Step 2: Auto-detect crop bounds (get suggested crop area)
          const { croppedDataUrl, crop: autoCropBounds, warnings, quality } = await autoCropBusinessCard(file);
          
          // Note: We don't use croppedDataUrl here - we'll crop from original after user adjustment
          
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
          }
          
          // Display non-critical warnings as toasts (only if no critical errors)
          if (!hasCriticalErrors && warnings && warnings.length > 0) {
            warnings.forEach(warning => {
              if (warning.severity === 'warning') {
                toast.warning(warning.message, { autoClose: 4000 });
              }
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
          
          // Step 3: Convert auto-detected crop bounds to react-image-crop format
          // Load image to get dimensions
          const img = new Image();
          img.onload = async () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            // Convert auto-detected bounds to percentage-based crop
            // autoCropBounds has: { x, y, width, height } in pixels
            let initialCrop;
            
            if (autoCropBounds && autoCropBounds.width && autoCropBounds.height) {
              // Calculate crop coverage percentage
              const cropWidthPercent = (autoCropBounds.width / imgWidth) * 100;
              const cropHeightPercent = (autoCropBounds.height / imgHeight) * 100;
              const cropXPercent = (autoCropBounds.x / imgWidth) * 100;
              const cropYPercent = (autoCropBounds.y / imgHeight) * 100;
              
              // Check if auto-detected crop covers most of the image (>95% in both dimensions)
              // and is near the edges (<5% margin on all sides) - meaning it's the full image
              const coversMostOfImage = cropWidthPercent >= 95 && cropHeightPercent >= 95;
              const nearEdges = cropXPercent <= 5 && cropYPercent <= 5 && 
                                (cropXPercent + cropWidthPercent) >= 95 && 
                                (cropYPercent + cropHeightPercent) >= 95;
              
              if (coversMostOfImage && nearEdges) {
                // Auto-detected crop matches full image - use original image as-is
                console.log('✅ Auto-detected crop matches full image, using original image');
                
                // Set preview to original image
                setCardPreview(originalDataUrl);
                
                // Convert original data URL to File for OCR
                const originalFile = dataURLtoFile(originalDataUrl, 'original-card.jpg');
                setCardImage(originalFile);
                
                // Compress for backend
                try {
                  const compressedDataUrl = await compressBusinessCardImage(originalFile);
                  setFormData(prev => ({ ...prev, cardImageUrl: compressedDataUrl }));
                } catch (error) {
                  console.error('Image compression error:', error);
                  setFormData(prev => ({ ...prev, cardImageUrl: originalDataUrl }));
                }
                
                // Skip crop adjustment and proceed directly to OCR
                setShowCropAdjustment(false);
                setOriginalImage(null);
                setCrop(null);
                setCompletedCrop(null);
                setCropImageRef(null);
                setProcessingCrop(false);
                
                // Automatically proceed to OCR
                handleProcessOCR();
                return;
              }
              
              // Use auto-detected crop (not full image)
              initialCrop = {
                unit: '%',
                x: Math.max(0, cropXPercent),
                y: Math.max(0, cropYPercent),
                width: Math.min(100, cropWidthPercent),
                height: Math.min(100, cropHeightPercent),
              };
            } else {
              // Fallback: centered crop (80% of image, centered)
              initialCrop = {
                unit: '%',
                x: 10, // 10% from left = centered for 80% width
                y: 10, // 10% from top = centered for 80% height
                width: 80,
                height: 80,
              };
            }
            
            setCrop(initialCrop);
            setShowCropAdjustment(true);
            setProcessingCrop(false);
          };
          img.onerror = () => {
            // If image fails to load, use default crop
            const defaultCrop = {
              unit: '%',
              x: 10,
              y: 10,
              width: 80,
              height: 80,
            };
            setCrop(defaultCrop);
            setShowCropAdjustment(true);
            setProcessingCrop(false);
          };
          img.src = originalDataUrl;
          
        } catch (error) {
          console.error('Auto-crop error:', error);
          
          // Show error modal for detection failure
          setErrorModal({
            visible: true,
            title: 'Card Detection Failed',
            message: 'Could not automatically detect the business card. You can manually adjust the crop area.\n\nTips:\n• Drag the corners to adjust the crop\n• Drag the edges to resize\n• Drag the center to move the crop area'
          });
          
          // Fallback: show full image with default crop (centered, 80% of image)
          const img = new Image();
          img.onload = () => {
            const defaultCrop = {
              unit: '%',
              x: 10, // 10% from left = centered for 80% width
              y: 10, // 10% from top = centered for 80% height
              width: 80,
              height: 80,
            };
            setCrop(defaultCrop);
            setShowCropAdjustment(true);
            setProcessingCrop(false);
          };
          img.onerror = () => {
            // If image fails to load, use centered default crop
            const defaultCrop = {
              unit: '%',
              x: 10,
              y: 10,
              width: 80,
              height: 80,
            };
            setCrop(defaultCrop);
            setShowCropAdjustment(true);
            setProcessingCrop(false);
          };
          img.src = originalDataUrl;
        }
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process image. Please try again.');
      setProcessingCrop(false);
      return false;
    }
    
    return true;
  };

  // Skip crop and use original image as-is
  const handleSkipCrop = async () => {
    if (!originalImage) {
      toast.error('Original image not available');
      return;
    }
    
    setProcessingCrop(true);
    
    try {
      // Set preview to original image
      setCardPreview(originalImage);
      
      // Convert original data URL to File for OCR
      const originalFile = dataURLtoFile(originalImage, 'original-card.jpg');
      setCardImage(originalFile);
      
      // Compress for backend
      try {
        const compressedDataUrl = await compressBusinessCardImage(originalFile);
        setFormData(prev => ({ ...prev, cardImageUrl: compressedDataUrl }));
      } catch (error) {
        console.error('Image compression error:', error);
        setFormData(prev => ({ ...prev, cardImageUrl: originalImage }));
      }
      
      // Hide crop adjustment UI
      setShowCropAdjustment(false);
      setOriginalImage(null);
      setCrop(null);
      setCompletedCrop(null);
      setCropImageRef(null);
      setProcessingCrop(false);
      
      // Automatically proceed to OCR
      handleProcessOCR();
    } catch (error) {
      console.error('Skip crop error:', error);
      toast.error('Failed to process original image. Please try again.');
      setProcessingCrop(false);
    }
  };

  // Apply final crop and proceed with OCR
  const handleCropConfirm = async () => {
    // Use completedCrop if available (user adjusted), otherwise use current crop (initial auto-detected crop)
    // This handles the edge case where user clicks "Looks Good" without adjusting - uses the visible rectangle
    const finalCrop = completedCrop || crop;
    
    if (!finalCrop || !originalImage || !cropImageRef) {
      toast.error('Please adjust the crop area first');
      return;
    }
    
    if (!finalCrop.width || !finalCrop.height || finalCrop.width <= 0 || finalCrop.height <= 0) {
      toast.error('Please select a valid crop area.');
      return;
    }
    
    // Log which crop is being used for debugging
    if (completedCrop) {
      console.log('✅ Using user-adjusted crop');
    } else {
      console.log('✅ Using initial auto-detected crop (user did not adjust)');
    }
    
    // Check if crop matches full image (within 2% margin)
    if (cropImageRef) {
      const img = cropImageRef;
      
      // Handle percentage vs pixel format
      let displayX, displayY, displayWidth, displayHeight;
      if (finalCrop.unit === '%') {
        // Convert percentages to pixels for comparison
        displayX = (finalCrop.x / 100) * img.width;
        displayY = (finalCrop.y / 100) * img.height;
        displayWidth = (finalCrop.width / 100) * img.width;
        displayHeight = (finalCrop.height / 100) * img.height;
      } else {
        displayX = finalCrop.x || 0;
        displayY = finalCrop.y || 0;
        displayWidth = finalCrop.width || 0;
        displayHeight = finalCrop.height || 0;
      }
      
      const cropXPercent = (displayX / img.width) * 100;
      const cropYPercent = (displayY / img.height) * 100;
      const cropWidthPercent = (displayWidth / img.width) * 100;
      const cropHeightPercent = (displayHeight / img.height) * 100;
      
      // If crop covers >98% and is at edges, use original image instead
      if (cropWidthPercent >= 98 && cropHeightPercent >= 98 && 
          cropXPercent <= 2 && cropYPercent <= 2) {
        console.log('✅ Crop matches full image, using original image');
        handleSkipCrop();
        return;
      }
    }

    setProcessingCrop(true);
    
    try {
      // Get image element
      const img = cropImageRef;
      
      if (!img || !img.naturalWidth || !img.naturalHeight || !img.width || !img.height) {
        toast.error('Image not loaded properly. Please try again.');
        setProcessingCrop(false);
        return;
      }
      
      // Calculate scale factors (displayed size vs natural size)
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      
      // react-image-crop: when unit is '%', the crop values ARE percentages
      // But react-image-crop returns pixel values in onChange/onComplete based on displayed size
      // We need to check if values are percentages (0-100) or pixels (based on displayed size)
      let cropX, cropY, cropWidth, cropHeight;
      
      // Handle crop values: react-image-crop uses percentages (unit: '%') when crop is set via prop
      // but returns pixels in onChange/onComplete callbacks
      // If user didn't adjust crop, finalCrop (from crop state) is in percentage format
      // If user adjusted crop, finalCrop (from completedCrop) is in pixels
      let displayX, displayY, displayWidth, displayHeight;
      
      if (finalCrop.unit === '%') {
        // Crop is in percentage format (user didn't adjust - using initial auto-detected crop)
        // Convert percentages to pixels based on displayed image size
        displayX = (finalCrop.x / 100) * img.width;
        displayY = (finalCrop.y / 100) * img.height;
        displayWidth = (finalCrop.width / 100) * img.width;
        displayHeight = (finalCrop.height / 100) * img.height;
      } else {
        // Crop is already in pixels (user adjusted - from onComplete callback)
        displayX = finalCrop.x || 0;
        displayY = finalCrop.y || 0;
        displayWidth = finalCrop.width || 0;
        displayHeight = finalCrop.height || 0;
      }
      
      // Validate displayed crop dimensions
      if (displayWidth <= 0 || displayHeight <= 0 || displayWidth > img.width || displayHeight > img.height) {
        toast.error('Invalid crop area. Please adjust the crop area.');
        setProcessingCrop(false);
        return;
      }
      
      // Scale displayed pixels to natural image size
      cropX = displayX * scaleX;
      cropY = displayY * scaleY;
      cropWidth = displayWidth * scaleX;
      cropHeight = displayHeight * scaleY;
      
      // Ensure coordinates are valid numbers and within bounds
      cropX = Math.round(Math.max(0, Math.min(cropX, img.naturalWidth)));
      cropY = Math.round(Math.max(0, Math.min(cropY, img.naturalHeight)));
      cropWidth = Math.round(Math.max(1, Math.min(cropWidth, img.naturalWidth - cropX)));
      cropHeight = Math.round(Math.max(1, Math.min(cropHeight, img.naturalHeight - cropY)));
      
      // Debug logging
      console.log('📐 Crop Calculation:', {
        displayedSize: `${img.width}x${img.height}`,
        naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
        scale: `${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`,
        displayCrop: { x: displayX, y: displayY, width: displayWidth, height: displayHeight },
        naturalCrop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight }
      });
      
      // Ensure crop coordinates are within image bounds and have minimum size
      const MIN_CROP_SIZE = 100; // Minimum 100x100 pixels for OCR
      cropX = Math.max(0, Math.min(cropX, img.naturalWidth - MIN_CROP_SIZE));
      cropY = Math.max(0, Math.min(cropY, img.naturalHeight - MIN_CROP_SIZE));
      cropWidth = Math.max(MIN_CROP_SIZE, Math.min(cropWidth, img.naturalWidth - cropX));
      cropHeight = Math.max(MIN_CROP_SIZE, Math.min(cropHeight, img.naturalHeight - cropY));
      
      // Validate minimum size for OCR
      if (cropWidth < MIN_CROP_SIZE || cropHeight < MIN_CROP_SIZE) {
        toast.error(`Crop area is too small (minimum ${MIN_CROP_SIZE}x${MIN_CROP_SIZE} pixels). Please adjust the crop area.`);
        setProcessingCrop(false);
        return;
      }
      
      // Create canvas to crop the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.floor(cropWidth);
      canvas.height = Math.floor(cropHeight);
      
      // Draw cropped portion
      ctx.drawImage(
        img,
        Math.floor(cropX), Math.floor(cropY), Math.floor(cropWidth), Math.floor(cropHeight),
        0, 0, Math.floor(cropWidth), Math.floor(cropHeight)
      );
      
      // Get cropped image as data URL
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      
      // Convert to File for OCR
      const croppedFile = dataURLtoFile(croppedDataUrl, 'cropped-card.jpg');
      
      // Update preview and image
      setCardPreview(croppedDataUrl);
      setCardImage(croppedFile);
      
      // Compress for backend
      try {
        const compressedDataUrl = await compressBusinessCardImage(croppedFile);
        setFormData(prev => ({ ...prev, cardImageUrl: compressedDataUrl }));
      } catch (error) {
        console.error('Image compression error:', error);
        setFormData(prev => ({ ...prev, cardImageUrl: croppedDataUrl }));
      }
      
      // Hide crop adjustment UI
      setShowCropAdjustment(false);
      setOriginalImage(null);
      setCrop(null);
      setCompletedCrop(null);
      setCropImageRef(null);
      
      // Automatically proceed to OCR
      handleProcessOCR();
      
    } catch (error) {
      console.error('Crop application error:', error);
      toast.error('Failed to apply crop. Please try again.');
    } finally {
      setProcessingCrop(false);
    }
  };

  // Handle retake - reset and allow new upload
  const handleCropRetake = () => {
    setShowCropAdjustment(false);
    setOriginalImage(null);
    setCardPreview(null);
    setCardImage(null);
    setCrop(null);
    setCompletedCrop(null);
    setCropImageRef(null);
    setFormData(prev => ({ ...prev, cardImageUrl: '' }));
    setShowForm(false);
    setIsDragging(false);
    dragCounterRef.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please drop an image file');
        return false;
      }
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
    
    // Format phone numbers as user types (real-time formatting with country-specific patterns)
    let normalizedValue = value;
    if (name === 'phone' || name === 'mobile') {
      // Use formatAsYouType for real-time formatting with country-specific patterns
      const formatted = formatAsYouType(value, detectedCountry);
      normalizedValue = formatted || value;
    }
    
    // Update form data - preserve all other fields
    setFormData(prev => {
      const updated = { ...prev, [name]: normalizedValue };
      console.log('📝 Form field updated:', name, '→', normalizedValue);
      console.log('📝 Updated formData:', updated);
      return updated;
    });
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
    } else if (name === 'phone' || name === 'mobile') {
      // Use libphonenumber-js for accurate phone validation
      if (!value || !value.trim()) {
        error = `${name === 'phone' ? 'Phone' : 'Mobile'} is required`;
      } else {
        const validation = validatePhoneNumberLib(value, detectedCountry);
        if (!validation.isValid) {
          error = validation.error || `Please enter a valid ${name === 'phone' ? 'phone' : 'mobile'} number`;
        }
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
    'phone', // Phone is required
    'mobile', // Mobile is required
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

    // Validate all required fields (including phone and mobile)
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
    if ((activeTab === 'camera' || activeTab === 'upload') && (!formData.cardImageUrl || !formData.cardImageUrl.trim())) {
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
      // Find the first field with an error for a more specific message
      const firstErrorField = Object.keys(fieldErrors).find(field => fieldErrors[field]);
      const errorMessage = firstErrorField 
        ? `Please fix the error in the "${firstErrorField}" field and try again.`
        : 'Please fill in all required fields correctly before saving.';
      
      setErrorModal({
        visible: true,
        title: 'Validation Error',
        message: errorMessage + '\n\nAll fields marked with * are required. Please check your entries and try again.',
      });
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
    // Note: cardImageUrl is only included when editing without new image to keep existing
    // Note: ocrText is set to empty string as backend database has length limits
    // Format phone numbers for backend (E.164 format: +1234567890)
    const cardJsonData = {
      cardOwnerName: formData.cardOwnerName.trim(),
      companyName: formData.companyName.trim(),
      department: toNullIfEmpty(formData.department), // Optional: send null if empty
      position: formData.position.trim(),
      phone: formatPhoneForBackend(formData.phone.trim(), detectedCountry),
      mobile: formatPhoneForBackend(formData.mobile.trim(), detectedCountry),
      email: formData.email.trim(),
      companyAddress: formData.companyAddress.trim(),
      linkedIn: toNullIfEmpty(formData.linkedIn), // Optional: send null if empty
      ocrText: '' // Set to empty string - backend database has length limits
    };

    // Handle file/image logic:
    // Priority order:
    // 1. Uploaded file (cardImage instanceof File) - highest priority
    // 2. Generated preview (generatedCardPreview) - convert to File for manual entry
    // 3. Existing image URL when editing - keep it in cardData (no file sent)
    
    let fileToSave = null;
    
    // Step 1: Check for uploaded file (camera/upload tabs)
    if (cardImage instanceof File) {
      fileToSave = cardImage;
      console.log('📤 Step 1: Using new uploaded file:', fileToSave.name, fileToSave.size, 'bytes');
    }
    // Step 2: Check for generated preview (manual entry tab) - ALWAYS check this if it exists
    // This takes priority over existing image URLs when user is on manual tab
    else if (activeTab === 'manual') {
      // On manual tab, we should always have a generated preview or generate one
      if (generatedCardPreview && typeof generatedCardPreview === 'string' && generatedCardPreview.startsWith('data:')) {
        // Convert generated preview data URL to File
        try {
          fileToSave = dataURLtoFile(generatedCardPreview, 'generated-card.png');
          console.log('✅ Step 2: Using generated card preview (converted to File):', fileToSave.size, 'bytes');
        } catch (error) {
          console.error('Error converting generated preview to File:', error);
          // Fallback: try generating the file again
          try {
            fileToSave = await generateBusinessCardFile({
              cardOwnerName: cardJsonData.cardOwnerName,
              position: cardJsonData.position,
              companyName: cardJsonData.companyName,
              email: cardJsonData.email,
              mobile: cardJsonData.mobile,
              phone: cardJsonData.phone,
              companyAddress: cardJsonData.companyAddress,
            }, 'generated-card.png');
            console.log('✅ Step 2 (fallback): Regenerated business card file:', fileToSave.size, 'bytes');
          } catch (genError) {
            console.error('Error generating business card file:', genError);
            setErrorModal({
              visible: true,
              title: 'Card Generation Error',
              message: 'Failed to generate business card image. Please try again.',
            });
            return;
          }
        }
      } else {
        // Manual tab but no preview ready yet (timing issue) or preview is invalid
        // Generate the file synchronously to ensure we have it
        console.log('⚠️ Manual tab: No preview ready, generating file now...');
        try {
          fileToSave = await generateBusinessCardFile({
            cardOwnerName: cardJsonData.cardOwnerName,
            position: cardJsonData.position,
            companyName: cardJsonData.companyName,
            email: cardJsonData.email,
            mobile: cardJsonData.mobile,
            phone: cardJsonData.phone,
            companyAddress: cardJsonData.companyAddress,
          }, 'generated-card.png');
          console.log('✅ Step 2 (generated on save): Generated business card file:', fileToSave.size, 'bytes');
        } catch (genError) {
          console.error('Error generating business card file:', genError);
          setErrorModal({
            visible: true,
            title: 'Card Generation Error',
            message: 'Failed to generate business card image. Please try again.',
          });
          return;
        }
      }
    }
    // Step 3: Check if we need to generate a file for new card
    else if (!initialData) {
      // Creating NEW card (no initialData)
      if (activeTab === 'manual') {
        // Manual entry: generate a card from form data
        try {
          fileToSave = await generateBusinessCardFile({
            cardOwnerName: cardJsonData.cardOwnerName,
            position: cardJsonData.position,
            companyName: cardJsonData.companyName,
            email: cardJsonData.email,
            mobile: cardJsonData.mobile,
            phone: cardJsonData.phone,
            companyAddress: cardJsonData.companyAddress,
          }, 'generated-card.png');
          console.log('✅ Generated business card file for new manual entry:', fileToSave.size, 'bytes');
        } catch (error) {
          console.error('Error generating business card file:', error);
          setErrorModal({
            visible: true,
            title: 'Card Generation Error',
            message: 'Failed to generate business card image. Please try again or upload an image instead.',
          });
          return;
        }
      } else if (activeTab === 'camera' || activeTab === 'upload') {
        // New card on camera/upload tab: requires an image
        setErrorModal({
          visible: true,
          title: 'Image Required',
          message: 'Please upload an image file for your business card.\n\nYou can:\n• Take a photo using the camera\n• Upload an image file\n• Switch to "Manual Entry" to generate a card automatically',
        });
        return;
      }
    }
    // Step 4: Editing existing card without new file or generated preview
    // Only reach here if no uploaded file AND no generated preview
    else if (initialData && !fileToSave) {
      // Editing existing card (initialData exists) and we don't have a file to save yet
      const hasExistingImageUrl = cardPreview && typeof cardPreview === 'string' && cardPreview.startsWith('http');
      
      if (hasExistingImageUrl) {
        // We have an existing image URL - include it in cardData so backend knows to keep it
        // No file will be sent, backend will preserve the existing image
        cardJsonData.cardImageUrl = normalizeImageUrl(cardPreview);
        console.log('✅ Step 4: Editing without new image - keeping existing image URL:', cardJsonData.cardImageUrl);
      } else if (activeTab === 'manual') {
        // Editing but no existing image - generate new card
        try {
          fileToSave = await generateBusinessCardFile({
            cardOwnerName: cardJsonData.cardOwnerName,
            position: cardJsonData.position,
            companyName: cardJsonData.companyName,
            email: cardJsonData.email,
            mobile: cardJsonData.mobile,
            phone: cardJsonData.phone,
            companyAddress: cardJsonData.companyAddress,
          }, 'updated-card.png');
          console.log('✅ Step 4: Generated business card file for edit (no existing image):', fileToSave.size, 'bytes');
        } catch (error) {
          console.error('Error generating business card file:', error);
          setErrorModal({
            visible: true,
            title: 'Card Generation Error',
            message: 'Failed to generate business card image. Please try again or upload an image instead.',
          });
          return;
        }
      }
    }

    // Ensure cardImageUrl is NOT included when we're sending a new file
    // (backend will create new URL from uploaded file)
    if (fileToSave instanceof File) {
      // We're sending a new file - don't include old cardImageUrl
      // Backend will create new URL from the uploaded file
      delete cardJsonData.cardImageUrl;
      console.log('✅ Sending new file - cardImageUrl removed from cardData (backend will create new URL)');
    }

    // Log payload for debugging (after file logic is complete)
    console.log('🔍 Card JSON Data:', cardJsonData);
    console.log('🔍 Card Image File (new upload):', cardImage instanceof File ? `File(${cardImage.name}, ${cardImage.size} bytes)` : 'null');
    console.log('🔍 Generated Preview:', generatedCardPreview ? `exists (type: ${typeof generatedCardPreview}, starts with 'data:': ${typeof generatedCardPreview === 'string' && generatedCardPreview.startsWith('data:')})` : 'null');
    console.log('🔍 Generated Preview value (first 50 chars):', generatedCardPreview ? generatedCardPreview.substring(0, 50) + '...' : 'null');
    console.log('🔍 File To Save:', fileToSave instanceof File ? `File(${fileToSave.name}, ${fileToSave.size} bytes)` : 'null');
    console.log('🔍 File source:', fileToSave instanceof File ? 
      (cardImage instanceof File ? 'Uploaded file' : 'Generated preview') : 
      (cardJsonData.cardImageUrl ? 'Existing URL (no file)' : 'No file, no URL'));
    console.log('🔍 Card Preview (existing image URL):', cardPreview);
    console.log('🔍 Initial Data (editing mode):', !!initialData);
    console.log('🔍 Active Tab:', activeTab);
    console.log('🔍 cardImageUrl in cardData:', cardJsonData.cardImageUrl || 'undefined (correct when sending new file)');

    // Final validation before sending
    if (fileToSave instanceof File) {
      // Validate file is not corrupted
      if (fileToSave.size === 0) {
        setErrorModal({
          visible: true,
          title: 'Invalid File',
          message: 'The image file is empty (0 bytes). Please try uploading again.',
        });
        return;
      }
      
      if (fileToSave.size > 10 * 1024 * 1024) { // 10MB
        setErrorModal({
          visible: true,
          title: 'File Too Large',
          message: 'The image file is too large (max 10MB). Please compress or use a smaller image.',
        });
        return;
      }
      
      // Verify file type
      if (!fileToSave.type || !fileToSave.type.startsWith('image/')) {
        console.warn('⚠️ File type might be invalid:', fileToSave.type);
        // Don't block - let backend handle it, but log warning
      }
      
      console.log('✅ File validation passed:', {
        name: fileToSave.name,
        size: fileToSave.size,
        type: fileToSave.type,
        lastModified: new Date(fileToSave.lastModified).toISOString()
      });
    }

    try {
      // Pass both the file and card data to parent
      // For manual entry, we now have a generated card file
      await onSave({
        file: fileToSave || null,
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
          value={formData[name] || ''}
          onChange={handleInputChange}
          onBlur={() => setTouchedFields(prev => ({ ...prev, [name]: true }))}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-lg border ${
            hasError
              ? 'border-red-500 focus:ring-red-500'
              : isMissing && isTouched
              ? 'border-orange-300 focus:ring-orange-500'
              : 'border-brand-brown/20 focus:ring-brand-orange/50'
          } focus:outline-none focus:ring-2 bg-white text-brand-brown placeholder:text-brand-textSecondary/60 placeholder:italic`}
          // Ensure placeholder only shows when field is empty
          style={{ 
            fontStyle: formData[name] ? 'normal' : 'italic',
            color: formData[name] ? '#55231E' : 'inherit'
          }}
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
      <div ref={modalRef} className="bg-brand-cardLight rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl border border-brand-brown/20 max-h-[90vh] overflow-y-auto">
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
            onClick={() => handleTabSwitch('camera')}
            disabled={processingOCR || uploading}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'camera'
                ? 'text-brand-orange border-b-2 border-brand-orange'
                : 'text-brand-textSecondary hover:text-brand-brown'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Take Photo
            </div>
          </button>
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
              Upload
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

        {/* Camera Tab Content - Primary: Take Photo */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {showCropAdjustment && originalImage ? (
              // Crop Adjustment UI
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Adjust Crop Area</p>
                      <p className="text-xs">
                        Drag the corners or edges to adjust the crop area. You can increase or reduce the size to include exactly what you need.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 overflow-hidden min-h-[400px]">
                  <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                    <div className="flex items-center justify-center">
                      <ReactCrop
                        crop={crop}
                        onChange={(newCrop) => {
                          // react-image-crop: when unit is '%', onChange returns percentages
                          // Convert to pixels based on displayed size for display
                          if (newCrop && newCrop.unit === '%' && cropImageRef) {
                            const img = cropImageRef;
                            // Validate minimum size (in pixels on displayed image)
                            const minDisplayWidth = (100 / img.width) * 100; // Minimum 100px in percentage
                            const minDisplayHeight = (100 / img.height) * 100;
                            if (newCrop.width < minDisplayWidth || newCrop.height < minDisplayHeight) {
                              // Crop too small, keep current crop
                              return;
                            }
                          }
                          setCrop(newCrop);
                        }}
                        onComplete={(completedCrop) => {
                          // Store completed crop for final processing
                          if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
                            setCompletedCrop(completedCrop);
                            // Also update the crop state with completed crop
                            setCrop(completedCrop);
                          }
                        }}
                        aspect={undefined} // Free-form crop (no aspect ratio lock)
                        minWidth={100} // Minimum 100 pixels in percentage (0.1% if image is 100000px wide, but react-image-crop handles this)
                        minHeight={100} // Minimum 100 pixels in percentage
                      >
                        <img
                          ref={setCropImageRef}
                          src={originalImage}
                          alt="Original card"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '400px', 
                            display: 'block',
                            objectFit: 'contain'
                          }}
                          onLoad={() => {
                            // Ensure crop is set when image loads (centered)
                            if (!crop && cropImageRef) {
                              const defaultCrop = {
                                unit: '%',
                                x: 10, // 10% from left = centered for 80% width
                                y: 10, // 10% from top = centered for 80% height
                                width: 80,
                                height: 80,
                              };
                              setCrop(defaultCrop);
                            }
                          }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-between items-center">
                  <button
                    onClick={handleSkipCrop}
                    disabled={processingCrop || processingOCR || uploading}
                    className="px-4 py-2 text-sm font-medium text-brand-brown border border-brand-brown/30 rounded-lg hover:bg-brand-backgroundAlt transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Use original image without cropping"
                  >
                    <X className="w-4 h-4" />
                    Skip Crop (Use Original)
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleCropRetake}
                      disabled={processingCrop}
                      className="px-4 py-2 border border-brand-brown/30 text-brand-brown rounded-lg font-medium hover:bg-brand-backgroundAlt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleCropConfirm}
                      disabled={processingCrop || !crop}
                      className="px-6 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingCrop ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Looks Good
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : !showForm ? (
              <>
                {!cardPreview ? (
                  <div
                    ref={dropZoneRef}
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
                      id="card-camera"
                      disabled={processingOCR || uploading}
                    />
                    <label
                      htmlFor="card-camera"
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
                          : 'Click to take a photo or drag & drop'}
                      </p>
                      <p className="text-xs text-brand-textSecondary mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center group">
                      <img
                        src={cardPreview}
                        alt="Card preview"
                        className="max-w-full max-h-64 object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                      {/* Change Card Button - Camera Icon */}
                      <button
                        onClick={() => {
                          // Reset card preview and show upload interface
                          setCardPreview(null);
                          setCardImage(null);
                          setOriginalImage(null);
                          setCrop(null);
                          setCompletedCrop(null);
                          setShowCropAdjustment(false);
                          setShowForm(false);
                          setGeneratedCardPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                          // Keep form data intact so user doesn't lose their information
                        }}
                        disabled={processingCrop || processingOCR || uploading}
                        className="absolute top-2 right-2 p-2 bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        title="Change business card image - Upload, take picture, or drag & drop"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      {/* Remove Card Button - X Icon */}
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
                        className="absolute top-2 left-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50 shadow-sm"
                        title="Remove card"
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
                  <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center group">
                    <img
                      src={cardPreview}
                      alt="Card preview"
                      className="max-w-full max-h-48 object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                    {/* Change Card Button - Camera Icon */}
                    <button
                      onClick={() => {
                        // Reset card preview and show upload interface
                        setCardPreview(null);
                        setCardImage(null);
                        setOriginalImage(null);
                        setCrop(null);
                        setCompletedCrop(null);
                        setShowCropAdjustment(false);
                        setShowForm(false);
                        setGeneratedCardPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        // Keep form data intact so user doesn't lose their information
                      }}
                      disabled={processingCrop || processingOCR || uploading}
                      className="absolute top-2 right-2 p-2 bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      title="Change business card image - Upload, take picture, or drag & drop"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-semibold mb-2">⚠️ Please Review Extracted Information</p>
                      <p className="text-xs mb-2 leading-relaxed">
                        <span className="font-medium">Important:</span> Please carefully review the extracted information below and compare it with your business card image to ensure all data is accurate. OCR extraction may have errors, so it's essential to verify each field matches what's actually on the card.
                      </p>
                      <p className="text-xs">
                        All fields marked with{' '}
                        <span className="text-red-500 font-medium">*</span> are required.
                        Fill in or correct any missing or incorrect fields before saving to avoid discrepancies.
                      </p>
                    </div>
                  </div>
                </div>
                {renderForm()}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab Content - Secondary: Drag & Drop/File Picker (No Camera) */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {showCropAdjustment && originalImage ? (
              // Crop Adjustment UI (same as camera tab)
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Adjust Crop Area</p>
                      <p className="text-xs">
                        Drag the corners or edges to adjust the crop area. You can increase or reduce the size to include exactly what you need.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 overflow-hidden min-h-[400px]">
                  <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                    <div className="flex items-center justify-center">
                      <ReactCrop
                        crop={crop}
                        onChange={(newCrop) => {
                          if (newCrop && newCrop.unit === '%' && cropImageRef) {
                            const img = cropImageRef;
                            const minDisplayWidth = (100 / img.width) * 100;
                            const minDisplayHeight = (100 / img.height) * 100;
                            if (newCrop.width < minDisplayWidth || newCrop.height < minDisplayHeight) {
                              return;
                            }
                          }
                          setCrop(newCrop);
                        }}
                        onComplete={(completedCrop) => {
                          if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
                            setCompletedCrop(completedCrop);
                            setCrop(completedCrop);
                          }
                        }}
                        aspect={undefined}
                        minWidth={100}
                        minHeight={100}
                      >
                        <img
                          ref={setCropImageRef}
                          src={originalImage}
                          alt="Original card"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '400px', 
                            display: 'block',
                            objectFit: 'contain'
                          }}
                          onLoad={() => {
                            if (!crop && cropImageRef) {
                              const defaultCrop = {
                                unit: '%',
                                x: 10,
                                y: 10,
                                width: 80,
                                height: 80,
                              };
                              setCrop(defaultCrop);
                            }
                          }}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-between items-center">
                  <button
                    onClick={handleSkipCrop}
                    disabled={processingCrop || processingOCR || uploading}
                    className="px-4 py-2 text-sm font-medium text-brand-brown border border-brand-brown/30 rounded-lg hover:bg-brand-backgroundAlt transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Use original image without cropping"
                  >
                    <X className="w-4 h-4" />
                    Skip Crop (Use Original)
                  </button>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCropRetake}
                      disabled={processingCrop || processingOCR || uploading}
                      className="px-4 py-2 border border-brand-brown/30 text-brand-brown rounded-lg font-medium hover:bg-brand-backgroundAlt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleCropConfirm}
                      disabled={processingCrop || !crop}
                      className="px-6 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingCrop ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Looks Good
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!showForm ? (
                  <div className="space-y-4">
                    {!cardPreview ? (
                      <div
                        ref={dropZoneRef}
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
                          onChange={handleCardUpload}
                          className="hidden"
                          id="card-upload"
                          disabled={processingOCR || uploading}
                        />
                        <label
                          htmlFor="card-upload"
                          onDragOver={(e) => {
                            e.stopPropagation();
                          }}
                          className={`cursor-pointer flex flex-col items-center gap-3 ${
                            processingOCR || uploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{ pointerEvents: 'auto' }}
                        >
                          <div className="p-4 bg-brand-orange/10 rounded-full">
                            <Upload className="w-8 h-8 text-brand-orange" />
                          </div>
                          <p className="text-sm font-medium text-brand-brown">
                            {isDragging
                              ? 'Drop image here'
                              : 'Click to upload or drag & drop'}
                          </p>
                          <p className="text-xs text-brand-textSecondary mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center group">
                          <img
                            src={cardPreview}
                            alt="Card preview"
                            className="max-w-full max-h-64 object-contain"
                            style={{ mixBlendMode: 'multiply' }}
                          />
                          {/* Change Card Button - Camera Icon */}
                          <button
                            onClick={() => {
                              // Reset card preview and show upload interface
                              setCardPreview(null);
                              setCardImage(null);
                              setOriginalImage(null);
                              setCrop(null);
                              setCompletedCrop(null);
                              setShowCropAdjustment(false);
                              setShowForm(false);
                              setGeneratedCardPreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                              // Keep form data intact so user doesn't lose their information
                            }}
                            disabled={processingCrop || processingOCR || uploading}
                            className="absolute top-2 right-2 p-2 bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                            title="Change business card image - Upload, take picture, or drag & drop"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          {/* Remove Card Button - X Icon */}
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
                            className="absolute top-2 left-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50 shadow-sm"
                            title="Remove card"
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cardPreview && (
                      <div className="relative bg-white rounded-lg border border-brand-brown/20 p-4 flex items-center justify-center group">
                        <img
                          src={cardPreview}
                          alt="Card preview"
                          className="max-w-full max-h-48 object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                        {/* Change Card Button - Camera Icon */}
                        <button
                          onClick={() => {
                            // Reset card preview and show upload interface
                            setCardPreview(null);
                            setCardImage(null);
                            setOriginalImage(null);
                            setCrop(null);
                            setCompletedCrop(null);
                            setShowCropAdjustment(false);
                            setShowForm(false);
                            setGeneratedCardPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                            // Keep form data intact so user doesn't lose their information
                          }}
                          disabled={processingCrop || processingOCR || uploading}
                          className="absolute top-2 right-2 p-2 bg-brand-orange hover:bg-brand-orangeLight text-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                          title="Change business card image - Upload, take picture, or drag & drop"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                          <p className="font-semibold mb-2">⚠️ Please Review Extracted Information</p>
                          <p className="text-xs mb-2 leading-relaxed">
                            <span className="font-medium">Important:</span> Please carefully review the extracted information below and compare it with your business card image to ensure all data is accurate. OCR extraction may have errors, so it's essential to verify each field matches what's actually on the card.
                          </p>
                          <p className="text-xs">
                            All fields marked with{' '}
                            <span className="text-red-500 font-medium">*</span> are required.
                            Fill in or correct any missing or incorrect fields before saving to avoid discrepancies.
                          </p>
                        </div>
                      </div>
                    </div>
                    {renderForm()}
                  </div>
                )}
              </>
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
                    A basic business card will be automatically generated from your information.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Generated Card Preview */}
            {generatedCardPreview && (
              <div className="bg-white rounded-lg border border-brand-brown/20 p-4">
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                  Card Preview
                </label>
                <div className="flex items-center justify-center bg-brand-background rounded-lg p-4">
                  <img
                    src={generatedCardPreview}
                    alt="Generated business card preview"
                    className="max-w-full max-h-48 object-contain rounded-lg shadow-sm"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                <p className="text-xs text-brand-textSecondary text-center mt-2">
                  This is a preview of your business card. It will be generated automatically when you save.
                </p>
              </div>
            )}
            
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
          {/* Row 1: Full Name | Company Name */}
          {renderField('cardOwnerName', 'Full Name', 'text', 'JioME App', true)}
          {renderField('companyName', 'Company Name', 'text', 'JioME Group', true)}
          
          {/* Row 2: Position/Title | Email */}
          {renderField('position', 'Position/Title', 'text', 'Make your dreams come true', true)}
          {renderField('email', 'Email', 'email', 'support@jiomegroup.com', true)}
          
          {/* Row 3: Mobile | Phone */}
          {renderField('mobile', 'Mobile', 'tel', 'e.g., +65 9123 4567', true)}
          {renderField('phone', 'Phone', 'tel', 'e.g., +65 6123 4567', true)}
        </div>
        
        {/* Row 4: LinkedIn Profile (optional, full width) - Only show if there's a value */}
        {formData.linkedIn && formData.linkedIn.trim() && (
          renderField('linkedIn', 'LinkedIn Profile', 'url', '', false)
        )}
        
        {/* Row 5: Company Address (full width) */}
        {renderField('companyAddress', 'Company Address', 'text', 'e.g., 123 Business Street, Singapore 123456', true)}
        
        {/* Hidden fields: department - not displayed but still in formData for backend */}
        {/* OCR text is processed internally but not displayed to user - sent as empty string to backend */}
        {/* cardImageUrl is now hidden from user - auto-filled when image is uploaded */}
      </form>
    );
  }
};

export default AddCardModal;
