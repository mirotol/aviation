import React, { useEffect } from 'react';
import { usePFDContext } from '../PFDContext';

export const PlaceholderMenu: React.FC<{ title: string }> = ({ title }) => {
  const { closePfdMenu, setOnPfdClr } = usePFDContext();

  useEffect(() => {
    setOnPfdClr(() => () => closePfdMenu());
    return () => setOnPfdClr(undefined);
  }, [closePfdMenu, setOnPfdClr]);

  return (
    <>
      <div className="pfd-menu-header">{title.toUpperCase()}</div>
      <div className="pfd-menu-content">
        <div style={{ padding: '10px', color: 'var(--text-dim)', fontSize: '12px' }}>
          NO DATA AVAILABLE
        </div>
      </div>
    </>
  );
};
