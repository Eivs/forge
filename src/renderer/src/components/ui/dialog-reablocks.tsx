/**
 * Dialog 组件
 * 使用 reablocks 的 Dialog 组件替换 radix-ui 的 Dialog 组件
 */

import * as React from 'react';
import { Dialog as ReablocksDialog } from 'reablocks';
import { cn } from '../../lib/utils';

// 定义 Dialog 组件的 Props
export interface DialogProps extends React.ComponentProps<typeof ReablocksDialog> {
  className?: string;
  children?: React.ReactNode;
}

// 创建 Dialog 组件
const Dialog = ({ className, children, ...props }: DialogProps) => {
  return (
    <ReablocksDialog className={cn(className)} {...props}>
      {children}
    </ReablocksDialog>
  );
};

// 定义 DialogContent 组件的 Props
export interface DialogContentProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 DialogContent 组件
const DialogContent = ({ className, children }: DialogContentProps) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

// 定义 DialogHeader 组件的 Props
export interface DialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 DialogHeader 组件
const DialogHeader = ({ className, children }: DialogHeaderProps) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

// 定义 DialogTitle 组件的 Props
export interface DialogTitleProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 DialogTitle 组件
const DialogTitle = ({ className, children }: DialogTitleProps) => {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
};

// 定义 DialogDescription 组件的 Props
export interface DialogDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 DialogDescription 组件
const DialogDescription = ({ className, children }: DialogDescriptionProps) => {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
};

// 定义 DialogFooter 组件的 Props
export interface DialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 DialogFooter 组件
const DialogFooter = ({ className, children }: DialogFooterProps) => {
  return <div className={cn('mt-4 flex justify-end gap-2', className)}>{children}</div>;
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
};
