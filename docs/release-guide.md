# Forge 应用程序发布指南

本文档介绍如何使用 GitHub Actions 自动构建和发布 Forge 应用程序。

## 发布流程

Forge 使用 GitHub Actions 自动化构建和发布流程。当您创建一个新的 Git 标签（以 `v` 开头，如 `v1.0.0`）并推送到 GitHub 时，将自动触发构建和发布流程。

### 发布步骤

1. 更新版本号
2. 创建 Git 标签
3. 推送标签到 GitHub
4. 等待 GitHub Actions 完成构建
5. 验证发布的应用程序

## 详细步骤

### 1. 更新版本号

在发布新版本之前，请确保更新 `package.json` 文件中的版本号：

```bash
# 编辑 package.json 文件
# 将 "version" 字段更新为新版本号，例如 "1.0.0"
```

### 2. 创建 Git 标签

创建一个新的 Git 标签，标签名称应与 `package.json` 中的版本号一致，并以 `v` 开头：

```bash
# 提交所有更改
git add .
git commit -m "准备发布 v1.0.0"

# 创建标签
git tag v1.0.0
```

### 3. 推送标签到 GitHub

将标签推送到 GitHub 仓库，这将触发 GitHub Actions 工作流：

```bash
# 推送提交
git push origin main

# 推送标签
git push origin v1.0.0
```

### 4. 等待 GitHub Actions 完成构建

推送标签后，GitHub Actions 将自动开始构建过程。您可以在 GitHub 仓库的 "Actions" 标签页中查看构建进度。

构建过程包括：

- 为 Windows、macOS 和 Linux 平台构建应用程序
- 创建安装程序（Windows: .exe, macOS: .dmg, Linux: .AppImage, .deb, .rpm）
- 创建 GitHub Release
- 上传构建的应用程序到 Release

### 5. 验证发布的应用程序

构建完成后，请验证：

- GitHub Release 已创建
- 所有平台的安装程序已上传
- 安装程序可以正常下载和安装

## 故障排除

### 构建失败

如果构建失败，请检查 GitHub Actions 日志以获取详细信息。常见问题包括：

- 依赖项安装失败
- 构建脚本错误
- 权限问题

### 签名问题

对于 macOS 和 Windows 应用程序，您可能需要配置代码签名证书。请参阅 electron-builder 文档了解如何配置代码签名。

## 手动发布

如果需要手动发布，可以使用以下命令：

```bash
# 构建并发布所有平台
npm run publish

# 或者仅构建特定平台
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## 相关文档

- [electron-builder 文档](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
