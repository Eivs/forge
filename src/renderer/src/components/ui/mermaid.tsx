import { FC, useEffect } from 'react';
import mermaid from 'mermaid';
import { cn } from '../../lib/utils';

export interface MermaidProps {
  theme?: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null';
  children?: any;
}

export const Mermaid: FC<MermaidProps> = ({ children, theme = 'default', ...props }) => {
  mermaid.initialize({
    startOnLoad: true,
    theme: theme,
    logLevel: 'fatal',
    securityLevel: 'strict',
    arrowMarkerAbsolute: false,
    ...props,
  });

  useEffect(() => {
    requestIdleCallback(() => {
      mermaid.contentLoaded();
    });
  }, [children]);

  return <div className={cn('mermaid flex w-full items-center justify-center')}>{children}</div>;
};

export default Mermaid;
