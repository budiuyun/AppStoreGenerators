// 获取Vue和naive-ui组件
const { createApp, ref, reactive, computed, h } = Vue;
const {
    NConfigProvider, NMessageProvider, NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter,
    NButton, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NCard, NTabs, NTabPane,
    NDynamicTags, NDynamicInput, NCollapse, NCollapseItem, NSpace, NAlert, NCode, NIcon, NDivider,
    darkTheme, useMessage, useThemeVars,
} = naive;

// 初始化应用
const app = createApp({
    setup() {
        // 消息提示
        const message = useMessage();
        
        // 主题设置
        const darkMode = ref(localStorage.getItem('darkMode') === 'true');
        const theme = computed(() => darkMode.value ? darkTheme : null);
        const themeVars = useThemeVars();
        
        // 图标组件
        const MoonOutline = VIconsIonicons5.MoonOutline;
        const SunnyOutline = VIconsIonicons5.SunnyOutline;
        const DownloadOutline = VIconsIonicons5.DownloadOutline;
        const RefreshOutline = VIconsIonicons5.RefreshOutline;
        
        // 表单数据初始化
        const formData = reactive({
            name: 'myapp',
            version: 'v1.0.0',
            appVersion: '1.0.0',
            description: '我的应用程序描述',
            icon: 'https://example.com/icon.png',
            keywords: [],
            sources: [],
            category: '应用工具',
            maintainer: {
                name: 'maintainer',
                email: 'maintainer@example.com'
            },
            
            // 添加工作负载类型
            workloadType: 'Deployment',
            
            image: {
                imageRegistry: 'docker.io',
                repository: 'myapp',
                tag: 'latest',
                pullPolicy: 'IfNotPresent'
            },
            
            service: {
                type: 'ClusterIP',
                port: 80
            },
            
            networkLimits: {
                enabled: true,
                egress: '1M',
                ingress: '1M'
            },
            
            resources: {
                limits: {
                    cpu: '200m',
                    memory: '256Mi'
                },
                requests: {
                    cpu: '100m',
                    memory: '128Mi'
                }
            },
            
            persistence: {
                enabled: true,
                path: '/data',
                accessMode: 'ReadWriteOnce',
                size: '1Gi',
                storageClass: 'local'
            }
        });
        
        // 环境变量
        const envVars = ref([
            { name: 'APP_MODE', value: 'production' }
        ]);
        
        // 选项配置
        const categoryOptions = [
            { label: '应用工具', value: '应用工具' },
            { label: '数据库', value: '数据库' },
            { label: '开发工具', value: '开发工具' },
            { label: '监控工具', value: '监控工具' },
            { label: '网络工具', value: '网络工具' },
            { label: '安全工具', value: '安全工具' },
            { label: '存储工具', value: '存储工具' },
            { label: '其他', value: '其他' }
        ];
        
        // 工作负载类型选项
        const workloadTypeOptions = [
            { label: 'Deployment (无状态)', value: 'Deployment' },
            { label: 'StatefulSet (有状态)', value: 'StatefulSet' }
        ];
        
        const pullPolicyOptions = [
            { label: 'IfNotPresent (推荐)', value: 'IfNotPresent' },
            { label: 'Always', value: 'Always' },
            { label: 'Never', value: 'Never' }
        ];
        
        const serviceTypeOptions = [
            { label: 'ClusterIP (推荐)', value: 'ClusterIP' },
            { label: 'NodePort', value: 'NodePort' },
            { label: 'LoadBalancer', value: 'LoadBalancer' }
        ];
        
        const accessModeOptions = [
            { label: 'ReadWriteOnce (单节点读写)', value: 'ReadWriteOnce' },
            { label: 'ReadOnlyMany (多节点只读)', value: 'ReadOnlyMany' },
            { label: 'ReadWriteMany (多节点读写)', value: 'ReadWriteMany' }
        ];
        
        // 生成Chart.yaml
        const generateChartYaml = () => {
            const chartData = {
                apiVersion: 'v2',
                name: formData.name,
                version: formData.version,
                appVersion: formData.appVersion,
                description: formData.description,
                icon: formData.icon
            };
            
            // 只有当有数据时才添加到对象中
            if (formData.keywords && formData.keywords.length > 0) {
                chartData.keywords = formData.keywords;
            }
            
            if (formData.sources && formData.sources.length > 0) {
                chartData.sources = formData.sources;
            }
            
            // 添加维护者信息
            chartData.maintainers = [{
                name: formData.maintainer.name,
                email: formData.maintainer.email
            }];
            
            // 添加分类注解
            chartData.annotations = {
                'budiu/app-category-zh': formData.category
            };
            
            return jsyaml.dump(chartData);
        };
        
        // 生成values.yaml
        const generateValuesYaml = () => {
            const values = {
                replicaCount: 1,
                workloadType: formData.workloadType,
                image: formData.image,
                service: formData.service,
                networkLimits: formData.networkLimits,
                resources: formData.resources,
                persistence: formData.persistence,
            };
            
            // 处理环境变量 - 这里一定要使用env1, env2这种格式
            if (envVars.value.length > 0) {
                values.env = {};
                envVars.value.forEach((env, index) => {
                    // 确保使用env1, env2, env3...的格式
                    values.env[`env${index + 1}`] = {
                        name: env.name,
                        value: env.value
                    };
                });
            }
            
            return jsyaml.dump(values);
        };
        
        // 生成工作负载YAML (之前的deployment.yaml)
        const generateWorkloadYaml = () => {
            // 根据工作负载类型生成不同的YAML
            if (formData.workloadType === 'StatefulSet') {
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
            } else {
                // 默认Deployment
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
        };
        
        // 生成service.yaml
        const generateServiceYaml = () => {
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
        };
        
        // 生成pvc.yaml
        const generatePvcYaml = () => {
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
        };
        
        // 生成_helpers.tpl
        const generateHelpersTpl = () => {
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
        };
        
        // 切换主题
        const toggleTheme = (value) => {
            darkMode.value = value;
            localStorage.setItem('darkMode', value);
        };
        
        // 下载所有文件
        const downloadAll = () => {
            // 校验必填字段
            if (!formData.name || !formData.version || !formData.appVersion || 
                !formData.description || !formData.icon || !formData.category ||
                !formData.maintainer.name || !formData.maintainer.email ||
                !formData.image.repository) {
                message.error('请填写所有必填字段');
                return;
            }
            
            // 使用JSZip下载文件包
            downloadAllWithJSZip();
        };
        
        // 使用JSZip下载文件
        const downloadAllWithJSZip = () => {
            const zip = new JSZip();
            
            // 创建目录结构
            const chartDir = zip.folder(formData.name);
            const templatesDir = chartDir.folder('templates');
            
            // 添加文件
            chartDir.file('Chart.yaml', generateChartYaml());
            chartDir.file('values.yaml', generateValuesYaml());
            
            // 根据工作负载类型添加相应文件
            if (formData.workloadType === 'StatefulSet') {
                templatesDir.file('statefulset.yaml', generateWorkloadYaml());
            } else {
                templatesDir.file('deployment.yaml', generateWorkloadYaml());
            }
            
            templatesDir.file('service.yaml', generateServiceYaml());
            
            // 只有在有状态集需要单独的PVC文件（非volumeClaimTemplates方式时）
            if (formData.workloadType === 'Deployment' && formData.persistence.enabled) {
                templatesDir.file('pvc.yaml', generatePvcYaml());
            }
            
            templatesDir.file('_helpers.tpl', generateHelpersTpl());
            
            // 生成README.md
            const readme = `# ${formData.name}

${formData.description}

## 工作负载类型

此Helm Chart使用 \`${formData.workloadType}\` 工作负载类型

## 参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| replicaCount | 副本数量 | \`1\` |
| workloadType | 工作负载类型 | \`${formData.workloadType}\` |
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
                message.success('Helm Chart文件已成功生成并下载');
            });
        };
        
        // 重置表单
        const resetForm = () => {
            formData.name = 'myapp';
            formData.version = 'v1.0.0';
            formData.appVersion = '1.0.0';
            formData.description = '我的应用程序描述';
            formData.icon = 'https://example.com/icon.png';
            formData.keywords = [];
            formData.sources = [];
            formData.category = '应用工具';
            formData.maintainer.name = 'maintainer';
            formData.maintainer.email = 'maintainer@example.com';
            
            // 重置工作负载类型
            formData.workloadType = 'Deployment';
            
            formData.image.imageRegistry = 'docker.io';
            formData.image.repository = 'myapp';
            formData.image.tag = 'latest';
            formData.image.pullPolicy = 'IfNotPresent';
            
            formData.service.type = 'ClusterIP';
            formData.service.port = 80;
            
            formData.networkLimits.enabled = true;
            formData.networkLimits.egress = '1M';
            formData.networkLimits.ingress = '1M';
            
            formData.resources.limits.cpu = '200m';
            formData.resources.limits.memory = '256Mi';
            formData.resources.requests.cpu = '100m';
            formData.resources.requests.memory = '128Mi';
            
            formData.persistence.enabled = true;
            formData.persistence.path = '/data';
            formData.persistence.accessMode = 'ReadWriteOnce';
            formData.persistence.size = '1Gi';
            formData.persistence.storageClass = 'local';
            
            envVars.value = [{ name: 'APP_MODE', value: 'production' }];
            
            message.success('表单已重置');
        };
        
        return {
            darkMode,
            theme,
            MoonOutline,
            SunnyOutline,
            DownloadOutline,
            RefreshOutline,
            formData,
            envVars,
            categoryOptions,
            workloadTypeOptions,
            pullPolicyOptions,
            serviceTypeOptions,
            accessModeOptions,
            generateChartYaml,
            generateValuesYaml,
            generateWorkloadYaml,
            generateServiceYaml,
            generatePvcYaml,
            generateHelpersTpl,
            toggleTheme,
            downloadAll,
            resetForm
        };
    }
});

// 挂载Vue应用
app.mount('#app'); 