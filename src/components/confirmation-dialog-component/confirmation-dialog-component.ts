import html from './confirmation-dialog-component.html?raw';
import cssUrl from './confirmation-dialog-component.scss?url';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ConfirmationDialogComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private backdrop: HTMLDivElement | null = null;
    private dialogTitleElement: HTMLElement | null = null;
    private dialogMessageElement: HTMLElement | null = null;
    private confirmButton: HTMLButtonElement | null = null;
    private cancelButton: HTMLButtonElement | null = null;
    private closeButton: HTMLButtonElement | null = null;

    private resolvePromise: ((value: boolean) => void) | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.backdrop = this.shadowRootRef.querySelector('.dialog-backdrop');
        this.dialogTitleElement = this.shadowRootRef.querySelector('.dialog-title');
        this.dialogMessageElement = this.shadowRootRef.querySelector('.dialog-message');
        this.confirmButton = this.shadowRootRef.querySelector('.confirm-button');
        this.cancelButton = this.shadowRootRef.querySelector('.cancel-button');
        this.closeButton = this.shadowRootRef.querySelector('.close-button');

        this.confirmButton?.addEventListener('click', this.handleConfirm.bind(this));
        this.cancelButton?.addEventListener('click', this.handleCancel.bind(this));
        this.closeButton?.addEventListener('click', this.handleCancel.bind(this));
        this.backdrop?.addEventListener('click', this.handleBackdropClick.bind(this));
    }

    disconnectedCallback() {
        this.confirmButton?.removeEventListener('click', this.handleConfirm.bind(this));
        this.cancelButton?.removeEventListener('click', this.handleCancel.bind(this));
        this.closeButton?.removeEventListener('click', this.handleCancel.bind(this));
        this.backdrop?.removeEventListener('click', this.handleBackdropClick.bind(this));
    }

    public show(
        title: string,
        message: string,
        confirmText: string = 'Да, удалить',
        cancelText: string = 'Отмена'
    ): Promise<boolean> {
        if (!this.backdrop || !this.dialogTitleElement || !this.dialogMessageElement || !this.confirmButton || !this.cancelButton) {
            console.error('ConfirmationDialogComponent: Elements not found.');
            return Promise.resolve(false);
        }

        this.dialogTitleElement.textContent = title;
        this.dialogMessageElement.textContent = message;
        this.confirmButton.textContent = confirmText;
        this.cancelButton.textContent = cancelText;

        this.backdrop.classList.add('visible');

        return new Promise<boolean>(resolve => {
            this.resolvePromise = resolve;
        });
    }

    private hide() {
        this.backdrop?.classList.remove('visible');
        this.resolvePromise = null;
    }

    private handleConfirm() {
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
        this.hide();
    }

    private handleCancel() {
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
        this.hide();
    }

    private handleBackdropClick(event: MouseEvent) {
        if (event.target === this.backdrop) {
            this.handleCancel();
        }
    }
}

customElements.define('confirmation-dialog', ConfirmationDialogComponent);