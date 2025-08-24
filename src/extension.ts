import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { UIManager } from './ui';
import { ConversationManager } from './conversation';

let ccrTerminal: vscode.Terminal | undefined;
// 新增：编辑器区域的终端
let editorTerminal: vscode.Terminal | undefined;

// ClaudeChatProvider 类实现 checkpoint 功能
class ClaudeChatProvider {
    private _context: vscode.ExtensionContext;
    private _backupRepoPath: string;
    private _workspacePath: string;
    private _commits: Array<{ sha: string; message: string; timestamp: number }> = [];
    private _uiManager: UIManager;
    private _conversationManager: ConversationManager;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        this._backupRepoPath = path.join(context.storageUri?.fsPath || '', 'backups', '.git');
        this._uiManager = UIManager.getInstance();
        this._conversationManager = ConversationManager.getInstance(context);
        this._initializeBackupRepo();
    }

    private async _initializeBackupRepo() {
        if (!this._workspacePath) {
            return;
        }

        const backupsDir = path.dirname(this._backupRepoPath);
        
        // 确保备份目录存在
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        // 检查是否已经初始化
        if (!fs.existsSync(this._backupRepoPath)) {
            // 初始化 Git 备份仓库
            const { exec } = require('child_process');
            const initCmd = `git --git-dir="${this._backupRepoPath}" --work-tree="${this._workspacePath}" init`;
            const configCmd1 = `git --git-dir="${this._backupRepoPath}" config user.name "CCR Checkpoint"`;
            const configCmd2 = `git --git-dir="${this._backupRepoPath}" config user.email "checkpoint@ccr.local"`;

            await new Promise<void>((resolve, reject) => {
                exec(initCmd, (error: any) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    exec(configCmd1, (error: any) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        exec(configCmd2, (error: any) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    });
                });
            });
        }
    }

    public async createCheckpoint(userMessage: string): Promise<void> {
        if (!this._workspacePath) {
            return;
        }

        // 显示创建 checkpoint 进度
        this._uiManager.showCreateCheckpointProgress();

        const { exec } = require('child_process');
        
        // 暂存所有文件
        const addCmd = `git --git-dir="${this._backupRepoPath}" --work-tree="${this._workspacePath}" add -A`;
        
        await new Promise<void>((resolve, reject) => {
            exec(addCmd, (error: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        // 创建提交信息
        let commitMessage = '';
        const truncatedMessage = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage;
        
        if (this._commits.length === 0) {
            commitMessage = `Initial backup: ${truncatedMessage}`;
        } else {
            // 检查是否有变更
            const statusCmd = `git --git-dir="${this._backupRepoPath}" --work-tree="${this._workspacePath}" status --porcelain`;
            const statusResult = await new Promise<string>((resolve, reject) => {
                exec(statusCmd, (error: any, stdout: string) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(stdout);
                });
            });

            if (statusResult.trim()) {
                commitMessage = `Before: ${truncatedMessage}`;
            } else {
                commitMessage = `Checkpoint (no changes): ${truncatedMessage}`;
            }
        }

        // 创建提交
        const commitCmd = `git --git-dir="${this._backupRepoPath}" --work-tree="${this._workspacePath}" commit -m "${commitMessage}" --allow-empty`;
        
        const commitResult = await new Promise<string>((resolve, reject) => {
            exec(commitCmd, (error: any, stdout: string) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });

        // 获取提交 SHA
        const getShaCmd = `git --git-dir="${this._backupRepoPath}" rev-parse HEAD`;
        const sha = await new Promise<string>((resolve, reject) => {
            exec(getShaCmd, (error: any, stdout: string) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });

        // 记录提交
        this._commits.push({
            sha,
            message: commitMessage,
            timestamp: Date.now()
        });

        // 保存到会话管理器
        this._conversationManager.addCheckpoint(sha, commitMessage, userMessage);
        this._conversationManager.addMessage('user', userMessage, sha);

        // 通知 UI
        this._notifyRestoreOption(sha);
        this._uiManager.showCreateCheckpointSuccess(sha);
    }

    public async restoreToCommit(commitSha: string): Promise<void> {
        if (!this._workspacePath) {
            return;
        }

        // 显示恢复进度
        this._uiManager.showRestoreProgress(commitSha);

        const { exec } = require('child_process');
        
        // 恢复到指定提交
        const checkoutCmd = `git --git-dir="${this._backupRepoPath}" --work-tree="${this._workspacePath}" checkout ${commitSha} -- .`;
        
        try {
            await new Promise<void>((resolve, reject) => {
                exec(checkoutCmd, (error: any) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });

            // 记录恢复操作
            this._conversationManager.addMessage('system', `Restored to checkpoint: ${commitSha}`);

            // 通知 UI 成功
            this._notifyRestoreSuccess(commitSha);
            this._uiManager.showRestoreSuccess(commitSha);
        } catch (error) {
            // 通知 UI 失败
            this._notifyRestoreError(commitSha, error);
            this._uiManager.showRestoreError(commitSha, (error as Error).message);
        }
    }

    private _notifyRestoreOption(commitSha: string): void {
        // 使用 UI 管理器显示恢复选项
        this._uiManager.showRestoreOption(commitSha, this._commits[this._commits.length - 1]?.message || '');
    }

    private _notifyRestoreSuccess(commitSha: string): void {
        console.log('Restore successful:', commitSha);
        vscode.window.showInformationMessage(`成功恢复到 checkpoint: ${commitSha.substring(0, 7)}`);
    }

    private _notifyRestoreError(commitSha: string, error: any): void {
        console.error('Restore failed:', commitSha, error);
        vscode.window.showErrorMessage(`恢复 checkpoint 失败: ${error.message}`);
    }

    public getCommits(): Array<{ sha: string; message: string; timestamp: number }> {
        return this._commits;
    }
}

// 全局 ClaudeChatProvider 实例
let claudeChatProvider: ClaudeChatProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Claude Code Router 扩展已激活!');

	// 初始化 ClaudeChatProvider
	claudeChatProvider = new ClaudeChatProvider(context);

	// 注册 start ccr 命令
	const startCcrCommand = vscode.commands.registerCommand('ccr.start', () => {
		startCcrTerminal();
	});

	// 注册 ccr code 命令
	const ccrCodeCommand = vscode.commands.registerCommand('ccr.code', () => {
		executeCcrCode();
	});

	// 新增：注册在编辑器侧边打开终端的命令
	const openTerminalEditorSideCommand = vscode.commands.registerCommand('ccr.openTerminalEditorSide', () => {
		openTerminalEditorSide();
	});

	// 新增：快速打开 CCR 配置文件
	const openCcrConfigCommand = vscode.commands.registerCommand('ccr.openConfig', async () => {
		await openCcrConfig();
	});

	// 注册 checkpoint 相关命令
	const createCheckpointCommand = vscode.commands.registerCommand('ccr.createCheckpoint', async () => {
		await createCheckpoint();
	});

	const restoreCheckpointCommand = vscode.commands.registerCommand('ccr.restoreCheckpoint', async () => {
		await restoreCheckpoint();
	});

	// 注册会话管理命令
	const newConversationCommand = vscode.commands.registerCommand('ccr.newConversation', async () => {
		await newConversation();
	});

	const loadConversationCommand = vscode.commands.registerCommand('ccr.loadConversation', async () => {
		await loadConversation();
	});

	const exportConversationCommand = vscode.commands.registerCommand('ccr.exportConversation', async () => {
		await exportConversation();
	});

	const importConversationCommand = vscode.commands.registerCommand('ccr.importConversation', async () => {
		await importConversation();
	});

	context.subscriptions.push(
		startCcrCommand, 
		ccrCodeCommand, 
		openTerminalEditorSideCommand,
		openCcrConfigCommand,
		createCheckpointCommand,
		restoreCheckpointCommand,
		newConversationCommand,
		loadConversationCommand,
		exportConversationCommand,
		importConversationCommand
	);

	// 监听终端关闭事件
	vscode.window.onDidCloseTerminal((terminal) => {
		if (terminal === ccrTerminal) {
			ccrTerminal = undefined;
		}
		if (terminal === editorTerminal) {
			editorTerminal = undefined;
		}
	});
}

// 新增：在编辑器侧边打开终端并执行 ccr code
function openTerminalEditorSide() {
	// 获取当前工作区的根目录
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('请先打开一个工作区');
		return;
	}

	// 如果编辑器终端已存在，显示它并执行 ccr code；否则创建新的
	if (editorTerminal) {
		editorTerminal.show();
		setTimeout(() => {
			if (editorTerminal) {
				editorTerminal.sendText('ccr code');
			}
		}, 300);
		vscode.window.showInformationMessage('编辑器终端已显示，正在执行 ccr code...');
		return;
	}

	// 使用 workbench.action.createTerminalEditorSide 命令创建终端
	vscode.commands.executeCommand('workbench.action.createTerminalEditorSide').then(() => {
		// 等待终端创建完成，然后获取活动终端
		setTimeout(() => {
			editorTerminal = vscode.window.activeTerminal;
			if (editorTerminal) {
				// 发送欢迎信息并自动执行 ccr code
				editorTerminal.sendText('echo "🚀 CCR 编辑器侧边终端已启动！"');
				editorTerminal.sendText('echo "📍 当前目录: $(pwd)"');
				editorTerminal.sendText('echo "⚡ 正在自动启动 ccr code..."');
				editorTerminal.sendText('');
				// 自动执行 ccr code 命令
				editorTerminal.sendText('ccr code');
			}
		}, 800);
	});

	vscode.window.showInformationMessage('CCR 编辑器终端已在侧边打开，正在自动执行 ccr code...');
}

function startCcrTerminal() {
	// 获取当前工作区的根目录
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showErrorMessage('请先打开一个工作区');
		return;
	}

	// 如果终端已存在，显示它；否则创建新的终端
	if (ccrTerminal) {
		ccrTerminal.show();
		vscode.window.showInformationMessage('CCR 终端已打开');
	} else {
		ccrTerminal = vscode.window.createTerminal({
			name: 'CCR Terminal',
			cwd: workspaceFolder.uri.fsPath,
			message: 'Claude Code Router 终端已启动\n输入 "ccr code" 开始使用'
		});
		ccrTerminal.show();
		vscode.window.showInformationMessage('CCR 终端已创建并打开');
	}
}

function executeCcrCode() {
	// 确保终端存在
	if (!ccrTerminal) {
		startCcrTerminal();
		// 等待终端创建完成后执行命令
		setTimeout(() => {
			if (ccrTerminal) {
				ccrTerminal.sendText('ccr code');
			}
		}, 500);
	} else {
		ccrTerminal.show();
		ccrTerminal.sendText('ccr code');
	}
	
	vscode.window.showInformationMessage('已执行 CCR Code 命令');
}



export function deactivate() {
	if (ccrTerminal) {
		ccrTerminal.dispose();
	}
	if (editorTerminal) {
		editorTerminal.dispose();
	}
}

// ===== Helper: 打开/创建 CCR 配置文件 =====
async function openCcrConfig() {
    try {
        const home = os.homedir();
        const configDir = path.join(home, '.claude-code-router');
        const configFile = path.join(configDir, 'config.json');

        const dirUri = vscode.Uri.file(configDir);
        const fileUri = vscode.Uri.file(configFile);

        // 确保目录存在
        try {
            await vscode.workspace.fs.createDirectory(dirUri);
        } catch (_) {
            // 忽略目录已存在等错误
        }

        // 如果文件不存在则创建一个空的 JSON 骨架
        const exists = await fileExists(fileUri);
        if (!exists) {
            const defaultContent = Buffer.from('{\n  \n}\n');
            await vscode.workspace.fs.writeFile(fileUri, defaultContent);
        }

        // 打开并显示文档
        const doc = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(doc, { preview: false });
        vscode.window.showInformationMessage('已打开 CCR 配置文件: ' + configFile);
    } catch (err: any) {
        vscode.window.showErrorMessage('打开 CCR 配置失败: ' + (err?.message ?? String(err)));
    }
}

async function fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch (_) {
        return false;
    }
}

// Checkpoint 功能相关函数
async function createCheckpoint() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const userMessage = await vscode.window.showInputBox({
        placeHolder: '输入消息描述用于 checkpoint',
        prompt: '请输入创建 checkpoint 的消息描述'
    });

    if (userMessage !== undefined) {
        try {
            await claudeChatProvider.createCheckpoint(userMessage);
            vscode.window.showInformationMessage('Checkpoint 创建成功');
        } catch (error) {
            vscode.window.showErrorMessage(`创建 checkpoint 失败: ${error}`);
        }
    }
}

async function restoreCheckpoint() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const commits = claudeChatProvider.getCommits();
    if (commits.length === 0) {
        vscode.window.showInformationMessage('无可恢复的 checkpoint');
        return;
    }

    const items = commits.map(commit => ({
        label: `${commit.sha.substring(0, 7)} - ${commit.message}`,
        description: new Date(commit.timestamp).toLocaleString(),
        sha: commit.sha
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择要恢复的 checkpoint'
    });

    if (selected) {
        try {
            await claudeChatProvider.restoreToCommit(selected.sha);
        } catch (error) {
            vscode.window.showErrorMessage(`恢复 checkpoint 失败: ${error}`);
        }
    }
}

// 会话管理函数
async function newConversation() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const title = await UIManager.getInstance().createNewConversation();
    if (title) {
        const conversationManager = getConversationManager();
        const conversation = conversationManager.createConversation(title);
        conversationManager.setCurrentConversation(conversation);
        UIManager.getInstance().showInfoMessage(`新会话 "${title}" 已创建`);
    }
}

async function loadConversation() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const conversationManager = getConversationManager();
    const conversations = conversationManager.getConversations();
    
    if (conversations.length === 0) {
        vscode.window.showInformationMessage('无可加载的历史会话');
        return;
    }

    const selectedId = await UIManager.getInstance().showConversationList(conversations);
    if (selectedId) {
        const conversation = conversationManager.loadConversation(selectedId);
        if (conversation) {
            conversationManager.setCurrentConversation(conversation);
            UIManager.getInstance().showInfoMessage(`已加载会话 "${conversation.title}"`);
        }
    }
}

async function exportConversation() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const conversationManager = getConversationManager();
    const conversations = conversationManager.getConversations();
    
    if (conversations.length === 0) {
        vscode.window.showInformationMessage('无可导出的会话');
        return;
    }

    const items = conversations.map(conv => ({
        label: conv.title,
        description: new Date(conv.timestamp).toLocaleString(),
        id: conv.id
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择要导出的会话'
    });

    if (selected) {
        const exportedData = conversationManager.exportConversation(selected.id);
        if (exportedData) {
            const uri = await vscode.window.showSaveDialog({
                filters: { json: ['json'] },
                defaultUri: vscode.Uri.file(`${selected.label.split(' - ')[0]}.json`)
            });
            
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(exportedData, 'utf8'));
                UIManager.getInstance().showInfoMessage(`会话 "${selected.label}" 已导出`);
            }
        }
    }
}

async function importConversation() {
    if (!claudeChatProvider) {
        vscode.window.showErrorMessage('ClaudeChatProvider 未初始化');
        return;
    }

    const uri = await vscode.window.showOpenDialog({
        filters: { json: ['json'] },
        canSelectMany: false
    });

    if (uri && uri.length > 0) {
        const conversationData = await vscode.workspace.fs.readFile(uri[0]);
        const conversationManager = getConversationManager();
        
        if (conversationManager.importConversation(conversationData.toString())) {
            UIManager.getInstance().showInfoMessage('会话导入成功');
        } else {
            UIManager.getInstance().showErrorMessage('会话导入失败');
        }
    }
}

// 获取会话管理器实例
function getConversationManager(): ConversationManager {
    if (!claudeChatProvider) {
        throw new Error('ClaudeChatProvider 未初始化');
    }
    // 这需要通过另一种方式获取，因为 ConversationManager 是私有的
    // 这里需要重构代码来支持这个功能
    throw new Error('需要重构代码来支持会话管理器获取');
}
