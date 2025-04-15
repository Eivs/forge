import { useLanguage } from '../../locales';

interface ErrorMessageProps {
  content: string;
}

/**
 * 处理错误消息的本地化
 * 将模板中的占位符替换为本地化文本
 */
const ErrorMessage = ({ content }: ErrorMessageProps) => {
  const { t } = useLanguage();

  // 提取错误消息
  let processedContent = content;

  // 替换错误标题
  processedContent = processedContent.replace('**ERROR_TITLE:**', `**${t.errors.title}:**`);

  // 替换未知错误
  processedContent = processedContent.replace('UNKNOWN_ERROR', t.errors.unknown);

  // 提取实际错误消息
  const messageMatch = processedContent.match(/\*\*.*?\:\*\* (.*?)\\n/);
  const errorMessage = messageMatch ? messageMatch[1] : '';

  // 替换错误提示
  processedContent = processedContent.replace('ERROR_HINT', t.errors.generationHint);

  // 格式化错误消息
  if (errorMessage && errorMessage !== t.errors.unknown) {
    processedContent = processedContent.replace(
      `**${t.errors.title}:** ${errorMessage}`,
      t.errors.generation.replace('{message}', errorMessage)
    );
  }

  return <div className="whitespace-pre-wrap">{processedContent}</div>;
};

export default ErrorMessage;
