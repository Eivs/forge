/**
 * 主题提供者组件
 * 将 reablocks 的 ThemeProvider 和 useTheme 导出供项目使用
 */

import { useTheme as useReablocksTheme } from 'reablocks';
import { useThemeStore } from '../store/themeStore';

// 导出 reablocks 的 ThemeProvider
export { ThemeProvider } from 'reablocks';

// 封装 useTheme hook
export const useTheme = () => {
  const reablocksTheme = useReablocksTheme();
  const { theme, setTheme } = useThemeStore();

  return {
    theme,
    setTheme,
    reablocksTheme
  };
};
