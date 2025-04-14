import { useTheme } from '../theme-provider';
import {
  CompactCard,
  CompactCardContent,
  CompactCardHeader,
  CompactCardTitle,
} from './CompactCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage, Language } from '../../locales';
import { useModelStore } from '../../store/modelStore';
import { useEffect } from 'react';

const GeneralSettings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { activeModels, defaultModelId, fetchModels, loadDefaultModel } = useModelStore();

  // 获取模型列表和默认模型设置
  useEffect(() => {
    const loadData = async () => {
      await fetchModels();
      await loadDefaultModel();
    };
    loadData();
  }, [fetchModels, loadDefaultModel]);

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
    window.electron.settings.set('theme', value);
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
  };

  const handleDefaultModelChange = async (value: string) => {
    const { setDefaultModel } = useModelStore.getState();
    await setDefaultModel(value);
  };

  return (
    <div className="space-y-3">
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.settings.theme}</CompactCardTitle>
        </CompactCardHeader>
        <CompactCardContent className="space-y-3">
          <div className="space-y-1">
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme" className="h-8 text-xs">
                <SelectValue placeholder={t.settings.selectTheme} />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="light">{t.settings.light}</SelectItem>
                <SelectItem value="dark">{t.settings.dark}</SelectItem>
                <SelectItem value="system">{t.settings.system}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CompactCardContent>
      </CompactCard>

      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.settings.language}</CompactCardTitle>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="space-y-1">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language" className="h-8 text-xs">
                <SelectValue placeholder={t.settings.selectLanguage} />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="zh">{t.settings.chinese}</SelectItem>
                <SelectItem value="en">{t.settings.english}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CompactCardContent>
      </CompactCard>

      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.settings.defaultModel}</CompactCardTitle>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="space-y-1">
            {activeModels.length > 0 ? (
              <Select value={defaultModelId} onValueChange={handleDefaultModelChange}>
                <SelectTrigger id="defaultModel" className="h-8 text-xs">
                  <SelectValue placeholder={t.settings.selectDefaultModel} />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {activeModels.map(model => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name} ({model.provider.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
                {t.settings.configureModelsFirst}
              </div>
            )}
          </div>
        </CompactCardContent>
      </CompactCard>
    </div>
  );
};

export default GeneralSettings;
