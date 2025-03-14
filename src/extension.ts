// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LLMProviderFactory } from './llm/provider-factory';
import { CopilotProvider } from './llm/copilot-provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeglance" is now active!');

	// Initialize the LLM provider factory with context
	LLMProviderFactory.initialize(context);

	// Add configuration change listener
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('codeglance.aiProvider')) {
				const config = vscode.workspace.getConfiguration('codeglance');
				const provider = config.get<string>('aiProvider');
				console.log('AI Provider changed to:', provider);
				// Force a new provider instance
				LLMProviderFactory.getProvider(provider);
			}
		})
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codeglance.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from codeglance!');
	});

	// Register command to configure AI provider
	let configureAICommand = vscode.commands.registerCommand('codeglance.configureAI', async () => {
		const providers = ['OpenAI', 'Anthropic', 'Copilot'];
		const selected = await vscode.window.showQuickPick(providers, {
			placeHolder: 'Select AI Provider to configure'
		});

		if (selected) {
			try {
				// Update the configuration first
				const config = vscode.workspace.getConfiguration('codeglance');
				await config.update('aiProvider', selected.toLowerCase(), vscode.ConfigurationTarget.Global);
				console.log('Updated aiProvider setting to:', selected.toLowerCase());

				// Get the provider and configure it
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

	// Register command to explain selected code
	let explainCodeCommand = vscode.commands.registerCommand('codeglance.showPopup', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('Please open a file first');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		
		if (!selectedText) {
			vscode.window.showInformationMessage('Please select some code first');
			return;
		}

		try {
			const provider = LLMProviderFactory.getProvider();
			
			// Check if provider is configured
			if (!await provider.isConfigured()) {
				const configure = await vscode.window.showInformationMessage(
					`${provider.name} is not configured. Would you like to configure it now?`,
					'Yes', 'No'
				);
				
				if (configure === 'Yes') {
					await provider.configure();
				} else {
					return;
				}
			}

			// Special handling for Copilot provider since it uses its own chat UI
			if (provider.name === 'GitHub Copilot') {
				await provider.generateExplanation(selectedText);
				return;
			}

			// For other providers, show the explanation in our webview
			const panel = vscode.window.createWebviewPanel(
				'codeExplanation',
				'Code Explanation',
				vscode.ViewColumn.Beside,
				{ enableScripts: true }
			);

			panel.webview.html = getLoadingContent();

			// Get explanation from the LLM provider
			const explanation = await provider.generateExplanation(selectedText);

			// Update the webview with the explanation
			panel.webview.html = getWebviewContent(selectedText, explanation);
		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
		}
	});

	context.subscriptions.push(disposable, configureAICommand, testAICommand, explainCodeCommand);
}

function getLoadingContent() {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code Explanation</title>
		<style>
			body {
				padding: 20px;
				font-family: var(--vscode-editor-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
				background-color: var(--vscode-editor-background);
				color: var(--vscode-editor-foreground);
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 200px;
			}
			.loading {
				font-size: 1.2em;
				color: var(--vscode-descriptionForeground);
			}
		</style>
	</head>
	<body>
		<div class="loading">Getting explanation from ${LLMProviderFactory.getProvider().name}...</div>
	</body>
	</html>`;
}

function getWebviewContent(selectedText: string, explanation: string) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code Explanation</title>
		<style>
			body {
				padding: 20px;
				font-family: var(--vscode-editor-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
				background-color: var(--vscode-editor-background);
				color: var(--vscode-editor-foreground);
			}
			h2 {
				color: var(--vscode-titleBar-activeForeground);
				border-bottom: 1px solid var(--vscode-titleBar-activeForeground);
				padding-bottom: 5px;
			}
			.code-block {
				background-color: var(--vscode-textCodeBlock-background);
				color: var(--vscode-editor-foreground);
				padding: 15px;
				border-radius: 5px;
				margin-bottom: 20px;
				font-family: var(--vscode-editor-font-family, 'Courier New', Courier, monospace);
				white-space: pre-wrap;
				border: 1px solid var(--vscode-panel-border);
			}
			.explanation {
				line-height: 1.6;
				color: var(--vscode-editor-foreground);
				background-color: var(--vscode-editor-background);
				padding: 10px;
				border-radius: 5px;
			}
		</style>
	</head>
	<body>
		<h2>Selected Code</h2>
		<div class="code-block">${escapeHtml(selectedText)}</div>
		<h2>Explanation</h2>
		<div class="explanation">${escapeHtml(explanation)}</div>
	</body>
	</html>`;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

// This method is called when your extension is deactivated
export function deactivate() {}
