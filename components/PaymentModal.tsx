// FIX: Import 'useCallback' from React to resolve 'Cannot find name' error.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plan } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  onPaymentSuccess: (plan: Plan) => void;
}

type PaymentStatus = 'collectUsers' | 'generating' | 'pending' | 'verifying' | 'success';

const VALID_COUPON = 'DEMO2024';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
  const [status, setStatus] = useState<PaymentStatus>('collectUsers');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'invalid' | 'applied'>('idle');

  const upiId = 'pinakjoshi143-2@okhdfcbank';
  const upiName = 'Pinak Joshi';

  const costs = useMemo(() => {
    const subtotal = plan.priceAmount * numberOfUsers;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  }, [plan.priceAmount, numberOfUsers]);


  useEffect(() => {
    if (isOpen) {
      setStatus('collectUsers');
      setTransactionId(null);
      setQrCodeUrl('');
      setNumberOfUsers(1);
      setCoupon('');
      setCouponStatus('idle');
    }
  }, [isOpen]);

  useEffect(() => {
    if (status === 'generating') {
      const timer = setTimeout(() => {
        const newTransactionId = `T${Date.now()}`;
        setTransactionId(newTransactionId);

        const transactionNote = `Payment for ${plan.name} x${numberOfUsers} users (${newTransactionId})`;
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${costs.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
        
        setQrCodeUrl(dynamicQrCodeUrl);
        setStatus('pending');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, plan, numberOfUsers, costs.total, upiId, upiName]);
  
  const handleConfirmPayment = useCallback(() => {
    setStatus('verifying');
    // Simulate backend verification after payment
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess(plan); // Allocate service to the user
      }, 1500); // Wait a bit on the success screen before closing
    }, 2500);
  }, [plan, onPaymentSuccess]);
  
  // Auto-detect payment
  useEffect(() => {
      if (status === 'pending') {
          const autoDetectTimer = setTimeout(() => {
              handleConfirmPayment();
          }, 7000); // Auto-verify after 7 seconds
          return () => clearTimeout(autoDetectTimer);
      }
  }, [status, handleConfirmPayment]);


  const handleProceedToPayment = () => {
    if (numberOfUsers > 0) {
      setStatus('generating');
    }
  };
  
  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === VALID_COUPON) {
        setCouponStatus('applied');
        setTimeout(() => {
            onPaymentSuccess(plan);
        }, 1500); // show success message then close
    } else {
        setCouponStatus('invalid');
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'collectUsers':
        return (
          <>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800">Confirm Your Subscription</h3>
              <p className="text-slate-600 mt-1">You are subscribing to the <span className="font-semibold">{plan.name}</span>.</p>
            </div>

            {couponStatus === 'applied' ? (
                <div className="text-center py-10">
                    <div className="flex justify-center items-center mb-4">
                        <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Coupon Applied!</h3>
                    <p className="mt-2 text-slate-600">Your <span className="font-semibold">{plan.name}</span> plan is being activated.</p>
                </div>
            ) : (
             <>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="numberOfUsers" className="block text-sm font-medium text-slate-700">How many users to subscribe?</label>
                    <input
                      type="number"
                      id="numberOfUsers"
                      value={numberOfUsers}
                      onChange={(e) => setNumberOfUsers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal ({numberOfUsers} &times; ₹{plan.priceAmount.toLocaleString('en-IN')})</span>
                        <span className="font-medium text-slate-800">₹{costs.subtotal.toLocaleString('en-IN')}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-slate-600">GST (18%)</span>
                        <span className="font-medium text-slate-800">₹{costs.gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                     <div className="flex justify-between text-lg font-bold border-t border-slate-300 pt-2 mt-2">
                        <span className="text-slate-900">Total Payable</span>
                        <span className="text-blue-600">₹{costs.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                     </div>
                  </div>
                </div>
                
                <div className="my-6">
                    <div className="flex items-center">
                        <div className="flex-grow border-t border-slate-300"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-slate-300"></div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="coupon" className="block text-sm font-medium text-slate-700 mb-1">Have a coupon code?</label>
                        <div className="flex space-x-2">
                             <input
                                type="text"
                                id="coupon"
                                value={coupon}
                                onChange={(e) => {
                                    setCoupon(e.target.value);
                                    if (couponStatus !== 'idle') setCouponStatus('idle');
                                }}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., DEMO2024"
                            />
                            <button onClick={handleApplyCoupon} className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-700">Apply</button>
                        </div>
                        {couponStatus === 'invalid' && <p className="text-sm text-red-600 mt-1">Invalid coupon code. Please try again.</p>}
                    </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
                    disabled={numberOfUsers < 1}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </>
            )}
          </>
        );
      case 'generating':
        return (
          <div className="text-center py-16">
            <div className="flex justify-center items-center mb-4">
               <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
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
               <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
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
              <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
            <div className="bg-white p-4 rounded-lg my-6 max-w-xs mx-auto shadow-inner border border-slate-200 flex justify-center items-center">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Unique UPI QR Code" className="rounded-md" width="200" height="200" />
                ) : (
                    <div className="w-[200px] h-[200px] bg-slate-200 animate-pulse rounded-md flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Loading QR...</span>
                    </div>
                )}
            </div>
            <div className="text-center text-sm text-slate-500 space-y-1">
                <p><span className="font-semibold">Plan:</span> {plan.name} (x{numberOfUsers} Users)</p>
                <p><span className="font-semibold">Total Amount:</span> ₹{costs.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p><span className="font-semibold">Payable to:</span> {upiName}</p>
                {transactionId && <p><span className="font-semibold">Transaction ID:</span> <span className="font-mono bg-slate-200 px-1 rounded">{transactionId}</span></p>}
            </div>
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center text-slate-500">
                <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Waiting for payment confirmation...</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                This is a simulation. Payment will be auto-detected shortly.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={['collectUsers', 'pending'].includes(status) ? onClose : undefined}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          {['collectUsers', 'pending'].includes(status) && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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