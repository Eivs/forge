// English translations
export default {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    enabled: 'Enabled',
    disabled: 'Disabled',
    saving: 'Saving...',
    loading: 'Loading...',
    confirm: 'Confirm',
    welcome: 'Welcome to Forge',
    welcomeMessage: 'Select a chat from the sidebar or create a new one to get started',
    noChatsYet: 'No chats yet',
    deleteConfirmation: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
  },
  chat: {
    newChat: 'New Chat',
    title: 'Title',
    chatTitle: 'Chat title',
    settings: 'Chat Settings',
    rename: 'Rename',
    deleteChat: 'Delete Chat',
    renameChat: 'Rename Chat',
    enterNewTitle: 'Enter new title',
    typeMessage: 'Type a message...',
  },
  settings: {
    settings: 'Settings',
    general: 'General',
    providers: 'Providers',
    models: 'Models',
    appearance: 'Appearance',
    customizeAppearance: 'Customize the appearance of the application',
    theme: 'Theme',
    selectTheme: 'Select theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    selectLanguage: 'Select language',
    english: 'English',
    chinese: 'Chinese',
  },
  model: {
    model: 'Model',
    selectModel: 'Select model',
    systemPrompt: 'System Prompt',
    enterSystemPrompt: 'Enter system prompt...',
    temperature: 'Temperature',
    temperatureDescription:
      'Lower values make output more deterministic, higher values make output more random',
    topP: 'Top P',
    topPDescription:
      'Controls the vocabulary range the model considers, lower values make output more focused',
    noModelsConfigured: 'No models configured',
    addModel: 'Add Model',
    editModel: 'Edit Model',
    modelName: 'Model Name',
    contextSize: 'Context Size (tokens)',
    enable: 'Enable',
  },
  provider: {
    provider: 'Provider',
    providers: 'Providers',
    noProvidersConfigured: 'No providers configured',
    addProvider: 'Add Provider',
    editProvider: 'Edit Provider',
    name: 'Name',
    apiUrl: 'API URL',
    apiKey: 'API Key',
    apiKeyKeepUnchanged: 'API Key (leave empty to keep unchanged)',
    enterApiKey: 'Enter API Key',
    enterNewApiKey: 'Enter new API Key',
    notSet: 'Not set',
    selectProvider: 'Select a provider',
  },
  mcp: {
    serverConfig: 'MCP Server Configuration',
    serverConfigDescription: 'Configure Model Context Protocol (MCP) server connection',
    serverUrl: 'MCP Server URL',
    connect: 'Connect',
    connecting: 'Connecting...',
    disconnect: 'Disconnect',
    error: 'Error',
    connected: 'Connected',
    connectedDescription: 'Successfully connected to MCP server',
    features: 'MCP Features',
    featuresDescription: 'MCP allows AI models to access external tools and data sources',
    withMcp: 'With MCP, AI models can:',
    accessFileSystem: 'Access local file system',
    performWebSearches: 'Perform web searches',
    callExternalApis: 'Call external APIs',
    runCode: 'Run code',
    andMore: 'And more...',
  },
};
