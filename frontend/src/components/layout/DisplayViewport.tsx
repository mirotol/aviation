import React from 'react';
import './styles/DisplayViewport.css';

export const DisplayViewport: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="display-viewport">{children}</div>;
};
