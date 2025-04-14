import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import GeneralSettings from './GeneralSettings';
import MCPSettings from './MCPSettings';
import ProviderList from './ProviderList';
import ProviderDetail from './ProviderDetail';
import { useLanguage } from '../../locales';
import { useModelStore } from '../../store/modelStore';
import { Provider } from '../../store/chatStore';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { t } = useLanguage();
  const { providers, fetchProviders, fetchModels } = useModelStore();
  const [activeTab, setActiveTab] = useState('general');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Fetch providers and models when dialog opens
  useEffect(() => {
    if (open) {
      fetchProviders();
      fetchModels();
    }
  }, [open, fetchProviders, fetchModels]);

  // Reset selected provider when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedProvider(null);
    }
  }, [open]);

  const currentProvider = useMemo(
    () => providers.find(p => p.id === selectedProvider?.id) || providers[0],
    [providers, selectedProvider?.id]
  );

  // Handle provider selection
  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  // Handle adding a new provider
  const handleAddProvider = () => {
    setSelectedProvider(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] overflow-hidden p-0">
        <DialogHeader className="px-4 pt-4 pb-1">
          <DialogTitle className="text-base">{t.settings.settings}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-[calc(75vh-60px)]"
        >
          <TabsList className="px-4 mb-1">
            <TabsTrigger value="general" className="text-xs py-1">
              {t.settings.general}
            </TabsTrigger>
            <TabsTrigger value="providers" className="text-xs py-1">
              {t.settings.providers}
            </TabsTrigger>
            <TabsTrigger value="mcp" className="text-xs py-1">
              MCP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="px-4 pb-4 flex-1 overflow-y-auto">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="providers" className="px-4 mb-1 overflow-hidden">
            <div className="flex h-full border-t">
              <div className="w-1/4 border-r h-full">
                <ProviderList
                  providers={providers}
                  selectedProviderId={currentProvider?.id || null}
                  onSelectProvider={handleSelectProvider}
                  onAddProvider={handleAddProvider}
                />
              </div>
              <div className="w-3/4 p-3 h-full">
                <ProviderDetail
                  provider={currentProvider}
                  onBack={() => setSelectedProvider(null)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mcp" className="px-4 pb-4 flex-1 overflow-y-auto">
            <MCPSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
