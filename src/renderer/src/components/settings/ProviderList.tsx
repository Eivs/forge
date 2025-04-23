import { useState } from 'react';
import { useModelStore } from '../../store/modelStore';
import { Provider } from '../../store/chatStore';
import { Button } from '../ui/button';
import { PlusIcon, GlobeIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useLanguage } from '../../locales';
import { cn } from '../../lib/utils';

interface ProviderListProps {
  providers: Provider[];
  selectedProviderId: number | null;
  onSelectProvider: (provider: Provider) => void;
  onAddProvider?: () => void;
}

const ProviderList = ({ providers, selectedProviderId, onSelectProvider }: ProviderListProps) => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
  });
  const { createProvider } = useModelStore();

  const handleAddProvider = async () => {
    try {
      const provider = await createProvider({
        ...newProvider,
        isActive: false,
      });
      setNewProvider({
        name: '',
        baseUrl: '',
        apiKey: '',
      });
      setIsAddDialogOpen(false);
      onSelectProvider(provider);
    } catch (error) {
      console.error('Error adding provider:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-background z-10">
        <h3 className="text-sm font-medium">{t.settings.providers}</h3>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title={t.mcp.addServer}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {providers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t.provider.noProvidersConfigured}
          </div>
        ) : (
          <div className="p-2">
            {providers.map(provider => (
              <div
                key={provider.id}
                className={cn(
                  'flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors text-base',
                  selectedProviderId === provider.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => onSelectProvider(provider)}
              >
                <div className="flex items-center">
                  <GlobeIcon className="h-3 w-3 mr-2 opacity-70" />
                  <span className="text-base line-clamp-2 w-36">{provider.name}</span>
                </div>
                {provider.isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Provider Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.provider.addProvider}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.provider.name}</Label>
              <Input
                id="name"
                value={newProvider.name}
                onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                placeholder="e.g. OpenAI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">{t.provider.apiUrl}</Label>
              <Input
                id="baseUrl"
                value={newProvider.baseUrl}
                onChange={e => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                placeholder="e.g. https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t.provider.apiKey}</Label>
              <Input
                id="apiKey"
                type="password"
                value={newProvider.apiKey}
                onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                placeholder={t.provider.enterApiKey}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddProvider}>{t.common.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderList;
