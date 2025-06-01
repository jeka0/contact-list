import html from './contact-form-component.html?raw';
import cssUrl from './contact-form-component.scss?url';
import { ContactService } from '../../services/contact-service';
import { GroupService } from '../../services/group-service';
import { ToastService } from '../../services/toast-service';
import { Injector } from '../../services/injector';
import type { Contact } from '../../models/Contact';
import IMask, { InputMask } from 'imask';
import { CustomDropdownComponent } from '../custom-dropdown-component/custom-dropdown-component';
import type { DropdownOption } from '../../models/DropdownOption';
import { Events } from '../../enum/events-enum';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class ContactFormComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private contactService = Injector.get(ContactService);
    private groupService = Injector.get(GroupService);
    private toastService = Injector.get(ToastService);

    private nameInput: HTMLInputElement | null = null;
    private phoneInput: HTMLInputElement | null = null;
    private groupDropdown: CustomDropdownComponent | null = null;
    private saveButton: HTMLButtonElement | null = null;

    private nameError: HTMLDivElement | null = null;
    private phoneError: HTMLDivElement | null = null;
    private dropdownError: HTMLDivElement | null = null;

    private phoneMaskInstance: InputMask | null = null;
    private _contact: Contact | null = null;
    private _mode: 'add' | 'edit' = 'add';

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
        this.contactService.loadContacts();
        this.groupService.loadGroups();
    }

    connectedCallback() {
        this.nameInput = this.shadowRootRef.querySelector('#contact-name');
        this.phoneInput = this.shadowRootRef.querySelector('#contact-phone');
        this.groupDropdown = this.shadowRootRef.querySelector('#contact-group-dropdown');
        this.saveButton = this.shadowRootRef.querySelector('.save-button');

        this.nameError = this.shadowRootRef.querySelector('#name-error');
        this.phoneError = this.shadowRootRef.querySelector('#phone-error');
        this.dropdownError = this.shadowRootRef.querySelector('#dropdown-error');

        if (this.phoneInput) {
            this.phoneMaskInstance = IMask(this.phoneInput, {
                mask: '+{7} (000) 000-00-00'
            });
        }

        requestAnimationFrame(() => {
            this.renderGroupsForDropdown();

            if (this._contact) {
                this.nameInput!.value = this._contact.name;
                this.phoneInput!.value = this._contact.phone;
                this.phoneMaskInstance?.updateValue();
                if (this.groupDropdown) {
                    this.groupDropdown.value = this._contact.groupId || '';
                }
                this.mode = 'edit';
            } else {
                this.clearForm();
                this.mode = 'add';
            }

            this.saveButton?.addEventListener('click', this.handleSubmit.bind(this));
            this.groupDropdown?.addEventListener(Events.DROPDOWN_CHANGE, this.handleGroupChange.bind(this));

            this.nameInput?.addEventListener('input', () => this.validateInput(this.nameInput, this.nameError));
            this.phoneInput?.addEventListener('input', () => this.validateInput(this.phoneInput, this.phoneError));
        });
    }

    disconnectedCallback() {
        this.saveButton?.removeEventListener('click', this.handleSubmit.bind(this));
        this.groupDropdown?.removeEventListener(Events.DROPDOWN_CHANGE, this.handleGroupChange.bind(this));
        this.nameInput?.removeEventListener('input', () => this.validateInput(this.nameInput, this.nameError));
        this.phoneInput?.removeEventListener('input', () => this.validateInput(this.phoneInput, this.phoneError));
    }

    set contact(contact: Contact | null) {
        this._contact = contact;
        if (this.isConnected) {
            this.renderGroupsForDropdown();

            if (contact) {
                this.nameInput!.value = contact.name;
                this.phoneInput!.value = contact.phone;
                if (this.groupDropdown) {
                    this.groupDropdown.value = contact.groupId || '';
                }
                this.mode = 'edit';
            } else {
                this.clearForm();
                this.mode = 'add';
            }
        }
    }

    get contact(): Contact | null {
        return this._contact;
    }

    set mode(newMode: 'add' | 'edit') {
        this._mode = newMode;
    }

    private renderGroupsForDropdown() {
        if (!this.groupDropdown) return;
        const groupOptions: DropdownOption[] = [{ value: '', text: 'Без группы' }];

        this.groupService.getGroups().forEach(group => {
            groupOptions.push({ value: group.id, text: group.name });
        });
        this.groupDropdown.options = groupOptions;
        this.groupDropdown.placeholder = 'Выберите группу';
        if (this._contact) {
            this.groupDropdown.value = this._contact.groupId || '';
        } else {
            this.groupDropdown.value = '';
        }
    }

    private handleGroupChange() {
        this.validateDropdown(this.groupDropdown, this.dropdownError);
    }

    private validateDropdown(dropdown: CustomDropdownComponent | null, errorElement: HTMLDivElement | null, errorMessage?: string) {
        if(!dropdown || !errorElement) return false;

        if(dropdown.value){
            dropdown.isValid = true;
            errorElement.classList.remove('error');
            return true;
        } else {
            dropdown.isValid = false;
            errorElement.classList.add('error');
            if(errorMessage){
                this.toastService.showErrorToast(errorMessage)
            }
            return false;
        }
    }

    private validateInput(inputElement: HTMLInputElement | null, errorElement: HTMLDivElement | null, errorMessage?: string): boolean {
        if (!inputElement || !errorElement) return false;

        if (inputElement.value.trim() === '') {
            inputElement.classList.add('invalid');
            errorElement.classList.add('error');
            if(errorMessage){
                this.toastService.showErrorToast(errorMessage)
            }
            return false;
        } else {
            inputElement.classList.remove('invalid');
            errorElement.classList.remove('error');
            return true;
        }
    }

    private validateForm(): boolean {
        let isValid = true;
        isValid = this.validateInput(this.nameInput, this.nameError, "Название контакта не может быть пустым!") && isValid;
        isValid = this.validateInput(this.phoneInput, this.phoneError, "Номер телефона не может быть пустым!") && isValid;
        isValid = this.validateDropdown(this.groupDropdown, this.dropdownError, "Должна быть выбрана группа для контакта!") && isValid;
        return isValid;
    }

    private handleSubmit(event: Event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        if (!this.nameInput || !this.phoneInput || !this.groupDropdown) return;

        const name = this.nameInput.value.trim();
        const phone = this.phoneInput.value.trim();
        const groupId = this.groupDropdown.value;

        let success = false;
        if (this._mode === 'add') {
            success = this.contactService.addContact(name, phone, groupId);
        } else if (this._mode === 'edit' && this._contact) {
            success = this.contactService.editContact(this._contact.id, name, phone, groupId);
        }

        if (success) {
            this.dispatchEvent(new CustomEvent(Events.FORM_SUBMITTED, { bubbles: true, composed: true, detail: { success: true, mode: this._mode } }));
        }
    }

    private clearForm() {
        if (this.nameInput) {
            this.nameInput.value = '';
            this.nameInput.classList.remove('invalid');
            this.nameInput.closest('.form-group')?.classList.remove('error');
        }
        if (this.phoneInput) {
            this.phoneInput.value = '';
            this.phoneInput.classList.remove('invalid');
            this.phoneInput.closest('.form-group')?.classList.remove('error');
        }
        if (this.groupDropdown) {
            this.groupDropdown.value = '';
        }

        this._contact = null;
        this.mode = 'add';
    }
}

customElements.define('contact-form-component', ContactFormComponent);