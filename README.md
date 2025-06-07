# 不丢云应用生成器

一个简单易用的Helm Chart生成工具，帮助快速创建标准化的Kubernetes应用部署配置。

## 功能特点

- 🚀 一键生成完整的Helm Chart文件结构
- 🎨 支持明暗两种主题模式，符合naive-ui风格
- 📝 提供可视化表单，轻松配置应用参数
- 💾 支持导出为ZIP压缩包，便于分享和使用
- 🔄 支持导入/导出JSON配置，方便复用和共享
- 🔧 遵循Kubernetes最佳实践，生成高质量配置

## 使用方法

1. 访问 [https://yourusername.github.io/AppStoreGenerators-/](https://yourusername.github.io/AppStoreGenerators-/)
2. 填写应用基本信息、镜像配置、资源限制等参数
3. 实时预览生成的YAML文件内容
4. 点击"下载Helm Chart文件包"按钮获取完整配置
5. 可以使用"导出JSON配置"保存当前配置，或使用"导入JSON"加载已有配置

## JSON配置格式

导入和导出的JSON配置文件格式如下：

```json
{
  "name": "应用名称",
  "version": "应用版本",
  "appVersion": "应用程序版本",
  "description": "应用描述",
  "icon": "图标URL",
  "category": "应用分类",
  "maintainer": {
    "name": "维护者姓名",
    "email": "维护者邮箱"
  },
  "workloadType": "Deployment或StatefulSet",
  "image": {
    "imageRegistry": "镜像仓库地址",
    "repository": "镜像名称",
    "tag": "镜像标签",
    "pullPolicy": "镜像拉取策略"
  },
  "service": {
    "type": "服务类型",
    "ports": {
      "http": 80,
      "https": 443
    }
  },
  "networkLimits": {
    "enabled": true,
    "egress": "出站带宽限制",
    "ingress": "入站带宽限制"
  },
  "resources": {
    "limits": {
      "cpu": "CPU限制",
      "memory": "内存限制"
    },
    "requests": {
      "cpu": "CPU请求",
      "memory": "内存请求"
    }
  },
  "persistence": {
    "enabled": true,
    "path": "数据挂载路径",
    "accessMode": "访问模式",
    "size": "存储大小",
    "storageClass": "存储类名称"
  },
  "envVars": [
    {
      "title": "环境变量中文名称",
      "description": "环境变量描述",
      "name": "变量名称",
      "value": "变量值"
    }
  ]
}
```

### 示例配置

```json
{
  "name": "nginx",
  "version": "v1.0.0",
  "appVersion": "1.21.0",
  "description": "高性能Web服务器和反向代理",
  "icon": "https://example.com/nginx-icon.png",
  "category": "网络工具",
  "maintainer": {
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "workloadType": "Deployment",
  "image": {
    "imageRegistry": "docker.io",
    "repository": "nginx",
    "tag": "latest",
    "pullPolicy": "IfNotPresent"
  },
  "service": {
    "type": "ClusterIP",
    "ports": {
      "http": 80,
      "https": 443
    }
  },
  "networkLimits": {
    "enabled": true,
    "egress": "1M",
    "ingress": "1M"
  },
  "resources": {
    "limits": {
      "cpu": "200m",
      "memory": "256Mi"
    },
    "requests": {
      "cpu": "100m",
      "memory": "128Mi"
    }
  },
  "persistence": {
    "enabled": true,
    "path": "/usr/share/nginx/html",
    "accessMode": "ReadWriteOnce",
    "size": "1Gi",
    "storageClass": "local"
  },
  "envVars": [
    {
      "title": "运行模式",
      "description": "Nginx运行模式",
      "name": "NGINX_MODE",
      "value": "production"
    },
    {
      "title": "工作进程数",
      "description": "Nginx工作进程数量",
      "name": "NGINX_WORKER_PROCESSES",
      "value": "auto"
    }
  ]
}
```

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
