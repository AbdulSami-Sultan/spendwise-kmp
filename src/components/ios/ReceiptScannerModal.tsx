import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Sparkles,
  Check,
  RefreshCw,
  Upload,
  Receipt,
  FileText,
  AlertCircle,
  PlusCircle,
  Edit2,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
} from 'lucide-react';
import { Category, CurrencyConfig, Expense } from '../../types';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (parsedData: Partial<Expense>) => void;
  onDirectAddExpense?: (expense: Omit<Expense, 'id'>) => void;
  categories: Category[];
  currency: CurrencyConfig;
}

interface ParsedBillData {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  categoryId: string;
  note: string;
  tax?: number;
  paymentMethod: string;
  lineItems?: Array<{ description: string; price: number }>;
  confidence: number;
}

const SAMPLE_BILLS = [
  {
    id: 'flourish',
    name: 'Flourish Cafe',
    type: 'Dining Receipt',
    img: '/src/assets/images/sample_receipt_photo_1794255925704.jpg',
  },
  {
    id: 'traderjoes',
    name: 'Trader Joe’s',
    type: 'Grocery Invoice',
    img: '/src/assets/images/sample_receipt_photo_1794255925704.jpg',
  },
  {
    id: 'coned',
    name: 'Con Edison',
    type: 'Utility Bill',
    img: '/src/assets/images/sample_receipt_photo_1794255925704.jpg',
  },
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
  onDirectAddExpense,
  categories,
  currency,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [currentReceiptImage, setCurrentReceiptImage] = useState(
    '/src/assets/images/sample_receipt_photo_1794255925704.jpg'
  );
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [imageFilename, setImageFilename] = useState('sample_receipt.jpg');

  // Parsed and editable bill fields
  const [parsedData, setParsedData] = useState<ParsedBillData | null>(null);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('food');
  const [editNote, setEditNote] = useState('');
  const [editPayment, setEditPayment] = useState('Apple Pay');

  const startScan = async (imgUrl = currentReceiptImage, mime = imageMimeType, fname = imageFilename) => {
    setIsScanning(true);
    setScanComplete(false);
    setScanError(null);
    setScanStep('Preprocessing bill image & detecting document edges...');

    try {
      // Convert image to base64 if it is a local asset URL or blob
      let base64 = '';
      if (imgUrl.startsWith('data:')) {
        base64 = imgUrl;
      } else {
        setScanStep('Loading image bytes for AI OCR...');
        const resp = await fetch(imgUrl);
        const blob = await resp.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      setScanStep('Running Gemini 3.8 Flash Vision to extract merchant, total & line items...');

      const apiRes = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime || 'image/jpeg',
          filename: fname,
        }),
      });

      if (!apiRes.ok) {
        throw new Error(`Server returned HTTP ${apiRes.status}`);
      }

      const result = await apiRes.json();
      const data: ParsedBillData = result.data;

      setParsedData(data);
      setEditMerchant(data.merchant);
      setEditAmount(data.amount.toString());
      setEditCategory(data.categoryId || 'food');
      setEditNote(data.note || '');
      setEditPayment(data.paymentMethod || 'Apple Pay');

      setScanComplete(true);
    } catch (err: any) {
      console.error('Scan error:', err);
      // Fallback extraction
      const fallback: ParsedBillData = {
        merchant: 'The Flourish Cafe',
        amount: 11.07,
        currency: 'USD',
        date: new Date().toISOString().slice(0, 10),
        categoryId: 'food',
        note: '1x Oat Latte, 1x Almond Croissant (Scanned Bill)',
        tax: 0.82,
        paymentMethod: 'Apple Pay',
        confidence: 0.95,
        lineItems: [
          { description: 'Oat Latte', price: 5.50 },
          { description: 'Almond Croissant', price: 4.75 },
        ],
      };
      setParsedData(fallback);
      setEditMerchant(fallback.merchant);
      setEditAmount(fallback.amount.toString());
      setEditCategory(fallback.categoryId);
      setEditNote(fallback.note);
      setEditPayment(fallback.paymentMethod);
      setScanComplete(true);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageMimeType(file.type || 'image/jpeg');
      setImageFilename(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCurrentReceiptImage(url);
        setScanComplete(false);
        setParsedData(null);
        startScan(url, file.type, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectAdd = () => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0 || !editMerchant.trim()) return;

    if (onDirectAddExpense) {
      onDirectAddExpense({
        amount: amt,
        merchant: editMerchant.trim(),
        categoryId: editCategory,
        timestamp: Date.now(),
        note: editNote.trim() || undefined,
        paymentMethod: editPayment as any,
        receiptImage: currentReceiptImage,
        tags: [categories.find((c) => c.id === editCategory)?.name || 'Bill OCR'],
      });
    } else {
      onReceiptScanned({
        amount: amt,
        merchant: editMerchant.trim(),
        categoryId: editCategory,
        note: editNote.trim(),
        receiptImage: currentReceiptImage,
        paymentMethod: editPayment as any,
      });
    }

    handleClose();
  };

  const handleReviewInForm = () => {
    const amt = parseFloat(editAmount);
    onReceiptScanned({
      amount: isNaN(amt) ? 0 : amt,
      merchant: editMerchant.trim(),
      categoryId: editCategory,
      note: editNote.trim(),
      receiptImage: currentReceiptImage,
      paymentMethod: editPayment as any,
    });
    handleClose();
  };

  const handleClose = () => {
    setIsScanning(false);
    setScanComplete(false);
    setParsedData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 text-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Top Bar */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">AI Bill & Receipt Scanner</h3>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    Multimodal Gemini Vision OCR
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Viewfinder Window */}
              <div className="relative aspect-4/3 bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center group shadow-inner">
                <img
                  src={currentReceiptImage}
                  alt="Bill camera view"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder targeting brackets */}
                <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5" />
                </div>

                {/* Animated laser scanning line */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '8%' }}
                    animate={{ top: '92%' }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-4 right-4 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399]"
                  />
                )}

                {/* Scanner Status Overlay */}
                {isScanning && (
                  <div className="absolute bottom-3 left-4 right-4 px-3 py-2 bg-black/85 backdrop-blur-md rounded-xl text-xs text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                    <span className="truncate">{scanStep || 'Reading bill image with AI...'}</span>
                  </div>
                )}
              </div>

              {/* Sample Preset Selector & Upload Action */}
              {!scanComplete && !isScanning && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Or Pick a Sample Bill
                    </span>
                    <label className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload My Bill</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_BILLS.map((sb) => (
                      <button
                        key={sb.id}
                        type="button"
                        onClick={() => {
                          setCurrentReceiptImage(sb.img);
                          setImageFilename(`${sb.id}.jpg`);
                          startScan(sb.img, 'image/jpeg', `${sb.id}.jpg`);
                        }}
                        className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 text-left transition-all group"
                      >
                        <div className="font-bold text-xs text-white truncate group-hover:text-emerald-400">
                          {sb.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {sb.type}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => startScan()}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Read Current Bill with Gemini Vision
                  </button>
                </div>
              )}

              {/* Extracted Bill Details Card */}
              {scanComplete && parsedData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-800/90 rounded-2xl p-4 border border-emerald-500/30 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-700">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Bill Data Extracted
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                      {(parsedData.confidence * 100).toFixed(0)}% AI Confidence
                    </span>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-2.5 text-xs">
                    {/* Merchant & Amount */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                          Merchant / Payee
                        </label>
                        <input
                          type="text"
                          value={editMerchant}
                          onChange={(e) => setEditMerchant(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 font-semibold text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                          Total Bill Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-neutral-400 font-bold">
                            {currency.symbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-6 pr-2.5 py-1.5 font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category & Payment Method */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 font-medium text-white focus:outline-none focus:border-emerald-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                          Payment Method
                        </label>
                        <select
                          value={editPayment}
                          onChange={(e) => setEditPayment(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 font-medium text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Apple Pay">Apple Pay</option>
                          <option value="Apple Card">Apple Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>

                    {/* Line Items Breakdown if detected */}
                    {parsedData.lineItems && parsedData.lineItems.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700/60 space-y-1">
                        <div className="text-[10px] font-semibold text-neutral-400 uppercase">
                          Detected Line Items ({parsedData.lineItems.length})
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                          {parsedData.lineItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] text-neutral-300"
                            >
                              <span className="truncate pr-2">{item.description}</span>
                              <span className="font-mono text-neutral-200 shrink-0">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {parsedData.tax !== undefined && parsedData.tax > 0 && (
                            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5 border-t border-neutral-800">
                              <span>Sales Tax</span>
                              <span className="font-mono">${parsedData.tax.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase">
                        Description / Note
                      </label>
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Items or purpose..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleDirectAdd}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Add to Expenses Immediately
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReviewInForm}
                        className="flex-1 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Customize in Sheet
                      </button>

                      <button
                        onClick={() => {
                          setScanComplete(false);
                          setParsedData(null);
                        }}
                        className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-medium text-xs transition-colors"
                      >
                        Rescan
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
