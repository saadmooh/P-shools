import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select className={`px-3 py-2 border rounded-md ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
};

export default Select;