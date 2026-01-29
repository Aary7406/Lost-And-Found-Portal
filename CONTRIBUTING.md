# Contributing to Lost & Found Portal

First off, thank you for considering contributing to Lost & Found Portal! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating a bug report, please check existing issues. When creating a report, include:

- **Clear title** describing the bug
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment** (OS, browser, Node version)

### 💡 Suggesting Features

Feature requests are welcome! Please:

- Check if the feature already exists or is planned
- Describe the feature in detail
- Explain why it would be useful
- Consider how it fits with existing features

### 🔧 Code Contributions

1. Look for issues tagged `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Follow the [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Git**
- **Supabase** account (for database)

### Local Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/lost-and-found.git
cd lost-and-found

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/lost-and-found.git

# 4. Install dependencies
bun install

# 5. Copy environment file
cp .env.local.example .env.local
# Fill in your Supabase credentials

# 6. Start development server
bun run dev
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Pull Request Process

### 1. Create a Branch

```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-documented
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the development server
bun run dev

# Run linting
bun run lint
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "feat: add email notification for found items"
git commit -m "fix: resolve login redirect loop"
git commit -m "docs: update API documentation"

# Commit message format
# type: description
#
# Types: feat, fix, docs, style, refactor, test, chore
```

### 5. Push and Create PR

```bash
git push origin your-branch-name
```

Then on GitHub:
1. Go to your fork
2. Click "Compare & pull request"
3. Fill out the PR template
4. Link related issues

### 6. PR Review

- Respond to feedback promptly
- Make requested changes
- Keep the PR focused on one thing

---

## Style Guidelines

### JavaScript/React

```javascript
// ✅ Good
const fetchItems = async () => {
  const response = await fetch('/api/items');
  return response.json();
};

// ❌ Bad
const fetchItems = async () => { const response = await fetch('/api/items'); return response.json(); };
```

### CSS

- Use CSS Modules (`.module.css`)
- Follow BEM-like naming: `.componentName`, `.componentName__element`
- Use CSS variables for colors from `globals.css`

### File Naming

- Components: `PascalCase` (e.g., `Toast.js`, `DatePicker.js`)
- Utilities: `camelCase` (e.g., `supabase.js`, `cache.js`)
- CSS Modules: Match component name (e.g., `Toast.module.css`)

---

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🙏
