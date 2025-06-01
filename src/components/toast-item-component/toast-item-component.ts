import html from './toast-item-component.html?raw';
import cssUrl from './toast-item-component.scss?url';
import { Events } from '../../enum/events-enum';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ToastItemComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private toastContainer: HTMLDivElement | null = null;
    private toastMessageElement: HTMLDivElement | null = null;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private _id: string = '';

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.toastContainer = this.shadowRootRef.querySelector('.toast-item-container');
        this.toastMessageElement = this.shadowRootRef.querySelector('.toast-message');

        requestAnimationFrame(() => {
            this.toastContainer?.classList.add('show');
        });
    }

    disconnectedCallback() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    set message(msg: string) {
        if (this.toastMessageElement) {
            this.toastMessageElement.textContent = msg;
        }
    }

    set type(notificationType: 'success' | 'error') {
        if (this.toastContainer) {
            this.toastContainer.classList.remove('success', 'error');
            this.toastContainer.classList.add(notificationType);
        }
    }

    set duration(ms: number) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.hide();
        }, ms);
    }

    set id(newId: string) {
        this._id = newId;
    }

    get id(): string {
        return this._id;
    }

    private hide() {
        if (this.toastContainer) {
            this.toastContainer.classList.remove('show');
            this.toastContainer.addEventListener('transitionend', () => {
                this.dispatchEvent(new CustomEvent(Events.TOASY_HIDDEN, {
                    detail: { id: this._id },
                    bubbles: true,
                    composed: true
                }));
                this.remove();
            }, { once: true });
        }
    }
}

customElements.define('toast-item', ToastItemComponent);