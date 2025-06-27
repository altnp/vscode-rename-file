# Rename File VS Code Extension

Easily rename the current file in VS Code, with smart suggestions based on the word under your cursor and language-aware casing.

## Features

- **Rename File**: Quickly rename the current file, pre-filling the input with the current file name (excluding the extension).
- **Rename File Smart**: Suggests new file names based on the word under your cursor, offering camelCase, PascalCase, kebab-case, and snake_case variants. The default suggestion is language-aware and configurable.

## Commands

- `Rename File` (`editor.renameFile`):
  - Renames the current file, pre-filling the input with the current file name (excluding the extension).
  - No smart suggestions; just type the new name.
- `Rename File Smart` (`editor.renameFileSmart`):
  - Suggests new file names based on the word under your cursor, with camelCase, PascalCase, kebab-case, and snake_case options.
  - The default suggestion is based on your language configuration.

Both commands are available in the Command Palette and can be assigned to keyboard shortcuts.

## Configuration

You can configure language-specific default casing for smart suggestions:

```json
{
  "renameFile.languageNamingStyles": {
    "*": "camelCase", // Default for all languages
    "csharp": "PascalCase", // C# files use PascalCase
    "xml": "PascalCase" // XML files use PascalCase
  }
}
```

- Supported casing values: `camelCase`, `PascalCase`, `kebab-case`, `snake_case`
- The `*` entry is the fallback for all languages not explicitly listed.

## See Also

See the [CHANGELOG.md](./CHANGELOG.md) for a summary of changes and release notes.
