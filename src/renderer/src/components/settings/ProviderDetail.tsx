import { useState, useEffect } from 'react';
import { useModelStore } from '../../store/modelStore';
import { Model, Provider } from '../../store/chatStore';
import {
  CompactCard,
  CompactCardContent,
  CompactCardDescription,
  CompactCardHeader,
  CompactCardTitle,
} from './CompactCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CompactSwitch } from './CompactSwitch';
import { Plus, Trash, Edit, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useLanguage } from '../../locales';

interface ProviderDetailProps {
  provider: Provider | null;
  onBack: () => void;
}

const ProviderDetail = ({ provider, onBack }: ProviderDetailProps) => {
  const {
    models,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
    setModelActive,
    updateProvider,
    deleteProvider,
    setProviderActive,
    fetchProviders,
  } = useModelStore();
  const { t } = useLanguage();

  // Provider editing state
  const [isEditProviderOpen, setIsEditProviderOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  // Model states
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [newModel, setNewModel] = useState({
    name: '',
    contextSize: 4000,
    isActive: false,
  });

  // Filter models for this provider
  const providerModels = models.filter(model => model.provider.id === provider?.id);

  // Set up editing provider
  useEffect(() => {
    if (provider) {
      setEditingProvider(provider);
    }
  }, [provider]);

  // Handle provider actions
  const handleEditProvider = async () => {
    if (!editingProvider) return;

    try {
      await updateProvider(editingProvider.id, editingProvider);
      setIsEditProviderOpen(false);
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const handleDeleteProvider = async () => {
    if (!provider) return;

    try {
      await deleteProvider(provider.id);
      onBack(); // Go back to provider list after deletion
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  const handleToggleProviderActive = async (isActive: boolean) => {
    if (!provider) return;

    try {
      await setProviderActive(provider.id, isActive);
      await fetchProviders();
      await fetchModels();
    } catch (error) {
      console.error('Error toggling provider active state:', error);
    }
  };

  // Handle model actions
  const handleAddModel = async () => {
    if (!provider) return;

    try {
      await createModel({
        ...newModel,
        provider,
      });
      setNewModel({
        name: '',
        contextSize: 4000,
        isActive: false,
      });
      setIsAddModelOpen(false);
      fetchModels(); // Refresh models list
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  const handleEditModel = async () => {
    if (!editingModel || !provider) return;

    try {
      await updateModel(editingModel.id, {
        ...editingModel,
        provider,
      });
      setIsEditModelOpen(false);
      setEditingModel(null);
      fetchModels(); // Refresh models list
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    try {
      await deleteModel(id);
      fetchModels(); // Refresh models list
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleToggleModelActive = async (id: number, isActive: boolean) => {
    try {
      await setModelActive(id, isActive);
      await fetchModels();
    } catch (error) {
      console.error('Error toggling model active state:', error);
    }
  };

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t.provider.selectProvider}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* Provider Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <h2 className="text-base font-medium">{provider.name}</h2>
      </div>

      {/* Provider Card */}
      <CompactCard>
        <CompactCardHeader>
          <div className="flex justify-between items-center">
            <CompactCardTitle>{t.provider.provider}</CompactCardTitle>
            <div className="flex items-center space-x-1">
              <CompactSwitch
                checked={provider.isActive}
                onCheckedChange={handleToggleProviderActive}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditProviderOpen(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDeleteProvider}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CompactCardHeader>
        <CompactCardContent>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Url:</span>
              <span className="text-xs truncate max-w-[200px]">{provider.baseUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Key:</span>
              <span>{provider.apiKey ? '**********' : t.provider.notSet}</span>
            </div>
          </div>
        </CompactCardContent>
      </CompactCard>

      {/* Models Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{t.model.model}</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddModelOpen(true)}
            className="h-7 text-xs px-2"
          >
            <Plus className="mr-1 h-3 w-3" />
            {t.model.addModel}
          </Button>
        </div>

        {providerModels.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            {t.model.noModelsConfigured}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {providerModels.map(model => (
              <CompactCard key={model.id}>
                <CompactCardHeader>
                  <div className="flex justify-between items-center">
                    <CompactCardTitle>{model.name}</CompactCardTitle>
                    <div className="flex items-center space-x-1">
                      <CompactSwitch
                        checked={model.isActive}
                        onCheckedChange={checked => handleToggleModelActive(model.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setEditingModel(model);
                          setIsEditModelOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteModel(model.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CompactCardHeader>
                <CompactCardContent>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.model.contextSize}:</span>
                      <span>{model.contextSize.toLocaleString()}</span>
                    </div>
                  </div>
                </CompactCardContent>
              </CompactCard>
            ))}
          </div>
        )}
      </div>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditProviderOpen} onOpenChange={setIsEditProviderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.provider.editProvider}</DialogTitle>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t.provider.name}</Label>
                <Input
                  id="edit-name"
                  value={editingProvider.name}
                  onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-baseUrl">{t.provider.apiUrl}</Label>
                <Input
                  id="edit-baseUrl"
                  value={editingProvider.baseUrl}
                  onChange={e =>
                    setEditingProvider({ ...editingProvider, baseUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apiKey">{t.provider.apiKeyKeepUnchanged}</Label>
                <Input
                  id="edit-apiKey"
                  type="password"
                  placeholder={t.provider.enterNewApiKey}
                  onChange={e => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProviderOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleEditProvider}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.model.addModel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.model.modelName}</Label>
              <Input
                id="name"
                value={newModel.name}
                onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                placeholder="e.g. gpt-4-turbo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contextSize">{t.model.contextSize}</Label>
              <Input
                id="contextSize"
                type="number"
                value={newModel.contextSize}
                onChange={e => setNewModel({ ...newModel, contextSize: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <CompactSwitch
                id="isActive"
                checked={newModel.isActive}
                onCheckedChange={checked => setNewModel({ ...newModel, isActive: checked })}
              />
              <Label htmlFor="isActive">{t.model.enable}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModelOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddModel}>{t.common.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={isEditModelOpen} onOpenChange={setIsEditModelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.model.editModel}</DialogTitle>
          </DialogHeader>
          {editingModel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t.model.modelName}</Label>
                <Input
                  id="edit-name"
                  value={editingModel.name}
                  onChange={e => setEditingModel({ ...editingModel, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contextSize">{t.model.contextSize}</Label>
                <Input
                  id="edit-contextSize"
                  type="number"
                  value={editingModel.contextSize}
                  onChange={e =>
                    setEditingModel({ ...editingModel, contextSize: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModelOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleEditModel}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderDetail;
