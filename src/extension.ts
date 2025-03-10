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
	let disposable = vscode.commands.registerCommand('codeglance.helloWorld', () => {
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

	// Register a command that shows a popup for selected text
	let showPopupCommand = vscode.commands.registerCommand('codeglance.showPopup', () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		
		if (editor) {
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);
			
			if (selectedText) {
				// Create and show a new webview panel
				const panel = vscode.window.createWebviewPanel(
					'codeExplanation', // Unique ID
					'Code Explanation', // Title displayed in the tab
					vscode.ViewColumn.Beside, // Show in a new column
					{
						enableScripts: true
					}
				);

				// Set the HTML content
				panel.webview.html = getWebviewContent(selectedText);
			} else {
				vscode.window.showInformationMessage('Please select some code first!');
			}
		}
	});

	context.subscriptions.push(disposable, showPopupCommand, configureAICommand, testAICommand);
}

function getWebviewContent(selectedText: string) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code Explanation</title>
		<style>
			body {
				padding: 20px;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
			}
			.code-block {
				background-color: #f5f5f5;
				padding: 15px;
				border-radius: 5px;
				margin-bottom: 20px;
				font-family: 'Courier New', Courier, monospace;
				white-space: pre-wrap;
			}
			.explanation {
				line-height: 1.6;
			}
		</style>
	</head>
	<body>
		<h2>Selected Code:</h2>
		<div class="code-block">${escapeHtml(selectedText)}</div>
		<h2>Explanation:</h2>
		<div class="explanation">
			This is a template explanation of the selected code. 
			In future versions, this will be replaced with AI-generated explanations.
		</div>
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
