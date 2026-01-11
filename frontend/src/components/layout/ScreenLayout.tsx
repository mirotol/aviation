import React from 'react';
import './styles/ScreenLayout.css';

interface ScreenLayoutProps {
  top: React.ReactNode;
  content: React.ReactNode;
  bottom: React.ReactNode;
  leftSide?: React.ReactNode; // Optional EngineDisplay
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ top, content, bottom, leftSide }) => {
  return (
    <div className="screen-layout">
      <div className="screen-top-bar">{top}</div>
      <div className="screen-content">
        {leftSide && <div className="screen-left-side">{leftSide}</div>}
        <div className="screen-main-content">{content}</div>
      </div>
      <div className="screen-bottom-bar">{bottom}</div>
    </div>
  );
};
