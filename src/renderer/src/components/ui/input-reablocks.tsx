/**
 * Input 组件
 * 使用 reablocks 的 Input 组件替换 radix-ui 的 Input 组件
 */

import * as React from 'react';
import { Input as ReablocksInput } from 'reablocks';
import { cn } from '../../lib/utils';

// 定义 Input 组件的 Props
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

// 创建 Input 组件
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <ReablocksInput
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
