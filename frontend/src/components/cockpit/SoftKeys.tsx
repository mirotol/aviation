import React from 'react';

export const SoftKeys: React.FC<{ type: 'PFD' | 'MFD' }> = ({ type }) => {
  return (
    <div className="soft-keys">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="soft-key-button" />
      ))}
    </div>
  );
};
