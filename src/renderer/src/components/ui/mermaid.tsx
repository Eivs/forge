import { FC, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mermaid from 'mermaid';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useTheme } from '../theme-provider';

export interface MermaidProps {
  theme?: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null';
  id?: string;
  lazyLoad?: boolean;
  children: string;
}

declare global {
  interface Window {
    mermaid?: typeof mermaid;
  }
}

const getRandomID = (): string => {
  const timestamp = Date.now();
  const randomFactor = Math.random();
  return Math.floor(timestamp * randomFactor).toString();
};

const Mermaid: FC<MermaidProps> = ({ id = getRandomID(), children = '', lazyLoad = true }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVisible = useIntersectionObserver({
    ref: mermaidRef,
    threshold: 0.1,
    enabled: lazyLoad,
  });

  const { theme: currentTheme } = useTheme();

  window.mermaid = mermaid;
  const mermaidConfig = useMemo(
    () => ({
      theme: (currentTheme === 'light' ? 'default' : 'dark') as 'default' | 'dark',
      startOnLoad: false,
      arrowMarkerAbsolute: false,
      suppressErrorRendering: false,
    }),
    [currentTheme]
  );

  const initializeMermaid = useCallback(async () => {
    try {
      if (!mermaidRef.current) return;

      mermaid.initialize(mermaidConfig);
      const graph = await mermaid.render(`mermaid-diagram-${id}`, children);

      const { svg, bindFunctions } = graph;
      mermaidRef.current.innerHTML = svg;
      bindFunctions?.(mermaidRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  }, [id, children, mermaidConfig]);

  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    initializeMermaid();

    return () => {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = '';
      }
    };
  }, [children, isLoaded, isVisible, initializeMermaid]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsLoaded(true);
    });

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <div
      id={id}
      className="relative mermaid flex w-full items-center justify-center"
      ref={mermaidRef}
    >
      {error ? (
        <div className="text-destructive text-sm">Error: {error}</div>
      ) : !isVisible || !isLoaded ? (
        <div className="relative mermaid flex w-full items-center justify-center">
          <div className="animate-pulse flex flex-col space-y-2 p-4 bg-secondary/50 rounded-md">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Mermaid;
