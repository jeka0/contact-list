import html from './toast-container-component.html?raw';
import cssUrl from './toast-container-component.scss?url';
import { ToastItemComponent } from '../toast-item-component/toast-item-component';
import type { ToastOptions } from '../../models/ToastOptions';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ToastContainerComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private notificationsContainer: HTMLDivElement | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.notificationsContainer = this.shadowRootRef.querySelector('.toast-notifications-container');
    }

    public show(options: ToastOptions) {
        if (!this.notificationsContainer) {
            console.error('ToastContainerComponent: Notifications container not initialized.');
            return;
        }

        const toastItem = new ToastItemComponent();
        this.notificationsContainer.appendChild(toastItem);
        toastItem.id = Date.now().toString();
        toastItem.message = options.message;
        toastItem.type = options.type || 'success';
        toastItem.duration = options.duration || 3000;
    }
}

customElements.define('toast-container', ToastContainerComponent);