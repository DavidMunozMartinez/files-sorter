export class Utils {
    constructor () {}

    closest(element: HTMLElement, selector: string): HTMLElement | null {
        let match = null;

        if (element.parentElement && element.parentNode?.nodeName !== 'document') {
            match = element.parentElement.matches(selector) ?
                element.parentElement : this.closest(element.parentElement, selector);

            return match;
        }
        else {
            return null;
        }
    }

    fsDropdown(element: HTMLElement | Element) {
        element.addEventListener('click', (event: any) => {
            onClick(event);
        });

        const onClick = (event: any) => {
            if (event.target.classList.contains('dropdown')) {
                event.target.classList.toggle('expanded');
                console.log('clicked', event.target);
            }
            else if (event.target.nodeName == 'SPAN') {
                let container = this.closest(event.target, '.dropdown');
                let key = event.target.getAttribute('value');
                if (container) {
                    let valueHolder = container?.querySelector('.value');
                    container.setAttribute('value', key);
                    if (valueHolder) {
                        valueHolder.innerHTML = event.target.innerHTML;
                        container.blur();
                    }
                }
            }
        }
    }
}