// 主题配置文件
export const themeConfig = {
  light: {
    // 背景色
    background: '#f8f9fa',
    foreground: '#1a1a1a',
    muted: '#6c757d',
    'muted-foreground': '#6c757d',
    
    // 卡片和组件
    card: '#ffffff',
    'card-foreground': '#1a1a1a',
    'card-muted': '#f1f3f5',
    
    // 主要颜色
    primary: '#0066ff',
    'primary-foreground': '#ffffff',
    
    // 次要颜色
    secondary: '#f1f3f5',
    'secondary-foreground': '#1a1a1a',
    
    // 强调色
    accent: '#f1f3f5',
    'accent-foreground': '#1a1a1a',
    
    // 边框
    border: '#e9ecef',
    input: '#e9ecef',
    
    // 消息气泡
    'user-message': '#e9f2ff',
    'user-message-foreground': '#1a1a1a',
    'assistant-message': '#ffffff',
    'assistant-message-foreground': '#1a1a1a',
    
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // 背景色
    background: '#141b2d',
    foreground: '#ffffff',
    muted: '#a1a1aa',
    'muted-foreground': '#a1a1aa',
    
    // 卡片和组件
    card: '#1e293b',
    'card-foreground': '#ffffff',
    'card-muted': '#1e293b',
    
    // 主要颜色
    primary: '#3b82f6',
    'primary-foreground': '#ffffff',
    
    // 次要颜色
    secondary: '#1e293b',
    'secondary-foreground': '#ffffff',
    
    // 强调色
    accent: '#1e293b',
    'accent-foreground': '#ffffff',
    
    // 边框
    border: '#2e3a59',
    input: '#2e3a59',
    
    // 消息气泡
    'user-message': '#2e3a59',
    'user-message-foreground': '#ffffff',
    'assistant-message': '#1e293b',
    'assistant-message-foreground': '#ffffff',
    
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// 字体配置
export const fontConfig = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// 间距配置
export const spacingConfig = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// 圆角配置
export const radiusConfig = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};
