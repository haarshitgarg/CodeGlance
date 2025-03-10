import * as vscode from 'vscode';

export interface LLMProvider {
    name: string;
    context: vscode.ExtensionContext;
    isConfigured(): Promise<boolean>;
    configure(): Promise<void>;
    generateExplanation(code: string): Promise<string>;
}

export interface LLMConfiguration {
    provider: string;
    model: string;
}

export const OPENAI_KEY_SECRET = 'codeglance.openai.apiKey';
export const ANTHROPIC_KEY_SECRET = 'codeglance.anthropic.apiKey'; 