/**
 * Tooltip 组件
 * 使用 reablocks 的 Tooltip 组件替换 radix-ui 的 Tooltip 组件
 */

import * as React from 'react';
import { Tooltip as ReablocksTooltip } from 'reablocks';
import { cn } from '../../lib/utils';

// 定义 TooltipProvider 组件的 Props
export interface TooltipProviderProps {
  children?: React.ReactNode;
}

// 创建 TooltipProvider 组件
const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

// 定义 Tooltip 组件的 Props
export interface TooltipProps {
  children?: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// 创建 Tooltip 组件
const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <>{children}</>;
};

// 定义 TooltipTrigger 组件的 Props
export interface TooltipTriggerProps {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

// 创建 TooltipTrigger 组件
const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, asChild = false, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(className)} {...props}>
        {children}
      </button>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

// 定义 TooltipContent 组件的 Props
export interface TooltipContentProps {
  className?: string;
  children?: React.ReactNode;
  sideOffset?: number;
  alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

// 创建 TooltipContent 组件
const TooltipContent = ({ className, children, ...props }: TooltipContentProps) => {
  return <div className={cn('z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md', className)}>{children}</div>;
};

// 创建一个包装组件，将 radix-ui 的 API 转换为 reablocks 的 API
const ReablocksTooltipWrapper = ({ 
  children, 
  content, 
  className 
}: { 
  children: React.ReactNode; 
  content: React.ReactNode;
  className?: string;
}) => {
  return (
    <ReablocksTooltip content={content} className={className}>
      {children}
    </ReablocksTooltip>
  );
};

export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  ReablocksTooltipWrapper
};
