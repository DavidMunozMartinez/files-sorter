import { spawn } from 'child_process';

export class Utils {
    // constructor () {}

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
            }
            else if (event.target.nodeName === 'SPAN') {
                const container = this.closest(event.target, '.dropdown');
                const key = event.target.getAttribute('value');
                if (container) {
                    const valueHolder = container?.querySelector('.value');
                    container.setAttribute('value', key);
                    if (valueHolder) {
                        valueHolder.innerHTML = event.target.innerHTML;
                        container.blur();
                    }
                }
            }
        }
    }

    saveData(key: string, data: any) {
        let rawData = JSON.stringify(data);
        localStorage.setItem(key, rawData);
    }

    getData(key: string) {
        const raw: string | null = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    }

    removeData() {}

    revealInExplorer(pathString: string, select?: boolean) {
        if (select) {
            spawn('explorer', [`/select, "${pathString}"`], {shell:true});
        }
        else {
            spawn('explorer', [`"${pathString}"`], {shell:true});
        }
    }
}