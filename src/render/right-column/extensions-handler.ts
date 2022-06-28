import { FileSorter } from "../file-sorter";
import { NotificationComponent } from "../notification-component/notification-component";
import { SectionHandler } from "../sections-handler";
import { Utils } from "../utils";
// import { AddRulesView } from './add-rules-modal/add-rules.component';

export class ExtensionsHandler extends SectionHandler {
    inputRef: HTMLElement | null;
    conditionRef: HTMLElement | null;
    joinConditionsRef: HTMLElement | null;
    rulesForRef: HTMLElement | null;

    folder: string | null = null;
    category: string | null = null;
    condition: string | null = null;

    fileSorter: FileSorter;
    utils: Utils;
    notificationService: NotificationComponent;

    private conditions: any = {
        starts_with: 'Starts with',
        contains: 'Contains',
        ends_with: 'Ends with'
    };

    constructor(fileSorter: FileSorter, utils: Utils, notificationService: NotificationComponent) {
        super('div.extensions', 'div.extension-list', '.extension-list-item');

        this.fileSorter = fileSorter;
        this.utils = utils;
        this.notificationService = notificationService;
        this.inputRef = this.contentRef?.querySelector('div.extensions-input');
        this.rulesForRef = document.getElementById('rulesFor');
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which === 13) {
                this.onEnter(event)
            }
        });

        this.inputRef?.addEventListener('blur', (event: any) => {
            event.target.innerText = '';
        });

        this.conditionRef = this.contentRef.querySelector('div.dropdown');
        if (this.conditionRef) {
            this.utils.fsDropdown(this.conditionRef);
        }
        this.joinConditionsRef = this.contentRef.querySelector('div.input-container.join-conditions');
        if (this.joinConditionsRef) {
            this.joinConditionsRef?.classList.add('hide');
            this.joinConditionsRef.addEventListener('click', () => {
                if (this.multiSelected && this.multiSelected.length > 1) {
                    this.joinConditions(this.multiSelected);
                }
            });
        }
        this.multiSelectable = true;

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            const value = item.getAttribute('value');
            if (value) {
                this.delete(value);
            }
            if (items.length === 0) {
                this.showTip();
            }
        });

        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length > 0) {
                this.hideTip();
                this.hideOverlay();
            }

            if (items.length > 2) {
              this.notificationService.showTipIfNeeded('GROUP_RULES')
            }
        });

        this.on('selected', (selected: any) => {
            if (selected.length > 1) {
                this.joinConditionsRef?.classList.remove('hide');
            } else {
                this.joinConditionsRef?.classList.add('hide');
            }
        });
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
        this.hideOverlay();
        this.folder = folder;
        this.category = category;
        this.clearList();
        if (this.rulesForRef) this.rulesForRef.innerText = ` "${category}" `;
        const extensions = this.getExtensions(this.folder, this.category);

        if (extensions.length > 0) {
            const items = extensions.map((extension: any) => {
                if (extension.indexOf(',') > -1) {
                    return this.createGroupedListItem(extension);
                }
                return this.createListItem(extension);
            });
            this.hideTip();
            this.renderList(items);
        }

        else {
            this.inputRef?.focus();
            this.showTip();
            this.hideOverlay();
        }
    }

    /**
     * Disables the section by showing the overlay and hiding the section tip, it also
     * sets some global values to null
     */
    disable() {
        this.showOverlay();
        this.hideTip();

        this.folder = null;
        this.category = null;
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
        // const value = `${condition}:${text}`;
        let success = false;
        const data = this.getFolders();
        const folder = data[this.folder];
        const extensions = folder.categories[this.category];

        if (extensions.indexOf(conditionString) === -1) {
            extensions.push(conditionString);
            localStorage.setItem('folders', JSON.stringify(data));
            this.fileSorter.updateFoldersData();
            success = true;
        }
        return success;
    }

    /**
     * Deletes the given extension string from local storage if it exists
     * @param extension Extension string to delete
     */
    private delete (extension: string) {
        if (!this.folder || !this.category) {
            return;
        }

        const data = this.getFolders();
        const folder = data[this.folder];
        const extensions: string[] = folder.categories[this.category];

        if (extensions.indexOf(extension) > -1) {
            extensions.splice(extensions.indexOf(extension), 1);
        }

        localStorage.setItem('folders', JSON.stringify(data));
        this.fileSorter.updateFoldersData();
    }

    /**
     * Executed when the section input trigger the enter key event
     * @param event Native DOM event
     */
    private onEnter(event: any) {
        const value = event.target.innerText;
        const condition = this.conditionRef?.getAttribute('value');
        if (!condition) {
            event.preventDefault();
            this.notificationService.notify({
                message: 'Please select a condition',
                type: 'info',
                timer: 5000 
            });
            return;
        }

        if (!value) {
            this.notificationService.notify({
                message: 'Please enter a value',
                type: 'info',
                timer: 5000 
            });
            return;
        }

        const conditionString = `${condition}:${value}`;
        const item = this.createListItem(conditionString);
        if (this.save(conditionString)) {
            this.renderItem(item);
            event.target.innerText = '';
        }
        event.preventDefault();

    }

    private createListItem(conditionString: string): HTMLElement {
        const split = conditionString.split(':');
        const condition = split[0];
        const value = split[1];

        let innerText = value;
        let valueText = value;
        if (condition && this.conditions[condition]) {
            innerText = this.conditions[condition] + ': ' + innerText;
            valueText = condition + ':' + value;
        }

        const item = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: innerText,
            attrs: ['value=' + valueText],
        });

        return item;
    }

    private getConditionData(conditionString: string) {
        const split = conditionString.split(':');
        const condition = split[0];
        const value = split[1];

        let innerText = value;
        let valueText = value;
        if (condition && this.conditions[condition]) {
            innerText = this.conditions[condition] + ': ' + innerText;
            valueText = condition + ':' + value;
        }
        return { innerText, valueText };
    }

    private createGroupedListItem(conditionString: string) {
        let innerText = '';
        let valueText = conditionString;
        let conditions = conditionString.split(',');
        conditions.forEach((condition: string, i: number) => {
            let data = this.getConditionData(condition);
            innerText += data.innerText;
            if (i != conditions.length - 1) {
                innerText += ' and '
            } 
        });

        return this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: innerText,
            attrs: ['value=' + valueText]
        });
    }

    /**
     * Turns a group of selected conditions into a single condition, AKA creates an AND condition where all conditions within
     * the group must be true in order to the group to be considered as "true"
     */
    private joinConditions(items: Element[]) {
        let newText = '';
        let newValue = '';
        let toDelete: string[] = [];
        items.forEach((item: any, i) => {
            let valueAttr = item.getAttribute('value');
            if (valueAttr && valueAttr.indexOf(',') > -1) {
                newText += item.innerText.split('\n')[1];
                newValue += valueAttr;
                toDelete.push(valueAttr);
            } else {
                let data = valueAttr?.split(':') || [];
                let condition = data[0];
                let value = data[1]
                newValue += condition + ':' + value;
                newText += this.conditions[condition] + ': ' + value;
                toDelete.push(valueAttr);
            }
            if (i != items.length - 1) {
                newValue += ',';
                newText += ' and ';
            }
        });

        let newElement = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: newText,
            attrs: ['value=' + newValue]
        });
        items.forEach((item) => {
            this.clearItem(<HTMLElement>item);
        });

        toDelete.forEach((conditionString) => {
            this.delete(conditionString);
        })

        if (this.save(newValue)) {
            this.renderItem(newElement);
        }

        this.notificationService.showTipIfNeeded('GROUP_RULE_CHECK');
    }
}