# 类型定义文件说明

本目录包含项目中使用的类型定义文件。

## 文件说明

### global.d.ts

这个文件包含全局类型定义，主要用于扩展 `Window` 接口，添加 `window.electron` API 的基本类型。
为了避免与现有代码的类型冲突，这里使用了较为宽松的 `any` 类型。

### electron-api.d.ts

这个文件提供了 `window.electron` API 的详细类型定义，包括：

- 数据模型类型（消息、聊天、模型、提供商等）
- API 方法参数和返回值的详细类型
- 各种操作的参数类型

**注意**：这个文件中的类型仅作为参考，不用于实际类型检查，以避免与现有代码的类型冲突。

## 使用方法

### 基本用法

在大多数情况下，直接使用 `window.electron` 即可，TypeScript 会使用 `global.d.ts` 中定义的类型。

```typescript
// 直接使用 window.electron
const chats = await window.electron.chats.getAll();
```

### 使用详细类型（可选）

如果需要更详细的类型提示，可以使用 `electron-api.d.ts` 中定义的类型：

```typescript
import { ElectronAPI } from '../types/electron-api';

// 获取类型化的 API
const api = window.electron as unknown as ElectronAPI;

// 使用类型化的 API
const chats = await api.chats.getAll();
const messages = await api.messages.getByChatId(chatId);
```

### 类型参考

在编写代码时，可以参考 `electron-api.d.ts` 中的类型定义，了解各个 API 方法的参数和返回值类型。

## 注意事项

- 实际应用中的数据模型类型定义在 `src/renderer/src/store/chatStore.ts` 中
- `electron-api.d.ts` 中的类型定义可能与实际代码中的类型有所不同，仅作为参考
- 如果发现类型定义与实际代码不符，请以实际代码为准
