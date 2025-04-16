import { useEffect, useState } from 'react';
import { useModelStore } from '../../store/modelStore';
import { Model, Provider } from '../../store/chatStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { PlusIcon, TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../../locales';

const ModelsSettings = () => {
  const {
    models,
    providers,
    fetchModels,
    fetchProviders,
    createModel,
    updateModel,
    deleteModel,
    setModelActive,
  } = useModelStore();
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [newModel, setNewModel] = useState({
    name: '',
    providerId: 0,
    contextSize: 4000,
    isActive: false,
  });

  // Initial loading of models and providers
  useEffect(() => {
    fetchModels();
    fetchProviders();
  }, []);

  const handleAddModel = async () => {
    try {
      const provider = providers.find(p => p.id === newModel.providerId);
      if (!provider) return;

      await createModel({
        ...newModel,
        provider,
      });
      setNewModel({
        name: '',
        providerId: 0,
        contextSize: 4000,
        isActive: false,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  const handleEditModel = async () => {
    if (!editingModel) return;

    try {
      const provider = providers.find(p => p.id === editingModel.providerId);
      if (!provider) return;

      await updateModel(editingModel.id, {
        ...editingModel,
        provider,
      });
      setIsEditDialogOpen(false);
      setEditingModel(null);
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    try {
      await deleteModel(id);
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await setModelActive(id, isActive);
    } catch (error) {
      console.error('Error toggling model active state:', error);
    }
  };

  const getProviderName = (providerId: number) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : '未知提供商';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t.model.model}</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t.model.addModel}
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t.model.noModelsConfigured}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <Card key={model.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{model.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={model.isActive}
                      onCheckedChange={checked => handleToggleActive(model.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingModel({
                          ...model,
                          providerId: model.provider.id,
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {model.isActive ? t.common.enabled : t.common.disabled}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.provider.provider}:</span>
                    <span>{model.provider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.model.contextSize}:</span>
                    <span>{model.contextSize.toLocaleString()} tokens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Model Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.model.addModel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">{t.provider.provider}</Label>
              <Select
                value={newModel.providerId.toString()}
                onValueChange={value => setNewModel({ ...newModel, providerId: parseInt(value) })}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder={t.provider.provider} />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Switch
                id="isActive"
                checked={newModel.isActive}
                onCheckedChange={checked => setNewModel({ ...newModel, isActive: checked })}
              />
              <Label htmlFor="isActive">{t.model.enable}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddModel}>{t.common.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.model.editModel}</DialogTitle>
          </DialogHeader>
          {editingModel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-provider">{t.provider.provider}</Label>
                <Select
                  value={editingModel.providerId.toString()}
                  onValueChange={value =>
                    setEditingModel({ ...editingModel, providerId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-provider">
                    <SelectValue placeholder={t.provider.provider} />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleEditModel}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelsSettings;
