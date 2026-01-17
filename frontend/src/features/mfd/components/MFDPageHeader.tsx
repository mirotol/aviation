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
      <div className="header-section left">NAV INFO</div>
      <div className="header-section center">
        <div className="page-title">{title}</div>
      </div>
      <div className="header-section right">COM INFO</div>
    </div>
  );
};
