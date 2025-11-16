import React from 'react';
import { cn } from '../utils/helpers';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-purplePrimary text-white hover:bg-brand-purpleLight focus:ring-brand-purpleGlow',
    secondary: 'bg-brand-bluePrimary text-white hover:bg-brand-blueGlow focus:ring-brand-blueGlow',
    outline: 'border-2 border-brand-purplePrimary text-brand-purplePrimary hover:bg-brand-purplePrimary/10 focus:ring-brand-purpleGlow',
    ghost: 'text-brand-textSecondary hover:bg-white/10 focus:ring-brand-blueGlow',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

