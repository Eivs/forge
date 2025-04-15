/**
 * Tabs 组件
 * 使用 reablocks 的 Tabs 组件替换 radix-ui 的 Tabs 组件
 */

import * as React from 'react';
import { Tabs as ReablocksTabs, Tab } from 'reablocks';
import { cn } from '../../lib/utils';

// 定义 Tabs 组件的 Props
export interface TabsProps extends React.ComponentProps<typeof ReablocksTabs> {
  className?: string;
  children?: React.ReactNode;
}

// 创建 Tabs 组件
const Tabs = ({ className, children, ...props }: TabsProps) => {
  return (
    <ReablocksTabs className={cn('relative', className)} {...props}>
      {children}
    </ReablocksTabs>
  );
};

// 定义 TabsList 组件的 Props
export interface TabsListProps {
  className?: string;
  children?: React.ReactNode;
}

// 创建 TabsList 组件
const TabsList = ({ className, children }: TabsListProps) => {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>
  );
};

// 定义 TabsTrigger 组件的 Props
export interface TabsTriggerProps {
  className?: string;
  value: string;
  children?: React.ReactNode;
}

// 创建 TabsTrigger 组件
const TabsTrigger = ({ className, value, children, ...props }: TabsTriggerProps) => {
  return (
    <Tab
      value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </Tab>
  );
};

// 定义 TabsContent 组件的 Props
export interface TabsContentProps {
  className?: string;
  value: string;
  children?: React.ReactNode;
}

// 创建 TabsContent 组件
const TabsContent = ({ className, value, children, ...props }: TabsContentProps) => {
  return (
    <div
      role="tabpanel"
      data-value={value}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
