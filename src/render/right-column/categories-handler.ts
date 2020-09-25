export class CategoriesHandler {
    elementRef: HTMLElement | null;
    overlayRef: HTMLElement | null | undefined;
    model: HTMLElement | null | undefined;
    items: HTMLElement | null | undefined;
    activeFolder: string | null;

    constructor () {
        this.elementRef = document.querySelector('div.categories');
        this.model = this.elementRef?.querySelector('div.category-input');
        this.items = this.elementRef?.querySelector('smart-hover.category-list');
        this.overlayRef = this.elementRef?.querySelector('div.inactive-overlay');
        this.activeFolder = null;
        this.setupEvents();
    }

    setActiveFolder(folder: string | null) {
        this.activeFolder = folder;
        if (folder) {
            this.hideOverlay();
        }
        else {
            this.showOverlay();
        }
    }

    addCategory() {
        if (this.model) {
            console.log('Adding: ', this.model.innerText);
            this.model.innerText = '';
        }
    }

    private setupEvents() {
        this.model?.addEventListener('keydown', (event: any) => {
            if (event.which == 13) {
                this.addCategory();
                event.preventDefault();
                event.target.blur();
                event.target.focus();
            }
        })
    }

    private hideOverlay() {
        if (this.overlayRef && !this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.add('hiden');
        }
    }

    private showOverlay() {
        if (this.overlayRef && this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.remove('hiden')
        }
    }
}