import './notification-component.scss';

export class NotificationComponent {

    private container: HTMLElement = document.createElement('div');
    private queue: any = {};

    constructor() {
        this.container.classList.add('notification-container');
        document.body.append(this.container);
    }

    notify(options: INotificationOptions) {
        let notification = new Notification(options);
        this.queue[notification.id] = notification;
        this.container.append(notification.ref);

        // Wait for animation frame to render the element before we apply the show methods, so the
        // animation works
        window.requestAnimationFrame(() => {
            // Notification hides itself based on the timer, or on manual close
            notification.show();
        });
    }
}

class Notification {
    ref: HTMLElement = document.createElement('div');
    id: string = '_' + Math.random().toString(36).substr(2, 9);

    private header: HTMLElement = document.createElement('div');
    private message: HTMLElement = document.createElement('div');
    private timer: number;

    constructor(options: INotificationOptions) {
        if (!options.type) { options.type = 'info' }
        if (!options.timer) { options.timer = 2000 }
        if (!options.message) { options.message = "" }

        this.timer = options.timer;
        const closeIcon: HTMLElement = document.createElement('i');
        closeIcon.classList.add('close');
        closeIcon.classList.add('material-icons')
        closeIcon.innerText = 'close';
        closeIcon.addEventListener('click', () => {
            this.remove();
        });

        this.ref.classList.add('notification-item');
        this.ref.classList.add(options.type);
        this.header.classList.add('notification-header');
        this.makeHeader(options.type);
        this.message.classList.add('notification-message');
        this.message.innerText = options.message;

        this.header.append(closeIcon);
        this.ref.append(this.header);
        this.ref.append(this.message);
    }

    show() {
        if (!this.ref.classList.contains('show')) {
            this.ref.classList.add('show');
        }

        setTimeout(() => {
            this.remove();
        }, this.timer);
    }

    remove() {
        if (this.ref.classList.contains('show')) {
            this.ref.classList.remove('show');
            // Wait for the animation to end, then physically remove the element
            setTimeout(() => { this.ref.parentElement?.removeChild(this.ref); }, 200);
        }
    }

    private makeHeader(type: 'warning' | 'info' | 'error' | 'success') {
        let iconRef = document.createElement('i');
        let iconName = 'info';
        iconRef.classList.add('material-icons');

        this.header.append(iconRef);

        switch (type) {
            case 'warning':
                iconName = 'warning';
                break;
            case 'error':
                iconName = 'error';
                break;
            case 'success':
                iconName = 'check_circle';
                break;
        }

        iconRef.classList.add(type);
        iconRef.innerText = iconName;
        this.header.innerHTML = '<p>' + type.charAt(0).toUpperCase() + type.slice(1) + '</p>';
        this.header.append(iconRef);
    }
}



export interface INotificationOptions {
    type?: 'warning' | 'info' | 'error' | 'success'
    message?: string
    timer: number
}