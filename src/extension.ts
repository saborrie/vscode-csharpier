import * as vscode from "vscode";
import * as cp from "child_process";

const outputchannel = vscode.window.createOutputChannel("Csharpier");

function format(input: string): Promise<string | null> {
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
      if (output === input) {
        resolve(null);
      } else {
        resolve(output);
      }
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
      return await provideEdits(document);
    },
  });
}

async function provideEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
  outputchannel.appendLine(`Formatting started.`);
  const hrStart = process.hrtime();
  const result = await format(document.getText());
  if (!result) {
    return [];
  }
  const hrEnd = process.hrtime(hrStart);
  outputchannel.appendLine(`Formatting completed in ${hrEnd[1] / 1000000}ms.`);
  return [vscode.TextEdit.replace(fullDocumentRange(document), result)];
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
  const lastLineId = document.lineCount - 1;
  return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

export function deactivate() {}
