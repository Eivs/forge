/**
 * Select 组件
 * 使用 reablocks 的 Select 组件替换 radix-ui 的 Select 组件
 */

import React from 'react';
import { Select as ReablocksSelect, SelectOption } from 'reablocks';
import { cn } from '../../lib/utils';

// 导出 Select 组件
export const Select = ReablocksSelect;

// 导出 SelectOption 组件
export const SelectItem = SelectOption;

// 导出 SelectGroup 组件
export const SelectGroup = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  // 将 children 转换为数组
  const childrenArray = React.Children.toArray(children);
  
  // 为每个子元素添加 group 属性
  return (
    <>
      {React.Children.map(childrenArray, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            group: label
          });
        }
        return child;
      })}
    </>
  );
};

// 导出 SelectTrigger 组件
export const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; id?: string; className?: string }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

// 导出 SelectValue 组件
export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>;
};

// 导出 SelectContent 组件
export const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>;
};

// 导出 SelectLabel 组件
export const SelectLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}>{children}</div>;
};

// 导出 SelectSeparator 组件
export const SelectSeparator = ({ className }: { className?: string }) => {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} />;
};

// 导出其他组件以保持 API 兼容性
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;
