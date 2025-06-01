import '../contact-group-list-component/contact-group-list-component';
import html from './main-component.html?raw';
import cssUrl from './main-component.scss?url';
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import { GroupListComponent } from '../group-list-component/group-list-component';
import { ContactFormComponent } from '../contact-form-component/contact-form-component';
import { Events } from '../../enum/events-enum';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class MainComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private sidebarComponent: SidebarComponent | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.sidebarComponent = document.querySelector('sidebar-component');

        document.addEventListener(Events.SHOW_GROUPS_SIDEBAR, this.handleShowGroupsSidebar.bind(this));
        document.addEventListener(Events.SHOW_CONTACT_FORM, this.handleShowAddContactForm.bind(this));
        document.addEventListener(Events.SIDEBAR_CLOSED, this.handleSidebarClosed.bind(this));
        document.addEventListener(Events.FORM_SUBMITTED, this.handleSidebarClosed.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener(Events.SHOW_GROUPS_SIDEBAR, this.handleShowGroupsSidebar.bind(this));
        document.removeEventListener(Events.SHOW_CONTACT_FORM, this.handleShowAddContactForm.bind(this));
        document.removeEventListener(Events.SIDEBAR_CLOSED, this.handleSidebarClosed.bind(this));
        document.removeEventListener(Events.FORM_SUBMITTED, this.handleSidebarClosed.bind(this));
    }

    private handleShowGroupsSidebar() {
        if (this.sidebarComponent) {
            this.sidebarComponent.setAttribute('open', '');
            const titleElementGroups = this.sidebarComponent?.shadowRoot?.querySelector('.sidebar-title');
            if (titleElementGroups) {
                titleElementGroups.textContent = 'Группы контактов';
            }
            this.sidebarComponent.setContent(new GroupListComponent());
        }
    }

    private handleShowAddContactForm() {
        if (this.sidebarComponent) {
            this.sidebarComponent.setAttribute('open', '');
            const titleElementAddContact = this.sidebarComponent?.shadowRoot?.querySelector('.sidebar-title');
            if (titleElementAddContact) {
                titleElementAddContact.textContent = 'Добавить контакт';
            }
            this.sidebarComponent.setContent(new ContactFormComponent(), { contact: null, mode: 'add' });
        }
    }

    private handleSidebarClosed() {
        if (this.sidebarComponent) {
            this.sidebarComponent.removeAttribute('open');
        }
    }
}

customElements.define('main-component', MainComponent);