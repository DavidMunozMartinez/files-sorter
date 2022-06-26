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
        this.contentRef.classList.toggle('hidden');
        // this.toggleView();
    }

    disable() {
        this.contentRef.classList.toggle('hidden');
        // this.toggleView();
    }

    private toggleView() {
        this.contentRef.classList.toggle('hidden');
    }
}