/**
 * Button 组件
 * 使用 reablocks 的 Button 组件替换 radix-ui 的 Button 组件
 */

import * as React from 'react';
import { Button as ReablocksButton } from 'reablocks';
import { cn } from '../../lib/utils';

// 定义 Button 组件的 Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// 创建 Button 组件
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    // 将 variant 映射到 reablocks 的 variant
    const reablocksVariant = (() => {
      switch (variant) {
        case 'default':
          return 'filled';
        case 'outline':
          return 'outline';
        case 'ghost':
        case 'link':
          return 'text';
        default:
          return 'filled';
      }
    })();

    // 将 variant 映射到 reablocks 的 color
    const reablocksColor = (() => {
      switch (variant) {
        case 'default':
          return 'primary';
        case 'destructive':
          return 'error';
        case 'secondary':
          return 'secondary';
        default:
          return 'default';
      }
    })();

    // 将 size 映射到 reablocks 的 size
    const reablocksSize = (() => {
      switch (size) {
        case 'sm':
          return 'small';
        case 'lg':
          return 'large';
        default:
          return 'medium';
      }
    })();

    return (
      <ReablocksButton
        ref={ref}
        className={cn(className)}
        variant={reablocksVariant}
        color={reablocksColor}
        size={reablocksSize}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
