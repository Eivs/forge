import { create } from 'zustand';
import { useEffect } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  systemTheme: 'light' | 'dark';
  updateSystemTheme: () => void;
}

// 创建一个函数来获取当前系统主题
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  systemTheme: getSystemTheme(),
  setTheme: theme => {
    set({ theme });
    window.electron.settings.set('theme', theme);

    // 更新 HTML 元素的主题类
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(`theme-${systemTheme}`);
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.classList.add(`theme-${theme}`);
      root.setAttribute('data-theme', theme);
    }
  },

  // 更新系统主题
  updateSystemTheme: () => {
    const newSystemTheme = getSystemTheme();
    set({ systemTheme: newSystemTheme });

    // 如果当前主题是系统主题，则需要更新 HTML 元素的主题类
    if (get().theme === 'system') {
      const root = window.document.documentElement;
      root.classList.remove('theme-light', 'theme-dark');
      root.classList.add(`theme-${newSystemTheme}`);
      root.setAttribute('data-theme', newSystemTheme);
    }
  },
}));

// 创建一个自定义 hook 来监听系统主题变化
export const useSystemTheme = () => {
  const { updateSystemTheme } = useThemeStore();

  useEffect(() => {
    // 初始化时更新一次
    updateSystemTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateSystemTheme();

    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(handleChange);
    }

    // 清理监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // 兼容旧浏览器
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [updateSystemTheme]);

  return useThemeStore(state => state.systemTheme);
};
