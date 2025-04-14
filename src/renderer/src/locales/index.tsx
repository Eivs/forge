import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from './en';
import zh from './zh';

// 定义语言类型
export type Language = 'en' | 'zh';

// 定义翻译对象类型
export type Translations = typeof en;

// 创建语言上下文
export const LanguageContext = createContext<{
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}>({
  language: 'en',
  t: en,
  setLanguage: () => {},
});

// 语言提供者组件
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从本地存储获取语言设置，默认为英文
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });

  // 根据语言获取翻译
  const [translations, setTranslations] = useState<Translations>(language === 'zh' ? zh : en);

  // 当语言变化时更新翻译
  useEffect(() => {
    setTranslations(language === 'zh' ? zh : en);
    localStorage.setItem('language', language);

    // 可选：如果需要，也可以更新 HTML 的 lang 属性
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        t: translations,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言的钩子
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
