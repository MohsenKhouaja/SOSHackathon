#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# 1. Input Handling: Project Name
if [ -z "$1" ]; then
  echo "Usage: ./setup-shadcn.sh <project-name>"
  echo "Please provide a project name."
  read -p "Project Name: " PROJECT_NAME
else
  PROJECT_NAME=$1
fi

if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required."
  exit 1
fi

echo "🚀 Starting setup for project: $PROJECT_NAME"

# 2. Create Vite Project (React + TypeScript)
echo "--- 📦 Creating Vite Project ---"
bun create vite@latest "$PROJECT_NAME" -- --template react-ts

cd "$PROJECT_NAME"

# 3. Add Tailwind CSS (V4 Workflow)
echo "--- 🎨 Installing Tailwind CSS v4 ---"
bun install tailwindcss @tailwindcss/vite

# 4. Configure CSS
echo "--- 📝 Updating src/index.css ---"
echo '@import "tailwindcss";' > src/index.css

# 5. Edit tsconfig.json (Using Node for safe JSON editing)
echo "--- ⚙️  Configuring tsconfig.json ---"
node -e "
const fs = require('fs');
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

// Add baseUrl and paths to compilerOptions
tsconfig.compilerOptions = {
  ...tsconfig.compilerOptions,
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*']
  }
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
"

# 6. Edit tsconfig.app.json
echo "--- ⚙️  Configuring tsconfig.app.json ---"
node -e "
const fs = require('fs');
const tsconfigApp = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));

// Add baseUrl and paths to compilerOptions
tsconfigApp.compilerOptions = {
  ...tsconfigApp.compilerOptions,
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*']
  }
};

fs.writeFileSync('tsconfig.app.json', JSON.stringify(tsconfigApp, null, 2));
"

# 7. Update vite.config.ts
echo "--- 🛠️  Updating vite.config.ts ---"
bun install -D @types/node

cat > vite.config.ts <<EOF
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
EOF

# 8. Run Shadcn CLI Init
# We use --defaults (or -d) to skip interactive prompts.
# This usually defaults to: Style: New York, Base Color: Slate/Neutral, CSS Variables: Yes.
echo "--- 🧱 Initializing shadcn/ui ---"
npx shadcn@latest init --defaults

# 9. Add Lucide Icons
echo "--- 🔦 Installing Lucide Icons ---"
bun install lucide-react

# 10. Add ALL Shadcn Components
echo "--- ➕ Adding all shadcn components ---"
# The --overwrite flag ensures it doesn't hang asking to overwrite if init added something
npx shadcn@latest add --all --overwrite --yes

# 11. Final Install to ensure everything is linked
echo "--- 🔄 Finalizing dependencies ---"
bun install

echo ""
echo "✅ Project $PROJECT_NAME setup complete!"
echo "---------------------------------------"
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  bun run dev"
