import './notification-component.scss';
import { spawn } from 'child_process';
import { Utils } from '../utils';
import { IMovedFileData } from '../file-sorter';
import { Tips } from '../app-tips';


export interface INotificationOptions {
    type?: 'warning' | 'info' | 'error' | 'success'
    message?: string
    timer: number,
    os?: boolean
}

export class NotificationComponent {

    private container: HTMLElement = document.createElement('div');
    private queue: any = {};
    utils: Utils;

    constructor(utils: Utils) {
        this.utils = utils;
        this.container.classList.add('notification-container');
        document.body.append(this.container);
    }

    notify(options: INotificationOptions): AppNotification {
        let notification = new AppNotification(options);
        this.queue[notification.id] = notification;
        this.container.append(notification.ref);

        // Wait for animation frame to render the element before we apply the show methods, so the
        // animation works
        window.requestAnimationFrame(() => {
            // Notification hides itself based on the timer, or on manual close
            notification.show();
        });

        return notification;
    }

    notifyOS(title: string, body: string) {
        if (this.utils.getData('notifications')) {
            const notification = new Notification(title, {
                body: body
            });
            return notification;
        } else {
            return false;
        }

        // notification.onclick = () => {
        //     spawn('explorer', [`/select, "${destination}"`], {shell:true})
        // };
    }

    notifyFileMove(folder: string, movedFiles: IMovedFileData[]) {
        let message = '"' + folder + '" sorted';
        let path: string | null = null;
        if (!movedFiles.length) {
            message = 'All seems in order!';
        } else if (movedFiles.length === 1) {
            message = `${movedFiles[0].fileName} has been moved to ${movedFiles[0].to}`;
            path  = movedFiles[0].to;
        }
        if (movedFiles.length > 1) {
            message = `${movedFiles.length} files have been sorted from "${folder}", to know exactly what went where, take a look at the logs file`;
        }
        this.notify({
            timer: 4000,
            message: message,
            type: 'success',
        });


        if (movedFiles.length) {
            let osNotification = this.notifyOS('Files sorted', message);
            if (osNotification && path) {
                osNotification.onclick = () => {
                    if (path) {
                        this.utils.revealInExplorer(path, true)
                    } else if (movedFiles.length > 1) {
                        this.utils.readLogs();
                    }
                }
            }
        }
    }

    showConsecutiveTips(tips: Array<keyof typeof Tips>) {
      let current = 0;
      let show = (i: number) => {
        let notification = this.showTip(tips[i]);
        if (tips[i + 1]) notification.onClose = close;
      };
      let close = () => {
        current++;
        if (tips[current]) show(current);
      }
      show(current);
    }

    showTip(tipKey: keyof typeof Tips): AppNotification {
      return this.notify({
        message: Tips[tipKey],
        type: 'info',
        timer: 20000
      });
    }

    showTipIfNeeded(tipKey: keyof typeof Tips): AppNotification | null {
      let userHasSeenTip = this.utils.getData(tipKey);
      let result = null;
      if (!userHasSeenTip) {
        result = this.showTip(tipKey);
        this.utils.saveData(tipKey, true);
      }
      return result;
    }
}

class AppNotification {
    ref: HTMLElement = document.createElement('div');
    id: string = '_' + Math.random().toString(36).substr(2, 9);
    type: 'warning' | 'info' | 'error' | 'success';

    private header: HTMLElement = document.createElement('div');
    private message: HTMLElement = document.createElement('div');
    private timer: number;

    constructor(options: INotificationOptions) {
        if (!options.type) { options.type = 'info' }
        if (!options.timer) { options.timer = 2000 }
        if (!options.message) { options.message = "" }

        this.type = options.type;
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
        this.message.innerHTML = options.message;

        this.header.append(closeIcon);
        this.ref.append(this.header);
        this.ref.append(this.message);
    }

    onClose() {}

    show() {
        if (!this.ref.classList.contains('show')) {
            this.ref.classList.add('show');
        }

        if (this.type !== 'error') {
            setTimeout(() => {
                this.remove();
            }, this.timer);
        }
    }

    remove() {
        if (this.ref.classList.contains('show')) {
            this.ref.classList.remove('show');
            // Wait for the animation to end, then physically remove the element
            setTimeout(() => {
              this.ref.parentElement?.removeChild(this.ref);
              this.onClose();
            }, 200);
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
