import { FileSorter } from "../../file-sorter";
import { NotificationComponent } from "../../notification-component/notification-component";
import { Utils } from "../../utils";
import { Bind } from 'bindrjs';
import { Rule, RuleDisplay, RulesHandlerBind } from "./rules-handler.model";

export class RulesHandler {
  folder: string | null = null;
  category: string | null = null;
  condition: string | null = null;

  fileSorter: FileSorter;
  utils: Utils;
  notificationService: NotificationComponent;
  bind!: RulesHandlerBind;

  private conditions: any = {
    starts_with: "Starts with",
    contains: "Contains",
    ends_with: "Ends with",
  };

  constructor(
    fileSorter: FileSorter,
    utils: Utils,
    notificationService: NotificationComponent
  ) {
    const { bind } = new Bind<RulesHandlerBind>({
      id: "rules-handler",
      template: require("./rules-handler.html"),
      bind: {
        category: '',
        showOverlay: false,
        showTip: false,
        conditions: this.conditions,
        activeCondition: '',
        rules: [],
        activeRules: 0,
        activeJoinedRules: 0,

        onKeydown: (event: KeyboardEvent) => {
          if (event.which === 13) {
            this.onEnter(event);
          }
        },
        showRules: () => {
          this.notificationService.showConsecutiveTips(['RULES_TIP', 'GROUP_RULES', 'GROUP_RULE_CHECK']);
        },
        selectCondition: (key: string) => {
          bind.activeCondition = key;
        },
        removeRule: (rule: any) => {
          const index = bind.rules.indexOf(rule);
          bind.rules.splice(index, 1);
          this.delete(rule.value);
          if (bind.rules.length === 0) {
            bind.showTip = true;
          }
        },
        selectRule: (event: MouseEvent, rule: Rule) => {
          let controlKey = (event.ctrlKey || event.altKey || event.metaKey);      
    
          if (!controlKey) {
            bind.activeRules = 0;
            bind.activeJoinedRules = 0;
            bind.rules.forEach((rule: Rule) => {
              rule.active = false;
            });
          }
    
          if (controlKey && rule.active) {
            rule.active = false;
            bind.activeRules--;
            if (rule.value.indexOf(',') > -1) {
              bind.activeJoinedRules--;
            }
          } else {
            rule.active = true;
            bind.activeRules++;
            if (rule.value.indexOf(',') > -1) {
              bind.activeJoinedRules++;
            }
          }
        },
        editRule: (rule: Rule) => {
          // rule.edit = true;
        },
        joinConditions: () => {
          this.joinConditions();
        },
        breakConditions: this.breakConditions.bind(this)
      },
    });

    this.fileSorter = fileSorter;
    this.utils = utils;
    this.notificationService = notificationService;
    this.bind = bind;
  }

  /**
   * Enables this section with the given folder and category string
   * @param folder Active folder string
   * @param category Active category string
   */
  enable(folder: string, category: string) {
    if (this.category === category) {
      return;
    }
    this.bind.showOverlay = false;
    this.folder = folder;
    this.category = category;
    this.bind.rules = [];
    this.bind.category = `"${category}"`;

    const extensions = this.utils.getExtensions(this.folder, this.category);

    if (extensions.length > 0) {
      extensions.forEach((extension: any) => {
        if (extension.indexOf(",") > -1) {
          return this.createGroupedListItem(extension);
        }
        return this.createListItem(extension);
      });
      this.bind.showTip = false;
    } else {
      this.bind.showTip = true;
      this.bind.showOverlay = false;
    }
  }

  /**
   * Disables the section by showing the overlay and hiding the section tip, it also
   * sets some global values to null
   */
  disable() {
    this.bind.showOverlay = true;
    this.bind.showTip = false;

    this.folder = null;
    this.category = null;
  }

  clear() {
    this.bind.rules = [];
  }

  /**
   * Saves in local storage an extension string into the active folder and
   * category, also returns a boolean indicating that it was saved succesfully
   * @param extension Extensoin string to save
   */
  private save(conditionString: string) {
    if (!this.folder || !this.category) {
      return false;
    }
    let success = false;
    const data = this.utils.getFolders();
    const folder = data[this.folder];
    const extensions = folder.categories[this.category];

    if (extensions.indexOf(conditionString) === -1) {
      extensions.push(conditionString);
      localStorage.setItem("folders", JSON.stringify(data));
      this.fileSorter.updateFoldersData();
      success = true;
    }
    return success;
  }

  /**
   * Deletes the given extension string from local storage if it exists
   * @param extension Extension string to delete
   */
  private delete(extension: string) {
    if (!this.folder || !this.category) {
      return;
    }

    const data = this.utils.getFolders();
    const folder = data[this.folder];
    const extensions: string[] = folder.categories[this.category];

    if (extensions.indexOf(extension) > -1) {
      extensions.splice(extensions.indexOf(extension), 1);
    }

    localStorage.setItem("folders", JSON.stringify(data));
    this.fileSorter.updateFoldersData();
  }

  /**
   * Executed when the section input trigger the enter key event
   * @param event Native DOM event
   */
  private onEnter(event: any) {
    const value = event.target.innerText;
    const condition = this.bind.activeCondition;
    if (!condition) {
      event.preventDefault();
      this.notificationService.notify({
        message: "Please select a condition",
        type: "info",
        timer: 5000,
      });
      return;
    }

    if (!value) {
      this.notificationService.notify({
        message: "Please enter a value",
        type: "info",
        timer: 5000,
      });
      return;
    }

    const conditionString = `${condition}:${value}`;
    if (this.save(conditionString)) {
      this.createListItem(conditionString);
      event.target.innerText = "";
    }

    if (this.bind.rules.length > 0) {
      this.bind.showTip = false;
      this.bind.showOverlay = false;
    }

    if (this.bind.rules.length > 2) {
      this.notificationService.showTipIfNeeded("GROUP_RULES");
    }
    event.preventDefault();
  }

  private createListItem(conditionString: string) {
    const [condition, value] = conditionString.split(':');

    let innerText = value;
    let valueText = value;
    if (condition && this.conditions[condition]) {
      innerText = this.conditions[condition] + ": " + innerText;
      valueText = condition + ":" + value;
    }

    this.bind.rules.push({
      value: valueText,
      display: innerText,
      displayObjects: this.makeDisplayObject(conditionString),
      active: false,
      edit: false,
    });
  }

  private getConditionData(conditionString: string) {
    const split = conditionString.split(":");
    const condition = split[0];
    const value = split[1];

    let innerText = value;
    let valueText = value;
    if (condition && this.conditions[condition]) {
      innerText = this.conditions[condition] + ": " + innerText;
      valueText = condition + ":" + value;
    }
    return { innerText, valueText };
  }

  private createGroupedListItem(conditionString: string) {
    let innerText = "";
    let valueText = conditionString;
    let conditions = conditionString.split(",");
    conditions.forEach((condition: string, i: number) => {
      let data = this.getConditionData(condition);
      innerText += data.innerText;
      if (i != conditions.length - 1) {
        innerText += " and ";
      }
    });



    this.bind.rules.push({
      value: valueText,
      display: innerText,
      displayObjects: this.makeDisplayObject(conditionString),
      active: false,
      edit: false,
    });
  }

  /**
   * Turns a group of selected conditions into a single condition, AKA creates an AND condition where all conditions within
   * the group must be true in order to the group to be considered as "true"
   */
  private joinConditions() {
    let newText = "";
    let newValue = "";
    let toDelete: string[] = [];

    const items = this.bind.rules.filter((rule: any) => rule.active);

    items.forEach((item: any, i: number) => {
      let valueAttr = item.value;
      if (valueAttr && valueAttr.indexOf(",") > -1) {
        newText += item.display;
        newValue += valueAttr;
        toDelete.push(valueAttr);
      } else {
        let data = valueAttr?.split(":") || [];
        let condition = data[0];
        let value = data[1];
        newValue += condition + ":" + value;
        newText += this.conditions[condition] + ": " + value;
        toDelete.push(valueAttr);
      }

      if (i != items.length - 1) {
        newValue += ",";
        newText += " and ";
      }
    });

    toDelete.forEach((conditionString) => {
      this.delete(conditionString);
    });

    if (this.save(newValue)) {
      this.bind.rules.push({
        value: newValue,
        display: newText,
        displayObjects: this.makeDisplayObject(newValue),
        active: false,
        edit: false,
      });
    }

    let current = items.pop();
    while (current) {
      let index = this.bind.rules.indexOf(current);
      this.bind.rules.splice(index, 1);
      current = items.pop();
    }

    this.notificationService.showTipIfNeeded("GROUP_RULE_CHECK");
  }

  private breakConditions() {
    let groups = this.bind.rules.filter((rule: any) => rule.active && rule.value.indexOf(',') > -1);
    groups.forEach((group: Rule) => {
      let rules: string[] = group.value.split(',');
      rules.forEach((ruleValue) => {
        let [condition, value] = ruleValue.split(':');
        if (this.save(ruleValue)) {
          this.bind.rules.push({
            value: ruleValue,
            display: this.conditions[condition] + ': ' + value,
            displayObjects: this.makeDisplayObject(ruleValue),
            active: false,
            edit: false,
          });
        }
      });
      this.delete(group.value);
    });

    // Delete in different iteration to not affect the array
    let current = groups.pop();
    while (current) {
      let index = this.bind.rules.indexOf(current);
      this.bind.rules.splice(index, 1);
      current = groups.pop();
    }
  }

  private makeDisplayObject(value: string): RuleDisplay[] {
    const conditionStrings = value.split(',');
    const ruleDisplays: RuleDisplay[] = [];
    conditionStrings.forEach((conditionString: string) => {
      const [condition, value] = conditionString.split(':');
      ruleDisplays.push({
        condition: this.conditions[condition],
        value,
      });
    });
    return ruleDisplays;
  }
}
