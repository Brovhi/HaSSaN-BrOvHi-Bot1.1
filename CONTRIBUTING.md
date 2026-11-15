# Contributing to HaSSaN-BrOvHi-Bot1.1

Thank you for your interest in contributing to **HaSSaN-BrOvHi-Bot1.1**! We welcome all contributions from bug reports and feature requests to code contributions and documentation improvements.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all members of the community with respect and courtesy.

---

## How Can I Contribute?

### 1. Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When filing a bug report, please include:

- A clear and descriptive title.
- Steps to reproduce the problem.
- Expected behavior vs. actual behavior.
- Relevant logs or screenshots (make sure to **redact sensitive data** such as session credentials, API keys, and phone numbers).
- Your environment details (Node.js version, operating system, hosting platform).

### 2. Suggesting Enhancements

We are always looking for new features and ideas! When submitting a feature request:

- Provide a detailed explanation of the proposed feature.
- Explain why this feature would be useful to users of HaSSaN-BrOvHi-Bot1.1.
- Include examples of command syntax, mockups, or expected output if applicable.

### 3. Adding or Updating Plugins

HaSSaN-BrOvHi-Bot1.1 uses a modular plugin structure located in the `plugins/` directory. When adding a new plugin:

- Follow existing plugin conventions and handler exports.
- Include appropriate command triggers, categories, and help descriptions.
- Ensure proper error handling and input validation.
- Avoid committing hardcoded credentials or malicious scripts.

---

## Development Setup

Follow these steps to set up the project locally:

1. **Fork the repository** on GitHub:
   [Fork HaSSaN-BrOvHi-Bot1.1](https://github.com/Brovhi/HaSSaN-BrOvHi-Bot1.1/fork)

2. **Clone your fork**:
   ```bash
   git clone https://github.com/Brovhi/HaSSaN-BrOvHi-Bot1.1.git
   cd HaSSaN-BrOvHi-Bot1.1
