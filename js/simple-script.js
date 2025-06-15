document.addEventListener('DOMContentLoaded', function () {
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

    // JSON标签页功能
    const applyJsonBtn = document.getElementById('apply-json-btn');
    const loadExampleBtn = document.getElementById('load-example-btn');
    const clearJsonBtn = document.getElementById('clear-json-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const jsonInput = document.getElementById('json-input');

    // 应用JSON按钮
    applyJsonBtn.addEventListener('click', () => {
        try {
            const jsonText = jsonInput.value.trim();
            if (!jsonText) {
                alert('请先输入或粘贴JSON配置');
                return;
            }

            const jsonData = JSON.parse(jsonText);
            console.log("解析的JSON数据:", jsonData);

            // 检查持久化挂载路径
            if (jsonData.persistence && jsonData.persistence.mounts) {
                console.log("准备填充挂载路径:", jsonData.persistence.mounts);
            }

            fillFormFromJson(jsonData);

            // 再次检查挂载路径是否正确填充
            const mountRows = document.querySelectorAll('.persistence-mount-row');
            console.log("填充后的挂载路径数量:", mountRows.length);
            mountRows.forEach((row, index) => {
                const pathInput = row.querySelector('.mount-path-input');
                console.log(`挂载路径 ${index + 1}:`, pathInput.value);
            });

            // 切换到基本信息标签页
            document.querySelector('.tab-btn[data-tab="basic"]').click();

            alert('JSON配置已成功应用到表单，请检查所有字段是否正确填充');

            // 更新预览
            updatePreviews();
        } catch (error) {
            alert('JSON解析失败: ' + error.message);
            console.error('JSON解析失败:', error);
        }
    });

    // 加载示例按钮
    loadExampleBtn.addEventListener('click', () => {
        // Nginx示例配置
        const exampleConfig = {
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
                    "http": {
                        "port": 80,
                        "protocol": "TCP"
                    },
                    "https": {
                        "port": 443,
                        "protocol": "TCP"
                    },
                    "dns": {
                        "port": 53,
                        "protocol": "UDP"
                    }
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
                "size": "1Gi",
                "accessMode": "ReadWriteOnce",
                "storageClass": "local",
                "mounts": [
                    "/usr/share/nginx/html",
                    "/etc/nginx/conf.d"
                ]
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
        };

        jsonInput.value = JSON.stringify(exampleConfig, null, 2);

        // 自动应用示例配置到表单
        console.log("应用示例配置，挂载路径:", exampleConfig.persistence.mounts);
        fillFormFromJson(exampleConfig);

        // 检查挂载路径是否正确填充
        const mountRows = document.querySelectorAll('.persistence-mount-row');
        console.log("挂载路径行数:", mountRows.length);

        // 如果挂载路径没有正确填充，手动填充
        if (mountRows.length !== exampleConfig.persistence.mounts.length) {
            console.log("需要手动填充挂载路径");

            // 清除现有挂载点
            const mountContainer = document.getElementById('persistence-mounts-container');
            mountContainer.innerHTML = '';

            // 手动添加每个路径
            exampleConfig.persistence.mounts.forEach(path => {
                addMountRow(path);
            });
        }

        alert('示例配置已应用到表单');
    });

    // 清空按钮
    clearJsonBtn.addEventListener('click', () => {
        if (confirm('确定要清空JSON内容吗？')) {
            jsonInput.value = '';
        }
    });

    // 复制JSON按钮
    copyJsonBtn.addEventListener('click', () => {
        const jsonText = jsonInput.value.trim();
        if (!jsonText) {
            alert('没有可复制的JSON内容');
            return;
        }

        // 复制到剪贴板
        navigator.clipboard.writeText(jsonText)
            .then(() => {
                alert('JSON已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);

                // 备用复制方法
                jsonInput.select();
                document.execCommand('copy');
                alert('JSON已复制到剪贴板');
            });
    });

    // 从JSON填充表单
    function fillFormFromJson(data) {
        // 处理JSON键名大小写不敏感的问题
        const normalizeData = (obj) => {
            if (obj === null || typeof obj !== 'object') return obj;

            const normalized = {};
            Object.keys(obj).forEach(key => {
                const lowerKey = key.toLowerCase();
                const value = obj[key];

                if (Array.isArray(value)) {
                    // 特殊处理挂载路径数组
                    if (lowerKey === 'mounts') {
                        console.log("正在处理mounts数组:", value);
                        normalized[lowerKey] = value; // 保持原样，不做转换
                    } else {
                        normalized[lowerKey] = value.map(item =>
                            typeof item === 'object' && item !== null ? normalizeData(item) : item
                        );
                    }
                } else if (typeof value === 'object' && value !== null) {
                    normalized[lowerKey] = normalizeData(value);
                } else {
                    normalized[lowerKey] = value;
                }
            });

            return normalized;
        };

        // 规范化数据，处理大小写不敏感
        const normalizedData = normalizeData(data);

        // 基本信息
        if (normalizedData.name) document.getElementById('name').value = normalizedData.name;
        if (normalizedData.version) document.getElementById('version').value = normalizedData.version;
        if (normalizedData.appversion) document.getElementById('appVersion').value = normalizedData.appversion;
        if (normalizedData.description) document.getElementById('description').value = normalizedData.description;
        if (normalizedData.icon) document.getElementById('icon').value = normalizedData.icon;

        // 分类
        if (normalizedData.category) {
            const categorySelect = document.getElementById('category');
            const customCategoryInput = document.getElementById('customCategory');

            // 检查是否是预定义分类
            const categories = Array.from(categorySelect.options).map(opt => opt.value);
            if (categories.includes(normalizedData.category) && normalizedData.category !== 'custom') {
                categorySelect.value = normalizedData.category;
                customCategoryInput.style.display = 'none';
            } else {
                categorySelect.value = 'custom';
                customCategoryInput.style.display = 'block';
                customCategoryInput.value = normalizedData.category;
            }
        }

        // 维护者信息
        if (normalizedData.maintainer) {
            if (normalizedData.maintainer.name) document.getElementById('maintainerName').value = normalizedData.maintainer.name;
            if (normalizedData.maintainer.email) document.getElementById('maintainerEmail').value = normalizedData.maintainer.email;
        }

        // 工作负载类型 - 不区分大小写
        if (normalizedData.workloadtype) {
            const workloadType = normalizedData.workloadtype.toLowerCase();
            if (workloadType === 'deployment' || workloadType === 'statefulset') {
                document.getElementById('workloadType').value = workloadType.charAt(0).toUpperCase() + workloadType.slice(1);
            }
        } else if (normalizedData.workloadType) {
            // 处理大小写匹配
            const workloadType = normalizedData.workloadType;
            if (workloadType === 'Deployment' || workloadType === 'StatefulSet') {
                document.getElementById('workloadType').value = workloadType;
            }
        }

        // 镜像信息
        if (normalizedData.image) {
            if (normalizedData.image.imageregistry) document.getElementById('imageRegistry').value = normalizedData.image.imageregistry;
            if (normalizedData.image.repository) document.getElementById('repository').value = normalizedData.image.repository;
            if (normalizedData.image.tag) document.getElementById('tag').value = normalizedData.image.tag;
            // pullPolicy是固定值，不需要从JSON中读取
        }

        // 服务配置
        if (normalizedData.service) {
            // serviceType是固定值，不需要从JSON中读取

            // 清除现有端口
            const portContainer = document.getElementById('service-ports-container');
            portContainer.innerHTML = '';

            // 添加端口
            if (normalizedData.service.ports && Array.isArray(normalizedData.service.ports)) {
                normalizedData.service.ports.forEach(port => {
                    addPortRow(port.name, port.port, port.protocol);
                });
            } else if (normalizedData.service.ports && typeof normalizedData.service.ports === 'object') {
                // 处理对象格式的端口
                Object.entries(normalizedData.service.ports).forEach(([name, portConfig]) => {
                    if (typeof portConfig === 'object' && portConfig !== null) {
                        // 如果是对象，获取port和protocol属性
                        const port = portConfig.port !== undefined ? portConfig.port : portConfig;
                        const protocol = portConfig.protocol || 'TCP';
                        addPortRow(name, port, protocol);
                    } else {
                        // 如果是数字，只有端口号
                        addPortRow(name, portConfig, 'TCP'); // 默认使用TCP协议
                    }
                });
            }

            // 确保至少有一个端口
            if (document.querySelectorAll('.service-port-row').length === 0) {
                addPortRow('http', 80, 'TCP');
            }
        }

        // 网络限制
        if (normalizedData.networklimits) {
            // networkEnabled是固定值，不需要从JSON中读取
            if (normalizedData.networklimits.egress) document.getElementById('egress').value = normalizedData.networklimits.egress;
            if (normalizedData.networklimits.ingress) document.getElementById('ingress').value = normalizedData.networklimits.ingress;
        }

        // 资源限制
        if (normalizedData.resources) {
            if (normalizedData.resources.limits) {
                if (normalizedData.resources.limits.cpu) document.getElementById('limitsCpu').value = normalizedData.resources.limits.cpu;
                if (normalizedData.resources.limits.memory) document.getElementById('limitsMemory').value = normalizedData.resources.limits.memory;
            }
            if (normalizedData.resources.requests) {
                if (normalizedData.resources.requests.cpu) document.getElementById('requestsCpu').value = normalizedData.resources.requests.cpu;
                if (normalizedData.resources.requests.memory) document.getElementById('requestsMemory').value = normalizedData.resources.requests.memory;
            }
        }

        // 持久化存储
        if (normalizedData.persistence) {
            if (normalizedData.persistence.enabled !== undefined) {
                document.getElementById('persistenceEnabled').checked = normalizedData.persistence.enabled;
            }

            // 显示/隐藏持久化设置
            document.querySelector('.persistence-settings').style.display =
                document.getElementById('persistenceEnabled').checked ? 'block' : 'none';

            // 设置持久卷全局属性
            if (normalizedData.persistence.size) document.getElementById('persistenceSize').value = normalizedData.persistence.size;
            if (normalizedData.persistence.accessmode) document.getElementById('persistenceAccessMode').value = normalizedData.persistence.accessmode;
            if (normalizedData.persistence.storageclass) document.getElementById('persistenceStorageClass').value = normalizedData.persistence.storageclass;
            // 添加对大小写的处理
            if (normalizedData.persistence.accessMode) document.getElementById('persistenceAccessMode').value = normalizedData.persistence.accessMode;
            if (normalizedData.persistence.storageClass) document.getElementById('persistenceStorageClass').value = normalizedData.persistence.storageClass;

            // 处理挂载路径列表
            const mountContainer = document.getElementById('persistence-mounts-container');
            mountContainer.innerHTML = '';

            if (normalizedData.persistence.mounts) {
                console.log("找到挂载路径配置:", normalizedData.persistence.mounts);
                // 检查mounts字段的类型并适当处理
                if (Array.isArray(normalizedData.persistence.mounts)) {
                    // 如果是数组，遍历处理每个元素
                    normalizedData.persistence.mounts.forEach(mount => {
                        console.log("处理挂载点:", mount);
                        if (typeof mount === 'string') {
                            // 如果是字符串数组，直接作为路径添加
                            console.log("添加字符串路径:", mount);
                            addMountRow(mount);
                        } else if (typeof mount === 'object' && mount !== null) {
                            // 如果是对象数组，检查path字段
                            if (mount.path) {
                                console.log("添加对象路径:", mount.path);
                                addMountRow(mount.path);
                            }
                        }
                    });
                } else if (typeof normalizedData.persistence.mounts === 'object') {
                    // 如果mounts是一个对象，尝试提取其中的路径
                    Object.values(normalizedData.persistence.mounts).forEach(value => {
                        if (typeof value === 'string') {
                            addMountRow(value);
                        } else if (typeof value === 'object' && value !== null && value.path) {
                            addMountRow(value.path);
                        }
                    });
                }
            } else if (normalizedData.persistence.path) {
                // 旧版格式兼容，将单个挂载点转换为多挂载点
                addMountRow(normalizedData.persistence.path);
            }

            // 确保至少有一个挂载目录行
            if (document.querySelectorAll('.persistence-mount-row').length === 0) {
                addMountRow('/data');
            }
        }

        // 环境变量
        if (normalizedData.envvars && Array.isArray(normalizedData.envvars)) {
            // 清除现有环境变量
            const envContainer = document.getElementById('env-container');
            envContainer.innerHTML = '';

            // 添加环境变量
            normalizedData.envvars.forEach(env => {
                addEnvRow(env.title, env.description, env.name, env.value);
            });

            // 确保至少有一个环境变量行
            if (document.querySelectorAll('.env-row').length === 0) {
                addEnvRow('应用模式', '应用运行的模式', 'APP_MODE', 'production');
            }
        } else if (normalizedData.env) {
            // 处理env对象格式
            const envContainer = document.getElementById('env-container');
            envContainer.innerHTML = '';

            Object.values(normalizedData.env).forEach(env => {
                addEnvRow(env.title, env.description, env.name, env.value);
            });

            // 确保至少有一个环境变量行
            if (document.querySelectorAll('.env-row').length === 0) {
                addEnvRow('应用模式', '应用运行的模式', 'APP_MODE', 'production');
            }
        }
    }

    // 辅助函数：添加端口行
    function addPortRow(name, port, protocol) {
        const portContainer = document.getElementById('service-ports-container');
        const portRow = document.createElement('div');
        portRow.className = 'service-port-row';

        // 设置默认协议为TCP
        protocol = protocol || 'TCP';

        portRow.innerHTML = `
            <div class="form-group port-name">
                <label>端口名称</label>
                <input type="text" class="port-name-input" placeholder="例如：http" value="${name || ''}">
            </div>
            <div class="form-group port-number">
                <label>端口号</label>
                <input type="number" class="port-number-input" min="1" max="65535" value="${port || 80}">
            </div>
            <div class="form-group port-protocol">
                <label>协议</label>
                <select class="port-protocol-select">
                    <option value="TCP" ${protocol === 'TCP' ? 'selected' : ''}>TCP</option>
                    <option value="UDP" ${protocol === 'UDP' ? 'selected' : ''}>UDP</option>
                </select>
            </div>
            <button type="button" class="remove-port">删除</button>
        `;

        portContainer.appendChild(portRow);

        // 添加删除端口的事件监听
        const removeBtn = portRow.querySelector('.remove-port');
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.service-port-row').length <= 1) {
                alert('至少需要一个服务端口！');
                return;
            }
            portRow.remove();
        });
    }

    // 辅助函数：添加环境变量行
    function addEnvRow(title, description, name, value) {
        const envContainer = document.getElementById('env-container');
        const envRow = document.createElement('div');
        envRow.className = 'env-row';

        envRow.innerHTML = `
            <div class="form-group env-title">
                <label>环境变量中文名称</label>
                <input type="text" class="env-title-input" placeholder="例如：数据库名" value="${title || ''}">
            </div>
            <div class="form-group env-desc">
                <label>环境变量描述</label>
                <input type="text" class="env-desc-input" placeholder="例如：MySQL数据库名称" value="${description || ''}">
            </div>
            <div class="form-group env-name">
                <label>变量名称</label>
                <input type="text" class="env-name-input" placeholder="例如：MYSQL_DATABASE" value="${name || ''}">
            </div>
            <div class="form-group env-value">
                <label>变量值</label>
                <input type="text" class="env-value-input" placeholder="环境变量值" value="${value || ''}">
            </div>
            <button type="button" class="remove-env">删除</button>
        `;

        envContainer.appendChild(envRow);

        // 添加删除环境变量的事件监听
        const removeBtn = envRow.querySelector('.remove-env');
        removeBtn.addEventListener('click', () => {
            envRow.remove();
        });
    }

    // 辅助函数：添加挂载目录行
    function addMountRow(path) {
        console.log("调用addMountRow添加路径:", path);
        const mountContainer = document.getElementById('persistence-mounts-container');
        const mountRow = document.createElement('div');
        mountRow.className = 'persistence-mount-row';

        // 确保path有值，如果没有则使用默认值
        const pathValue = path && typeof path === 'string' ? path : '/data';

        mountRow.innerHTML = `
            <div class="form-group mount-path">
                <label>挂载路径</label>
                <input type="text" class="mount-path-input" placeholder="例如：/data" value="${pathValue}">
            </div>
            <button type="button" class="remove-mount">删除</button>
        `;

        mountContainer.appendChild(mountRow);

        // 添加删除挂载目录的事件监听
        const removeBtn = mountRow.querySelector('.remove-mount');
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.persistence-mount-row').length <= 1) {
                alert('至少需要一个挂载目录！');
                return;
            }
            mountRow.remove();
        });

        // 确认路径已正确设置
        console.log("挂载路径已设置为:", mountRow.querySelector('.mount-path-input').value);
    }

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

    // 添加挂载目录
    const addMountBtn = document.getElementById('add-mount');
    const mountContainer = document.getElementById('persistence-mounts-container');

    addMountBtn.addEventListener('click', () => {
        addMountRow('/data');
    });

    // 初始化删除挂载目录按钮
    document.querySelectorAll('.remove-mount').forEach(btn => {
        btn.addEventListener('click', function () {
            // 如果只有一个挂载目录，不允许删除
            if (document.querySelectorAll('.persistence-mount-row').length <= 1) {
                alert('至少需要一个挂载目录！');
                return;
            }
            this.closest('.persistence-mount-row').remove();
        });
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
            <div class="form-group port-protocol">
                <label>协议</label>
                <select class="port-protocol-select">
                    <option value="TCP" selected>TCP</option>
                    <option value="UDP">UDP</option>
                </select>
            </div>
            <button type="button" class="remove-port">删除</button>
        `;

        portContainer.appendChild(portRow);

        // 添加删除端口的事件监听
        const removeBtn = portRow.querySelector('.remove-port');
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.service-port-row').length <= 1) {
                alert('至少需要一个服务端口！');
                return;
            }
            portRow.remove();
        });
    });

    // 初始化删除端口按钮
    document.querySelectorAll('.remove-port').forEach(btn => {
        btn.addEventListener('click', function () {
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

    // 导出JSON按钮
    const exportJsonBtn = document.getElementById('export-json-btn');
    exportJsonBtn.addEventListener('click', () => {
        if (!validateForm()) {
            return;
        }

        const formData = getFormData();
        const jsonString = JSON.stringify(formData, null, 2);

        // 将JSON填充到JSON标签页的文本框中
        document.getElementById('json-input').value = jsonString;

        // 切换到JSON标签页
        document.querySelector('.tab-btn[data-tab="json"]').click();

        alert('JSON配置已生成，可以复制或编辑');
    });

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
            const protocol = row.querySelector('.port-protocol-select').value;
            if (name && !isNaN(port)) {
                servicePorts.push({ name, port, protocol });
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

        // 收集挂载目录
        const mounts = [];
        document.querySelectorAll('.persistence-mount-row').forEach(row => {
            const path = row.querySelector('.mount-path-input').value.trim();
            if (path) {
                mounts.push(path);
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
                    memory: document.getElementById('limitsMemory').value.trim(),
                    "ephemeral-storage": "10Gi" // 默认添加临时存储限制为10Gi
                },
                requests: {
                    cpu: document.getElementById('requestsCpu').value.trim(),
                    memory: document.getElementById('requestsMemory').value.trim(),
                    "ephemeral-storage": "5Gi" // 默认添加临时存储请求为5Gi
                }
            },
            persistence: {
                enabled: persistenceEnabled,
                size: document.getElementById('persistenceSize').value.trim(),
                accessMode: document.getElementById('persistenceAccessMode').value.trim(),
                storageClass: document.getElementById('persistenceStorageClass').value.trim(),
                mounts: persistenceEnabled ? mounts : []
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

        // 验证持久化存储配置
        if (formData.persistence.enabled) {
            // 验证PVC配置
            const sizePattern = /^[0-9]+(Mi|Gi|Ti)$/;
            if (!formData.persistence.size) {
                alert('请填写存储大小');
                return false;
            }

            if (!sizePattern.test(formData.persistence.size)) {
                alert('存储大小格式不正确，应为数字+Mi/Gi/Ti，例如1Gi');
                return false;
            }

            if (!formData.persistence.accessMode) {
                alert('请选择访问模式');
                return false;
            }

            if (!formData.persistence.storageClass) {
                alert('请填写存储类名称');
                return false;
            }

            if (formData.persistence.mounts.length === 0) {
                alert('请至少添加一个挂载目录');
                return false;
            }

            // 验证每个挂载点
            for (const mount of formData.persistence.mounts) {
                if (!mount) {
                    alert('请填写挂载路径');
                    return false;
                }
            }

            // 检查路径是否重复
            const paths = formData.persistence.mounts.map(m => m);
            const uniquePaths = [...new Set(paths)];
            if (paths.length !== uniquePaths.length) {
                alert('挂载路径不能重复');
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

        // 创建端口对象
        const servicePorts = {};
        formData.service.ports.forEach(port => {
            servicePorts[port.name] = {
                port: port.port,
                protocol: port.protocol
            };
        });

        const values = {
            workloadType: formData.workloadType,
            replicaCount: 1,
            image: {
                imageRegistry: formData.image.imageRegistry,
                repository: formData.image.repository,
                tag: formData.image.tag,
                pullPolicy: formData.image.pullPolicy11
            },
            service: {
                type: formData.service.type,
                ports: servicePorts
            },
            networkLimits: formData.networkLimits,
            resources: {
                limits: {
                    cpu: formData.resources.limits.cpu,
                    memory: formData.resources.limits.memory,
                    "ephemeral-storage": "10Gi" // 默认添加临时存储限制为10Gi
                },
                requests: {
                    cpu: formData.resources.requests.cpu,
                    memory: formData.resources.requests.memory,
                    "ephemeral-storage": "5Gi" // 默认添加临时存储请求为5Gi
                }
            },
            persistence: {
                enabled: formData.persistence.enabled,
                size: formData.persistence.size,
                accessMode: formData.persistence.accessMode,
                storageClass: formData.persistence.storageClass,
                mounts: formData.persistence.mounts
            }
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

        // 添加icon字段
        values.icon = formData.icon;

        return jsyaml.dump(values);
    }

    // 生成values.schema.json
    function generateValuesSchemaJson() {
        const formData = getFormData();

        // 构建schema对象
        const schema = {
            "$schema": "http://json-schema.org/schema#",
            "type": "object",
            "title": `${formData.name} Helm Chart 配置`,
            "required": [
                "workloadType",
                "replicaCount",
                "image",
                "service",
                "networkLimits",
                "resources"
            ],
            "properties": {
                "workloadType": {
                    "type": "string",
                    "title": "工作负载类型",
                    "description": "指定部署为有状态集(StatefulSet)或无状态部署(Deployment)",
                    "enum": ["Deployment", "StatefulSet"],
                    "default": formData.workloadType
                },
                "replicaCount": {
                    "type": "integer",
                    "title": "副本数量",
                    "description": "Deployment的副本数量",
                    "default": 1,
                    "minimum": 1
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
                            "description": "服务暴露的端口配置，键为端口名称，值为端口配置对象",
                            "patternProperties": {
                                "^.*$": {
                                    "type": "object",
                                    "title": "端口配置",
                                    "description": "服务端口配置",
                                    "properties": {
                                        "port": {
                                            "type": "integer",
                                            "title": "端口号",
                                            "description": "服务端口号",
                                            "minimum": 1,
                                            "maximum": 65535
                                        },
                                        "protocol": {
                                            "type": "string",
                                            "title": "协议",
                                            "description": "端口使用的协议",
                                            "enum": ["TCP", "UDP"],
                                            "default": "TCP"
                                        }
                                    },
                                    "required": ["port", "protocol"]
                                }
                            },
                            "additionalProperties": false,
                            "examples": [
                                {
                                    "http": {
                                        "port": 80,
                                        "protocol": "TCP"
                                    },
                                    "https": {
                                        "port": 443,
                                        "protocol": "TCP"
                                    },
                                    "dns": {
                                        "port": 53,
                                        "protocol": "UDP"
                                    }
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
                                    "type": ["string", "null"],
                                    "title": "CPU限制",
                                    "description": "CPU资源限制，可以是m或核心数，留空表示无限制",
                                    "pattern": "^[0-9]+m?$|^$",
                                    "default": "200m"
                                },
                                "memory": {
                                    "type": ["string", "null"],
                                    "title": "内存限制",
                                    "description": "内存资源限制，可以是Mi或Gi，留空表示无限制",
                                    "pattern": "^[0-9]+(Mi|Gi)$|^$",
                                    "default": "256Mi"
                                },
                                "ephemeral-storage": {
                                    "type": ["string", "null"],
                                    "title": "临时存储限制",
                                    "description": "临时存储资源限制，可以是Mi或Gi",
                                    "pattern": "^[0-9]+(Mi|Gi)$|^$",
                                    "default": "10Gi"
                                }
                            }
                        },
                        "requests": {
                            "type": "object",
                            "title": "资源请求",
                            "required": ["cpu", "memory"],
                            "properties": {
                                "cpu": {
                                    "type": ["string", "null"],
                                    "title": "CPU请求",
                                    "description": "CPU资源请求，可以是m或核心数，留空表示无限制",
                                    "pattern": "^[0-9]+m?$|^$",
                                    "default": "100m"
                                },
                                "memory": {
                                    "type": ["string", "null"],
                                    "title": "内存请求",
                                    "description": "内存资源请求，可以是Mi或Gi，留空表示无限制",
                                    "pattern": "^[0-9]+(Mi|Gi)$|^$",
                                    "default": "128Mi"
                                },
                                "ephemeral-storage": {
                                    "type": ["string", "null"],
                                    "title": "临时存储请求",
                                    "description": "临时存储资源请求，可以是Mi或Gi",
                                    "pattern": "^[0-9]+(Mi|Gi)$|^$",
                                    "default": "5Gi"
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
            "required": ["enabled", "size", "accessMode", "storageClass", "mounts"],
            "properties": {
                "enabled": {
                    "type": "boolean",
                    "title": "启用持久化存储",
                    "description": "是否启用持久化存储",
                    "default": true
                },
                "size": {
                    "type": "string",
                    "title": "存储大小",
                    "description": "持久化存储的大小，例如1Gi",
                    "default": "1Gi",
                    "pattern": "^[0-9]+(Mi|Gi|Ti)$"
                },
                "accessMode": {
                    "type": "string",
                    "title": "访问模式",
                    "description": "持久化存储的访问模式",
                    "enum": ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"],
                    "default": "ReadWriteOnce"
                },
                "storageClass": {
                    "type": "string",
                    "title": "存储类名称",
                    "description": "Kubernetes存储类的名称",
                    "default": "local"
                },
                "mounts": {
                    "type": "array",
                    "title": "挂载路径",
                    "description": "将持久卷挂载到容器的路径列表",
                    "items": {
                        "type": "string",
                        "title": "挂载路径",
                        "description": "容器内挂载持久化存储的路径",
                        "default": "/data"
                    }
                }
            }
        };

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
        const volumeMounts = formData.persistence.enabled && formData.persistence.mounts.length > 0
            ? `\n          volumeMounts:
            {{- range $index, $path := .Values.persistence.mounts }}
            - name: data
              mountPath: {{ $path }}
            {{- end }}`
            : '';

        const volumes = formData.persistence.enabled && formData.persistence.mounts.length > 0
            ? `\n      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: {{ include "${formData.name}.fullname" . }}`
            : '';

        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${formData.name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${formData.name}.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          {{- if .Values.service.ports }}
          ports:
            {{- range $name, $portConfig := .Values.service.ports }}
            - name: {{ $name }}
              containerPort: {{ $portConfig.port }}
              protocol: {{ $portConfig.protocol }}
            {{- end }}
          {{- end }}
          {{- if .Values.env }}
          env:
            {{- range $key, $value := .Values.env }}
            - name: {{ $value.name }}
              value: {{ $value.value | quote }}
            {{- end }}
          {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- if and .Values.persistence.enabled .Values.persistence.mounts }}${volumeMounts}
          {{- end }}
      {{- if and .Values.persistence.enabled .Values.persistence.mounts }}${volumes}
      {{- end }}`;
    }

    // 生成StatefulSet YAML
    function generateStatefulSetYaml(formData) {
        const volumeMounts = formData.persistence.enabled && formData.persistence.mounts.length > 0
            ? `\n          volumeMounts:
            {{- range $index, $path := .Values.persistence.mounts }}
            - name: data
              mountPath: {{ $path }}
            {{- end }}`
            : '';

        const volumes = formData.persistence.enabled && formData.persistence.mounts.length > 0
            ? `\n      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: {{ include "${formData.name}.fullname" . }}`
            : '';

        return `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  serviceName: {{ include "${formData.name}.fullname" . }}
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${formData.name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${formData.name}.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          {{- if .Values.service.ports }}
          ports:
            {{- range $name, $portConfig := .Values.service.ports }}
            - name: {{ $name }}
              containerPort: {{ $portConfig.port }}
              protocol: {{ $portConfig.protocol }}
            {{- end }}
          {{- end }}
          {{- if .Values.env }}
          env:
            {{- range $key, $value := .Values.env }}
            - name: {{ $value.name }}
              value: {{ $value.value | quote }}
            {{- end }}
          {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- if and .Values.persistence.enabled .Values.persistence.mounts }}${volumeMounts}
          {{- end }}
      {{- if and .Values.persistence.enabled .Values.persistence.mounts }}${volumes}
      {{- end }}`;
    }

    // 生成service.yaml
    function generateServiceYaml() {
        const formData = getFormData();

        return `apiVersion: v1
kind: Service
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels: {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    {{- range $name, $portConfig := .Values.service.ports }}
    - port: {{ $portConfig.port }}
      targetPort: {{ $portConfig.port }}
      protocol: {{ $portConfig.protocol }}
      name: {{ $name }}
    {{- end }}
  selector: {{- include "${formData.name}.selectorLabels" . | nindent 4 }}`;
    }

    // 生成pvc.yaml
    function generatePvcYaml() {
        const formData = getFormData();

        return `{{- if .Values.persistence.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ include "${formData.name}.fullname" . }}
  labels:
    {{- include "${formData.name}.labels" . | nindent 4 }}
spec:
  accessModes:
    - {{ .Values.persistence.accessMode }}
  resources:
    requests:
      storage: {{ .Values.persistence.size }}
  {{- if .Values.persistence.storageClass }}
  storageClassName: {{ .Values.persistence.storageClass | quote }}
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

        // 无论工作负载类型如何，只要启用了持久化存储，就生成pvc.yaml
        if (formData.persistence.enabled) {
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
${formData.envVars.length > 0 ? '| env | 环境变量配置 | 见下文 |\n' : ''}

${formData.envVars.length > 0 ? `## 环境变量

应用程序支持以下环境变量配置：

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
${formData.envVars.map(env => `| ${env.name} | ${env.description || env.title} | \`${env.value}\` |`).join('\n')}
` : ''}

## 安装方法

\`\`\`bash
helm install my-release ./${formData.name}
\`\`\``;

        chartDir.file('README.md', readmeContent);

        // 生成并下载zip文件
        zip.generateAsync({ type: 'blob' }).then(function (content) {
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
        document.getElementById('persistenceSize').value = '1Gi';
        document.getElementById('persistenceAccessMode').value = 'ReadWriteOnce';
        document.getElementById('persistenceStorageClass').value = 'local';

        // 移除所有额外的挂载目录行
        const mountRows = document.querySelectorAll('.persistence-mount-row');
        for (let i = 1; i < mountRows.length; i++) {
            mountRows[i].remove();
        }

        // 重置第一个挂载目录行
        if (mountRows.length > 0) {
            const firstMountRow = mountRows[0];
            firstMountRow.querySelector('.mount-path-input').value = '/data';
        }

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