import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, Check, RefreshCw, Upload } from 'lucide-react';
import { Expense } from '../../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (parsedData: Partial<Expense>) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentReceiptImage, setCurrentReceiptImage] = useState('/src/assets/images/sample_receipt_photo_1794255925704.jpg');

  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1800);
  };

  const handleApply = () => {
    onReceiptScanned({
      amount: 11.07,
      merchant: 'The Flourish Cafe',
      categoryId: 'food',
      note: 'Oat Latte & Almond Croissant (OCR Scanned)',
      receiptImage: currentReceiptImage,
    });
    setScanComplete(false);
    onClose();
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCurrentReceiptImage(url);
      setScanComplete(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Top Bar */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">Smart Receipt Scanner</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Window */}
            <div className="relative aspect-4/3 bg-black overflow-hidden flex items-center justify-center">
              <img
                src={currentReceiptImage}
                alt="Receipt camera feed"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90"
              />

              {/* Viewfinder targeting brackets */}
              <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-xl">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />
              </div>

              {/* Animated laser scanning line */}
              {isScanning && (
                <motion.div
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2, ease: 'easeInOut' }}
                  className="absolute left-4 right-4 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399]"
                />
              )}

              {/* Scanner Status Overlay */}
              {isScanning && (
                <div className="absolute bottom-3 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-xs text-emerald-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Analyzing receipt line items & tax...</span>
                </div>
              )}
            </div>

            {/* OCR Extracted Data / Action area */}
            <div className="p-4 space-y-3">
              {scanComplete ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-800/80 rounded-2xl p-3 border border-neutral-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Receipt Parsed Successfully
                    </span>
                    <span className="text-sm font-bold font-mono tabular-nums text-white">$11.07</span>
                  </div>

                  <div className="text-xs text-neutral-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Merchant</span>
                      <span className="font-medium text-white">The Flourish Cafe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Items</span>
                      <span className="font-medium text-white">1x Oat Latte, 1x Croissant</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Category</span>
                      <span className="font-medium text-emerald-400">Food & Dining</span>
                    </div>
                  </div>

                  <button
                    onClick={handleApply}
                    className="w-full py-2.5 mt-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Insert Into Expense Form
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={startScan}
                    disabled={isScanning}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isScanning ? 'Scanning...' : 'Scan Sample Receipt'}
                  </button>

                  <div className="flex items-center justify-center">
                    <label className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer py-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload different receipt photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
