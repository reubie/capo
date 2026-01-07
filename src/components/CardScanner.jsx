import React, { useState, useEffect } from 'react';
import { CheckCircle, X, RotateCw, AlertCircle } from 'lucide-react';
import { scanBusinessCard, renderAppleStyleCard } from '../utils/appleCardScanner';
import { toast } from 'react-toastify';

/**
 * CardScanner Component
 * Apple-style business card scanner with preview and confirm/retake flow
 */
const CardScanner = ({ imageFile, onConfirm, onRetake, onCancel }) => {
  const [originalImage, setOriginalImage] = useState(null);
  const [scannedCard, setScannedCard] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [finalCard, setFinalCard] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (imageFile) {
      // Load original image for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
      };
      reader.readAsDataURL(imageFile);
      
      // Process the image
      processImage(imageFile);
    }
  }, [imageFile]);

  const processImage = async (file) => {
    setProcessing(true);
    setWarnings([]);
    
    try {
      // Step 1: Scan the card (detect, correct perspective, enhance)
      const result = await scanBusinessCard(file);
      
      // Step 2: Render in Apple-style presentation
      const appleStyleCard = await renderAppleStyleCard(result.scannedCard);
      
      setScannedCard(result.scannedCard);
      setFinalCard(appleStyleCard);
      setWarnings(result.warnings || []);
      
      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          if (warning.severity === 'error') {
            toast.error(warning.message);
          } else if (warning.severity === 'warning') {
            toast.warning(warning.message);
          }
        });
      }
    } catch (error) {
      console.error('Card scanning error:', error);
      toast.error('Failed to scan business card. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (scannedCard) {
      // Use the scanned card (perspective-corrected, enhanced) for OCR
      // This is the actual card image without the Apple-style presentation
      fetch(scannedCard)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'scanned-card.jpg', { type: 'image/jpeg' });
          // Pass the file (for OCR) and the Apple-style rendered version (for display)
          onConfirm(file, finalCard || scannedCard);
        })
        .catch(err => {
          console.error('Error converting scanned card:', err);
          toast.error('Failed to process scanned card');
        });
    }
  };

  const handleRetake = () => {
    setOriginalImage(null);
    setScannedCard(null);
    setFinalCard(null);
    setWarnings([]);
    onRetake();
  };

  if (!imageFile && !originalImage) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Processing Indicator */}
      {processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Scanning business card...</p>
              <p className="text-xs mt-1">Detecting edges, correcting perspective, and enhancing image</p>
            </div>
          </div>
        </div>
      )}

      {/* Original vs Scanned Comparison */}
      {!processing && originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Original Photo
            </label>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-brand-brown/20">
              <img
                src={originalImage}
                alt="Original photo"
                className="w-full h-64 object-contain"
              />
            </div>
          </div>

          {/* Scanned Card (Apple-style) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
              Scanned Card
            </label>
            <div className="relative bg-brand-background rounded-lg overflow-hidden border border-brand-brown/20 p-4 flex items-center justify-center min-h-[256px]">
              {finalCard ? (
                <img
                  src={finalCard}
                  alt="Scanned business card"
                  className="max-w-full max-h-64 object-contain shadow-lg rounded"
                />
              ) : scannedCard ? (
                <img
                  src={scannedCard}
                  alt="Scanned business card"
                  className="max-w-full max-h-64 object-contain"
                />
              ) : (
                <div className="text-center text-brand-textSecondary">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Processing...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && !processing && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                warning.severity === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : warning.severity === 'warning'
                  ? 'bg-orange-50 border-orange-200 text-orange-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{warning.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!processing && finalCard && (
        <div className="flex gap-3 pt-4 border-t border-brand-brown/20">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRetake}
            className="flex-1 py-2.5 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Retake
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 bg-brand-orange text-brand-textOnDark rounded-lg font-bold hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Use This Card
          </button>
        </div>
      )}
    </div>
  );
};

export default CardScanner;

