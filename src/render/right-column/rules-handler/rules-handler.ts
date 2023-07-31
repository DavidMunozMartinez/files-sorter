import { FileSorter } from "../../file-sorter";
import { NotificationComponent } from "../../notification-component/notification-component";
import { Utils } from "../../utils";
import { Bind } from 'bindrjs';

let renderer: any = null;

export class RulesHandler {
  folder: string | null = null;
  category: string | null = null;
  condition: string | null = null;

  fileSorter: FileSorter;
  utils: Utils;
  notificationService: NotificationComponent;

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
    renderer = new Bind({
      id: "rules-handler",
      template: require("./rules-handler.html"),
      bind: {
        category: null,
        hideOverlay: false,
        showTip: false,
        conditions: this.conditions,
        activeCondition: null,
        rules: [],
        activeRules: 0
      },
    });

    this.fileSorter = fileSorter;
    this.utils = utils;
    this.notificationService = notificationService;

    renderer.bind.onKeydown = (event: MouseEvent) => {
      if (event.which === 13) {
        this.onEnter(event);
      }
    }

    renderer.bind.showRules = ()  => {
      this.notificationService.showConsecutiveTips(['RULES_TIP', 'GROUP_RULES', 'GROUP_RULE_CHECK']);
    }

    renderer.bind.selectCondition  = (event: MouseEvent, key: string) => {
      renderer.bind.activeCondition = key;
    }

    renderer.bind.removeRule = (rule: any) => {
      const index = renderer.bind.rules.indexOf(rule);
      renderer.bind.rules.splice(index, 1);
      this.delete(rule.value);
      if (renderer.bind.rules.length === 0) {
        renderer.bind.showTip = true;
      }
    }

    renderer.bind.selectRule = (event: MouseEvent, rule: any) => {
      let controlKey = (event.ctrlKey || event.altKey || event.metaKey);      

      if (!controlKey) {
        renderer.bind.activeRules = 0;
        renderer.bind.rules.forEach((_: any) => {
          _.active = false;
        });
      }

      if (controlKey && rule.active) {
        rule.active = false;
        renderer.bind.activeRules--;
      } else {
        rule.active = true;
        renderer.bind.activeRules++;
      }
    }

    renderer.bind.joinConditions = () => {
      this.joinConditions();
    }
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
    renderer.bind.showOverlay = false;
    this.folder = folder;
    this.category = category;
    renderer.bind.rules = [];
    renderer.bind.category = `"${category}"`;

    const extensions = this.utils.getExtensions(this.folder, this.category);

    if (extensions.length > 0) {
      extensions.forEach((extension: any) => {
        if (extension.indexOf(",") > -1) {
          return this.createGroupedListItem(extension);
        }
        return this.createListItem(extension);
      });
      renderer.bind.showTip = false;
    } else {
      renderer.bind.showTip = true;
      renderer.bind.showOverlay = false;
    }
  }

  /**
   * Disables the section by showing the overlay and hiding the section tip, it also
   * sets some global values to null
   */
  disable() {
    renderer.bind.showOverlay = true;
    renderer.bind.showTip = false;

    this.folder = null;
    this.category = null;
  }

  clear() {
    renderer.bind.rules = [];
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
    const condition = renderer.bind.activeCondition;
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

    if (renderer.bind.rules.length > 0) {
      renderer.bind.showTip = false;
      renderer.bind.showOverlay = false;
    }

    if (renderer.bind.rules.length > 2) {
      this.notificationService.showTipIfNeeded("GROUP_RULES");
    }
    event.preventDefault();
  }

  private createListItem(conditionString: string) {
    const split = conditionString.split(":");
    const condition = split[0];
    const value = split[1];

    let innerText = value;
    let valueText = value;
    if (condition && this.conditions[condition]) {
      innerText = this.conditions[condition] + ": " + innerText;
      valueText = condition + ":" + value;
    }

    renderer.bind.rules.push({
      value: valueText,
      display: innerText
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

    renderer.bind.rules.push({
      value: valueText,
      display: innerText
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

    const items = renderer.bind.rules.filter((rule: any) => rule.active);

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
      renderer.bind.rules.push({
        value: newValue,
        display: newText
      });
    }

    let current = items.pop();
    while (current) {
      let index = renderer.bind.rules.indexOf(current);
      renderer.bind.rules.splice(index, 1);
      current = items.pop();
    }

    this.notificationService.showTipIfNeeded("GROUP_RULE_CHECK");
  }

  private breakConditions() {}
}
