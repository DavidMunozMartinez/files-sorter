export class SmartHover extends HTMLElement {
    private props = ['top', 'left', 'height', 'width']

    shadow!: HTMLElement;
    active!: HTMLElement;

    connectedCallback() {
        // Applies the necessary listeners to the childs of the container
        this.applyChilds();
        // Apprends the smart hover shadow in the container, this happens second so that
        // we don't apply the listeners to the shadow
        this.shadow = this.createShadow();

        this.addEventListener('mouseleave', () => {
            this.shadow.style.opacity = '0';
        });
        this.addEventListener('mouseenter', () => {
            this.shadow.style.opacity = '1';
        });
    }

    // Public so the user can re-apply the listeners if the container has changed
    public applyChilds() {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child != this.shadow) {
                child.addEventListener('mouseenter', (event) => {
                    this.onHover(event)
                });
            }
        }
    }

    private onHover(event: any) {
        if (event && event.target && event.target !== this.active) {
            let target = event.target;
            this.active = target;
            let rect = {
                top: target.offsetTop,
                left: target.offsetLeft,
                height: target.offsetHeight,
                width: target.offsetWidth
            }
    
            this.applyPosition(rect)
        }
    }

    private applyPosition(rect: any) {
        this.props.forEach((prop: any) => {
            this.shadow.style[prop] = rect[prop];
        });
        this.applyChilds();
    }

    private createShadow() {
        let element: any = document.createElement('div');
        element.classList.add('smart-hover-shadow');
        element.style.position = 'absolute';
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.1s'
        element.style['z-index'] = -1;
        this.prepend(element);
        return element;
    }
}