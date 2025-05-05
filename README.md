# 不丢云应用生成器

一个简单易用的Helm Chart生成工具，帮助快速创建标准化的Kubernetes应用部署配置。

## 功能特点

- 🚀 一键生成完整的Helm Chart文件结构
- 🎨 支持明暗两种主题模式，符合naive-ui风格
- 📝 提供可视化表单，轻松配置应用参数
- 💾 支持导出为ZIP压缩包，便于分享和使用
- 🔧 遵循Kubernetes最佳实践，生成高质量配置

## 使用方法

1. 访问 [https://yourusername.github.io/AppStoreGenerators-/](https://yourusername.github.io/AppStoreGenerators-/)
2. 填写应用基本信息、镜像配置、资源限制等参数
3. 实时预览生成的YAML文件内容
4. 点击"下载Helm Chart文件包"按钮获取完整配置

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/AppStoreGenerators-.git

# 进入项目目录
cd AppStoreGenerators-

# 使用任意HTTP服务器启动，例如
python -m http.server
# 或
npx serve
```

## 部署到GitHub Pages

本项目设计为静态网站，可以直接部署到GitHub Pages：

1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择部署分支和目录

## 技术栈

- Vue.js 3.x - 渐进式JavaScript框架
- Naive UI - 高质量Vue组件库，支持暗色模式
- js-yaml - YAML解析和生成库
- JSZip - ZIP文件生成库

## 贡献

欢迎提交Issue和Pull Request来完善这个项目。

## 许可

MIT
