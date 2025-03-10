import * as vscode from 'vscode';
import OpenAI from 'openai';
import { LLMProvider, OPENAI_KEY_SECRET } from './types';

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI | null = null;
    name = 'OpenAI';

    constructor(public context: vscode.ExtensionContext) {}

    async isConfigured(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }

    async configure(): Promise<void> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            password: true
        });

        if (!apiKey) {
            throw new Error('API Key is required');
        }

        // Store the API key securely
        await this.context.secrets.store(OPENAI_KEY_SECRET, apiKey);
        
        // Initialize the client
        this.client = new OpenAI({ apiKey });
    }

    private async getApiKey(): Promise<string | undefined> {
        return await this.context.secrets.get(OPENAI_KEY_SECRET);
    }

    async generateExplanation(code: string): Promise<string> {
        if (!this.client) {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                throw new Error('OpenAI is not configured. Please configure it first.');
            }
            this.client = new OpenAI({ apiKey });
        }

        const config = vscode.workspace.getConfiguration('codeglance');
        const model = config.get<string>('openai.model') || 'gpt-3.5-turbo';

        const response = await this.client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert programmer helping to explain code. Provide clear, concise explanations.'
                },
                {
                    role: 'user',
                    content: `Please explain this code:\n\n${code}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        return response.choices[0]?.message?.content || 'No explanation generated';
    }
} 