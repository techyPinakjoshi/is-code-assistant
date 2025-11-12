import React, { useState } from 'react';
import { Plan, PlanId } from '../types';
import { CheckIcon } from './icons';
import EnterpriseContactForm from './EnterpriseContactForm';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserPlan: PlanId;
  onUpgradeSelect: (plan: Plan) => void;
}

const plans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro Tier',
    price: '₹999',
    priceAmount: 999,
    pricePeriod: '/ user / month',
    features: [
      'Unlimited Queries',
      'Save Conversations',
      'Offline Access to Saved Data',
      'Standard Support',
    ],
    cta: 'Upgrade to Pro',
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business Tier',
    price: '₹5,000',
    priceAmount: 5000,
    pricePeriod: '/ user / month',
    features: [
      'All features of Pro Tier',
      'Team Management & Collaboration',
      'AI Analysis of Bill of Quantities',
      'AI Design Analysis (.dwg, .pdf)',
      'AI Work Progress Dashboard',
      'Priority Support',
    ],
    cta: 'Upgrade to Business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Tier',
    price: 'Custom',
    priceAmount: 0,
    pricePeriod: '',
    features: [
      'All features of Business Tier',
      'Full API Access',
      'AI Analysis from Photo Uploads',
      'AI Live Camera Monitoring',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
  },
];

const PlanCard: React.FC<{ plan: Plan; isCurrent: boolean; onSelect: (plan: Plan) => void; }> = ({ plan, isCurrent, onSelect }) => {
  const isEnterprise = plan.id === 'enterprise';
  return (
    <div className={`relative flex flex-col p-6 rounded-xl border-2 ${plan.isPopular ? 'border-blue-500' : 'border-slate-200'} ${isCurrent ? 'bg-slate-100' : 'bg-white'}`}>
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
      <div className="mt-2">
        <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
        <span className="text-md font-medium text-slate-500">{plan.pricePeriod}</span>
      </div>
      <ul className="mt-6 space-y-3 flex-grow">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-center space-x-3">
            <CheckIcon />
            <span className="text-slate-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full mt-8 py-3 px-6 font-semibold rounded-lg transition-colors duration-200 ${
          isCurrent 
            ? 'bg-slate-300 text-slate-600 cursor-not-allowed' 
            : isEnterprise
            ? 'bg-slate-800 text-white hover:bg-slate-900'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {isCurrent ? 'Current Plan' : plan.cta}
      </button>
    </div>
  );
};


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentUserPlan, onUpgradeSelect }) => {
  const [view, setView] = useState<'plans' | 'enterprise_contact'>('plans');

  if (!isOpen) return null;
  
  const handleClose = () => {
    onClose();
    // Reset view to default when closing
    setTimeout(() => setView('plans'), 300);
  }

  const handlePlanSelect = (plan: Plan) => {
    if (plan.id === 'enterprise') {
        setView('enterprise_contact');
    } else {
        onUpgradeSelect(plan);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                        {view === 'plans' ? 'Subscription Plans' : 'Enterprise Inquiry'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {view === 'plans' ? "Choose the plan that's right for your team." : "Fill out the form below and our team will get in touch."}
                    </p>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {view === 'plans' && (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <PlanCard 
                                key={plan.id}
                                plan={plan}
                                isCurrent={currentUserPlan === plan.id}
                                onSelect={handlePlanSelect}
                            />
                        ))}
                    </div>
                    <div className="mt-8 text-center text-sm text-slate-500">
                        <p>For the Free Tier, you are on a one-month trial. <a href="#" className="font-medium text-blue-600 hover:underline">Learn more</a>.</p>
                    </div>
                </>
            )}

            {view === 'enterprise_contact' && (
                <EnterpriseContactForm 
                    onBack={() => setView('plans')}
                    onClose={handleClose}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;