export class RulesHandler {
    contentRef!: HTMLElement;
    // VIEW_CONTAINER: HTMLElement;
    folder: string | null = null;
    category: string | null = null;

    constructor(contentSelector: string) {
        const content: HTMLElement | null = document.querySelector(contentSelector);
        if (content) this.contentRef = content;

        this.contentRef.addEventListener('click', () => {
            this.disable();
        });
    }


    enable(folder: string, category: string) {
        this.toggleView();
    }

    disable() {
        this.toggleView();
    }

    private toggleView() {
        if (this.contentRef.classList.contains('hidden')) {
            this.contentRef.classList.toggle('hidden');
        }
    }
}