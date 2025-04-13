import { useEffect, useState } from 'react'
import { useModelStore } from '../../store/modelStore'
import { Provider } from '../../store/chatStore'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Plus, Trash, Edit, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { useLanguage } from '../../locales'

const ProvidersSettings = () => {
  const { providers, fetchProviders, createProvider, updateProvider, deleteProvider, setProviderActive } = useModelStore()
  const { t } = useLanguage()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [newProvider, setNewProvider] = useState({
    name: '',
    baseUrl: '',
    apiKey: ''
  })

  // Initial loading of providers
  useEffect(() => {
    fetchProviders()
  }, [])

  const handleAddProvider = async () => {
    try {
      await createProvider({
        ...newProvider,
        isActive: false
      })
      setNewProvider({
        name: '',
        baseUrl: '',
        apiKey: ''
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding provider:', error)
    }
  }

  const handleEditProvider = async () => {
    if (!editingProvider) return

    try {
      await updateProvider(editingProvider.id, editingProvider)
      setIsEditDialogOpen(false)
      setEditingProvider(null)
    } catch (error) {
      console.error('Error updating provider:', error)
    }
  }

  const handleDeleteProvider = async (id: number) => {
    try {
      await deleteProvider(id)
    } catch (error) {
      console.error('Error deleting provider:', error)
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await setProviderActive(id, isActive)
    } catch (error) {
      console.error('Error toggling provider active state:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t.provider.providers}</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.provider.addProvider}
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t.provider.noProvidersConfigured}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map(provider => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{provider.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={provider.isActive}
                      onCheckedChange={(checked) => handleToggleActive(provider.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProvider(provider)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {provider.isActive ? '已启用' : '已禁用'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API URL:</span>
                    <span>{provider.baseUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Key:</span>
                    <span>{provider.apiKey ? "**********" : t.provider.notSet}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                placeholder="e.g. OpenAI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">{t.provider.apiUrl}</Label>
              <Input
                id="baseUrl"
                value={newProvider.baseUrl}
                onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                placeholder="e.g. https://api.openai.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t.provider.apiKey}</Label>
              <Input
                id="apiKey"
                type="password"
                value={newProvider.apiKey}
                onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                placeholder={t.provider.enterApiKey}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleAddProvider}>
              {t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-baseUrl">{t.provider.apiUrl}</Label>
                <Input
                  id="edit-baseUrl"
                  value={editingProvider.baseUrl}
                  onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apiKey">{t.provider.apiKeyKeepUnchanged}</Label>
                <Input
                  id="edit-apiKey"
                  type="password"
                  placeholder={t.provider.enterNewApiKey}
                  onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleEditProvider}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProvidersSettings
