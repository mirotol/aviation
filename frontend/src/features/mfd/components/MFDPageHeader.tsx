import React from 'react';
import '../styles/MFDPageHeader.css';

interface MFDPageHeaderProps {
  title: string;
  pageIndex: number;
  pageCount: number;
}

export const MFDPageHeader: React.FC<MFDPageHeaderProps> = ({ title, pageIndex, pageCount }) => {
  return (
    <div className="mfd-page-header">
      <div className="header-section left">
        <div className="engine-data-summary">
          {/* Simple engine summary */}
          <span className="label">FUEL</span> <span className="value">40.0 GAL</span>
        </div>
      </div>
      <div className="header-section center">
        <div className="page-title">{title}</div>
      </div>
      <div className="header-section right">
        <div className="page-indicator">
          <div className="group-label">MAP</div>
          <div className="dots">
            {Array.from({ length: pageCount }).map((_, i) => (
              <span key={i} className={`dot ${i === pageIndex - 1 ? 'active' : ''}`}>
                ●
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
