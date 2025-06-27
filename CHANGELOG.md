# Change Log

All notable changes to the "rename-file" extension will be documented in this file.

## [1.0.0] - 2025-06-27

- Initial release
- Add `Rename File` and `Rename File Smart` commands
- Smart rename suggests camelCase, PascalCase, kebab-case, and snake_case based on word under cursor
- Language-aware casing via configuration
- Always preserves file extension and cursor position
- Handles case-only renames on all platforms
- No success notifications; works silently
