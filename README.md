# CodeGlance

CodeGlance is a VS Code extension that provides AI-powered code explanations using various LLM providers.

## Features

- Get instant explanations for selected code snippets
- Support for multiple AI providers:
  - OpenAI (GPT-4, GPT-3.5-turbo)
  - Anthropic (Claude-3 Opus, Claude-3 Sonnet)
  - GitHub Copilot (NEW in v1.1.0)
- Easy configuration and switching between providers
- Keyboard shortcuts for quick access

## Requirements

- VS Code 1.90.0 or higher
- For OpenAI: An OpenAI API key
- For Anthropic: An Anthropic API key
- For GitHub Copilot: Active GitHub Copilot and Copilot Chat subscriptions

## Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "CodeGlance"
4. Click Install

## Usage

1. Select code you want to understand
2. Press `Cmd+Shift+E` (Mac) or use the command palette to run "Show Code Explanation"
3. View the explanation in:
   - A side panel (for OpenAI and Anthropic)
   - Copilot Chat panel (for GitHub Copilot)

## Commands

- `CodeGlance: Configure AI Provider` - Set up your preferred AI provider
- `CodeGlance: Test AI Configuration` - Test your current AI provider setup
- `CodeGlance: Show Code Explanation` - Get an explanation for selected code

## Settings

- `codeglance.aiProvider`: Select the AI provider ("openai", "anthropic", or "copilot")
- `codeglance.openai.model`: Choose OpenAI model ("gpt-4" or "gpt-3.5-turbo")
- `codeglance.anthropic.model`: Choose Anthropic model ("claude-3-opus-20240229" or "claude-3-sonnet-20240229")

## Security

Your API keys are stored securely in VS Code's secret storage.

## What's New in v1.1.0

- Added GitHub Copilot integration
- Native Copilot Chat interface for explanations
- Improved provider switching
- Bug fixes and performance improvements

## License

This extension is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
