// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "GGSG" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "ggsg.generateGettersAndSetters",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const editor = vscode.window.activeTextEditor;
      let structName = "";
      const getters: string[] = [];
      const setters: string[] = [];

      if (editor) {
        const lines = editor.document.getText(editor.selection).split("\n");
        for (let line = 0; line < lines.length; line++) {
          // first line must be a struct definition
          if (line === 0) {
            const matches = lines[line].match(/type\s(.*)\sstruct/);
            if (matches) {
              structName = matches[1];
            } else {
              vscode.window.showErrorMessage(
                `Invalid selection. First line must be a Go struct definition.`
              );
              return;
            }
            continue;
          }
          // all good, lets create getters and setters
          const values = [...lines[line].matchAll(/(\*?\w)+/g)];
          if (values.length >= 2) {
            // Might be a valid line
            const receiver = structName.toLowerCase();
            const rawKey = values[0][0];
            const displayKey = rawKey[0].toUpperCase() + rawKey.slice(1);
            const type = values[1][0];
            // push function to getters
            getters.push(
              `func (${receiver} *${structName}) Get${displayKey}() ${type} ` +
                `{\n\treturn ${receiver}.${rawKey}\n}`
            );
            // push function to setters
            setters.push(
              `func (${receiver} *${structName}) Set${displayKey}(${rawKey} ${type}) *${structName} ` +
                `{\n\t${receiver}.${rawKey} = ${rawKey}\n\treturn ${receiver}\n}`
            );
          }
        }
      }

      editor?.edit((editBuilder) => {
        editBuilder.insert(
          new vscode.Position(editor.document.lineCount + 1, 0),
          "\n" + getters.join("\n\n") + "\n\n" + setters.join("\n\n")
        );
      });

      if (getters.length + setters.length >= 1) {
        vscode.window.showInformationMessage(
          `Generated ${getters.length} getters and ${setters.length} setters.`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
