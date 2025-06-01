import html from './contact-group-list-component.html?raw';
import cssUrl from './contact-group-list-component.scss?url';
import { ContactService } from '../../services/contact-service';
import { GroupService } from '../../services/group-service';
import { Injector } from '../../services/injector';
import type { Contact } from '../../models/Contact';
import { ContactItemComponent } from '../contact-item-component/contact-item-component';
import { Events } from '../../enum/events-enum';
import { ConfirmationDialogComponent } from '../confirmation-dialog-component/confirmation-dialog-component';
import { ContactFormComponent } from '../contact-form-component/contact-form-component';
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import arrowIcon from '../../icons/chevron-down.svg'

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ContactGroupListComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private contactService = Injector.get(ContactService);
    private groupService = Injector.get(GroupService);
    private container: HTMLDivElement | null = null;
    private confirmationDialog: ConfirmationDialogComponent | null = null;
    private sidebarComponent: SidebarComponent | null = null;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
        this.contactService.loadContacts();
        this.groupService.loadGroups();
    }

    connectedCallback() {
        this.container = this.shadowRootRef.querySelector('.contact-group-list');
        
        this.confirmationDialog = document.querySelector('confirmation-dialog');
        this.sidebarComponent = document.querySelector('sidebar-component');

        this.renderGroupsAndContacts();
        
        document.addEventListener(Events.CONTACT_ADDED, this.handleDataChange.bind(this));
        document.addEventListener(Events.CONTACT_EDITED, this.handleDataChange.bind(this));
        document.addEventListener(Events.CONTACT_DELETED, this.handleDataChange.bind(this));
        document.addEventListener(Events.GROUP_ADDED, this.handleDataChange.bind(this));
        document.addEventListener(Events.GROUP_EDITED, this.handleDataChange.bind(this));
        document.addEventListener(Events.GROUP_DELETED, this.handleDataChange.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener(Events.CONTACT_ADDED, this.handleDataChange.bind(this));
        document.removeEventListener(Events.CONTACT_EDITED, this.handleDataChange.bind(this));
        document.removeEventListener(Events.CONTACT_DELETED, this.handleDataChange.bind(this));
        document.removeEventListener(Events.GROUP_ADDED, this.handleDataChange.bind(this));
        document.removeEventListener(Events.GROUP_EDITED, this.handleDataChange.bind(this));
        document.removeEventListener(Events.GROUP_DELETED, this.handleDataChange.bind(this));
    }

    private handleDataChange() {
        this.renderGroupsAndContacts();
    }

    private renderGroupsAndContacts() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        const groups = this.groupService.getGroups();
        const allContacts = this.contactService.getContacts();

        if (groups.length === 0 && allContacts.length === 0) {
            this.container.appendChild(this.createEmptyMessage());
            this.container.classList.add('contact-group-list--empty');
            return;
        } else {
            this.container.classList.remove('contact-group-list--empty');
        }
        
        const ungroupedContacts = allContacts.filter(contact => !contact.groupId);
        if (ungroupedContacts.length > 0 || groups.length === 0) {
            this.createGroupPanel('Без группы', ungroupedContacts);
        }

        groups.forEach(group => {
            const contactsInGroup = allContacts.filter(contact => contact.groupId === group.id);
            this.createGroupPanel(group.name, contactsInGroup);
        });
    }

    private createEmptyMessage() : HTMLDivElement{
        const emptyMessageElement = document.createElement('div');
        emptyMessageElement.classList.add("contact-group-list__empty-state");
        emptyMessageElement.textContent = "Список контактов пуст";
        return emptyMessageElement;
    }

    private createGroupPanel(groupName: string, contacts: Contact[]) {
        if (!this.container) return;

        const groupPanel = document.createElement('div');
        groupPanel.classList.add('contact-group-list__group-panel');

        const content = this.createContent(contacts);
        groupPanel.appendChild(this.createHeader(groupName, content));
        groupPanel.appendChild(content);
        this.container.appendChild(groupPanel);
    }

    private createContent(contacts: Contact[]) : HTMLDivElement{
        const content = document.createElement('div');
        content.classList.add('contact-group-list__group-content');

        if (contacts.length === 0) {
            const emptyGroupMessage = document.createElement('p');
            emptyGroupMessage.classList.add('contact-group-list__group-content--empty');
            emptyGroupMessage.textContent = 'В этой группе пока нет контактов';
            content.appendChild(emptyGroupMessage);
        } else {
            contacts.forEach(contact => {
                const contactItem = document.createElement('contact-item') as ContactItemComponent;
                contactItem.contact = contact;
                contactItem.addEventListener(Events.EDIT_CONTACT, this.handleEditContact.bind(this) as EventListener);
                contactItem.addEventListener(Events.DELETE_CONTACT, this.handleDeleteContact.bind(this) as EventListener);
                content.appendChild(contactItem);
            });
        }
        return content;
    }

    private createHeader(groupName: string, content: HTMLDivElement) : HTMLDivElement {
        const header = document.createElement('div');
        header.classList.add('contact-group-list__group-header', 'contact-group-list__group-header--collapsed');
        header.addEventListener('click', () => this.toggleGroupPanel(header, content));
        header.appendChild(this.createTitle(groupName));

        fetch(arrowIcon).then(response => response.text())
        .then(svgContent => header.appendChild(this.createArrow(svgContent)))

        return header;
    }

    private createTitle(groupName: string) : HTMLHeadingElement {
        const title = document.createElement('h3');
        title.classList.add('contact-group-list__group-title');
        title.textContent = groupName;
        return title;
    }

    private createArrow(svgContent: string) : HTMLSpanElement {
        const arrow = document.createElement('span');
        arrow.classList.add('contact-group-list__group-arrow');
        arrow.innerHTML = svgContent;
        return arrow;
    }

    private toggleGroupPanel(header: HTMLDivElement, content: HTMLDivElement) {
        const isExpanded = header.classList.contains('contact-group-list__group-header--expanded');
        if (isExpanded) {
            header.classList.remove('contact-group-list__group-header--expanded');
            header.classList.add('contact-group-list__group-header--collapsed');
            content.style.maxHeight = '0';
            content.style.paddingTop = '0';
            content.style.paddingBottom = '0';
        } else {
            header.classList.add('contact-group-list__group-header--expanded');
            header.classList.remove('contact-group-list__group-header--collapsed');
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.paddingTop = '15px';
            content.style.paddingBottom = '15px';
        }
    }

    private handleEditContact(event: CustomEvent) {
        const contactToEdit = event.detail.contact as Contact;
        if (this.sidebarComponent) {
            this.sidebarComponent.setAttribute('open', '');
            const titleElement = this.sidebarComponent?.shadowRoot?.querySelector('.sidebar-title');
            if (titleElement) {
                titleElement.textContent = 'Редактировать контакт';
            }
            this.sidebarComponent.setContent(new ContactFormComponent(), { contact: contactToEdit, mode: 'edit' });
        }
    }

    private handleDeleteContact(event: CustomEvent) {
        const contactId = event.detail.contactId;
        const contactName = event.detail.contactName;

        if (this.confirmationDialog) {
            this.confirmationDialog.show('Удалить контакт?',  `Вы действительно хотите удалить контакт "${contactName}"?`, 'Да, удалить').then(confirm => {
                if(confirm){
                    this.contactService.deleteContact(contactId);
                    this.renderGroupsAndContacts();
                }
            })
        }
    }
}

customElements.define('contact-group-list', ContactGroupListComponent);