# Forge 应用程序构建资源

此目录包含 Forge 应用程序的构建资源，用于 electron-builder 打包过程。

## 目录结构

```
build/
├── entitlements.mac.plist  # macOS 应用程序权限配置
└── icons/                  # 应用程序图标
    ├── png/                # PNG 格式图标（源文件）
    ├── mac/                # macOS 图标
    └── win/                # Windows 图标
```

## 图标配置

应用程序使用 `build/icons/png/icon.png` 作为源图标，通过 electron-icon-builder 工具生成各平台所需的图标格式。

### 生成图标

1. 将 PNG 格式的图标文件放在 `build/icons/png/icon.png`
2. 运行以下命令生成所有平台的图标：

```bash
npm run generate-icons
```

这将使用 electron-icon-builder 工具自动生成 Windows (.ico)、macOS (.icns) 和 Linux (各种尺寸的 PNG) 图标。

## 构建应用程序

### 构建所有平台

```bash
npm run dist
```

### 构建特定平台

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

## 构建输出

构建后的应用程序将位于 `dist-electron` 目录中。
