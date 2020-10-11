export class SectionHandler {

    contentRef: HTMLElement | null;
    // listRef: HTMLElement | null;
    overlayRef: HTMLElement | null;
    tipRef: HTMLElement | null;

    constructor(containerQuerySelector: string, listQuerySelector: string) {
        this.contentRef = document.querySelector(containerQuerySelector);
        // this.listRef = this.contentRef?.querySelector(listQuerySelector) || null;
        this.overlayRef = this.contentRef?.querySelector('.inactive-overlay') || null;
        this.tipRef = this.contentRef?.querySelector('.section-tip') || null;
    }

    /**
     * Creates an HTML element based on an options object
     * @param tag Tag name
     * @param opts Options object that define the element
     */
    makeElement(tag: string, opts: any): HTMLElement {
        let element = document.createElement(tag);
        if (opts.classList && opts.classList.length && opts.classList.length > 0) {
            element.classList.add(...opts.classList)
        }
        if (opts.click && typeof (opts.click) === 'function') {
            element.addEventListener('click', (event: any) => {
                opts.click(event);
            });
        }
        if (opts.innerHTML) {
            element.innerHTML = opts.innerHTML;
        }
        if (opts.children && opts.children.length && opts.children.length > 0) {
            element.prepend(...opts.children);
        }
        return element;
    }

    /**
     * Makes the tip for this section visible
     */
    showTip() {
        if (this.tipRef && !this.tipRef.classList.contains('active')) {
            this.tipRef.classList.add('active');
        }
    }

    /**
     * Makes the tip for this section invisible
     */
    hideTip() {
        if (this.tipRef && this.tipRef.classList.contains('active')) {
            this.tipRef.classList.remove('active');
        }
    }

    /**Hides the overlay that blocks the section */
    hideOverlay() {
        if (this.overlayRef && !this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.add('hiden');
        }
    }

    /**Shows an overlay that blocks the section */
    showOverlay() {
        if (this.overlayRef && this.overlayRef.classList.contains('hiden')) {
            this.overlayRef.classList.remove('hiden');
        }

    }
    
}