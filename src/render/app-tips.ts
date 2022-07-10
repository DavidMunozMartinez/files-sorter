export enum Tips {
  // This tips become HTML so be careful with these
  FOLDERS_TIP = `Click the icon <i class="material-icons"style="">add</i> to select a folder and start organizing!</br></br>`,
  AUTO_SORT_ON_OFF = `
    <i class="material-icons">visibility</i> Incoming files will be rule checked and moved if needed.
    <br>
    <i class="material-icons">visibility_off</i> Incoming files won't be rule checked or moved`,
  MANUAL_SORT = `<i class="material-icons">task_alt</i> Manually apply the folder rule set ONCE.`,
  REMOVE_CONFIG = `<i class="material-icons">close</i> Remove the configuration item
    <br>
    This will not do anything to your file system, it will only remove the configuration item from the app`,
  CATEGORIES_TIP = `This section shows your folders within your automated folders, you can add as many rules as you want to each`,
  REORDER_CATEGORIES = `You can re-order your folders, when rules are checked they are checked from top to bottom`,
  RULES_TIP = `Here you define file rules for this folder.</br></br>Files names (including file extension) will be checked against each rule`,
  GROUP_RULES = `Group multiple conditions:
    <br>
    <br>
    - Multi-select with "Ctrl + Click"
    <br>
    - Click the group button that appears to group all selected conditions`,
  GROUP_RULE_CHECK = `All conditions within a group need to pass for the entire group to pass when the rule check is performed`,
  DELETE = `Removing anything from a list wont do anything to your files or folders, it will just delete the configuration for it`,
}
