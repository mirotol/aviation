import React from 'react';

interface SideKeysProps {
  position: 'left' | 'right';
}

export const SideKeys: React.FC<SideKeysProps> = ({ position }) => {
  return (
    <div className={`side-keys side-keys-${position}`}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bezel-button" />
      ))}
    </div>
  );
};
