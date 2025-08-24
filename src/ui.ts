import * as vscode from 'vscode';

// UI 交互处理类
export class UIManager {
    private static instance: UIManager;
    private _statusBarItem: vscode.StatusBarItem;

    private constructor() {
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._statusBarItem.text = "$(play-circle) CCR";
        this._statusBarItem.tooltip = "Claude Code Router Checkpoint";
        this._statusBarItem.command = "ccr.createCheckpoint";
        this._statusBarItem.show();
    }

    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    // 显示恢复选项按钮
    public showRestoreOption(commitSha: string, message: string): void {
        // 在当前编辑器中显示恢复按钮
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const decorationRange = new vscode.Range(
                editor.selection.active.line,
                0,
                editor.selection.active.line,
                0
            );

            const decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: ` 🔄 恢复到此 checkpoint (${commitSha.substring(0, 7)})`,
                    color: '#007acc',
                    margin: '0 0 0 10px'
                }
            });

            editor.setDecorations(decorationType, [decorationRange]);

            // 点击事件监听
            const disposable = vscode.commands.registerCommand('ccr.restoreToSpecificCommit', async () => {
                await this.handleRestoreClick(commitSha);
                decorationType.dispose();
                disposable.dispose();
            });
        }

        // 在状态栏显示提示
        this._statusBarItem.text = "$(play-circle) CCR (新 checkpoint 可用)";
        this._statusBarItem.tooltip = `Checkpoint: ${message}`;
    }

    // 处理恢复点击事件
    private async handleRestoreClick(commitSha: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('ccr.restoreToCommit', commitSha);
        } catch (error) {
            vscode.window.showErrorMessage(`恢复 checkpoint 失败: ${error}`);
        }
    }

    // 显示恢复进度
    public showRestoreProgress(commitSha: string): void {
        this._statusBarItem.text = "$(sync~spin) 正在恢复...";
        this._statusBarItem.tooltip = `正在恢复到 checkpoint: ${commitSha.substring(0, 7)}`;
    }

    // 显示恢复成功
    public showRestoreSuccess(commitSha: string): void {
        this._statusBarItem.text = "$(check) CCR 恢复成功";
        this._statusBarItem.tooltip = `已恢复到 checkpoint: ${commitSha.substring(0, 7)}`;
        
        // 3秒后恢复正常状态
        setTimeout(() => {
            this._statusBarItem.text = "$(play-circle) CCR";
            this._statusBarItem.tooltip = "Claude Code Router Checkpoint";
        }, 3000);
    }

    // 显示恢复错误
    public showRestoreError(commitSha: string, error: string): void {
        this._statusBarItem.text = "$(error) CCR 恢复失败";
        this._statusBarItem.tooltip = `恢复失败: ${error}`;
        
        // 3秒后恢复正常状态
        setTimeout(() => {
            this._statusBarItem.text = "$(play-circle) CCR";
            this._statusBarItem.tooltip = "Claude Code Router Checkpoint";
        }, 3000);
    }

    // 显示 checkpoint 创建进度
    public showCreateCheckpointProgress(): void {
        this._statusBarItem.text = "$(sync~spin) 正在创建 checkpoint...";
        this._statusBarItem.tooltip = "正在创建新的 checkpoint";
    }

    // 显示 checkpoint 创建成功
    public showCreateCheckpointSuccess(commitSha: string): void {
        this._statusBarItem.text = "$(check) CCR checkpoint 已创建";
        this._statusBarItem.tooltip = `新 checkpoint: ${commitSha.substring(0, 7)}`;
        
        // 3秒后恢复正常状态
        setTimeout(() => {
            this._statusBarItem.text = "$(play-circle) CCR";
            this._statusBarItem.tooltip = "Claude Code Router Checkpoint";
        }, 3000);
    }

    // 显示会话列表
    public async showConversationList(conversations: Array<{ id: string; title: string; timestamp: number }>): Promise<string | undefined> {
        const items = conversations.map(conv => ({
            label: conv.title,
            description: new Date(conv.timestamp).toLocaleString(),
            id: conv.id
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要加载的历史会话'
        });

        return selected?.id;
    }

    // 创建新会话输入
    public async createNewConversation(): Promise<string | undefined> {
        return await vscode.window.showInputBox({
            placeHolder: '输入新会话标题',
            prompt: '请输入新会话的标题'
        });
    }

    // 显示提示信息
    public showInfoMessage(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    // 显示错误信息
    public showErrorMessage(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    // 更新状态栏
    public updateStatusBar(text: string, tooltip?: string): void {
        this._statusBarItem.text = text;
        if (tooltip) {
            this._statusBarItem.tooltip = tooltip;
        }
    }

    // 清理资源
    public dispose(): void {
        this._statusBarItem.dispose();
    }
}