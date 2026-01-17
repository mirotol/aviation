import React from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { usePageContext } from '../pages/PageContext';
import '../styles/MFDPageHeader.css';

interface MFDPageHeaderProps {
  title: string;
  pageIndex: number;
  pageCount: number;
}

export const MFDPageHeader: React.FC<MFDPageHeaderProps> = ({ title, pageIndex, pageCount }) => {
  const { snapshot } = useWebSocket();
  const { mfdPageGroup, mfdModalPage } = usePageContext();

  const gs = snapshot ? Math.round(snapshot.airSpeed.speed) : 0;
  const trk = snapshot ? Math.round(snapshot.attitude.yaw) : 0;
  const trkStr = trk.toString().padStart(3, '0');

  const groupLabel = mfdModalPage || mfdPageGroup;

  return (
    <div className="mfd-page-header">
      <div className="header-section left">{groupLabel} INFO</div>

      <div className="header-section center">
        {/* TOP: NAV DATA */}
        <div className="center-row top">
          <div className="nav-metric">
            <span className="nav-label">GS</span>
            <span className="nav-value">{gs}KT</span>
          </div>

          <div className="nav-metric">
            <span className="nav-label">DTK</span>
            <span className="nav-value">273°</span>
          </div>

          <div className="nav-metric">
            <span className="nav-label">TRK</span>
            <span className="nav-value">{trkStr}°</span>
          </div>

          <div className="nav-metric">
            <span className="nav-label">ETE</span>
            <span className="nav-value">00:18</span>
          </div>
        </div>

        {/* BOTTOM: PAGE INFO */}
        <div className="center-row bottom">
          <div className="page-title">{groupLabel} – {title}</div>
        </div>
      </div>

      <div className="header-section right">COM INFO</div>
    </div>
  );
};
