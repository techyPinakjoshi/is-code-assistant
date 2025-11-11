import React, { useState } from 'react';
import { BackIcon } from './icons';

interface EnterpriseContactFormProps {
    onBack: () => void;
    onClose: () => void;
}

const EnterpriseContactForm: React.FC<EnterpriseContactFormProps> = ({ onBack, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        employees: '',
        description: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const recipient = 'pinakjoshi7777@gmail.com';
        const subject = `Enterprise Plan Inquiry: ${formData.companyName}`;
        const body = `
New Enterprise Plan Inquiry:
---------------------------------
First Name: ${formData.firstName}
Last Name: ${formData.lastName}
Email: ${formData.email}
Company Name: ${formData.companyName}
Number of Employees: ${formData.employees}
---------------------------------
Message:
${formData.description}
        `.trim();

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        setSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 4000);
    };

    if (submitted) {
        return (
            <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-slate-800">Thank You!</h3>
                <p className="mt-2 text-slate-600">Your email client should now be open. Please send the pre-filled email to complete your inquiry.</p>
                <p className="mt-1 text-slate-500 text-sm">This window will close shortly.</p>
            </div>
        )
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4">
                <BackIcon />
                <span className="ml-1">Back to Plans</span>
            </button>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                        <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                        <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company Name</label>
                        <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="employees" className="block text-sm font-medium text-slate-700">Number of Employees</label>
                         <select name="employees" id="employees" value={formData.employees} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select a range</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-1000">201-1,000</option>
                            <option value="1000+">1,000+</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">How can we help?</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                    <p className="mt-1 text-xs text-slate-500">Please describe your requirements, e.g., API access needs, specific monitoring features, etc.</p>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-8 py-3 bg-slate-800 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                        Submit Inquiry
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EnterpriseContactForm;
