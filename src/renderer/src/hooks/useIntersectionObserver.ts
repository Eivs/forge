import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverProps {
  ref: RefObject<Element>;
  threshold?: number;
  enabled?: boolean;
}

/**
 * 使用 Intersection Observer 监听元素是否进入视口的 Hook
 * @param ref - 要监听的元素引用
 * @param threshold - 触发阈值,默认 0.1
 * @param enabled - 是否启用观察器,默认 true
 * @returns isVisible - 元素是否可见
 */
export const useIntersectionObserver = ({
  ref,
  threshold = 0.1,
  enabled = true,
}: UseIntersectionObserverProps): boolean => {
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, threshold, enabled, isVisible]);

  return isVisible;
};
