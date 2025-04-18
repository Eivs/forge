# Forge 应用程序打包指南

本文档介绍如何使用 electron-builder 打包 Forge 应用程序。

## 前提条件

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- 对于 macOS 构建：XCode 和命令行工具
- 对于 Windows 构建：Windows 操作系统或使用 Wine 的 Linux/macOS
- 对于 Linux 构建：相关依赖（详见 electron-builder 文档）

## 安装依赖

```bash
# 安装项目依赖
npm install
```

## 图标配置

应用程序使用 `public/forge-icon.svg` 作为图标。electron-builder 将自动将其转换为各个平台所需的格式。

## 构建应用程序

### 开发构建

```bash
# 开发模式运行
npm run dev

# 构建但不打包
npm run build
```

### 生产构建

```bash
# 构建并打包为可分发格式（所有平台）
npm run dist

# 仅构建特定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux

# 构建并打包为目录（用于测试）
npm run pack
```

## 发布应用程序

要发布应用程序，请确保已配置 GitHub 令牌并运行：

```bash
npm run publish
```

这将构建应用程序并将其发布到 GitHub Releases。

## 配置文件

electron-builder 配置位于项目根目录的 `electron-builder.yml` 文件中。您可以根据需要修改此文件以自定义构建过程。

### 常见配置选项

- **appId**: 应用程序的唯一标识符
- **productName**: 应用程序的显示名称
- **copyright**: 版权信息
- **directories.output**: 构建输出目录
- **files**: 要包含在构建中的文件
- **extraResources**: 要包含在应用程序中的额外资源
- **mac/win/linux**: 特定平台的配置

有关更多配置选项，请参阅 [electron-builder 文档](https://www.electron.build/configuration/configuration)。

## 故障排除

### macOS 构建问题

如果在 macOS 上构建时遇到签名问题，请确保已安装有效的 Apple 开发者证书，并在 `electron-builder.yml` 中配置了正确的签名选项。

### Windows 构建问题

在 Windows 上构建时，确保已安装所有必要的构建工具，包括 Visual Studio 构建工具。

### Linux 构建问题

在 Linux 上构建时，可能需要安装额外的依赖项。请参阅 electron-builder 文档了解特定发行版的要求。
