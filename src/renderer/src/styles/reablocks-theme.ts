import { ReablocksTheme, extendTheme, theme as baseTheme } from 'reablocks';
import { themeConfig } from './theme';

/**
 * 创建自定义的 reablocks 主题
 * 基于项目现有的主题配置
 */
export const createReablocksTheme = (mode: 'light' | 'dark'): ReablocksTheme => {
  const currentTheme = themeConfig[mode];

  return extendTheme(baseTheme, {
    components: {
      // 按钮组件
      button: {
        base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        variants: {
          default: `bg-primary text-primary-foreground hover:bg-primary/90`,
          destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ghost: 'hover:bg-accent hover:text-accent-foreground',
          link: 'underline-offset-4 hover:underline text-primary',
        },
        sizes: {
          default: 'h-10 py-2 px-4',
          sm: 'h-9 px-3 rounded-md',
          lg: 'h-11 px-8 rounded-md',
          icon: 'h-10 w-10',
        },
      },

      // 输入框组件
      input: {
        base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },

      // 对话框组件
      dialog: {
        base: 'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
        overlay:
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
        content:
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full',
        title: 'text-lg font-semibold text-foreground',
        description: 'text-sm text-muted-foreground',
      },

      // 下拉菜单组件
      select: {
        base: 'relative w-full',
        trigger:
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        content:
          'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
        item: 'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      },

      // 卡片组件
      card: {
        base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
        header: 'flex flex-col space-y-1.5 p-6',
        title: 'text-2xl font-semibold leading-none tracking-tight',
        description: 'text-sm text-muted-foreground',
        content: 'p-6 pt-0',
        footer: 'flex items-center p-6 pt-0',
      },

      // 工具提示组件
      tooltip: {
        base: 'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
      },

      // 标签页组件
      tabs: {
        base: 'relative',
        list: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        trigger:
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        content:
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },

      // 头像组件
      avatar: {
        base: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        image: 'aspect-square h-full w-full',
        fallback: 'flex h-full w-full items-center justify-center rounded-full bg-muted',
      },

      // 徽章组件
      badge: {
        base: 'inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants: {
          default: 'bg-primary text-primary-foreground hover:bg-primary/80',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
          outline: 'text-foreground',
        },
      },

      // 复选框组件
      checkbox: {
        base: 'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      },

      // 单选框组件
      radio: {
        base: 'peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      },

      // 开关组件
      toggle: {
        base: 'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        thumb:
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      },

      // 文本区域组件
      textarea: {
        base: 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },

      // 加载器组件
      loader: {
        base: 'animate-spin text-muted-foreground',
      },
    },
  });
};

// 导出亮色和暗色主题
export const lightTheme = createReablocksTheme('light');
export const darkTheme = createReablocksTheme('dark');
