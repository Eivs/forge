#!/bin/bash
set -e

echo "Setting up Forge - AI Assistant"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create necessary directories if not exist
mkdir -p public

# Install Electron dev dependencies
echo "Installing Electron development tools..."
npm install -D electron-builder

# Setup development environment
echo "Setting up development environment..."

# Check if any environment variables are needed
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# OpenAI API Key
# OPENAI_API_KEY=sk-xxx

# Anthropic API Key
# ANTHROPIC_API_KEY=sk-xxx

# Google API Key
# GOOGLE_API_KEY=xxx

# DeepSeek API Key
# DEEPSEEK_API_KEY=xxx
EOF
    echo ".env file created. Please edit it with your API keys."
fi

echo "Setup complete! You can now run 'npm run dev' to start the development server."