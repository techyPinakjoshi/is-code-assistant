import React, { useState, useEffect } from 'react';
import { Plan } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onPaymentSuccess: (plan: Plan) => void;
}

type PaymentStatus = 'generating' | 'pending' | 'verifying' | 'success';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
  const [status, setStatus] = useState<PaymentStatus>('generating');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const upiId = 'pinakjoshi143-2@okhdfcbank';
  const upiName = 'Pinak Joshi';

  useEffect(() => {
    if (isOpen) {
      setStatus('generating');
      setTransactionId(null);
      setQrCodeUrl('');

      // Simulate a backend call to generate a dynamic QR code for this specific transaction
      const timer = setTimeout(() => {
        const newTransactionId = `T${Date.now()}`;
        setTransactionId(newTransactionId);

        // In a real app, this transaction note would be used by the backend webhook to identify the payment
        const transactionNote = `Payment for ${plan.name} (${newTransactionId})`;
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${plan.priceAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
        
        setQrCodeUrl(dynamicQrCodeUrl);
        setStatus('pending');
      }, 2000); // 2-second delay to simulate network latency

      return () => clearTimeout(timer);
    }
  }, [isOpen, plan]);

  const handleConfirmPayment = () => {
    setStatus('verifying');
    // Simulate backend verification after payment
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess(plan); // Allocate service to the user
      }, 1500); // Wait a bit on the success screen before closing
    }, 2500);
  };
  
  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'generating':
        return (
          <div className="text-center py-16">
            <div className="flex justify-center items-center mb-4">
               <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Generating Secure Payment QR...</h3>
            <p className="mt-2 text-slate-600">Please wait while we create a unique transaction for you.</p>
          </div>
        );
      case 'verifying':
        return (
          <div className="text-center py-16">
            <div className="flex justify-center items-center mb-4">
               <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Verifying Payment...</h3>
            <p className="mt-2 text-slate-600">Please wait while we confirm your transaction for ID: <span className="font-mono bg-slate-200 px-1 rounded">{transactionId}</span>. Do not close this window.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-16">
            <div className="flex justify-center items-center mb-4">
              <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Payment Successful!</h3>
            <p className="mt-2 text-slate-600">Your <span className="font-semibold">{plan.name}</span> is now active. Welcome aboard!</p>
          </div>
        );
      case 'pending':
      default:
        return (
          <>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800">Complete Your Payment</h3>
              <p className="text-slate-600 mt-1">Scan the unique QR code below with your favorite UPI app.</p>
            </div>
            <div className="bg-white p-4 rounded-lg my-6 max-w-xs mx-auto shadow-inner border border-slate-200">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Unique UPI QR Code" className="w-full h-full rounded-md" />
                ) : (
                    <div className="w-[250px] h-[250px] bg-slate-200 animate-pulse rounded-md flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Loading QR...</span>
                    </div>
                )}
            </div>
            <div className="text-center text-sm text-slate-500 space-y-1">
                <p><span className="font-semibold">Plan:</span> {plan.name}</p>
                <p><span className="font-semibold">Amount:</span> {plan.price}{plan.pricePeriod}</p>
                <p><span className="font-semibold">Payable to:</span> {upiName}</p>
                {transactionId && <p><span className="font-semibold">Transaction ID:</span> <span className="font-mono bg-slate-200 px-1 rounded">{transactionId}</span></p>}
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                I Have Completed The Payment
              </button>
               <p className="text-xs text-slate-400 mt-3 text-center">
                This is a simulation. In a real app, payment would be auto-detected via server webhooks.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={status === 'pending' ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          {status === 'pending' && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
