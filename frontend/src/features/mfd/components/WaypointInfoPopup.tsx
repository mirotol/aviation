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
              <span className="info-label">Name:</span>
              <span className="info-value">{searchResults[0].name || '---'}</span>
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
              <span className="location-label">BRG:</span>
              <span className="location-value">---°</span>
              <span className="location-label">DIS:</span>
              <span className="location-value">---NM</span>
            </div>
            <div className="location-row">
              <span className="location-label">Country:</span>
              <span className="location-value">---</span>
            </div>
            <div className="location-row">
              <span className="location-label">N:</span>
              <span className="location-value">{searchResults[0].latitude.toFixed(6)}°</span>
            </div>
            <div className="location-row">
              <span className="location-label">E:</span>
              <span className="location-value">{searchResults[0].longitude.toFixed(6)}°</span>
            </div>
          </>
        ) : (
          <div className="no-results">No waypoint found</div>
        )}
      </div>
    </div>
  );
};
