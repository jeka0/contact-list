import html from './contact-item-component.html?raw';
import cssUrl from './contact-item-component.scss?url';
import type { Contact } from '../../models/Contact';
import { Events } from '../../enum/events-enum';
import deleteIcon from '../../icons/delete-icon.svg';
import editIcon from '../../icons/edit-icon.svg';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ContactItemComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private nameElement: HTMLSpanElement | null = null;
    private phoneElement: HTMLSpanElement | null = null;
    private editButton: HTMLButtonElement | null = null;
    private deleteButton: HTMLButtonElement | null = null;

    private _contact: Contact | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.nameElement = this.shadowRootRef.querySelector('.contact-item__name');
        this.phoneElement = this.shadowRootRef.querySelector('.contact-item__phone');
        this.editButton = this.shadowRootRef.querySelector('.contact-item__button--edit');
        this.deleteButton = this.shadowRootRef.querySelector('.contact-item__button--delete');

        this.setSvg(editIcon, this.editButton);
        this.setSvg(deleteIcon, this.deleteButton);

        this.editButton?.addEventListener('click', this.handleEditClick.bind(this));
        this.deleteButton?.addEventListener('click', this.handleDeleteClick.bind(this));

        this.render();
    }

    disconnectedCallback() {
        this.editButton?.removeEventListener('click', this.handleEditClick.bind(this));
        this.deleteButton?.removeEventListener('click', this.handleDeleteClick.bind(this));
    }

    set contact(contact: Contact | null) {
        this._contact = contact;
        this.render();
    }

    get contact(): Contact | null {
        return this._contact;
    }

    private render() {
        if (this._contact) {
            if (this.nameElement) {
                this.nameElement.textContent = this._contact.name;
            }
            if (this.phoneElement) {
                this.phoneElement.textContent = this._contact.phone;
            }
        }
    }

    private setSvg(icon: string, button: HTMLButtonElement | null) {
        fetch(icon)
        .then(response => response.text())
        .then(svgContent => { 
            if(button){
                button.innerHTML = svgContent;
            }
        })
    }

    private handleEditClick() {
        if (this._contact) {
            this.dispatchEvent(new CustomEvent(Events.EDIT_CONTACT, {
                detail: { contact: this._contact },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleDeleteClick() {
        if (this._contact) {
            this.dispatchEvent(new CustomEvent(Events.DELETE_CONTACT, {
                detail: { contactId: this._contact.id, contactName: this._contact.name },
                bubbles: true,
                composed: true
            }));
        }
    }
}

customElements.define('contact-item', ContactItemComponent);