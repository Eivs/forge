import { create } from 'zustand';
import { Model, Provider } from './chatStore';

interface ModelState {
  models: Model[];
  providers: Provider[];
  fetchModels: () => Promise<void>;
  fetchProviders: () => Promise<void>;
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

  fetchModels: async () => {
    try {
      const models = await window.electron.models.getAll();
      set({ models });
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  },

  fetchProviders: async () => {
    try {
      const providers = await window.electron.providers.getAll();

      set({ providers });
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  },

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

  setModelActive: async (id, isActive) => {
    try {
      const updatedModel = await window.electron.models.setActive(id, isActive);
      set(state => ({
        models: state.models.map(model => {
          if (model.id === id) {
            return updatedModel;
          }
          // 不再禁用同一服务商下的其他模型，允许多选
          return model;
        }),
      }));
      return updatedModel;
    } catch (error) {
      console.error('Error setting model active state:', error);
      throw error;
    }
  },

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
      return updatedProvider;
    } catch (error) {
      console.error('Error setting provider active state:', error);
      throw error;
    }
  },
}));
