import React from 'react';
import { Category } from '../types';

interface CategoryButtonProps {
  name: Category;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ name, icon, isActive, onClick }) => {
  const baseClasses = "flex flex-col items-center justify-center text-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer h-full";
  const activeClasses = "bg-blue-100 border-blue-500 text-blue-700 shadow-md";
  const inactiveClasses = "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm text-slate-600";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-semibold">{name}</span>
    </div>
  );
};

export default CategoryButton;