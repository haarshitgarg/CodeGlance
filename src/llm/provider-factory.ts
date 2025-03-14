import * as vscode from 'vscode';
import { LLMProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { CopilotProvider } from './copilot-provider';

export class LLMProviderFactory {
    private static context: vscode.ExtensionContext;

    static initialize(context: vscode.ExtensionContext) {
        this.context = context;
    }

    static getProvider(name?: string): LLMProvider {
        if (!this.context) {
            throw new Error('LLMProviderFactory not initialized');
        }

        if (!name) {
            const config = vscode.workspace.getConfiguration('codeglance');
            name = config.get<string>('aiProvider') || 'openai';
            console.log('Current AI provider from config:', name);
        }

        console.log('Creating provider instance for:', name);
        
        let provider: LLMProvider;
        switch (name.toLowerCase()) {
            case 'openai':
                provider = new OpenAIProvider(this.context);
                break;
            case 'anthropic':
                provider = new AnthropicProvider(this.context);
                break;
            case 'copilot':
                provider = new CopilotProvider(this.context);
                break;
            default:
                throw new Error(`Unknown provider: ${name}`);
        }

        console.log('Created provider:', provider.name);
        return provider;
    }
} 