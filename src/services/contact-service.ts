import type { Contact } from '../models/Contact';
import { LocalStorageService } from './local-storage-service';
import { ToastService } from './toast-service';
import { Injector } from "./injector";

export class ContactService {
    private CONTACTS_KEY = 'contacts';
    private contacts: Contact[] = [];
    private localStorageService = Injector.get(LocalStorageService);
    private toastService = Injector.get(ToastService);

    loadContacts(): void {
        this.contacts = this.localStorageService.loadData<Contact>(this.CONTACTS_KEY);
    }

    saveContacts(): void {
        this.localStorageService.saveData<Contact>(this.CONTACTS_KEY, this.contacts)
    }

    getContacts(): Contact[] {
        return [...this.contacts];
    }

    addContact(name: string, phone: string, groupId: string): boolean {
        const unmaskedPhone = phone.replace(/\D/g, '');
        if (this.contacts.some(contact => contact.phone.replace(/\D/g, '') === unmaskedPhone)) {
            this.toastService.showErrorToast("Данный номер телефон уже используется! Контакт не будет сохранен!")
            return false;
        }

        const newContact: Contact = {
            id: Date.now().toString(),
            name,
            phone,
            groupId
        };
        this.contacts.push(newContact);
        this.saveContacts();
        this.toastService.showSuccessToast("Контакт успешно создан!")
        return true;
    }

    editContact(id: string, newName: string, newPhone: string, newGroupId: string): boolean {
        const index = this.contacts.findIndex(contact => contact.id === id);

        if (index === -1) {
            return false;
        }

        const unmaskedNewPhone = newPhone.replace(/\D/g, '');
        if (this.contacts.some(contact => contact.phone.replace(/\D/g, '') === unmaskedNewPhone && contact.id !== id)) {
            this.toastService.showErrorToast("Данный номер телефон уже используется! Контакт не будет изменен!")
            return false;
        }

        this.contacts[index] = { ...this.contacts[index], name: newName, phone: newPhone, groupId: newGroupId };
        this.saveContacts();
        this.toastService.showSuccessToast("Контакт успешно изменен!")
        return true;
    }

    deleteContact(id: string): boolean {
        const initialLength = this.contacts.length;
        this.contacts = this.contacts.filter(contact => contact.id !== id);
        if (this.contacts.length < initialLength) {
            this.saveContacts();
            this.toastService.showSuccessToast("Контакт успешно удален!")
            return true;
        }
        return false;
    }

    deleteContactsByGroupId(groupId: string): void {
        this.loadContacts();
        const initialLength = this.contacts.length;
        this.contacts = this.contacts.filter(contact => contact.groupId !== groupId);
        if (this.contacts.length < initialLength) {
            this.saveContacts();
            this.toastService.showSuccessToast("Связанные с группой контакты успешно удалены!")
        }
    }
}