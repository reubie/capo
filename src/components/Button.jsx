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
    primary: 'bg-brand-orange text-brand-textOnDark hover:bg-brand-orangeLight focus:ring-brand-orange',
    secondary: 'bg-brand-orange text-brand-textOnDark hover:bg-brand-orangeLight focus:ring-brand-orange',
    outline: 'border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10 focus:ring-brand-orange',
    ghost: 'text-brand-textSecondary hover:bg-brand-brown/10 focus:ring-brand-orange',
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

