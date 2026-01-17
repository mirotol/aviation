import React from 'react';
import '../styles/PFDAnnunciationBar.css';

export const PFDAnnunciationBar: React.FC = () => {
  return (
    <div className="pfd-annunciation-bar">
      {/* LEFT: NAV */}
      <div className="annunciation-section left">
        <div className="annunciation-row top">
          <div className="nav-info">NAV1 110.50</div>
        </div>
        <div className="annunciation-row bottom">
          <div className="nav-info">NAV2 113.70</div>
        </div>
      </div>

      {/* CENTER: NAV STATUS + AFCS */}
      <div className="annunciation-section center">
        {/* NAVIGATION STATUS BOX (TOP) */}
        <div className="nav-status-box">
          <div className="nav-status-left">
            <div className="nav-active-leg">KIXD → KCOS</div>
          </div>
          <div className="nav-status-right">
            <div className="nav-dis-brg">DIS 12.4NM&nbsp;&nbsp;BRG 273°</div>
          </div>
        </div>

        {/* AFCS STATUS BOX (BOTTOM) */}
        <div className="afcs-box">
          <div className="afcs-lateral">
            <span className="armed">GPS</span>
            <span className="active">HDG</span>
          </div>

          <div className="afcs-center">
            <span className="active">AP</span>
          </div>

          <div className="afcs-vertical">
            <span className="active">ALT</span>
            <span className="mode-reference">500FPM</span>
            <span className="armed">ALTS</span>
          </div>
        </div>
      </div>

      {/* RIGHT: COM */}
      <div className="annunciation-section right">
        <div className="annunciation-row top">
          <div className="com-info">COM1 118.30</div>
        </div>
        <div className="annunciation-row bottom">
          <div className="com-info">COM2 121.90</div>
        </div>
      </div>
    </div>
  );
};
