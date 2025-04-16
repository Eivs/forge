import { FC, PropsWithChildren, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plugin } from 'unified';
import { CodeHighlighter } from './code-highlighter';
import { cn } from '../../lib/utils';
import { TableComponent, TableHeaderCell, TableDataCell } from './table';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import Mermaid from './mermaid';
import { markdownTheme } from './markdown-theme';
import 'katex/dist/katex.css';

interface MarkdownWrapperProps extends PropsWithChildren {
  /**
   * Remark plugins to apply to the markdown content.
   */
  remarkPlugins?: Plugin[];

  /**
   * Rehype plugins to apply to the markdown content.
   */
  rehypePlugins?: Plugin[];
}
// 代码块组件
const Code = memo(({ className, inline, children, ...props }: any) => {
  const renderContent = useMemo(() => {
    if (inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const match = className?.match(/language-(\w+)/);
    if (match && match[1] === 'mermaid') {
      return (
        <div className="relative mermaid flex w-full items-center justify-center">
          {children}
          <Mermaid />
        </div>
      );
    }

    if (match) {
      return (
        <CodeHighlighter
          {...props}
          language={className}
          className={cn(markdownTheme.code, className)}
          copyClassName={cn(markdownTheme.copy)}
          toolbarClassName={cn(markdownTheme.toolbar)}
        >
          {children}
        </CodeHighlighter>
      );
    }

    return (
      <pre>
        <code>{children}</code>
      </pre>
    );
  }, [className, inline, children, props]);

  return renderContent;
});

// 定义组件函数
const MarkdownBase: FC<MarkdownWrapperProps> = ({
  children,
  remarkPlugins = [remarkGfm, remarkMath],
  rehypePlugins = [rehypeKatex, rehypeRaw],
}) => {
  // 使用 useMemo 缓存组件定义，避免不必要的重新创建
  const components = useMemo(
    () => ({
      // 代码块
      code: ({ node, ...restProps }: any) => <Code node-type={node.type} {...restProps} />,
      // 表格相关
      table: ({ node, ...restProps }: any) => (
        <TableComponent node-type={node.type} {...restProps} className={cn(markdownTheme.table)} />
      ),
      th: ({ node, ...restProps }: any) => (
        <TableHeaderCell node-type={node.type} {...restProps} className={cn(markdownTheme.th)} />
      ),
      td: ({ node, ...restProps }: any) => (
        <TableDataCell node-type={node.type} {...restProps} className={cn(markdownTheme.td)} />
      ),
      tr: ({ node, ...restProps }: any) => (
        <tr node-type={node.type} {...restProps} className={cn(markdownTheme.tr)} />
      ),
      // 文本和链接
      a: ({ node, ...restProps }: any) => (
        <a
          node-type={node.type}
          {...restProps}
          className={cn(markdownTheme.a)}
          target="_blank"
          rel="noopener noreferrer"
        />
      ),
      p: ({ node, ...restProps }: any) => (
        <p node-type={node.type} {...restProps} className={cn(markdownTheme.p)} />
      ),
      strong: ({ node, ...restProps }: any) => (
        <strong node-type={node.type} {...restProps} className={cn(markdownTheme.strong)} />
      ),
      em: ({ node, ...restProps }: any) => (
        <em node-type={node.type} {...restProps} className={cn(markdownTheme.em)} />
      ),
      del: ({ node, ...restProps }: any) => (
        <del node-type={node.type} {...restProps} className={cn(markdownTheme.del)} />
      ),
      hr: ({ node, ...restProps }: any) => (
        <hr node-type={node.type} {...restProps} className={cn(markdownTheme.hr)} />
      ),
      // 标题
      h1: ({ node, ...restProps }: any) => (
        <h1 node-type={node.type} {...restProps} className={cn(markdownTheme.h1)} />
      ),
      h2: ({ node, ...restProps }: any) => (
        <h2 node-type={node.type} {...restProps} className={cn(markdownTheme.h2)} />
      ),
      h3: ({ node, ...restProps }: any) => (
        <h3 node-type={node.type} {...restProps} className={cn(markdownTheme.h3)} />
      ),
      h4: ({ node, ...restProps }: any) => (
        <h4 node-type={node.type} {...restProps} className={cn(markdownTheme.h4)} />
      ),
      h5: ({ node, ...restProps }: any) => (
        <h5 node-type={node.type} {...restProps} className={cn(markdownTheme.h5)} />
      ),
      h6: ({ node, ...restProps }: any) => (
        <h6 node-type={node.type} {...restProps} className={cn(markdownTheme.h6)} />
      ),
      // 列表
      li: ({ node, ...restProps }: any) => (
        <li node-type={node.type} {...restProps} className={cn(markdownTheme.li)} />
      ),
      ul: ({ node, ...restProps }: any) => (
        <ul node-type={node.type} {...restProps} className={cn(markdownTheme.ul)} />
      ),
      ol: ({ node, ...restProps }: any) => (
        <ol node-type={node.type} {...restProps} className={cn(markdownTheme.ol)} />
      ),
      // 引用和图片
      blockquote: ({ node, ...restProps }: any) => (
        <blockquote node-type={node.type} {...restProps} className={cn(markdownTheme.blockquote)} />
      ),
      img: ({ node, ...restProps }: any) => (
        <img
          node-type={node.type}
          {...restProps}
          className={cn(markdownTheme.img)}
          alt={restProps.alt || 'Image'}
        />
      ),
      // 预格式化文本
      pre: ({ node, ...restProps }: any) => (
        <pre node-type={node.type} {...restProps} className={cn(markdownTheme.pre)} />
      ),
    }),
    []
  ); // 空依赖数组意味着组件定义只创建一次

  return (
    <div className={cn(markdownTheme.container)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins as Plugin[]}
        rehypePlugins={rehypePlugins as Plugin[]}
        components={components}
      >
        {children as string}
      </ReactMarkdown>
    </div>
  );
};

// 自定义比较函数，只有当内容变化时才重新渲染
const arePropsEqual = (prevProps: MarkdownWrapperProps, nextProps: MarkdownWrapperProps) => {
  // 检查内容是否相同
  const prevContent = typeof prevProps.children === 'string' ? prevProps.children : '';
  const nextContent = typeof nextProps.children === 'string' ? nextProps.children : '';

  return prevContent === nextContent;
};

// 使用 memo 包装组件以避免不必要的重新渲染
const Markdown = memo(MarkdownBase, arePropsEqual);

export default Markdown;
