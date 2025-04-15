import { ChatTheme } from 'reachat';

/**
 * reachat 组件库的自定义主题
 * 基于项目的设计风格进行定制
 */
export const chatTheme: ChatTheme = {
  base: 'text-foreground',
  console: 'flex w-full gap-4 h-full',
  companion: 'w-full h-full overflow-hidden',
  empty: 'text-center flex-1',
  appbar: '',
  sessions: {
    base: 'overflow-auto',
    console: 'min-w-[150px] w-[30%] max-w-[300px] bg-background p-5 rounded-lg',
    companion: 'w-full h-full',
    group: 'text-xs text-muted-foreground mt-4 hover:bg-transparent mb-1',
    create: 'relative mb-4 rounded-lg text-foreground',
    session: {
      base: 'group my-1 rounded-lg p-2 text-muted-foreground border border-transparent hover:bg-accent hover:border-border',
      active:
        'border border-border text-foreground bg-accent hover:bg-accent border-primary/50 [&_button]:!opacity-100',
      delete: '[&>svg]:w-4 [&>svg]:h-4 opacity-0 group-hover:!opacity-50',
    },
  },
  messages: {
    base: '',
    console: 'flex flex-col mx-5 flex-1 overflow-hidden',
    companion: 'flex w-full h-full',
    back: 'self-start p-0 my-2',
    inner: 'flex-1 h-full flex flex-col',
    title: 'text-base font-bold text-foreground',
    date: 'text-xs whitespace-nowrap text-muted-foreground',
    content: 'mt-2 flex-1 overflow-auto',
    header: 'flex justify-between items-center gap-2',
    showMore: 'mb-4',
    message: {
      base: 'mt-4 mb-4 flex flex-col p-0 rounded border-none bg-transparent',
      question:
        'relative font-semibold mb-4 px-4 py-4 pb-2 rounded-lg rounded-br-none text-foreground border bg-user-message border-border',
      response: 'relative data-[compact=false]:px-4 text-foreground',
      overlay:
        'overflow-y-hidden max-h-[350px] after:content-["."] after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-gradient-to-b after:from-transparent after:to-background',
      cursor: 'inline-block w-1 h-4 bg-current',
      expand: 'absolute bottom-1 right-1 z-10',
      files: {
        base: 'mb-2 flex flex-wrap gap-3',
        file: {
          base: 'flex items-center gap-2 border border-border px-3 py-2 rounded-lg cursor-pointer',
          name: 'text-sm text-muted-foreground',
        },
      },
      sources: {
        base: 'my-4 flex flex-wrap gap-3',
        source: {
          base: 'flex gap-2 border border-border px-4 py-2 rounded-lg cursor-pointer',
          companion: 'flex-1 px-3 py-1.5',
          image: 'max-w-10 max-h-10 rounded-md w-full h-fit self-center',
          title: 'text-md block',
          url: 'text-sm text-primary underline',
        },
      },
      markdown: {
        copy: 'sticky py-1 [&>svg]:w-4 [&>svg]:h-4 opacity-50',
        p: 'mb-2',
        a: 'text-primary underline',
        table: 'table-auto w-full m-2',
        th: 'px-4 py-2 text-left font-bold border-b border-border',
        td: 'px-4 py-2',
        code: 'm-2 rounded-b relative',
        toolbar:
          'text-xs bg-card-muted flex items-center justify-between px-2 py-1 rounded-t sticky top-0 backdrop-blur-md',
        li: 'mb-2 ml-6',
        ul: 'mb-4 list-disc',
        ol: 'mb-4 list-decimal',
      },
      footer: {
        base: 'mt-3 flex gap-1.5 text-muted-foreground',
        copy: 'p-3 rounded-lg [&>svg]:w-4 [&>svg]:h-4 opacity-50 hover:!opacity-100 hover:bg-accent hover:text-foreground',
        upvote:
          'p-3 rounded-lg [&>svg]:w-4 [&>svg]:h-4 opacity-50 hover:!opacity-100 hover:bg-accent hover:text-foreground',
        downvote:
          'p-3 rounded-lg [&>svg]:w-4 [&>svg]:h-4 opacity-50 hover:!opacity-100 hover:bg-accent hover:text-foreground',
        refresh:
          'p-3 rounded-lg [&>svg]:w-4 [&>svg]:h-4 opacity-50 hover:!opacity-100 hover:bg-accent hover:text-foreground',
      },
    },
  },
  input: {
    base: 'flex mt-4 relative',
    upload: 'px-5 py-2 text-muted-foreground size-10',
    input:
      'w-full border rounded-lg px-3 py-2 pr-16 text-foreground border-border hover:border-primary/50 focus-within:border-primary/50 bg-background [&>textarea]:w-full [&>textarea]:flex-none',
    actions: {
      base: 'absolute flex gap-2 items-center right-5 inset-y-1/2 -translate-y-1/2 z-10',
      send: 'px-3 py-3 hover:bg-primary-hover rounded-full bg-accent hover:bg-accent/80 text-foreground',
      stop: 'px-2 py-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90',
    },
  },
};
