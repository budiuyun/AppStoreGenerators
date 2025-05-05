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
    
    // 添加环境变量
    const addEnvBtn = document.getElementById('add-env');
    const envContainer = document.getElementById('env-container');
    
    addEnvBtn.addEventListener('click', () => {
        const envRow = document.createElement('div');
        envRow.className = 'env-row';
        
        envRow.innerHTML = `
            <input type="text" class="env-name" placeholder="环境变量名称">
            <input type="text" class="env-value" placeholder="环境变量值">
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
            btn.parentElement.remove();
        });
    });
    
    // 下载按钮
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', downloadAll);
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', resetForm);
    
    // 更新预览内容
    function updatePreviews() {
        document.getElementById('preview-chart').textContent = generateChartYaml();
        document.getElementById('preview-values').textContent = generateValuesYaml();
        document.getElementById('preview-deployment').textContent = generateDeploymentYaml();
        document.getElementById('preview-service').textContent = generateServiceYaml();
        document.getElementById('preview-pvc').textContent = generatePvcYaml();
        document.getElementById('preview-helpers').textContent = generateHelpersTpl();
    }
    
    // 获取表单数据
    function getFormData() {
        const networkEnabled = document.getElementById('networkEnabled').checked;
        const persistenceEnabled = document.getElementById('persistenceEnabled').checked;
        
        // 收集环境变量
        const envVars = [];
        document.querySelectorAll('.env-row').forEach(row => {
            const name = row.querySelector('.env-name').value.trim();
            const value = row.querySelector('.env-value').value.trim();
            if (name) {
                envVars.push({ name, value });
            }
        });
        
        return {
            name: document.getElementById('name').value.trim(),
            version: document.getElementById('version').value.trim(),
            appVersion: document.getElementById('appVersion').value.trim(),
            description: document.getElementById('description').value.trim(),
            icon: document.getElementById('icon').value.trim(),
            category: document.getElementById('category').value,
            maintainer: {
                name: document.getElementById('maintainerName').value.trim(),
                email: document.getElementById('maintainerEmail').value.trim()
            },
            image: {
                imageRegistry: document.getElementById('imageRegistry').value.trim(),
                repository: document.getElementById('repository').value.trim(),
                tag: document.getElementById('tag').value.trim(),
                pullPolicy: document.getElementById('pullPolicy').value
            },
            service: {
                type: document.getElementById('serviceType').value,
                port: parseInt(document.getElementById('servicePort').value)
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
            image: formData.image,
            service: formData.service,
            networkLimits: formData.networkLimits,
            resources: formData.resources,
            persistence: formData.persistence
        };
        
        // 处理环境变量 - 这里一定要使用env1, env2这种格式
        if (formData.envVars.length > 0) {
            values.env = {};
            formData.envVars.forEach((env, index) => {
                // 确保使用env1, env2, env3...的格式
                values.env[`env${index + 1}`] = {
                    name: env.name,
                    value: env.value
                };
            });
        }
        
        return jsyaml.dump(values);
    }
    
    // 生成deployment.yaml
    function generateDeploymentYaml() {
        const formData = getFormData();
        
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
            - name: http
              containerPort: ${formData.service.port}
              protocol: TCP
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
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
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
        
        // 创建一个JSZip实例
        const zip = new JSZip();
        
        // 创建目录结构
        const chartDir = zip.folder(formData.name);
        const templatesDir = chartDir.folder('templates');
        
        // 添加文件
        chartDir.file('Chart.yaml', generateChartYaml());
        chartDir.file('values.yaml', generateValuesYaml());
        templatesDir.file('deployment.yaml', generateDeploymentYaml());
        templatesDir.file('service.yaml', generateServiceYaml());
        templatesDir.file('pvc.yaml', generatePvcYaml());
        templatesDir.file('_helpers.tpl', generateHelpersTpl());
        
        // 生成README.md
        const readme = `# ${formData.name}

${formData.description}

## 参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| replicaCount | 副本数量 | \`1\` |
| image.repository | 镜像名称 | \`${formData.image.repository}\` |
| image.tag | 镜像标签 | \`${formData.image.tag}\` |
| image.pullPolicy | 镜像拉取策略 | \`${formData.image.pullPolicy}\` |
| service.type | 服务类型 | \`${formData.service.type}\` |
| service.port | 服务端口 | \`${formData.service.port}\` |
| resources | 资源限制/请求 | 参见values.yaml |
| persistence.enabled | 是否启用持久化存储 | \`${formData.persistence.enabled}\` |
| persistence.size | 存储大小 | \`${formData.persistence.size}\` |

## 安装方法

\`\`\`bash
helm install my-release ./charts/${formData.name}
\`\`\`
`;
        chartDir.file('README.md', readme);
        
        // 生成并下载zip文件
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${formData.name}-chart.zip`;
            link.click();
            URL.revokeObjectURL(url);
            
            // 显示成功消息
            alert('Helm Chart文件已成功生成并下载');
        });
    }
    
    // 重置表单
    function resetForm() {
        // 基本信息
        document.getElementById('name').value = '';
        document.getElementById('version').value = 'v1.0.0';
        document.getElementById('appVersion').value = '1.0.0';
        document.getElementById('description').value = '';
        document.getElementById('icon').value = '';
        document.getElementById('category').value = '应用工具';
        document.getElementById('maintainerName').value = '';
        document.getElementById('maintainerEmail').value = '';
        
        // 容器镜像
        document.getElementById('imageRegistry').value = 'docker.io';
        document.getElementById('repository').value = '';
        document.getElementById('tag').value = 'latest';
        document.getElementById('pullPolicy').value = 'IfNotPresent';
        
        // 服务配置
        document.getElementById('serviceType').value = 'ClusterIP';
        document.getElementById('servicePort').value = '80';
        
        // 网络带宽限制
        document.getElementById('networkEnabled').checked = true;
        document.getElementById('egress').value = '1M';
        document.getElementById('ingress').value = '1M';
        
        // 资源配置
        document.getElementById('limitsCpu').value = '200m';
        document.getElementById('limitsMemory').value = '256Mi';
        document.getElementById('requestsCpu').value = '100m';
        document.getElementById('requestsMemory').value = '128Mi';
        
        // 持久化存储
        document.getElementById('persistenceEnabled').checked = true;
        document.getElementById('path').value = '/data';
        document.getElementById('accessMode').value = 'ReadWriteOnce';
        document.getElementById('size').value = '1Gi';
        document.getElementById('storageClass').value = 'local';
        
        // 环境变量
        const envContainer = document.getElementById('env-container');
        envContainer.innerHTML = `
            <div class="env-row">
                <input type="text" class="env-name" placeholder="环境变量名称" value="APP_MODE">
                <input type="text" class="env-value" placeholder="环境变量值" value="production">
                <button type="button" class="remove-env">删除</button>
            </div>
        `;
        
        // 重新绑定删除按钮事件
        document.querySelectorAll('.remove-env').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.parentElement.remove();
            });
        });
        
        alert('表单已重置');
    }
    
    // 初始化预览
    updatePreviews();
}); 