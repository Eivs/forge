
import { useTheme } from '../theme-provider'
import { CompactCard, CompactCardContent, CompactCardDescription, CompactCardHeader, CompactCardTitle } from './CompactCard'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useLanguage, Language } from '../../locales'

const GeneralSettings = () => {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system')
    window.electron.settings.set('theme', value)
  }

  const handleLanguageChange = (value: Language) => {
    setLanguage(value)
  }

  return (
    <div className="space-y-3">
      <CompactCard>
        <CompactCardHeader>
          <CompactCardTitle className="text-sm">{t.settings.appearance}</CompactCardTitle>
          <CompactCardDescription className="text-xs">
            {t.settings.customizeAppearance}
          </CompactCardDescription>
        </CompactCardHeader>
        <CompactCardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="theme" className="text-xs">{t.settings.theme}</Label>
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
          <CompactCardDescription className="text-xs">
            {t.settings.selectLanguage}
          </CompactCardDescription>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="space-y-1">
            <Label htmlFor="language" className="text-xs">{t.settings.language}</Label>
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
    </div>
  )
}

export default GeneralSettings
