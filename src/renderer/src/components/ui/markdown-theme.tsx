export interface markdownTheme {
  // 容器
  container: string;

  // 段落和文本
  p: string;
  a: string;
  strong: string;
  em: string;
  del: string;
  hr: string;

  // 标题
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;

  // 列表
  li: string;
  ul: string;
  ol: string;

  // 表格
  table: string;
  th: string;
  td: string;
  tr: string;

  // 代码
  code: string;
  inlineCode: string;
  pre: string;
  toolbar: string;
  copy: string;

  // 引用
  blockquote: string;

  // 图片
  img: string;
}

export const markdownTheme = {
  // 容器
  container: 'max-w-full overflow-x-auto',

  // 段落和文本
  p: 'mb-4 leading-7 text-foreground',
  a: 'text-primary hover:text-primary/80 underline underline-offset-2 transition-colors',
  strong: 'font-semibold',
  em: 'italic',
  del: 'line-through text-muted-foreground',
  hr: 'my-6 border-t border-border',

  // 标题
  h1: 'mt-8 mb-4 text-3xl font-bold tracking-tight text-foreground',
  h2: 'mt-8 mb-3 text-2xl font-semibold tracking-tight text-foreground border-b border-border pb-1',
  h3: 'mt-6 mb-3 text-xl font-semibold text-foreground',
  h4: 'mt-4 mb-2 text-lg font-medium text-foreground',
  h5: 'mt-4 mb-2 text-base font-medium text-foreground',
  h6: 'mt-4 mb-2 text-sm font-medium text-muted-foreground',

  // 列表
  li: 'mb-2 ml-6',
  ul: 'mb-6 list-disc pl-2 marker:text-muted-foreground',
  ol: 'mb-6 list-decimal pl-2 marker:text-muted-foreground',

  // 表格
  table: 'w-full my-6 border-collapse overflow-hidden rounded-md border border-border',
  th: 'px-4 py-3 text-left font-medium bg-secondary text-secondary-foreground border-b border-border',
  td: 'px-4 py-3 border-t border-border',
  tr: 'hover:bg-muted/40 transition-colors',

  // 代码
  code: 'rounded-md relative my-4',
  inlineCode:
    'px-1.5 py-0.5 mx-0.5 rounded-md bg-secondary text-secondary-foreground font-mono text-sm',
  pre: 'overflow-x-auto rounded-md',
  toolbar:
    'text-xs flex items-center justify-between px-3 py-1.5 rounded-t sticky top-0 backdrop-blur-md bg-secondary border-b border-border',
  copy: 'sticky py-1 [&>svg]:w-4 [&>svg]:h-4 opacity-70 hover:opacity-100 transition-opacity',

  // 引用
  blockquote: 'pl-4 my-6 border-l-4 border-border italic text-muted-foreground',

  // 图片
  img: 'max-w-full h-auto rounded-md my-4',
};
