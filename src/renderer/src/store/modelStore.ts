import { create } from 'zustand';
import { Model, Provider } from './chatStore';

interface ModelState {
  models: Model[];
  providers: Provider[];
  activeModels: Model[];
  defaultModel: Model | null;
  defaultModelId: string;
  fetchModels: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  loadDefaultModel: () => Promise<void>;
  setDefaultModel: (modelId: string) => Promise<void>;
  createModel: (data: Partial<Model>) => Promise<Model>;
  updateModel: (id: number, data: Partial<Model>) => Promise<Model>;
  deleteModel: (id: number) => Promise<void>;
  setModelActive: (id: number, isActive: boolean) => Promise<Model>;
  createProvider: (data: Partial<Provider>) => Promise<Provider>;
  updateProvider: (id: number, data: Partial<Provider>) => Promise<Provider>;
  deleteProvider: (id: number) => Promise<void>;
  setProviderActive: (id: number, isActive: boolean) => Promise<Provider>;
}

export const useModelStore = create<ModelState>(set => ({
  models: [],
  providers: [],
  activeModels: [],
  defaultModel: null,
  defaultModelId: '',

  // 获取所有模型
  fetchModels: async () => {
    try {
      const models = await window.electron.models.getAll();
      const activeModels = models.filter(model => model.isActive);
      set({ models, activeModels });
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  },

  // 加载默认模型
  loadDefaultModel: async () => {
    try {
      // 获取激活的模型
      const { activeModels } = useModelStore.getState();
      if (activeModels.length === 0) {
        set({ defaultModel: null, defaultModelId: '' });
        return;
      }

      // 尝试从设置中获取默认模型 ID
      const defaultModelId = await window.electron.settings.getByKey('defaultModelId');

      if (defaultModelId) {
        // 检查默认模型是否处于激活状态
        const defaultModel = activeModels.find(m => m.id.toString() === defaultModelId);
        if (defaultModel) {
          set({ defaultModel, defaultModelId });
          return;
        }
      }

      // 如果没有设置默认模型或默认模型不活跃，使用第一个活跃模型
      set({
        defaultModel: activeModels[0],
        defaultModelId: activeModels[0].id.toString(),
      });
    } catch (error) {
      console.error('Error loading default model:', error);
    }
  },

  // 设置默认模型
  setDefaultModel: async modelId => {
    try {
      await window.electron.settings.set('defaultModelId', modelId);
      const { activeModels } = useModelStore.getState();
      const defaultModel = activeModels.find(m => m.id.toString() === modelId) || null;
      set({ defaultModel, defaultModelId: modelId });
    } catch (error) {
      console.error('Error setting default model:', error);
    }
  },

  // 获取所有提供商
  fetchProviders: async () => {
    try {
      const providers = await window.electron.providers.getAll();

      set({ providers });
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  },

  // 创建模型
  createModel: async data => {
    try {
      const model = await window.electron.models.create(data);
      set(state => ({ models: [...state.models, model] }));
      return model;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  },

  // 更新模型
  updateModel: async (id, data) => {
    try {
      const updatedModel = await window.electron.models.update(id, data);
      set(state => ({
        models: state.models.map(model => (model.id === id ? updatedModel : model)),
      }));
      return updatedModel;
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  },

  // 删除模型
  deleteModel: async id => {
    try {
      await window.electron.models.delete(id);
      set(state => ({
        models: state.models.filter(model => model.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  },

  // 设置模型的启用状态
  setModelActive: async (id, isActive) => {
    try {
      const updatedModel = await window.electron.models.setActive(id, isActive);
      set(state => {
        // 更新模型列表
        const updatedModels = state.models.map(model => {
          if (model.id === id) {
            return updatedModel;
          }
          // 不再禁用同一服务商下的其他模型，允许多选
          return model;
        });

        // 更新激活模型列表
        const updatedActiveModels = updatedModels.filter(model => model.isActive);

        return {
          models: updatedModels,
          activeModels: updatedActiveModels,
        };
      });

      // 如果激活状态变化，可能需要更新默认模型
      const { loadDefaultModel } = useModelStore.getState();
      await loadDefaultModel();

      return updatedModel;
    } catch (error) {
      console.error('Error setting model active state:', error);
      throw error;
    }
  },

  // 创建提供商
  createProvider: async data => {
    try {
      const provider = await window.electron.providers.create(data);
      set(state => ({ providers: [...state.providers, provider] }));
      return provider;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  },

  // 更新提供商
  updateProvider: async (id, data) => {
    try {
      const updatedProvider = await window.electron.providers.update(id, data);
      set(state => ({
        providers: state.providers.map(provider =>
          provider.id === id ? updatedProvider : provider
        ),
      }));
      return updatedProvider;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  },

  // 删除提供商
  deleteProvider: async id => {
    try {
      await window.electron.providers.delete(id);
      set(state => ({
        providers: state.providers.filter(provider => provider.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  },

  // 设置提供商的启用状态
  setProviderActive: async (id, isActive) => {
    try {
      const updatedProvider = await window.electron.providers.setActive(id, isActive);
      set(state => ({
        providers: state.providers.map(provider => {
          if (provider.id === id) {
            return updatedProvider;
          }

          return provider;
        }),
      }));

      // 当提供商激活状态变化时，需要重新加载模型和默认模型
      const { fetchModels, loadDefaultModel } = useModelStore.getState();
      await fetchModels();
      await loadDefaultModel();

      return updatedProvider;
    } catch (error) {
      console.error('Error setting provider active state:', error);
      throw error;
    }
  },
}));
