import React from 'react';

export const DisplayViewport: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="display-viewport">
      {children}
    </div>
  );
};
