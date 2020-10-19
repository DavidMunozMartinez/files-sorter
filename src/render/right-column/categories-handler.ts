import { FileSorter } from '../file-sorter';
import { SectionHandler } from '../sections-handler';
import { ExtensionsHandler } from './extensions-handler';

export class CategoriesHandler extends SectionHandler {
    inputRef: HTMLElement | null | undefined;
    folder: string | null = null;
    extensionHandler: ExtensionsHandler;
    fileSorter: FileSorter;
    constructor(fileSorter: FileSorter) {
        super('div.categories', 'smart-hover.category-list', '.category-list-item');
        this.fileSorter = fileSorter;
        this.extensionHandler = new ExtensionsHandler(fileSorter);
        this.inputRef = this.contentRef?.querySelector('div.category-input');
        this.inputRef?.addEventListener('keydown', (event: any) => {
            if (event.which == 13) {
                this.onEnter(event);
            }
        });

        this.inputRef?.addEventListener('blur', (event: any) => {
            event.target.innerText = '';
        })

        // Executed when a new item is added to the section list
        this.on('added', (item: HTMLElement, items: NodeList) => {
            if (items.length == 1) {
                this.hideTip();
                this.select(item);
            }
        });

        // Executed when a list item is selected
        this.on('selected', (item: HTMLElement) => {
            let category = item.getAttribute('value');
            if (this.folder && category) {
                this.extensionHandler.enable(this.folder, category);
                this.hideOverlay();
            }
        });

        // Executed when an item weill be removed from the sectin list
        this.on('removed', (item: HTMLElement, items: NodeList) => {
            let category = item.getAttribute('value');
            if (items.length == 0) {
                this.showTip();
                this.extensionHandler.clearList();
                this.extensionHandler.showOverlay();
                this.extensionHandler.hideTip();
            }

            if (category == this.extensionHandler.category) {
                this.extensionHandler.clearList();
                this.extensionHandler.showOverlay();
                this.extensionHandler.hideTip();
            }

            if (category) {
                this.delete(category);
            }
        });
    }

    /**
     * Enables the category section with the given folder string
     * @param folder Folder string path
     */
    enable (folder: string) {
        if (this.folder == folder) {
            return;
        }
        this.hideOverlay();

        this.folder = folder;
        this.clearList();
        let categories = this.getCategories(folder);
        let categoryList = Object.keys(categories);

        // If the category list is greater than 0 we render it and remove the section tip
        if (categoryList.length > 0) {
            let items: Array<HTMLElement> = categoryList.map((category) => {
                return this.createListElement(category);
            });

            this.renderList(items);
            this.hideTip();
        }
        // If not, the section is enabled but we show the tip
        else {
            this.inputRef?.focus();
            this.showTip();
            this.hideOverlay();
            this.extensionHandler.clearList();
            this.extensionHandler.disable();
        }
    }

    /**
     * Disables the categories section by showing the overlay and hiding the tip
     * it also sets folder to null and clears and disables the extensions section
     */
    disable() {
        this.showOverlay();
        this.hideTip();
        this.folder = null;

        this.extensionHandler.clearList()
        this.extensionHandler.disable();
    }

    /**
     * Executed when the enter key is pressed on the section input
     * @param event Native DOM event
     */
    private onEnter(event: any) {
        if (!this.inputRef) {
            return;
        }

        let value = this.inputRef.innerText;
        if (this.save(value)) {
            let item = this.createListElement(value);
            this.renderItem(item);
            this.inputRef.innerText = '';
        }
        event.preventDefault();
    }

    /**
     * Saves in local storage a category string on the current active folder
     * @param category Category string to save
     */
    private save(category: string) {
        if (!this.folder || category == '') {
            return false;
        }
        let success = false;
        let folders = this.getFolders();
        let folder = folders[this.folder];
        let categories = folder.categories;

        if (!categories[category]) {
            categories[category] = [];
            localStorage.setItem('folders', JSON.stringify(folders));
            this.fileSorter.updateFoldersData();
            success = true;
        }

        return success;
    }

    /**
     * Deletes the category and its data from local storage
     * @param category Category string to delete
     */
    private delete(category: string) {
        if (!this.folder) {
            return;
        }

        let folders = this.getFolders();
        let folder = folders[this.folder];

        if (folder.categories && folder.categories[category]) {
            delete folder.categories[category];
            localStorage.setItem('folders', JSON.stringify(folders));
            this.fileSorter.updateFoldersData();

        }
    }

    /**
     * Creates an HTML element that will be rendered in the section list
     * @param value Category string value
     */
    private createListElement (value: string): HTMLElement {
        let folderIcon = this.makeElement('i', {
            classList: ['material-icons'],
            innerHTML: 'folder'
        });

        let valueHolder = this.makeElement('span', {
            innerHTML: value
        });

        let item = this.makeElement('div', {
            classList: ['category-list-item'],
            attrs: ['value=' + value],
            children: [folderIcon, valueHolder],
        });

        this.dragHandle(item);

        return item;
    }

    private dragHandle(item: HTMLElement) {
        let mousedown = false;
        let startY = 0;
        let steps: { top: any; step: any; }[] = [];

        let prev: any = {
            step: 0,
            element: null,
            index: 0
        };

        let currentStep = 0;

        let next: any = {
            step: 0,
            element: null,
            index: 0
        };

        let dropPos = 0;
        let current = 0;

        let siblings: any = [];

        item.addEventListener('mousedown', (event: any) => {
            this.select(item);
            mousedown = true;
            startY = event.clientY;
            dropPos = event.target.offsetTop;
            currentStep = dropPos + event.target.clientHeight/2;

            defineSteps();

            console.log(currentStep);
            console.log(steps);
        });

        item.addEventListener('mousemove', (event: any) => {
            if (mousedown) {
                // return;
                let y = (event.clientY - startY);
                current = currentStep + y;

                item.style.zIndex = '5';
                item.style.transform = `translateY(${y}px)`;

                if (next.step && current > next.step) {
                    this.swapNodes(item, next.element);
                }

                if (prev.step && current < prev.step) {
                    this.swapNodes(item, prev.element);
                }
            }

        });

        item.addEventListener('mouseup', () => {
            drop()
        });

        item.addEventListener('mouseleave', () => {
            drop();
        });
        
        function drop() {
            item.style.transform = `translateY(${0}px)`;
            mousedown = false;
            item.style.zIndex = '0';
        }

        const defineSteps = () => {
            steps = [];
            let stepIndex = 0;
            siblings = this.listRef?.querySelectorAll(this.listItemSelector);
            siblings?.forEach((sibling: any, index: any) => {
                let step = {
                    top: sibling.offsetTop,
                    step: sibling.offsetTop + (sibling.clientHeight/2) 
                }

                if (dropPos == step.top) {
                    stepIndex = index;
                }

                steps.push(step);
            });

            prev = {};
            next = {};

            if (steps[stepIndex - 1]) {
                prev.step = steps[stepIndex - 1].step;
                prev.index = stepIndex - 1;
                prev.element = siblings[stepIndex - 1];
            }
            if (steps[stepIndex + 1]) {
                next.step = steps[stepIndex + 1].step;
                next.index = stepIndex + 1
                next.element = siblings[stepIndex + 1];
            }
        }
    }

    private swapNodes(n1: HTMLElement, n2: HTMLElement) {
        var p1 = n1.parentNode;
        var p2 = n2.parentNode;
        let i1: number = 0, i2: number = 0;
        if ( !p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1) ) return;
    
        for (var i = 0; i < p1.children.length; i++) {
            if (p1.children[i].isEqualNode(n1)) {
                i1 = i;
            }
        }
        for (var i = 0; i < p2.children.length; i++) {
            if (p2.children[i].isEqualNode(n2)) {
                i2 = i;
            }
        }
    
        if ( p1.isEqualNode(p2) && i1 < i2 ) {
            i2++;
        }
        p1.insertBefore(n2, p1.children[i1]);
        p2.insertBefore(n1, p2.children[i2]);
    }
}