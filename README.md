# Wanwu

![Wanwu](src/Wanwu.png)

万物 - Claude Code Router 命令行工具扩展，现已支持在编辑器窗口中显示真正的终端！

## 功能特性

### 🆕 Checkpoint 功能
- **智能备份**: 每次向 Claude 发送消息前自动创建代码状态快照
- **版本恢复**: 一键恢复到任意 checkpoint 状态
- **隔离存储**: 独立的 Git 备份仓库，不影响用户项目
- **会话管理**: 完整的对话历史和 checkpoint 记录持久化

### 🆕 编辑器终端功能
- **侧边终端**: 在编辑器侧边打开新的终端实例并自动执行 `ccr code`
- **传统终端**: 在底部面板显示标准终端

### 🚀 主要命令

#### 🔄 Checkpoint 相关命令

##### 1. 创建 Checkpoint
```
命令: CCR: Create Checkpoint
快捷键: 可通过命令面板访问
```
- 为当前工作区创建 checkpoint 快照
- 支持自定义描述信息
- 自动检测文件变更状态
- 显示创建进度和结果反馈

##### 2. 恢复 Checkpoint
```
命令: CCR: Restore Checkpoint
快捷键: 可通过命令面板访问
```
- 浏览所有可用的 checkpoint 列表
- 显示 commit SHA、消息和创建时间
- 选择任意 checkpoint 进行恢复
- 提供恢复进度和成功/失败反馈

##### 3. 新建会话
```
命令: CCR: New Conversation
快捷键: 可通过命令面板访问
```
- 创建新的对话会话
- 支持自定义会话标题
- 自动关联 checkpoint 功能

##### 4. 加载会话
```
命令: CCR: Load Conversation
快捷键: 可通过命令面板访问
```
- 浏览历史会话列表
- 显示会话标题和最后更新时间
- 支持重新加载历史对话场景
- 恢复会话相关的所有 checkpoint

##### 5. 导出会话
```
命令: CCR: Export Conversation
快捷键: 可通过命令面板访问
```
- 选择要导出的会话
- 保存为 JSON 格式文件
- 包含完整的对话历史和 checkpoint 数据
- 便于备份和分享

##### 6. 导入会话
```
命令: CCR: Import Conversation
快捷键: 可通过命令面板访问
```
- 从 JSON 文件导入会话
- 自动分配新的会话 ID
- 完整恢复对话历史和 checkpoint 记录

#### 1. 编辑器侧边终端 (推荐)
```
命令: CCR: Open Terminal in Editor Side
快捷键: 可通过命令面板访问
```
- 在编辑器侧边创建真正的终端窗口
- 支持完整的终端功能和交互
- 自动设置到当前工作区目录
- **🚀 自动执行 `ccr code` 命令**
- 提供友好的欢迎信息和状态提示
- 适合多终端并行使用

#### 2. 传统CCR终端
```
命令: CCR: Start CCR
快捷键: 可通过命令面板访问
```
- 在底部终端面板创建CCR终端
- 传统的终端使用方式

#### 3. CCR代码执行
```
命令: CCR: CCR Code
快捷键: 可通过命令面板访问
```
- 快速执行 `ccr code` 命令
- 自动创建终端（如果不存在）

#### 4. 打开CCR配置
```
命令: CCR: Open CCR Config
快捷键: 可通过命令面板访问
```
- 一键打开 `~/.claude-code-router/config.json`
- 若文件或目录不存在将自动创建
- 便于快速查看与编辑 CCR 配置

## 📋 使用方法

### 🔄 Checkpoint 使用方法

#### 创建和使用 Checkpoint
1. **创建 Checkpoint**:
   - 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
   - 输入 "CCR: Create Checkpoint"
   - 输入描述信息（可选但推荐）
   - 等待创建完成，状态栏会显示进度和结果

2. **恢复 Checkpoint**:
   - 按 `Ctrl+Shift+P` 或 `Cmd+Shift+P`
   - 输入 "CCR: Restore Checkpoint"
   - 从列表中选择要恢复的 checkpoint
   - 查看恢复进度和结果反馈

3. **会话管理**:
   - **新建会话**: 使用 "CCR: New Conversation" 创建新的对话场景
   - **加载会话**: 使用 "CCR: Load Conversation" 加载历史对话
   - **导出会话**: 使用 "CCR: Export Conversation" 备份对话数据
   - **导入会话**: 使用 "CCR: Import Conversation" 导入备份的对话

#### Checkpoint 特性说明
- **自动备份**: Checkpoint 会自动备份工作区所有文件
- **智能提交**: 根据变更状态生成不同的提交信息
- **空提交支持**: 即使没有文件变更也会创建 checkpoint 记录
- **隔离存储**: 备份数据存储在扩展的独立目录中，不影响项目
- **持久化**: 所有 checkpoint 和会话数据都会持久保存

### 方法一：通过编辑器标题栏按钮（推荐）
1. 打开任意文件
2. 在编辑器标题栏找到万物图标按钮
3. 点击按钮：
   - 🔥 "Open Terminal in Editor Side" - 侧边终端并执行 `ccr code`

### 方法二：通过命令面板
1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 "CCR" 查看所有可用命令
3. 选择对应的命令执行

### 方法三：通过快捷键（可自定义）
在VSCode的键盘快捷键设置中可以为以下命令设置快捷键：
- `ccr.openTerminalEditorSide`
- `ccr.start`
- `ccr.code`
- `ccr.openConfig`
- `ccr.createCheckpoint`
- `ccr.restoreCheckpoint`
- `ccr.newConversation`
- `ccr.loadConversation`
- `ccr.exportConversation`
- `ccr.importConversation`

## ⚙️ 配置文件位置

### CCR 配置文件
- 路径: `~/.claude-code-router/config.json`
- 作用: 存放 Claude Code Router 的全局配置
- 打开方式: 通过命令面板执行 `CCR: Open CCR Config`

### Checkpoint 数据存储
- **备份仓库**: `{扩展存储目录}/backups/.git`
- **会话数据**: `{扩展存储目录}/conversations/`
- **索引文件**: `{扩展存储目录}/conversations/index.json`
- **作用**: 存储所有 checkpoint 和会话数据
- **特点**: 完全独立，不影响用户项目文件

## 🛠️ 技术实现

### Checkpoint 功能实现

#### 1. 独立 Git 备份仓库
```typescript
// 创建独立的 Git 备份仓库
const backupRepoPath = path.join(context.storageUri.fsPath, 'backups', '.git');
const initCmd = `git --git-dir="${backupRepoPath}" --work-tree="${workspacePath}" init`;
```
- 使用 `--git-dir` 和 `--work-tree` 参数指定独立的 Git 仓库
- 工作区指向用户项目，仓库存储在扩展目录中
- 完全隔离，不影响用户项目的 Git 状态

#### 2. 智能提交策略
```typescript
// 根据变更状态生成提交信息
if (commits.length === 0) {
    commitMessage = `Initial backup: ${truncatedMessage}`;
} else {
    // 检查文件变更状态
    const statusCmd = `git --git-dir="${backupRepoPath}" status --porcelain`;
    if (statusResult.trim()) {
        commitMessage = `Before: ${truncatedMessage}`;
    } else {
        commitMessage = `Checkpoint (no changes): ${truncatedMessage}`;
    }
}
```
- 首次提交：标记为初始备份
- 有变更时：标记为变更前状态
- 无变更时：仍然创建空提交确保连续性

#### 3. 恢复机制
```typescript
// 恢复到指定提交
const checkoutCmd = `git --git-dir="${backupRepoPath}" --work-tree="${workspacePath}" checkout ${commitSha} -- .`;
```
- 使用 `git checkout` 恢复文件内容
- 只恢复文件内容，不改变 Git 历史记录
- 支持精确恢复到任意 checkpoint

#### 4. 会话持久化
```typescript
interface ConversationData {
    id: string;
    title: string;
    messages: Array<{
        role: string;
        content: string;
        timestamp: number;
        checkpoint?: string;
    }>;
    checkpoints: Array<{
        sha: string;
        message: string;
        timestamp: number;
        userMessage: string;
    }>;
    timestamp: number;
    lastUpdated: number;
}
```
- 完整的对话历史记录
- Checkpoint 与消息的关联关系
- 支持导入导出和备份恢复

### 编辑器侧边终端实现
使用VSCode扩展API的 `Terminal.location` 配置：
```typescript
const terminal = vscode.window.createTerminal({
    name: 'CCR 编辑器终端',
    cwd: workspaceFolder.uri.fsPath,
    location: vscode.TerminalLocation.Editor
});
```

并自动执行ccr code命令：
```typescript
setTimeout(() => {
    if (editorTerminal) {
        editorTerminal.sendText('ccr code');
    }
}, 800);
```

## 🔧 配置要求

- VSCode 版本: >= 1.74.0
- 支持的操作系统: Windows, macOS, Linux
- 需要Claude Code Router CLI工具
- 需要Git工具（用于checkpoint功能）

## 📦 安装和使用

1. 确保已安装Claude Code Router CLI工具
2. 确保系统已安装Git（用于checkpoint功能）
3. 打开VSCode并加载此扩展
4. 打开一个工作区或文件夹
5. 使用上述任意方法启动终端功能

## 🎯 推荐工作流程

### 🔄 Checkpoint 工作流程
1. **开始新任务**: 使用 "CCR: New Conversation" 创建新会话
2. **记录基线**: 在重要修改前使用 "CCR: Create Checkpoint" 创建基线快照
3. **持续备份**: 在关键步骤前重复创建checkpoint，形成版本线
4. **问题回退**: 遇到问题时使用 "CCR: Restore Checkpoint" 恢复到之前状态
5. **阶段性保存**: 定期导出会话数据，备份到安全位置

### 日常开发
1. **日常开发**: 使用 "Open Terminal in Editor Side" 在编辑器侧边使用终端
   - 命令会自动执行 `ccr code`，无需手动输入
   - 终端在编辑器侧边显示，方便并行工作
2. **多任务处理**: 多次点击可以复用现有终端或创建新实例
3. **快速操作**: 使用编辑器标题栏的万物图标按钮快速访问功能
4. **重复使用**: 再次点击会重新执行 `ccr code`

### 会话管理最佳实践
- **定期备份**: 重要阶段性完成后导出会话数据
- **清晰命名**: 为会话和checkpoint使用有意义的描述
- **分项目管理**: 不同项目使用独立的会话
- **历史追踪**: 利用会话历史追踪完整的开发过程

## 🐛 故障排除

### Checkpoint 相关问题

#### Checkpoint 创建失败
- **Git 未安装**: 确保系统已安装 Git 工具
- **权限问题**: 检查扩展存储目录是否有写权限
- **工作区未打开**: 确保已打开 VSCode 工作区或文件夹
- **磁盘空间**: 检查磁盘空间是否充足

#### Checkpoint 恢复失败
- **文件锁定**: 确保没有程序占用要恢复的文件
- **权限问题**: 检查文件写入权限
- **Git 仓库损坏**: 删除扩展存储目录下的 `backups` 文件夹重新初始化

#### 会话数据丢失
- **检查存储目录**: 查看扩展存储目录下的 `conversations` 文件夹
- **索引重建**: 删除 `index.json` 文件，扩展会自动重建索引
- **导出备份**: 定期导出会话数据作为备份

### 终端无法创建
- 确保已打开工作区或文件夹
- 检查VSCode版本是否支持
- 尝试重新加载VSCode窗口

### 命令不可用
- 确保扩展已正确激活
- 检查命令面板中是否显示CCR相关命令
- 尝试重新启用扩展

## 🎁 高级功能

### 状态栏指示器
- **默认状态**: 显示 "$(play-circle) CCR"
- **创建中**: 显示 "$(sync~spin) 正在创建 checkpoint..."
- **创建成功**: 显示 "$(check) CCR checkpoint 已创建"
- **恢复中**: 显示 "$(sync~spin) 正在恢复..."
- **恢复成功**: 显示 "$(check) CCR 恢复成功"
- **错误状态**: 显示 "$(error) CCR 操作失败"

### 键盘快捷键建议
```json
{
    "key": "ctrl+shift+c",
    "command": "ccr.createCheckpoint",
    "when": "editorTextFocus"
},
{
    "key": "ctrl+shift+r",
    "command": "ccr.restoreCheckpoint",
    "when": "editorTextFocus"
},
{
    "key": "ctrl+shift+n",
    "command": "ccr.newConversation",
    "when": "editorTextFocus"
}
```

### 数据迁移
- **扩展升级**: 会话数据会自动保留
- **跨设备**: 通过导出/导入功能迁移数据
- **备份策略**: 建议定期备份 `conversations` 文件夹

## 🤝 贡献

欢迎提交Issue和Pull Request来改进万物扩展！

## 许可证

MIT License 
