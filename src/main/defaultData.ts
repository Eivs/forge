// 默认用户数据
export const defaultUser = {
  name: 'Default User',
  email: 'user@example.com',
};

// 默认设置数据
export const defaultSettings = [
  {
    key: 'theme',
    value: 'light',
  },
  {
    key: 'language',
    value: 'en',
  },
];

// 默认提供商数据
export const defaultProviders = [
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    isActive: true,
  },
  {
    name: 'CoresHub',
    baseUrl: 'https://openapi.coreshub.cn/v1',
    apiKey: '',
    isActive: true,
  },
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    isActive: false,
  },
  {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: '',
    isActive: false,
  },
  {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '',
    isActive: false,
  },
];

// 默认模型数据
export const defaultModels = {
  DeepSeek: [
    {
      name: 'deepseek-chat',
      contextSize: 32000,
      isActive: true,
    },
    {
      name: 'deepseek-reasoner',
      contextSize: 32000,
      isActive: true,
    },
  ],
  CoresHub: [
    {
      name: 'DeepSeek-V3',
      contextSize: 16000,
      isActive: true,
    },
    {
      name: 'DeepSeek-R1',
      contextSize: 16000,
      isActive: true,
    },
  ],
  OpenAI: [
    {
      name: 'gpt-4-turbo',
      contextSize: 128000,
      isActive: false,
    },
    {
      name: 'gpt-4o',
      contextSize: 128000,
      isActive: false,
    },
    {
      name: 'gpt-3.5-turbo',
      contextSize: 16000,
      isActive: false,
    },
  ],
  Anthropic: [
    {
      name: 'claude-3-haiku',
      contextSize: 200000,
      isActive: false,
    },
    {
      name: 'claude-3-sonnet',
      contextSize: 200000,
      isActive: false,
    },
    {
      name: 'claude-3-opus',
      contextSize: 200000,
      isActive: false,
    },
    {
      name: 'claude-3-5-haiku',
      contextSize: 200000,
      isActive: false,
    },
    {
      name: 'claude-3-5-sonnet',
      contextSize: 200000,
      isActive: false,
    },
    {
      name: 'claude-3-7-sonnet',
      contextSize: 200000,
      isActive: false,
    },
  ],
  Google: [
    {
      name: 'gemini-pro',
      contextSize: 32000,
      isActive: false,
    },
    {
      name: 'gemini-ultra',
      contextSize: 32000,
      isActive: false,
    },
  ],
};
