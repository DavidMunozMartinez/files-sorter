export enum Tips {
  // This tips become HTML so be careful with these
  AUTO_SORT_ON_OFF = 'Use the <i class="material-icons">sync</i> icon to set the folder on auto-sort, meaning when a file is placed on that folder, the rules will be checked and the file will be automatically moved if needed',
  MANUAL_SORT = 'Once you are happy with your rules set, use the <i class="material-icons">task_alt</i> icon to manually apply your sorting rules to the folder',
  REORDER_CATEGORIES = "Re-order your rules folders with drag and drop, when a file is sorted, ruled folders are checked in order from top to bottom and the file its placed on the first available match",
  GROUP_RULES = "You can group multiple conditions into one, select multiple with Ctrl + Click and use the group button that appears at the bottom",
  GROUP_RULE_CHECK = "All conditions within a group need to pass for the entire group to pass when the rule check is performed",
  DELETE = "Removing anything from a list wont do anything to your files or folders, it will just delete the configuration for it",
}
