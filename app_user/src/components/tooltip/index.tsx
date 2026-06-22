import React from 'react';
import { TooltipMesure } from './TooltipMesure';
import { TooltipModal } from './TooltipModal';

export interface IAppTooltipProps {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  contentSide?: 'left' | 'center' | 'right';
  triangularColor?: string;
  type?: 'measure' | 'modal';
}

const AppTooltip = React.memo((props: IAppTooltipProps) => {
  const { children, tooltipContent, side = 'top', type = 'modal', triangularColor = 'white', contentSide = 'center' } = props;

  if (type === 'measure') {
    return (
      <TooltipMesure tooltipContent={tooltipContent} side={side} triangularColor={triangularColor} contentSide={contentSide}>
        {children}
      </TooltipMesure>
    )
  }

  if (type === 'modal') {
    return (
      <TooltipModal tooltipContent={tooltipContent} side={side} triangularColor={triangularColor} contentSide={contentSide}>
        {children}
      </TooltipModal>
    )
  }
})

export default AppTooltip;