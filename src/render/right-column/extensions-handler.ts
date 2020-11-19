import { FileSorter } from "../file-sorter";
import { SectionHandler } from "../sections-handler";
import { Utils } from "../utils";
// import { AddRulesView } from './add-rules-modal/add-rules.component';

export class ExtensionsHandler extends SectionHandler {
    inputRef: HTMLElement | null;
    conditionRef: HTMLElement | null;

    folder: string | null = null;
    category: string | null = null;
    condition: string | null = null;

    fileSorter: FileSorter;
    utils: Utils;

    constructor(fileSorter: FileSorter, utils: Utils) {
        super('div.extensions', 'div.extension-list', '.extension-list-item');

        this.fileSorter = fileSorter;
        this.utils = utils;

        this.inputRef = this.contentRef?.querySelector('div.extensions-input');
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

                const index = Array.prototype.indexOf.call(items, item);
                if (index < items.length - 1) {
                    const operand = this.createOperandItem();
                    this.renderItem(operand, {
                        silent: true,
                        removable: false,
                        selectable: false
                    });
                }
            }
        })
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

        const extensions = this.getExtensions(this.folder, this.category);

        if (extensions.length > 0) {
            const items = extensions.map((extension: any) => {
                const split = extension.split(':');
                const condition = split[0];
                const text = split[1];
                return this.createListItem(text, condition);
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
    private save(text: string, condition: string) {
        if (!this.folder || !this.category) {
            return false;
        }
        const value = `${condition}:${text}`;
        let success = false;
        const data = this.getFolders();
        const folder = data[this.folder];
        const extensions = folder.categories[this.category];

        if (extensions.indexOf(value) === -1) {
            extensions.push(value);
            localStorage.setItem('folders', JSON.stringify(data));
            this.fileSorter.updateFoldersData();
            success = true;
        }
        return success
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
            return;
        }

        if (!value) {
            return;
        }

        const item = this.createListItem(value, condition);

        if (this.save(value, condition)) {
            this.renderItem(item);
            event.target.innerText = '';
        }
        event.preventDefault();

    }

    private createListItem(value: string, condition?: string): HTMLElement {
        const conditions: any = {
            starts_with: 'Starts with',
            contains: 'Contains',
            ends_with: 'Ends with'
        };

        let innerText = value;
        let valueText = value;
        if (condition && conditions[condition]) {
            innerText = conditions[condition] + ': ' + innerText;
            valueText = condition + ':' + value;
        }

        const item = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: innerText,
            attrs: ['value=' + valueText],
            click: () => {
                // const modal = new AddRulesView(document.body);
            }
        });

        return item;
    }

    private createOperandItem() {
        const item = this.makeElement('div', {
            classList: ['extension-list-item', 'operand'],
            innerHTML: 'or',
            attrs: ['value=or']
            // click: () => {
            //     console.log('clicked');
            // }
        });

        return item;
    }
}