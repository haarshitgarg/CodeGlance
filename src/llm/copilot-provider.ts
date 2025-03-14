import * as vscode from 'vscode';
import { LLMProvider } from './types';

export class CopilotProvider implements LLMProvider {
    name = 'GitHub Copilot';

    constructor(public context: vscode.ExtensionContext) {}

    async isConfigured(): Promise<boolean> {
        const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
        const copilotChatExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
        return !!copilotExtension && !!copilotChatExtension;
    }

    async configure(): Promise<void> {
        const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
        const copilotChatExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
        
        if (!copilotExtension || !copilotChatExtension) {
            throw new Error('GitHub Copilot and Copilot Chat extensions are required. Please install them from the VS Code marketplace.');
        }

        if (!copilotExtension.isActive) {
            await copilotExtension.activate();
        }

        if (!copilotChatExtension.isActive) {
            await copilotChatExtension.activate();
        }
    }

    async generateExplanation(code: string): Promise<string> {
        if (!await this.isConfigured()) {
            throw new Error('GitHub Copilot and Copilot Chat are not configured. Please install and configure them first.');
        }

        try {
            // Get the Copilot Chat extension
            const copilotChatExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
            if (!copilotChatExtension?.exports) {
                throw new Error('Could not access Copilot Chat API');
            }

            // Send the code to Copilot Chat with an explain prompt
            await vscode.commands.executeCommand(
                'github.copilot.chat.explain',
                `Please explain this code:\n\n${code}`
            );

            return 'Explanation request sent to Copilot Chat. Please check the chat panel for the response.';
        } catch (error) {
            throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}