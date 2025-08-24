import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

let ccrTerminal: vscode.Terminal | undefined;
// 新增：编辑器区域的终端
let editorTerminal: vscode.Terminal | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Claude Code Router 扩展已激活!');

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

	context.subscriptions.push(
		startCcrCommand, 
		ccrCodeCommand, 
		openTerminalEditorSideCommand,
		openCcrConfigCommand
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
