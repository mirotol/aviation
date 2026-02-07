import React from 'react';
import { NavPoint } from '../../../providers/WebSocketContext';
import '../styles/DuplicateSelectionPopup.css';

interface DuplicateSelectionPopupProps {
  waypointSearchQuery: string;
  searchResults: NavPoint[];
  selectedResultIndex: number;
}

export const DuplicateSelectionPopup: React.FC<DuplicateSelectionPopupProps> = ({
  waypointSearchQuery,
  searchResults,
  selectedResultIndex,
}) => {
  return (
    <div className="duplicate-selection-popup">
      <div className="duplicate-header">DUPLICATE WAYPOINTS</div>
      <div className="duplicate-content">
        {/* Waypoint Section */}
        <div className="duplicate-waypoint-section">
          <div className="section-label">Waypoint</div>
          <div className="waypoint-ident">{waypointSearchQuery.trim()}</div>
        </div>

        {/* Duplicates List Section */}
        <div className="duplicate-list-section">
          <div className="section-label">Duplicates</div>
          <div className="duplicate-list">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className={`duplicate-item ${idx === selectedResultIndex ? 'selected' : ''}`}
              >
                <span className="duplicate-type">{result.type}</span>
                <span className="duplicate-country">---</span>
              </div>
            ))}
          </div>
        </div>

        {/* Information Section */}
        <div className="duplicate-info-section">
          <div className="section-label">Information</div>
          <div className="duplicate-info-details">
            <div className="info-line">
              <span>Name: {searchResults[selectedResultIndex].name || '---'}</span>
            </div>
            <div className="info-line">
              <span>
                N: {searchResults[selectedResultIndex].latitude.toFixed(6)}° E:{' '}
                {searchResults[selectedResultIndex].longitude.toFixed(6)}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
