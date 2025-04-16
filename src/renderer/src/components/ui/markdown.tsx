import { FC, PropsWithChildren, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plugin } from 'unified';
import { CodeHighlighter } from './code-highlighter';
import { cn } from '../../lib/utils';
import { TableComponent, TableHeaderCell, TableDataCell } from './table';
import rehypeKatex from 'rehype-katex';
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
      return <Mermaid>{children}</Mermaid>;
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
  rehypePlugins = [rehypeKatex],
}) => {
  // 使用 useMemo 缓存组件定义，避免不必要的重新创建
  const components = useMemo(
    () => ({
      // 代码块
      code: (props: any) => {
        return <Code {...props} />;
      },
      // 表格相关
      table: (props: any) => <TableComponent {...props} className={cn(markdownTheme.table)} />,
      th: (props: any) => <TableHeaderCell {...props} className={cn(markdownTheme.th)} />,
      td: (props: any) => <TableDataCell {...props} className={cn(markdownTheme.td)} />,
      tr: (props: any) => <tr {...props} className={cn(markdownTheme.tr)} />,
      // 文本和链接
      a: (props: any) => (
        <a {...props} className={cn(markdownTheme.a)} target="_blank" rel="noopener noreferrer" />
      ),
      p: (props: any) => <p {...props} className={cn(markdownTheme.p)} />,
      strong: (props: any) => <strong {...props} className={cn(markdownTheme.strong)} />,
      em: (props: any) => <em {...props} className={cn(markdownTheme.em)} />,
      del: (props: any) => <del {...props} className={cn(markdownTheme.del)} />,
      hr: (props: any) => <hr {...props} className={cn(markdownTheme.hr)} />,
      // 标题
      h1: (props: any) => <h1 {...props} className={cn(markdownTheme.h1)} />,
      h2: (props: any) => <h2 {...props} className={cn(markdownTheme.h2)} />,
      h3: (props: any) => <h3 {...props} className={cn(markdownTheme.h3)} />,
      h4: (props: any) => <h4 {...props} className={cn(markdownTheme.h4)} />,
      h5: (props: any) => <h5 {...props} className={cn(markdownTheme.h5)} />,
      h6: (props: any) => <h6 {...props} className={cn(markdownTheme.h6)} />,
      // 列表
      li: (props: any) => <li {...props} className={cn(markdownTheme.li)} />,
      ul: (props: any) => <ul {...props} className={cn(markdownTheme.ul)} />,
      ol: (props: any) => <ol {...props} className={cn(markdownTheme.ol)} />,
      // 引用和图片
      blockquote: (props: any) => (
        <blockquote {...props} className={cn(markdownTheme.blockquote)} />
      ),
      img: (props: any) => (
        <img {...props} className={cn(markdownTheme.img)} alt={props.alt || '图片'} />
      ),
      // 预格式化文本
      pre: (props: any) => <pre {...props} className={cn(markdownTheme.pre)} />,
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
