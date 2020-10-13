import { SectionHandler } from "../sections-handler";

export class ExtensionsHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;

    folder: string | null = null;
    category: string | null = null;

    constructor() {
        super('div.extensions', 'div.extension-list', '.extension-list-item');
        this.inputRef = this.contentRef?.querySelector('div.extensions-input');
        this.inputRef?.addEventListener('keydown', (event: any) => { 
            if (event.which == 13) {
                this.onEnter(event)
            }
        });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let value = item.getAttribute('value');
            if (value) {
                this.delete(value);
            }
            if (items.length == 1) {
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
                return this.makeElement('div', {
                    classList: ['extension-list-item'],
                    innerHTML: extension
                });
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

    disable() {
        this.showOverlay();
        this.hideTip();

        this.folder = null;
        this.category = null;
    }

    private save(extension: string) {
        if (!this.folder || !this.category) {
            return false;
        }

        let success = false
        let data = this.getFolders();
        let folder = data[this.folder];
        let extensions = folder.categories[this.category];

        if (extensions.indexOf(extension) == -1) {
            extensions.push(extension);
            localStorage.setItem('folders', JSON.stringify(data));
            success = true;
        }
        return success
    }

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
    }

    private onEnter(event: any) {
        let value = event.target.innerText;
        let item = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: value,
            attrs: ['value:' + value]
        });

        if (this.save(value)) {
            this.renderItem(item);
            event.target.innerText = '';
        }
        // this.save(value);
        event.preventDefault();

    }
}