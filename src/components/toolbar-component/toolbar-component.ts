import html from './toolbar-component.html?raw';
import cssUrl from './toolbar-component.scss?url';
import { Events } from '../../enum/events-enum';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ToolbarComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private groupsButton: HTMLButtonElement | null = null;
    private addContactButton: HTMLButtonElement | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.groupsButton = this.shadowRootRef.querySelector('.groups');
        this.addContactButton = this.shadowRootRef.querySelector('.add');
        this.addClickHandler(this.groupsButton, this.handleGroupsClick);
        this.addClickHandler(this.addContactButton, this.handleAddContactClick);
    }

    disconnectedCallback() {
        this.removeClickHandler(this.groupsButton, this.handleGroupsClick);
        this.removeClickHandler(this.addContactButton, this.handleAddContactClick);
    }

    private handleGroupsClick() : void {
        this.defaultClickHandler(Events.SHOW_GROUPS_SIDEBAR)
    }

    private handleAddContactClick() : void {
        this.defaultClickHandler(Events.SHOW_CONTACT_FORM)
    }

    private defaultClickHandler(eventName: string) {
        this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true }));
    }

    private addClickHandler(button: HTMLButtonElement | null, handler: () => void) {
        if (button) {
            button.addEventListener('click', handler.bind(this));
        }
    }

    private removeClickHandler(button: HTMLButtonElement | null, handler: () => void) {
        if (button) {
            button.removeEventListener('click', handler.bind(this));
        }
    }
}

customElements.define('toolbar-component', ToolbarComponent);