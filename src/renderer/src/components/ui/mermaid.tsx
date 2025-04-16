import { FC, useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../theme-provider';

export interface MermaidProps {
  theme?: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null';
  children?: any;
  className?: string;
}
declare global {
  interface Window {
    mermaid?: typeof mermaid;
  }
}

export const Mermaid: FC<MermaidProps> = () => {
  const { theme: currentTheme } = useTheme();

  useEffect(() => {
    const renderCode = () => {
      mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme === 'dark' ? 'dark' : 'default',
        logLevel: 'error',
        securityLevel: 'strict',
        arrowMarkerAbsolute: false,
        suppressErrorRendering: false,
      });

      mermaid.run();
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(renderCode);
    } else {
      setTimeout(renderCode, 100);
    }
  }, [currentTheme]);

  return <></>;
};

export default Mermaid;
