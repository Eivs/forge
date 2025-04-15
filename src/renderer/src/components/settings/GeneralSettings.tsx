import { useTheme } from '../theme-provider';
import {
  CompactCard,
  CompactCardContent,
  CompactCardHeader,
  CompactCardTitle,
} from './CompactCard';
import { Select } from 'reablocks';
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
            <Select
              value={theme}
              onChange={handleThemeChange}
              placeholder={t.settings.selectTheme}
              className="h-8 text-xs"
            >
              <option value="light">{t.settings.light}</option>
              <option value="dark">{t.settings.dark}</option>
              <option value="system">{t.settings.system}</option>
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
            <Select
              value={language}
              onChange={handleLanguageChange}
              placeholder={t.settings.selectLanguage}
              className="h-8 text-xs"
            >
              <option value="zh">{t.settings.chinese}</option>
              <option value="en">{t.settings.english}</option>
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
              <Select
                value={defaultModelId}
                onChange={handleDefaultModelChange}
                placeholder={t.settings.selectDefaultModel}
                className="h-8 text-xs"
              >
                {activeModels.map(model => (
                  <option key={model.id} value={model.id.toString()}>
                    {model.name} ({model.provider.name})
                  </option>
                ))}
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
