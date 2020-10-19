import { FileSorter } from "../file-sorter";
import { SectionHandler } from "../sections-handler";

export class ExtensionsHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;
    dropdownRef: HTMLElement | null | undefined;

    folder: string | null = null;
    category: string | null = null;
    condition: string | null = null;

    fileSorter: FileSorter;

    constructor(fileSorter: FileSorter) {
        super('div.extensions', 'div.extension-list', '.extension-list-item');

        this.fileSorter = fileSorter;

        this.inputRef = this.contentRef?.querySelector('div.extensions-input');
        this.inputRef?.addEventListener('keydown', (event: any) => { 
            if (event.which == 13) {
                this.onEnter(event)
            }
        });

        this.inputRef?.addEventListener('blur', (event: any) => {
            event.target.innerText = '';
        });

        this.dropdownRef = this.contentRef?.querySelector('div.dropdown');
        this.dropdownRef?.addEventListener('click', (event: any) => {
            if (event.target.classList.contains('dropdown')) {
                event.target.classList.toggle('expanded');
                console.log('clicked', event.target);
            }
            else if (event.target.nodeName == 'SPAN') {
                let key = event.target.getAttribute('value');
                if (this.dropdownRef && this.inputRef) {
                    this.dropdownRef.setAttribute('value', key);
                    let valueHolder = this.dropdownRef.querySelector('.value');
                    this.condition = key;
                    if (valueHolder) {
                        valueHolder.innerHTML = event.target.innerHTML;
                        this.inputRef.focus();
                    }
                }
            }
            
        }, false);
        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let value = item.getAttribute('value');
            if (value) {
                this.delete(value);
            }
            if (items.length == 0) {
                this.showTip();
            }
        });

        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length > 0) {
                this.hideTip();
                this.hideOverlay();
            }
        })
    }

    /**
     * Enables this section with the given folder and category string
     * @param folder Active folder string
     * @param category Active category string
     */
    enable(folder: string, category: string) {
        if (this.category == category) {
            return;
        }
        this.hideOverlay();
        this.folder = folder;
        this.category = category;
        this.clearList();

        let extensions = this.getExtensions(this.folder, this.category);

        if (extensions.length > 0) {
            let items = extensions.map((extension: any) => {
                let split = extension.split(':');
                let condition = split[0];
                let text = split[1];
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
        let value = `${condition}:${text}`
        let success = false
        let data = this.getFolders();
        let folder = data[this.folder];
        let extensions = folder.categories[this.category];

        if (extensions.indexOf(value) == -1) {
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

        let data = this.getFolders();
        let folder = data[this.folder];
        let extensions: Array<string> = folder.categories[this.category];

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
        let value = event.target.innerText;

        if (!this.condition) {
            this.dropdownRef?.focus();
            event.preventDefault();
            return;
        }
        if (!value) {
            return;
        }

        let item = this.createListItem(value, this.condition);

        if (this.save(value, this.condition)) {
            this.renderItem(item);
            event.target.innerText = '';
        }
        event.preventDefault();

    }

    private createListItem(value: string, condition?: string): HTMLElement {
        let conditions: any = {
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

        let item = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: innerText,
            attrs: ['value=' + valueText]
        });

        return item;
    }
}