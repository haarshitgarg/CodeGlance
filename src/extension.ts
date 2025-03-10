// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LLMProviderFactory } from './llm/provider-factory';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeglance" is now active!');

	// Initialize the LLM provider factory with context
	LLMProviderFactory.initialize(context);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codeglance.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from codeglance!');
	});

	// Register command to configure AI provider
	let configureAICommand = vscode.commands.registerCommand('codeglance.configureAI', async () => {
		const providers = ['OpenAI', 'Anthropic'];
		const selected = await vscode.window.showQuickPick(providers, {
			placeHolder: 'Select AI Provider to configure'
		});

		if (selected) {
			try {
				const provider = LLMProviderFactory.getProvider(selected.toLowerCase());
				await provider.configure();
				vscode.window.showInformationMessage(`${selected} configured successfully!`);
			} catch (error) {
				vscode.window.showErrorMessage(`Error configuring ${selected}: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
			}
		}
	});

	// Register command to test AI configuration
	let testAICommand = vscode.commands.registerCommand('codeglance.testAI', async () => {
		try {
			const provider = LLMProviderFactory.getProvider();
			const isConfigured = await provider.isConfigured();
			
			if (!isConfigured) {
				vscode.window.showWarningMessage(`${provider.name} is not configured. Please configure it first using the 'Configure AI Provider' command.`);
				return;
			}

			// Simple test message to verify configuration
			const testResponse = await provider.generateExplanation('function hello() { console.log("Hello, World!"); }');
			vscode.window.showInformationMessage(`${provider.name} is configured correctly! Test response received.`);
		} catch (error) {
			vscode.window.showErrorMessage(`Error testing configuration: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
		}
	});

	context.subscriptions.push(disposable, configureAICommand, testAICommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
