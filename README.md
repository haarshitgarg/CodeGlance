# CodeGlance

AI-powered code explanation extension for Visual Studio Code. Get instant explanations for any code snippet using OpenAI or Anthropic models.

## Features

- Explain selected code using AI
- Support for multiple AI providers (OpenAI and Anthropic)
- Theme-aware UI that matches your VS Code settings
- Secure API key storage

## Requirements

- Visual Studio Code 1.98.0 or higher
- An API key from either OpenAI or Anthropic

## Installation

1. Install the extension from the VS Code Marketplace
2. Configure your preferred AI provider using the command palette:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Configure AI Provider" and select it
   - Choose your provider and enter your API key

## Usage

1. Select any code in your editor
2. Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows/Linux)
3. View the explanation in the side panel

## Commands

- `CodeGlance: Configure AI Provider` - Set up your AI provider
- `CodeGlance: Test AI Configuration` - Test your API configuration
- `CodeGlance: Show Code Explanation` - Explain selected code

## Extension Settings

* `codeglance.aiProvider`: Select the AI provider ("openai" or "anthropic")
* `codeglance.openai.model`: Select OpenAI model ("gpt-4" or "gpt-3.5-turbo")
* `codeglance.anthropic.model`: Select Anthropic model ("claude-3-opus-20240229" or "claude-3-sonnet-20240229")

## Security

API keys are stored securely using VS Code's built-in secrets storage.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
