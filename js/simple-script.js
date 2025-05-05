document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // 移除所有active类
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 添加active类到当前元素
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // 如果是预览标签，更新预览内容
            if (tabName === 'preview') {
                updatePreviews();
            }
        });
    });
    
    // 预览标签页切换
    const previewTabs = document.querySelectorAll('.preview-tab');
    const previewContents = document.querySelectorAll('.preview-content pre');
    
    previewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const previewName = tab.getAttribute('data-preview');
            
            // 移除所有active类
            previewTabs.forEach(t => t.classList.remove('active'));
            previewContents.forEach(c => c.classList.remove('active'));
            
            // 添加active类到当前元素
            tab.classList.add('active');
            document.getElementById(`preview-${previewName}`).classList.add('active');
        });
    });
    
    // 网络带宽限制切换
    const networkEnabled = document.getElementById('networkEnabled');
    const networkSettings = document.querySelector('.network-settings');
    
    networkEnabled.addEventListener('change', () => {
        networkSettings.style.display = networkEnabled.checked ? 'block' : 'none';
    });
    
    // 持久化存储切换
    const persistenceEnabled = document.getElementById('persistenceEnabled');
    const persistenceSettings = document.querySelector('.persistence-settings');
    
    persistenceEnabled.addEventListener('change', () => {
        persistenceSettings.style.display = persistenceEnabled.checked ? 'block' : 'none';
    });
    
    // 添加端口
    const addPortBtn = document.getElementById('add-port');
    const portContainer = document.getElementById('service-ports-container');
    
    addPortBtn.addEventListener('click', () => {
        const portRow = document.createElement('div');
        portRow.className = 'service-port-row';
        
        portRow.innerHTML = `
            <div class="form-group port-name">
                <label>端口名称</label>
                <input type="text" class="port-name-input" placeholder="例如：http">
            </div>
            <div class="form-group port-number">
                <label>端口号</label>
                <input type="number" class="port-number-input" min="1" max="65535" value="80">
            </div>
            <button type="button" class="remove-port">删除</button>
        `;
        
        portContainer.appendChild(portRow);
        
        // 添加删除端口的事件监听
        const removeBtn = portRow.querySelector('.remove-port');
        removeBtn.addEventListener('click', () => {
            portRow.remove();
        });
    });
    
    // 初始化删除端口按钮
    document.querySelectorAll('.remove-port').forEach(btn => {
        btn.addEventListener('click', function() {
            // 如果只有一个端口，不允许删除
            if (document.querySelectorAll('.service-port-row').length <= 1) {
                alert('至少需要一个服务端口！');
                return;
            }
            this.closest('.service-port-row').remove();
        });
    });
    
    // 添加环境变量
    const addEnvBtn = document.getElementById('add-env');
    const envContainer = document.getElementById('env-container');
    
    addEnvBtn.addEventListener('click', () => {
        const envRow = document.createElement('div');
        envRow.className = 'env-row';
        
        envRow.innerHTML = `
            <div class="form-group env-title">
                <label>环境变量中文名称</label>
                <input type="text" class="env-title-input" placeholder="例如：数据库名">
            </div>
            <div class="form-group env-desc">
                <label>环境变量描述</label>
                <input type="text" class="env-desc-input" placeholder="例如：MySQL数据库名称">
            </div>
            <div class="form-group env-name">
                <label>变量名称</label>
                <input type="text" class="env-name-input" placeholder="例如：MYSQL_DATABASE">
            </div>
            <div class="form-group env-value">
                <label>变量值</label>
                <input type="text" class="env-value-input" placeholder="环境变量值">
            </div>
            <button type="button" class="remove-env">删除</button>
        `;
        
        envContainer.appendChild(envRow);
        
        // 添加删除环境变量的事件监听
        const removeBtn = envRow.querySelector('.remove-env');
        removeBtn.addEventListener('click', () => {
            envRow.remove();
        });
    });
    
    // 初始化删除环境变量按钮
    document.querySelectorAll('.remove-env').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.env-row').remove();
        });
    });
    
    // 下载按钮
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', downloadAll);
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', resetForm);
    
    // 处理自定义分类
    const categorySelect = document.getElementById('category');
    const customCategoryInput = document.getElementById('customCategory');
    
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'custom') {
            customCategoryInput.style.display = 'block';
            customCategoryInput.focus();
        } else {
            customCategoryInput.style.display = 'none';
        }
    });
    
    // 更新预览内容
    function updatePreviews() {
        document.getElementById('preview-chart').textContent = generateChartYaml();
        document.getElementById('preview-values').textContent = generateValuesYaml();
        document.getElementById('preview-schema').textContent = generateValuesSchemaJson();
        document.getElementById('preview-workload').textContent = generateWorkloadYaml();
        document.getElementById('preview-service').textContent = generateServiceYaml();
        document.getElementById('preview-pvc').textContent = generatePvcYaml();
        document.getElementById('preview-helpers').textContent = generateHelpersTpl();
    }
    
    // 获取表单数据
    function getFormData() {
        const networkEnabled = document.getElementById('networkEnabled').checked;
        const persistenceEnabled = document.getElementById('persistenceEnabled').checked;
        const categorySelect = document.getElementById('category');
        const customCategoryInput = document.getElementById('customCategory');
        
        // 确定分类值
        let category = categorySelect.value;
        if (category === 'custom' && customCategoryInput.value.trim()) {
            category = customCategoryInput.value.trim();
        }
        
        // 收集服务端口
        const servicePorts = [];
        document.querySelectorAll('.service-port-row').forEach(row => {
            const name = row.querySelector('.port-name-input').value.trim();
            const port = parseInt(row.querySelector('.port-number-input').value);
            if (name && !isNaN(port)) {
                servicePorts.push({ name, port });
            }
        });
        
        // 收集环境变量
        const envVars = [];
        document.querySelectorAll('.env-row').forEach(row => {
            const title = row.querySelector('.env-title-input').value.trim();
            const description = row.querySelector('.env-desc-input').value.trim();
            const name = row.querySelector('.env-name-input').value.trim();
            const value = row.querySelector('.env-value-input').value.trim();
            if (name) {
                envVars.push({ title, description, name, value });
            }
        });
        
        return {
            name: document.getElementById('name').value.trim(),
            version: document.getElementById('version').value.trim(),
            appVersion: document.getElementById('appVersion').value.trim(),
            description: document.getElementById('description').value.trim(),
            icon: document.getElementById('icon').value.trim(),
            category: category,
            maintainer: {
                name: document.getElementById('maintainerName').value.trim(),
                email: document.getElementById('maintainerEmail').value.trim()
            },
            // 添加工作负载类型
            workloadType: document.getElementById('workloadType').value,
            image: {
                imageRegistry: document.getElementById('imageRegistry').value.trim(),
                repository: document.getElementById('repository').value.trim(),
                tag: document.getElementById('tag').value.trim(),
                pullPolicy: document.getElementById('pullPolicy').value
            },
            service: {
                type: document.getElementById('serviceType').value,
                ports: servicePorts
            },
            networkLimits: {
                enabled: networkEnabled,
                egress: networkEnabled ? document.getElementById('egress').value.trim() : '',
                ingress: networkEnabled ? document.getElementById('ingress').value.trim() : ''
            },
            resources: {
                limits: {
                    cpu: document.getElementById('limitsCpu').value.trim(),
                    memory: document.getElementById('limitsMemory').value.trim()
                },
                requests: {
                    cpu: document.getElementById('requestsCpu').value.trim(),
                    memory: document.getElementById('requestsMemory').value.trim()
                }
            },
            persistence: {
                enabled: persistenceEnabled,
                path: persistenceEnabled ? document.getElementById('path').value.trim() : '',
                accessMode: persistenceEnabled ? document.getElementById('accessMode').value : '',
                size: persistenceEnabled ? document.getElementById('size').value.trim() : '',
                storageClass: persistenceEnabled ? document.getElementById('storageClass').value.trim() : ''
            },
            envVars: envVars
        };
    }
    
    // 表单验证
    function validateForm() {
        const formData = getFormData();
        const categorySelect = document.getElementById('category');
        const customCategoryInput = document.getElementById('customCategory');
        
        // 必填字段验证
        if (!formData.name) {
            alert('请填写应用名称');
            return false;
        }
        
        if (!formData.version) {
            alert('请填写应用版本');
            return false;
        }
        
        if (!formData.appVersion) {
            alert('请填写应用程序版本');
            return false;
        }
        
        if (!formData.description) {
            alert('请填写应用描述');
            return false;
        }
        
        if (!formData.icon) {
            alert('请填写图标URL');
            return false;
        }
        
        // 验证分类
        if (categorySelect.value === 'custom' && !customCategoryInput.value.trim()) {
            alert('请输入自定义分类名称');
            customCategoryInput.focus();
            return false;
        }
        
        if (!formData.maintainer.name) {
            alert('请填写维护者姓名');
            return false;
        }
        
        if (!formData.maintainer.email) {
            alert('请填写维护者邮箱');
            return false;
        }
        
        if (!formData.image.repository) {
            alert('请填写镜像名称');
            return false;
        }
        
        // 验证端口配置
        if (formData.service.ports.length === 0) {
            alert('请至少添加一个服务端口');
            return false;
        }
        
        // 验证网络限制格式
        if (formData.networkLimits.enabled) {
            const egressPattern = /^[0-9]+[KMG]$/;
            const ingressPattern = /^[0-9]+[KMG]$/;
            
            if (!egressPattern.test(formData.networkLimits.egress)) {
                alert('出站带宽限制格式不正确，应为数字+K/M/G，例如1M');
                return false;
            }
            
            if (!ingressPattern.test(formData.networkLimits.ingress)) {
                alert('入站带宽限制格式不正确，应为数字+K/M/G，例如1M');
                return false;
            }
        }
        
        return true;
    }
    
    // 生成Chart.yaml
    function generateChartYaml() {
        const formData = getFormData();
        
        const chartData = {
            apiVersion: 'v2',
            name: formData.name,
            version: formData.version,
            appVersion: formData.appVersion,
            description: formData.description,
            icon: formData.icon,
            maintainers: [
                {
                    name: formData.maintainer.name,
                    email: formData.maintainer.email
                }
            ],
            annotations: {
                'budiu/app-category-zh': formData.category
            }
        };
        
        return jsyaml.dump(chartData);
    }
    
    // 生成values.yaml
    function generateValuesYaml() {
        const formData = getFormData();
        
        const values = {
            replicaCount: 1,
            workloadType: formData.workloadType,
            image: {
                imageRegistry: formData.image.imageRegistry,
                repository: formData.image.repository,
                tag: formData.image.tag,
                pullPolicy: formData.image.pullPolicy
            },
            service: {
                type: formData.service.type,
                ports: formData.service.ports.reduce((obj, port) => {
                    obj[port.name] = port.port;
                    return obj;
                }, {})
            },
            networkLimits: formData.networkLimits,
            resources: formData.resources,
            persistence: formData.persistence
        };
        
        // 处理环境变量 - 使用env1, env2这种格式
        if (formData.envVars.length > 0) {
            values.env = {};
            formData.envVars.forEach((env, index) => {
                // 确保使用env1, env2, env3...的格式
                values.env[`env${index + 1}`] = {
                    name: env.name,
                    value: env.value,
                    description: env.description || '',
                    title: env.title || `环境变量${index + 1}`
                };
            });
        }
        
        return jsyaml.dump(values);
    }
    
    // 生成values.schema.json
    function generateValuesSchemaJson() {
        const formData = getFormData();
        
        // 构建schema对象
        const schema = {
            "$schema": "https://json-schema.org/draft-07/schema#",
            "type": "object",
            "title": `${formData.name} Helm Chart 配置`,
            "required": [
                "replicaCount",
                "workloadType",
                "image",
                "service",
                "networkLimits",
                "resources"
            ],
            "properties": {
                "replicaCount": {
                    "type": "integer",
                    "title": "副本数量",
                    "description": "Deployment的副本数量",
                    "default": 1,
                    "minimum": 1
                },
                "workloadType": {
                    "type": "string",
                    "title": "工作负载类型",
                    "description": "指定部署为有状态集(StatefulSet)或无状态部署(Deployment)",
                    "enum": ["Deployment", "StatefulSet"],
                    "default": formData.workloadType
                },
                "image": {
                    "type": "object",
                    "title": "容器镜像",
                    "required": ["repository", "tag", "pullPolicy"],
                    "properties": {
                        "imageRegistry": {
                            "type": "string",
                            "title": "镜像仓库地址",
                            "description": "容器镜像的仓库地址",
                            "default": "docker.io"
                        },
                        "repository": {
                            "type": "string",
                            "title": "镜像名称",
                            "description": "容器镜像的名称"
                        },
                        "tag": {
                            "type": "string",
                            "title": "镜像标签",
                            "description": "容器镜像的标签",
                            "default": "latest"
                        },
                        "pullPolicy": {
                            "type": "string",
                            "title": "镜像拉取策略",
                            "description": "镜像拉取策略，只能是IfNotPresent",
                            "enum": ["IfNotPresent"],
                            "default": "IfNotPresent"
                        }
                    }
                },
                "service": {
                    "type": "object",
                    "title": "服务配置",
                    "required": ["type", "ports"],
                    "properties": {
                        "type": {
                            "type": "string",
                            "title": "服务类型",
                            "description": "Kubernetes服务类型",
                            "enum": ["ClusterIP"],
                            "default": "ClusterIP"
                        },
                        "ports": {
                            "type": "object",
                            "title": "服务端口配置",
                            "description": "服务暴露的端口配置，键为端口名称，值为端口号",
                            "patternProperties": {
                                "^.*$": {
                                    "type": "integer",
                                    "title": "端口号",
                                    "description": "服务端口号",
                                    "minimum": 1,
                                    "maximum": 65535
                                }
                            },
                            "additionalProperties": false,
                            "examples": [
                                {
                                    "http": 80,
                                    "https": 443,
                                    "metrics": 8080
                                }
                            ]
                        }
                    }
                },
                "networkLimits": {
                    "type": "object",
                    "title": "网络带宽限制",
                    "required": ["enabled", "egress", "ingress"],
                    "properties": {
                        "enabled": {
                            "type": "boolean",
                            "title": "启用网络带宽限制",
                            "description": "是否启用网络带宽限制",
                            "default": true
                        },
                        "egress": {
                            "type": "string",
                            "title": "出站带宽限制",
                            "description": "容器出站带宽限制，格式为数字+K/M/G，例如1M",
                            "default": "1M",
                            "pattern": "^[0-9]+[KMG]$"
                        },
                        "ingress": {
                            "type": "string",
                            "title": "入站带宽限制",
                            "description": "容器入站带宽限制，格式为数字+K/M/G，例如1M",
                            "default": "1M",
                            "pattern": "^[0-9]+[KMG]$"
                        }
                    }
                },
                "resources": {
                    "type": "object",
                    "title": "资源配置",
                    "required": ["limits", "requests"],
                    "properties": {
                        "limits": {
                            "type": "object",
                            "title": "资源限制",
                            "required": ["cpu", "memory"],
                            "properties": {
                                "cpu": {
                                    "type": "string",
                                    "title": "CPU限制",
                                    "description": "CPU资源限制，可以是m或核心数",
                                    "default": "200m"
                                },
                                "memory": {
                                    "type": "string",
                                    "title": "内存限制",
                                    "description": "内存资源限制，可以是Mi或Gi",
                                    "default": "256Mi"
                                }
                            }
                        },
                        "requests": {
                            "type": "object",
                            "title": "资源请求",
                            "required": ["cpu", "memory"],
                            "properties": {
                                "cpu": {
                                    "type": "string",
                                    "title": "CPU请求",
                                    "description": "CPU资源请求，可以是m或核心数",
                                    "default": "100m"
                                },
                                "memory": {
                                    "type": "string",
                                    "title": "内存请求",
                                    "description": "内存资源请求，可以是Mi或Gi",
                                    "default": "128Mi"
                                }
                            }
                        }
                    }
                }
            }
        };
        
        // 添加持久化存储配置
        schema.properties.persistence = {
            "type": "object",
            "title": "持久化存储",
            "required": ["enabled"],
            "properties": {
                "enabled": {
                    "type": "boolean",
                    "title": "启用持久化存储",
                    "description": "是否启用持久化存储",
                    "default": true
                }
            }
        };
        
        // 如果启用了持久化存储，添加相关配置
        if (formData.persistence.enabled) {
            schema.properties.persistence.properties.path = {
                "type": "string",
                "title": "数据挂载路径",
                "description": "容器内挂载持久化存储的路径",
                "default": "/data"
            };
            
            schema.properties.persistence.properties.accessMode = {
                "type": "string",
                "title": "存储访问模式",
                "description": "持久化存储的访问模式",
                "enum": ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"],
                "default": "ReadWriteOnce"
            };
            
            schema.properties.persistence.properties.size = {
                "type": "string",
                "title": "存储大小",
                "description": "持久化存储的大小，例如1Gi",
                "default": "1Gi"
            };
            
            schema.properties.persistence.properties.storageClass = {
                "type": "string",
                "title": "存储类名称",
                "description": "Kubernetes存储类的名称",
                "default": "local"
            };
        }
        
        // 添加环境变量配置
        if (formData.envVars.length > 0) {
            schema.properties.env = {
                "type": "object",
                "title": "环境变量",
                "description": "应用程序环境变量配置"
            };
            
            // 为每个环境变量创建schema属性
            schema.properties.env.properties = {};
            formData.envVars.forEach((env, index) => {
                const envKey = `env${index + 1}`;
                schema.properties.env.properties[envKey] = {
                    "type": "object",
                    "title": env.title || `环境变量${index + 1}`,
                    "description": env.description || `环境变量${index + 1}的配置`,
                    "required": ["name", "value"],
                    "properties": {
                        "name": {
                            "type": "string",
                            "title": "变量名称",
                            "description": "环境变量的名称",
                            "default": env.name
                        },
                        "value": {
                            "type": "string",
                            "title": "变量值",
                            "description": "环境变量的值",
                            "default": env.value
                        },
                        "title": {
                            "type": "string",
                            "title": "中文名称",
                            "description": "环境变量的中文名称",
                            "default": env.title
                        },
                        "description": {
                            "type": "string",
                            "title": "描述",
                            "description": "环境变量的详细描述",
                            "default": env.description
                        }
                    }
                };
            });
        }
        
        return JSON.stringify(schema, null, 2);
    }
    
    // 生成工作负载YAML
    function generateWorkloadYaml() {
        const formData = getFormData();
        
        // 根据工作负载类型选择模板
        if (formData.workloadType === 'StatefulSet') {
            return generateStatefulSetYaml(formData);
        } else {
            return generateDeploymentYaml(formData);
        }
    }
    
    // 生成Deployment YAML
    function generateDeploymentYaml(formData) {
        // 端口配置
        const portsConfig = formData.service.ports.map(port => 
            `            - name: ${port.name}
              containerPort: ${port.port}
              protocol: TCP`
        ).join('\n');
        
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
  annotations:
    app.kubernetes.io/part-of: ${formData.name}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${formData.name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${formData.name}.labels" . | nindent 8 }}
        {{- include "${formData.name}.selectorLabels" . | nindent 8 }}
      {{- if .Values.networkLimits.enabled }}
      annotations:
        kubernetes.io/egress-bandwidth: {{ .Values.networkLimits.egress | quote }}
        kubernetes.io/ingress-bandwidth: {{ .Values.networkLimits.ingress | quote }}
      {{- end }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
${portsConfig}
          {{- if .Values.env }}
          env:
            {{- if kindIs "map" .Values.env }}
            {{- range $key, $value := .Values.env }}
            - name: {{ $value.name | quote }}
              value: {{ $value.value | quote }}
            {{- end }}
            {{- else if kindIs "array" .Values.env }}
            {{- range .Values.env }}
            - name: {{ .name | quote }}
              value: {{ .value | quote }}
            {{- end }}
            {{- end }}
          {{- end }}
          resources:
            limits:
              cpu: {{ .Values.resources.limits.cpu | quote }}
              memory: {{ .Values.resources.limits.memory | quote }}
            requests:
              cpu: {{ .Values.resources.requests.cpu | quote }}
              memory: {{ .Values.resources.requests.memory | quote }}
          {{- if .Values.persistence.enabled }}
          volumeMounts:
            - name: data
              mountPath: {{ .Values.persistence.path }}
          {{- end }}
      {{- if .Values.persistence.enabled }}
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: {{ include "${formData.name}.fullname" . }}-pvc
      {{- end }}`;
    }
    
    // 生成StatefulSet YAML
    function generateStatefulSetYaml(formData) {
        // 端口配置
        const portsConfig = formData.service.ports.map(port => 
            `            - name: ${port.name}
              containerPort: ${port.port}
              protocol: TCP`
        ).join('\n');
        
        return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
  annotations:
    app.kubernetes.io/part-of: ${formData.name}
spec:
  serviceName: {{ include "${formData.name}.fullname" . }}
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${formData.name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${formData.name}.labels" . | nindent 8 }}
        {{- include "${formData.name}.selectorLabels" . | nindent 8 }}
      {{- if .Values.networkLimits.enabled }}
      annotations:
        kubernetes.io/egress-bandwidth: {{ .Values.networkLimits.egress | quote }}
        kubernetes.io/ingress-bandwidth: {{ .Values.networkLimits.ingress | quote }}
      {{- end }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
${portsConfig}
          {{- if .Values.env }}
          env:
            {{- if kindIs "map" .Values.env }}
            {{- range $key, $value := .Values.env }}
            - name: {{ $value.name | quote }}
              value: {{ $value.value | quote }}
            {{- end }}
            {{- else if kindIs "array" .Values.env }}
            {{- range .Values.env }}
            - name: {{ .name | quote }}
              value: {{ .value | quote }}
            {{- end }}
            {{- end }}
          {{- end }}
          resources:
            limits:
              cpu: {{ .Values.resources.limits.cpu | quote }}
              memory: {{ .Values.resources.limits.memory | quote }}
            requests:
              cpu: {{ .Values.resources.requests.cpu | quote }}
              memory: {{ .Values.resources.requests.memory | quote }}
          {{- if .Values.persistence.enabled }}
          volumeMounts:
            - name: data
              mountPath: {{ .Values.persistence.path }}
          {{- end }}
      {{- if .Values.persistence.enabled }}
      volumeClaimTemplates:
        - metadata:
            name: data
          spec:
            accessModes:
              - {{ .Values.persistence.accessMode }}
            {{- if .Values.persistence.storageClass }}
            storageClassName: {{ .Values.persistence.storageClass }}
            {{- end }}
            resources:
              requests:
                storage: {{ .Values.persistence.size }}
      {{- end }}`;
    }
    
    // 生成service.yaml
    function generateServiceYaml() {
        const formData = getFormData();
        
        return `apiVersion: v1
kind: Service
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    {{- range $name, $port := .Values.service.ports }}
    - port: {{ $port }}
      targetPort: {{ $name }}
      protocol: TCP
      name: {{ $name }}
    {{- end }}
  selector:
    {{- include "${formData.name}.selectorLabels" . | nindent 4 }}`;
    }
    
    // 生成pvc.yaml
    function generatePvcYaml() {
        const formData = getFormData();
        
        return `{{- if .Values.persistence.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ include "${formData.name}.fullname" . }}-pvc
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  accessModes:
    - {{ .Values.persistence.accessMode }}
  resources:
    requests:
      storage: {{ .Values.persistence.size }}
  {{- if .Values.persistence.storageClass }}
  storageClassName: {{ .Values.persistence.storageClass }}
  {{- end }}
{{- end }}`;
    }
    
    // 生成_helpers.tpl
    function generateHelpersTpl() {
        const formData = getFormData();
        
        return `{{/*
Expand the name of the chart.
*/}}
{{- define "${formData.name}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "${formData.name}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${formData.name}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${formData.name}.labels" -}}
helm.sh/chart: {{ include "${formData.name}.chart" . }}
{{ include "${formData.name}.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${formData.name}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${formData.name}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}`;
    }
    
    // 下载所有文件
    function downloadAll() {
        if (!validateForm()) {
            return;
        }
        
        const formData = getFormData();
        const zip = new JSZip();
        
        // 创建目录结构
        const chartDir = zip.folder(formData.name);
        const templatesDir = chartDir.folder('templates');
        
        // 添加文件
        chartDir.file('Chart.yaml', generateChartYaml());
        chartDir.file('values.yaml', generateValuesYaml());
        chartDir.file('values.schema.json', generateValuesSchemaJson());
        
        // 根据工作负载类型创建不同的文件名
        if (formData.workloadType === 'StatefulSet') {
            templatesDir.file('statefulset.yaml', generateWorkloadYaml());
        } else {
            templatesDir.file('deployment.yaml', generateWorkloadYaml());
        }
        
        templatesDir.file('service.yaml', generateServiceYaml());
        
        // 只有在Deployment工作负载时才需要单独的PVC文件
        if (formData.workloadType === 'Deployment' && formData.persistence.enabled) {
            templatesDir.file('pvc.yaml', generatePvcYaml());
        }
        
        templatesDir.file('_helpers.tpl', generateHelpersTpl());
        
        // 生成README.md
        const readmeContent = `# ${formData.name}

${formData.description}

## 工作负载类型

此Helm Chart使用 \`${formData.workloadType}\` 工作负载类型。

${formData.workloadType === 'StatefulSet' ? '- StatefulSet适合有状态应用，提供持久标识和存储' : '- Deployment适合无状态应用，方便快速扩展和更新'}

## 参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| replicaCount | 副本数量 | \`1\` |
| workloadType | 工作负载类型 | \`${formData.workloadType}\` |
| image.repository | 镜像名称 | \`${formData.image.repository}\` |
| image.tag | 镜像标签 | \`${formData.image.tag}\` |
| image.pullPolicy | 镜像拉取策略 | \`${formData.image.pullPolicy}\` |
| service.type | 服务类型 | \`${formData.service.type}\` |
| persistence.enabled | 是否启用持久化存储 | \`${formData.persistence.enabled}\` |
| persistence.size | 存储大小 | \`${formData.persistence.size}\` |

## 安装方法

\`\`\`bash
helm install my-release ./${formData.name}
\`\`\``;

        chartDir.file('README.md', readmeContent);
        
        // 生成并下载zip文件
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${formData.name}-chart.zip`;
            link.click();
            URL.revokeObjectURL(url);
            
            alert('Helm Chart文件已成功生成并下载');
        });
    }
    
    // 重置表单
    function resetForm() {
        if (!confirm('确定要重置所有表单内容吗？这将丢失所有已填写的数据。')) {
            return;
        }
        
        // 重置基本信息
        document.getElementById('name').value = 'myapp';
        document.getElementById('version').value = 'v1.0.0';
        document.getElementById('appVersion').value = '1.0.0';
        document.getElementById('description').value = '';
        document.getElementById('icon').value = 'https://example.com/icon.png';
        document.getElementById('category').value = '应用工具';
        document.getElementById('customCategory').value = '';
        document.getElementById('customCategory').style.display = 'none';
        document.getElementById('maintainerName').value = '';
        document.getElementById('maintainerEmail').value = '';
        
        // 重置工作负载类型
        document.getElementById('workloadType').value = 'Deployment';
        
        // 重置容器镜像
        document.getElementById('imageRegistry').value = 'docker.io';
        document.getElementById('repository').value = '';
        document.getElementById('tag').value = 'latest';
        document.getElementById('pullPolicy').value = 'IfNotPresent';
        
        // 重置服务设置
        document.getElementById('serviceType').value = 'ClusterIP';
        
        // 移除所有额外的端口行
        const portRows = document.querySelectorAll('.service-port-row');
        for (let i = 1; i < portRows.length; i++) {
            portRows[i].remove();
        }
        
        // 重置第一个端口行
        if (portRows.length > 0) {
            const firstPortRow = portRows[0];
            firstPortRow.querySelector('.port-name-input').value = 'http';
            firstPortRow.querySelector('.port-number-input').value = '80';
        }
        
        // 重置网络限制
        document.getElementById('networkEnabled').checked = true;
        document.getElementById('egress').value = '1M';
        document.getElementById('ingress').value = '1M';
        
        // 重置资源限制
        document.getElementById('limitsCpu').value = '200m';
        document.getElementById('limitsMemory').value = '256Mi';
        document.getElementById('requestsCpu').value = '100m';
        document.getElementById('requestsMemory').value = '128Mi';
        
        // 重置持久化存储
        document.getElementById('persistenceEnabled').checked = true;
        document.getElementById('path').value = '/data';
        document.getElementById('accessMode').value = 'ReadWriteOnce';
        document.getElementById('size').value = '1Gi';
        document.getElementById('storageClass').value = 'local';
        
        // 移除所有额外的环境变量行
        const envRows = document.querySelectorAll('.env-row');
        for (let i = 1; i < envRows.length; i++) {
            envRows[i].remove();
        }
        
        // 重置第一个环境变量行
        if (envRows.length > 0) {
            const firstEnvRow = envRows[0];
            firstEnvRow.querySelector('.env-title-input').value = '应用模式';
            firstEnvRow.querySelector('.env-desc-input').value = '应用运行的模式';
            firstEnvRow.querySelector('.env-name-input').value = 'APP_MODE';
            firstEnvRow.querySelector('.env-value-input').value = 'production';
        }
        
        alert('表单已重置');
    }
    
    // 初始化预览
    updatePreviews();
}); 