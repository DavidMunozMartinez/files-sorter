import { SectionHandler } from "../sections-handler";

export class ExtensionsHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;

    folder: string | null = null;
    category: string | null = null;

    constructor() {
        super('div.extensions', 'div.extension-list', '.extension-list-item');
        this.inputRef = this.contentRef?.querySelector('div.extensions-input');
        this.inputRef?.addEventListener('keydown', (event) => { this.inputKeydown(event) });

        this.on('removed', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.showTip();
            }
        });
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

    private storeExtension(value: string) {
        if (!this.folder || !this.category) {
            return;
        }

        let data = this.getFolders();
        let folder = data[this.folder];
        let extensions = folder.categories[this.category];

        if (extensions.indexOf(value) == -1) {
            extensions.push(value);
        }
        localStorage.setItem('folders', JSON.stringify(data));
    }

    private inputKeydown(event: any) {
        if (event.which != 13) {
            return;
        }
        let target = event.target;
        let value = event.target.innerText;
        let item = this.makeElement('div', {
            classList: ['extension-list-item'],
            innerHTML: value
        });

        this.renderItem(item);
        this.storeExtension(value);
        event.preventDefault();
        target.blur();
        target.focus();
        this.hideTip();
        if (this.inputRef) {
            this.inputRef.innerText = '';
        }
    }
}