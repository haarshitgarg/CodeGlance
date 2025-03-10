import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ANTHROPIC_KEY_SECRET } from './types';

export class AnthropicProvider implements LLMProvider {
    private client: Anthropic | null = null;
    name = 'Anthropic';

    constructor(public context: vscode.ExtensionContext) {}

    async isConfigured(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }

    async configure(): Promise<void> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Anthropic API Key',
            password: true
        });

        if (!apiKey) {
            throw new Error('API Key is required');
        }

        // Store the API key securely
        await this.context.secrets.store(ANTHROPIC_KEY_SECRET, apiKey);
        
        // Initialize the client
        this.client = new Anthropic({ apiKey });
    }

    private async getApiKey(): Promise<string | undefined> {
        return await this.context.secrets.get(ANTHROPIC_KEY_SECRET);
    }

    async generateExplanation(code: string): Promise<string> {
        if (!this.client) {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                throw new Error('Anthropic is not configured. Please configure it first.');
            }
            this.client = new Anthropic({ apiKey });
        }

        const config = vscode.workspace.getConfiguration('codeglance');
        const model = config.get<string>('anthropic.model') || 'claude-3-sonnet-20240229';

        const response = await this.client.messages.create({
            model,
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: `Please explain this code:\n\n${code}`
            }],
            system: 'You are an expert programmer helping to explain code. Provide clear, concise explanations.'
        });

        return response.content[0].text;
    }
} 