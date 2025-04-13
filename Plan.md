### 功能需求

#### 1. 多模型支持

- 集成主流 AI 模型，包括：
  - **云服务**：OpenAI、Gemini、Anthropic、DeepSeek 等等。
- 支持用户**自定义服务商和模型**，允许接入非内置模型。

#### 2. AI 助手与对话管理

- 自定义助手
  - 用户可定义系统提示词。
  - 支持调整模型参数（如温度、Top-p 等）。
- 智能会话管理
  - 自动为会话命名。
  - 支持会话整理和历史回溯。

#### 3. 会话格式

- 支持多种格式：
  - **文本** 和 **Markdown**。
- 内置功能：
  - **代码语法高亮**，支持开发者使用 （Reachat 支持）。
  - **流程图可视化**，支持 Mermaid 图表 （Reachat 支持）。
  - **数学公式**渲染 （Reachat 支持）。

#### 4. 用户体验与界面设计

- 跨平台兼容
  - 支持 Windows、macOS、Linux。
  - Web 端部分功能（MCP 仅支持 SSE）。
- 界面特性
  - 支持**亮/暗主题**切换。
  - **全局搜索**功能。
  - 会话管理 ( 删除，重命名等)
  - **拖放排序**会话或内容。
  - 配置（LLM 服务商, 模型配置, MCP Server 配置）。
- **本地部署**：数据存储在用户设备上，增强隐私性。

#### 5. 扩展功能

- 支持 

  MCP（Model Context Protocol）服务

  - 可访问外部数据源（如本地文件系统）。
  - 支持外部工具（如网络搜索）。

------

### 技术栈

- Electron

  - 跨平台桌面框架，基于 Web 前端 和 Node 后端 。
  - 参考 https://www.electronjs.org/zh/docs/latest/

- React

  - 前端框架，用于构建本项目的动态单页面应用。

- Zustand

  - React 状态管理库，轻量且易用，用于实现本项目中的前端状态管理。
  - 参考：https://zustand.docs.pmnd.rs/getting-started/introduction

- Tailwind CSS

  - Tailwind CSS 实用优先的 CSS 框架，用于构建本项目构建现代化 UI。
  - 参考：https://tailwindcss.com/docs/installation/using-vite

- Radix UI

  - Radix UI 用于构建本项目无样式 React 组件库，与 Tailwind CSS 兼容。
  - 参考：https://www.radix-ui.com/themes/docs/overview/getting-started

- Reachat

  - Reachat 用于构建本项目 的 React LLM 聊天组件，支持 Markdown、代码高亮、数学公式和 Mermaid 图表。
  - 参考：https://reachat.dev/docs

- electron-vite

  - electron-vite 用于构建本项目构建工具，旨在为 Electron 提供更快、更精简的开发体验。

  - 参考：https://cn.electron-vite.org/guide/

- LangChain

  - LLM API 请求库，支持流式响应。 需要运行在 Electron 的 Node.js 环境中
  - 参考：https://js.langchain.com/docs/introduction/

- @langchain/mcp-adapters

  - LangChain 的 MCP 客户端库，支持 MCP 服务集成。 需要运行在 Electron 的 Node.js 环境中
  - 参考：https://github.com/langchain-ai/langchainjs-mcp-adapters

- modelcontextprotocol/typescript-sdk

  - MCP 官方的 TypeScript SDK，结合 @langchain/mcp-adapters 一起使用作为 MCP Clinet， 需要运行在 Electron 的 Node.js 环境中

  - 参考：https://github.com/modelcontextprotocol/typescript-sdk

- prisma

  - prisma 是一个[ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)，在 Electron 的 NodeJS 环境中使用，使用 SQLite 作为数据源，用于存储本项目的应用的配置和聊天记录等等