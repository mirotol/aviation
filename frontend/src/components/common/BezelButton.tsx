import React from 'react';
import './styles/BezelButton.css';

interface BezelButtonProps {
  id?: string;
  label?: string | React.ReactNode;
  onClick?: (id?: string) => void;
  className?: string;
  variant?: 'small' | 'large' | 'softkey';
}

export const BezelButton: React.FC<BezelButtonProps> = ({
  id,
  label,
  onClick,
  className = '',
  variant,
}) => {
  let baseClass = 'bezel-button';
  if (variant === 'small') baseClass = 'bezel-button small';
  if (variant === 'softkey') baseClass = 'soft-key-button';

  return (
    <div className={`${baseClass} ${className}`} onClick={() => onClick?.(id)}>
      <span className="button-label">{label}</span>
    </div>
  );
};
