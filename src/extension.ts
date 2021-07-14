import * as vscode from "vscode";
import * as cp from "child_process";

function runFormatter(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // TODO handle the case where csharpier is not installed
    // TODO handle errors with csharpier parsing (return the input?)

    const csharpier = cp.spawn("dotnet", ["csharpier", "--write-stdout"], {
      stdio: "pipe",
    });

    let output = "";
    csharpier.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    csharpier.on("exit", () => {
      resolve(output);
    });

    csharpier.stdin.write(input);
    csharpier.stdin.end();
  });
}

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentFormattingEditProvider("csharp", {
    async provideDocumentFormattingEdits(
      document: vscode.TextDocument
    ): Promise<vscode.TextEdit[]> {
      const unformatted = document.getText();
      const formatted = await runFormatter(unformatted);

      var firstLine = document.lineAt(0);
      var lastLine = document.lineAt(document.lineCount - 1);
      var textRange = new vscode.Range(
        0,
        firstLine.range.start.character,
        document.lineCount - 1,
        lastLine.range.end.character
      );

      return [vscode.TextEdit.replace(textRange, formatted)];
    },
  });
}

export function deactivate() {}
