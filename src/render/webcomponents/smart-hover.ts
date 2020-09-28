export class SmartHover extends HTMLElement {
    private props = ['top', 'left', 'height', 'width'];
    private shadowAnimationMS: number = 180;
    // Used to compare and determine if the contents of the container have changed so we can re-apply
    // our children listeners.
    private contents: string = '';
    private siblingsActive: boolean = false;

    // This element is the one that will be moving over the child elements, the 'smart' hover
    shadow!: HTMLElement;
    // Current element under our smart hover
    active: HTMLElement | null = null;
    // Query selector to filter which children can be hovered
    query: string | null = null;

    connectedCallback() {
        this.query = this.getAttribute('query-selector');
        // Applies the necessary listeners to the childs of the container
        this.containerListeners();
        this.childrenListeners();
        // Creates the shadow element that wil be used to hover over elements
        this.shadow = this.createShadow();

        // Append shadow if it contains hoverable elements
        if (this.getChildren().length > 0) {
            this.safeAppendShadow();
        }
        this.contents = this.innerText;
    }

    showShadow() {
        this.shadow.style.opacity = '0';
        this.shadow.style.display = 'block';
        this.shadow.style.opacity = '1';
    }

    hideShadow(callback?: any) {
        this.shadow.style.opacity = '0';
        setTimeout(() => {
            if (callback) {
                callback();
            }
        }, this.shadowAnimationMS);
    }

    private containerListeners() {
        this.addEventListener('mouseenter', (event: any) => this.containerMouseEnter(event));
        this.addEventListener('mouseleave', (event: any) => this.containerMouseLeave(event));
        this.addEventListener('mousemove', (event: any) => this.containerMouseMove(event));
    }

    private containerMouseEnter(event: any) {
        // Re-apply listeners if the contents has changed
        let children = this.getChildren();
        // If we have no child we remove the shadow, also if we get to this event and we have a defined active element
        // it means that the element was removed on the spot and the mouse enter was triggered on the container
        if (children.length == 0 || this.active) {
            this.hideShadow(() => {
                this.safeRemoveShadow();
            })
            return;
        }

        this.safeAppendShadow();
    }

    private containerMouseLeave(event: any) {
        this.safeRemoveShadow();
        this.siblingsActive = false;
    }

    private containerMouseMove(event: any) {
        // If the contents changed during our movements, we update our listeners
        if (this.contents != this.innerText) {
            this.childrenListeners();
        }
        this.contents = this.innerText;
    }

    /**
     * Applies mouse events to container children, these events handle changing the shadow position and size
     */
    private childrenListeners() {
        let children: Array<any> = this.getChildren();
        children.map((child) => {
            child.removeEventListener('mouseenter', this.childMouseEnter.bind(this), false);
            child.removeEventListener('mouseleave', this.childMouseLeave.bind(this), false);

            child.addEventListener('mouseenter', this.childMouseEnter.bind(this), false);
            child.addEventListener('mouseleave', this.childMouseLeave.bind(this), false);
        });
    }

    /**
     * Triggered when a child node triggers a mouseenter event
     * @param event DOM event
     */
    private childMouseEnter(event: any) {
        // Re-apply listeners if the container content changed
        if (this.contents !== this.innerText) {
            this.childrenListeners();
        }

        if (event && event.target) {
            let rect = this.getRectangle(event.target);
            this.applyPosition(rect, this.siblingsActive);
            this.showShadow();
            this.active = event.target;
        }

        this.siblingsActive = true;
    }

    /**
     * Triggered when a child node triggers a mouseleave event
     * @param event DOM event
     */
    private childMouseLeave(event: any) {
        this.hideShadow();
        this.active = null;
        let children = this.getChildren();
        if (children.length == 0) {
            this.hideShadow(() => {
                this.safeRemoveShadow()
            });
        }
    }

    /**
     * returns our container hoverable children
     */
    private getChildren(): Array<any> {
        return Array.from(this.query ? this.querySelectorAll(this.query) : this.children);
    }

    private getRectangle(element: HTMLElement) {
        return {
            top: element.offsetTop,
            left: element.offsetLeft,
            height: element.offsetHeight,
            width: element.offsetWidth
        };
    }

    private applyPosition(rect: any, animate?: boolean) {
        console.log(animate);
        this.shadow.style.transition = animate ? 'all ' + this.shadowAnimationMS + 'ms' : 'unset'; 
        this.props.forEach((prop: any) => {
            this.shadow.style[prop] = rect[prop];
        });
        this.shadow.style.transition = 'all ' + this.shadowAnimationMS + 'ms';

    }

    private createShadow() {
        let element: any = document.createElement('div');
        element.classList.add('smart-hover-shadow');
        element.style.position = 'absolute';
        element.style.cursor = 'pointer';
        element.style.transition = 'all ' + this.shadowAnimationMS + 'ms';
        element.style['z-index'] = -1;
        return element;
    }

    private safeAppendShadow() {
        let shadow = this.querySelector('.smart-hover-shadow');
        if (!shadow) {
            this.append(this.shadow);
        }
    }

    private safeRemoveShadow() {
        let shadow = this.querySelector('.smart-hover-shadow');
        if (shadow) {
            this.removeChild(this.shadow);
        }
    }
}