# Forge - AI 助手桌面应用

Forge 是一个跨平台的桌面 AI 助手应用，支持多种 AI 模型、对话管理和丰富的格式化功能。

## 功能特点

### 多模型支持
- 集成主流 AI 模型，包括 OpenAI、Gemini、Anthropic、DeepSeek 等
- 自定义服务提供商和模型配置

### AI 助手与对话管理
- 通过系统提示词创建自定义助手
- 可调节的模型参数（温度、top-p）
- 自动对话命名和历史记录管理

### 对话格式化
- 文本和 Markdown 支持
- 代码语法高亮
- Mermaid 图表可视化
- 数学公式渲染

### 用户体验
- 跨平台兼容性（Windows、macOS、Linux）
- 明/暗主题支持
- 全局搜索功能
- 对话管理（删除、重命名等）
- 拖放式对话组织

### 隐私与安全
- 本地数据存储，增强隐私保护
- MCP（模型上下文协议）支持，用于访问外部工具和数据源

## 技术栈

- **Electron**: 跨平台桌面框架
- **React**: 前端框架
- **Zustand**: 状态管理
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Radix UI**: 无样式组件库
- **Reachat**: 支持 Markdown 的聊天 UI 组件库
- **LangChain**: 带流式传输支持的 LLM API 请求库
- **Prisma**: 现代化 ORM 数据库交互工具

## 架构

### 前端
- React 组件结构管理用户界面
- Zustand 管理应用状态
- Electron 渲染器进程处理前端逻辑

### 后端
- Electron 主进程管理数据库和 API 调用
- Prisma ORM 处理数据库操作
- SQLite 数据库存储用户数据、对话历史和设置

### 数据流
- 用户交互通过 React 组件捕获
- Zustand 存储更新并通过 IPC 发送请求到主进程
- 主进程使用 Prisma 进行数据库操作
- LLM API 调用由主进程处理并返回结果

## 开发

### 数据库管理

Forge 使用 Prisma ORM 和 SQLite 数据库进行数据存储。以下是一些常用的数据库管理命令：

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio 可视化数据库管理工具
npm run prisma:studio
```

### 环境设置

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npm run prisma:generate

# 启动开发服务器
npm run dev
```

### 构建应用

```bash
# 生成 Prisma 客户端（如果尚未生成）
npm run prisma:generate

# 构建应用
npm run build

# 启动构建后的应用
npm start
```

## 许可证

MIT