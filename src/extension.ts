import * as vscode from "vscode";

async function renameFile(suggestFromCursor: boolean = true) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const currentFileName = editor.document.fileName;
  const fileName = currentFileName.split("\\").pop()?.split("/").pop() || "";
  const fileExtension = fileName.includes(".") ? "." + fileName.split(".").pop() : "";
  const fileNameWithoutExt = fileName.replace(fileExtension, "");

  const suggestions = [];
  let defaultValue = fileName;
  let selectionLength = fileNameWithoutExt.length;

  if (suggestFromCursor) {
    let currentWord = "";
    const position = editor.selection.active;
    const wordPattern = /[\w-]+/;
    const wordRange = editor.document.getWordRangeAtPosition(position, wordPattern);
    if (wordRange) {
      currentWord = editor.document.getText(wordRange);
    }

    if (currentWord) {
      const { camelCase, pascalCase, kebabCase, snakeCase } = await import("change-case");

      const config = vscode.workspace.getConfiguration("renameFile");
      const languageNamingStyles = config.get<Record<string, string>>("languageNamingStyles", {});
      const currentLanguage = editor.document.languageId;

      const preferredStyle = languageNamingStyles[currentLanguage] || languageNamingStyles["*"] || "camelCase";

      const caseOptions = [
        {
          label: camelCase(currentWord) + fileExtension,
          description: "camelCase",
          isPreferred: preferredStyle === "camelCase",
          nameOnly: camelCase(currentWord),
        },
        {
          label: pascalCase(currentWord) + fileExtension,
          description: "PascalCase",
          isPreferred: preferredStyle === "PascalCase",
          nameOnly: pascalCase(currentWord),
        },
        {
          label: kebabCase(currentWord) + fileExtension,
          description: "kebab-case",
          isPreferred: preferredStyle === "kebab-case",
          nameOnly: kebabCase(currentWord),
        },
        {
          label: snakeCase(currentWord) + fileExtension,
          description: "snake_case",
          isPreferred: preferredStyle === "snake_case",
          nameOnly: snakeCase(currentWord),
        },
      ];

      suggestions.push(...caseOptions);

      const preferredItem = suggestions.find((item) => item.isPreferred);
      if (preferredItem) {
        defaultValue = preferredItem.label;
        selectionLength = preferredItem.nameOnly.length;
      }
    }
  }

  const quickPick = vscode.window.createQuickPick();
  quickPick.items = suggestions;
  quickPick.placeholder = fileName || "Enter the new file name";
  quickPick.title = `Rename File: ${fileName}`;
  quickPick.canSelectMany = false;
  quickPick.value = defaultValue;

  if (suggestions.length > 0) {
    const preferredItem = suggestions.find((item) => item.isPreferred);
    if (preferredItem) {
      quickPick.activeItems = [preferredItem];
    }
  }

  setTimeout(() => {
    if (quickPick.value === defaultValue) {
      (quickPick as any).valueSelection = [0, selectionLength];
    }
  }, 10);

  quickPick.show();

  const newName = await new Promise<string | undefined>((resolve) => {
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      if (selected) {
        resolve(selected.label);
      } else {
        resolve(quickPick.value);
      }
      quickPick.dispose();
    });

    quickPick.onDidHide(() => {
      resolve(undefined);
      quickPick.dispose();
    });
  });

  if (newName) {
    try {
      const cursorPosition = editor.selection.active;
      const viewColumn = editor.viewColumn;

      if (editor.document.isDirty) {
        await editor.document.save();
      }

      const currentFilePath = editor.document.fileName;
      const currentDir = currentFilePath.substring(
        0,
        currentFilePath.lastIndexOf("\\") !== -1 ? currentFilePath.lastIndexOf("\\") : currentFilePath.lastIndexOf("/")
      );
      const newFilePath = currentDir + (currentFilePath.includes("\\") ? "\\" : "/") + newName;

      const currentFileUri = vscode.Uri.file(currentFilePath);
      const newFileUri = vscode.Uri.file(newFilePath);

      await vscode.workspace.fs.rename(currentFileUri, newFileUri, { overwrite: false });

      if (newName.toLowerCase() !== fileName.toLowerCase()) {
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
        const newDocument = await vscode.workspace.openTextDocument(newFileUri);
        const newEditor = await vscode.window.showTextDocument(newDocument, viewColumn);
        newEditor.selection = new vscode.Selection(cursorPosition, cursorPosition);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error renaming file: ${error}`);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const renameFileDisposable = vscode.commands.registerCommand("editor.renameFile", () => renameFile(false));
  const renameFileSmartDisposable = vscode.commands.registerCommand("editor.renameFileSmart", () => renameFile(true));

  context.subscriptions.push(renameFileDisposable, renameFileSmartDisposable);
}

export function deactivate() {}
