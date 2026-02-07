import React from 'react';
import { NavPoint } from '../../../providers/WebSocketContext';
import '../styles/WaypointInfoPopup.css';

interface WaypointInfoPopupProps {
  waypointSearchQuery: string;
  waypointCharIndex: number;
  searchResults: NavPoint[];
}

export const WaypointInfoPopup: React.FC<WaypointInfoPopupProps> = ({
  waypointSearchQuery,
  waypointCharIndex,
  searchResults,
}) => {
  return (
    <div className="waypoint-info-popup">
      <div className="waypoint-info-header">WAYPOINT INFORMATION</div>

      {/* Selection Section */}
      <div className="waypoint-selection-section">
        <div className="section-label">IDENT, FACILITY, CITY</div>
        <div className="waypoint-ident-input">
          {waypointSearchQuery.split('').map((c, i) => (
            <span key={i} className={waypointCharIndex === i ? 'char-cursor' : ''}>
              {c === ' ' ? '_' : c}
            </span>
          ))}
        </div>
        {searchResults.length > 0 && (
          <div className="waypoint-info-details">
            <div className="info-line">
              <span className="info-value">{searchResults[0].name || '---'}</span>
            </div>
            <div className="info-line">
              <span className="info-value">---</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="waypoint-map-section">
        <div className="map-placeholder">Map Placeholder</div>
      </div>

      {/* Location Section */}
      <div className="waypoint-location-section">
        {searchResults.length > 0 ? (
          <>
            <div className="location-row">
              <div className="location-country">FINLAND</div>
            </div>
            <div className="location-row">
              <div className="location-group">
                <span className="location-label">BRG</span>
                <span className="location-value">---°</span>
              </div>
              <div className="location-coords">
                <span className="location-value">
                  N {searchResults[0].latitude >= 0 ? '' : 'S'}
                  {Math.abs(searchResults[0].latitude).toFixed(2)}°
                </span>
              </div>
            </div>
            <div className="location-row">
              <div className="location-group">
                <span className="location-label">DIS</span>
                <span className="location-value">---NM</span>
              </div>
              <div className="location-coords">
                <span className="location-value">
                  E {searchResults[0].longitude >= 0 ? '' : 'W'}
                  {Math.abs(searchResults[0].longitude).toFixed(2)}°
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="no-results">No waypoint found</div>
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', paddingBottom: '8px' }}>
        Press "ENT" to accept
      </div>
    </div>
  );
};
