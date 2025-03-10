import * as vscode from 'vscode';
import { LLMProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';

export class LLMProviderFactory {
    private static providers: Map<string, LLMProvider> = new Map();
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
        }

        let provider = this.providers.get(name);
        
        if (!provider) {
            switch (name.toLowerCase()) {
                case 'openai':
                    provider = new OpenAIProvider(this.context);
                    break;
                case 'anthropic':
                    provider = new AnthropicProvider(this.context);
                    break;
                default:
                    throw new Error(`Unknown provider: ${name}`);
            }
            this.providers.set(name, provider);
        }

        return provider;
    }
} 