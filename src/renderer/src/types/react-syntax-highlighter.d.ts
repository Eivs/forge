declare module 'react-syntax-highlighter' {
  import { ComponentType, ReactNode } from 'react';

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: ReactNode;
    customStyle?: any;
    codeTagProps?: any;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: any;
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    lineProps?: any;
    renderer?: any;
    PreTag?: ComponentType<any>;
    CodeTag?: ComponentType<any>;
    [key: string]: any;
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export const PrismLight: ComponentType<SyntaxHighlighterProps> & {
    registerLanguage: (name: string, language: any) => void;
  };
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/jsx' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/javascript' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/typescript' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/tsx' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/css' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/json' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/markdown' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/bash' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/python' {
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/sql' {
  const language: any;
  export default language;
}
