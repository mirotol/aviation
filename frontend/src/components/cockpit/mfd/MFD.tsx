import React from 'react';
import '../efis/EFISUnit.css';
import { usePageContext, MFD_PAGES } from '../pages/PageContext';
import { SoftkeyBar } from '../efis/SoftkeyBar';
import { MFDPageHeader } from './MFDPageHeader';
import { ScreenLayout } from '../efis/ScreenLayout';
import { EngineDisplay } from './EngineDisplay';

const MFD: React.FC = () => {
  const { mfdPageGroup, mfdPageSelection, mfdModalPage } = usePageContext();

  const currentGroup = mfdModalPage ?? mfdPageGroup;
  const pageDef = MFD_PAGES[currentGroup][mfdPageSelection];

  const PageComponent = pageDef.component;

  return (
    <ScreenLayout
      top={
        <MFDPageHeader
          title={pageDef.name}
          pageIndex={mfdPageSelection + 1}
          pageCount={MFD_PAGES[currentGroup].length}
        />
      }
      leftSide={<EngineDisplay />}
      content={<PageComponent />}
      bottom={<SoftkeyBar type="MFD" />}
    />
  );
};

export default MFD;
