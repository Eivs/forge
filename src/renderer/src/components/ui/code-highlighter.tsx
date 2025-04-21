import {
  FC,
  PropsWithChildren,
  ReactElement,
  useState,
  useCallback,
  useMemo,
  memo,
  useEffect,
  useRef,
} from 'react';
import { Button } from './button';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
// 使用轻量级版本的语法高亮器
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ClipboardCopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '../../lib/utils';
import { useTheme } from '../theme-provider';
import { dark, light } from './code-highlighter-themes';

// 按需导入语言支持，而不是全部导入
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';

// 注册常用语言
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('sql', sql);

export interface CodeHighlighterProps extends PropsWithChildren {
  /**
   * The class name to apply to the code block.
   */
  className?: string;

  /**
   * The language of the code block.
   */
  language?: string;

  /**
   * The class name to apply to the copy button.
   */
  copyClassName?: string;

  /**
   * The class name to apply to the toolbar.
   */
  toolbarClassName?: string;

  /**
   * Icon to show for copy.
   */
  copyIcon?: ReactElement;

  /**
   * 是否延迟渲染大型代码块
   */
  lazyLoad?: boolean;

  /**
   * 代码长度阈值，超过该值则启用虚拟滚动
   */
  virtualizeThreshold?: number;

  /**
   * 最大显示高度，超过则显示滚动条
   */
  maxHeight?: string;
}

// 定义组件函数
const CodeHighlighterBase: FC<CodeHighlighterProps> = ({
  className,
  children,
  copyIcon = <ClipboardCopyIcon />,
  language,
  toolbarClassName,
  lazyLoad = true,
  virtualizeThreshold = 500,
  maxHeight = '400px',
}) => {
  const { theme: currentTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const codeContent = typeof children === 'string' ? String(children).replace(/\n$/, '') : '';
  const codeLength = codeContent.length;

  // 使用 useMemo 缓存语言解析结果
  const lang = useMemo(() => {
    const match = language?.match(/language-(\w+)/);
    return match ? match[1] : 'text';
  }, [language]);

  // 使用 useCallback 优化复制函数
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        console.log('Text copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }, []);

  // 使用 Intersection Observer 实现延迟加载
  const codeRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver({
    ref: codeRef,
    threshold: 0.1,
    enabled: lazyLoad,
  });

  // 大型代码块延迟渲染
  useEffect(() => {
    if (!isVisible) return;

    setTimeout(() => {
      setIsLoaded(true);
    });
  }, [isVisible]);

  // 渲染占位内容
  if (!isVisible || !isLoaded) {
    return (
      <div ref={codeRef} className={cn('relative', className)}>
        <div className={cn(toolbarClassName)}>
          <div>{lang ? lang.toUpperCase() : 'TEXT'}</div>
          <Button
            className={cn('text-muted-foreground hover:text-foreground transition-colors')}
            size="icon"
            variant="ghost"
            title="Copy code"
            onClick={() => handleCopy(codeContent)}
            disabled={!isLoaded}
          >
            {copyIcon}
          </Button>
        </div>
        <div className="animate-pulse flex flex-col space-y-2 p-4 bg-secondary/50 rounded-md">
          <div className="h-2 bg-muted rounded"></div>
          <div className="h-2 bg-muted rounded w-3/4"></div>
          <div className="h-2 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // 渲染代码块
  return (
    <div ref={codeRef} className={cn('relative', className)}>
      <div className={cn(toolbarClassName)}>
        <div>{`<${lang ? lang.toUpperCase() : 'TEXT'}>`}</div>
        <Button
          className={cn('text-muted-foreground hover:text-foreground transition-colors')}
          size="icon"
          variant="ghost"
          title="Copy code"
          onClick={() => handleCopy(codeContent)}
        >
          {copied ? <CheckIcon /> : copyIcon}
        </Button>
      </div>
      <div
        className={cn('overflow-auto', codeLength > virtualizeThreshold && 'relative')}
        style={{ maxHeight: codeLength > virtualizeThreshold ? maxHeight : 'none' }}
      >
        <SyntaxHighlighter
          language={lang}
          style={currentTheme === 'light' ? light : dark}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.9rem',
            lineHeight: '1.5',
          }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// 使用 memo 包装组件以避免不必要的重新渲染
export const CodeHighlighter = memo(CodeHighlighterBase);
