import React from 'react';
import '../../../components/common/styles/EFISUnit.css';
import { usePageContext, MFD_PAGES } from '../pages/PageContext';
import { SoftkeyBar } from '../../cockpit/components/SoftkeyBar';
import { MFDPageHeader } from './MFDPageHeader';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { EngineDisplay } from './EngineDisplay';
import { ActiveFlightPlan } from '../pages/ActiveFlightPlan';

const MFD: React.FC = () => {
  const { mfdPageGroup, mfdPageSelection, mfdModalPage } = usePageContext();

  const currentGroup = mfdModalPage ?? mfdPageGroup;
  const pageDef = MFD_PAGES[currentGroup][mfdPageSelection];

  const PageComponent = pageDef.component;

  const NavComponent = MFD_PAGES.NAV[0].component;

  const content = (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <NavComponent />
      </div>
      {mfdModalPage === 'FPL' && (
        <div style={{ width: '50%', height: '100%', position: 'relative' }}>
          <ActiveFlightPlan />
        </div>
      )}
    </div>
  );

  return (
    <ScreenLayout
      top={
        <MFDPageHeader
          title={mfdModalPage === 'FPL' ? 'Active Flight Plan' : pageDef.name}
          pageIndex={mfdPageSelection + 1}
          pageCount={MFD_PAGES[currentGroup].length}
        />
      }
      leftSide={<EngineDisplay />}
      content={mfdModalPage === 'FPL' ? content : <PageComponent />}
      bottom={<SoftkeyBar type="MFD" />}
    />
  );
};

export default MFD;
