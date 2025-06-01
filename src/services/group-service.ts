import type { Group } from '../models/Group';
import { LocalStorageService } from './local-storage-service';
import { ContactService } from './contact-service';
import { ToastService } from './toast-service';
import { Injector } from './injector';
import { Events } from '../enum/events-enum';

export class GroupService {
    private GROUPS_KEY = 'groups';
    private groups: Group[] = [];
    private localStorageService = Injector.get(LocalStorageService);
    private contactService = Injector.get(ContactService);
    private toastService = Injector.get(ToastService);

    loadGroups(): void {
        this.groups = this.localStorageService.loadData<Group>(this.GROUPS_KEY);
    }

    saveGroups(): void {
        this.localStorageService.saveData<Group>(this.GROUPS_KEY, this.groups);
    }

    getGroups(): Group[] {
        return [...this.groups];
    }

    addGroup(name: string): boolean {
        if (this.groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
            this.toastService.showErrorToast("Группа с таким названием уже существует!");
            return false;
        }

        const newGroup: Group = {
            id: Date.now().toString(),
            name
        };
        this.groups.push(newGroup);
        this.saveGroups();
        this.toastService.showSuccessToast("Группа успешно создана!");
        document.dispatchEvent(new CustomEvent(Events.GROUP_ADDED, { bubbles: true, composed: true }));
        return true;
    }

    editGroup(id: string, newName: string): boolean {
        const index = this.groups.findIndex(group => group.id === id);
        if (index === -1) {
            return false;
        }
        if (this.groups.some(group => group.name.toLowerCase() === newName.toLowerCase() && group.id !== id)) {
            this.toastService.showErrorToast("Группа с таким названием уже существует!");
            return false;
        }

        this.groups[index] = { ...this.groups[index], name: newName };
        this.saveGroups();
        this.toastService.showSuccessToast("Группа успешно изменена!");
        document.dispatchEvent(new CustomEvent(Events.GROUP_EDITED, { bubbles: true, composed: true }));
        return true;
    }

    deleteGroup(id: string): boolean {
        const initialLength = this.groups.length;
        this.groups = this.groups.filter(group => group.id !== id);
        if (this.groups.length < initialLength) {
            this.saveGroups();
            this.toastService.showSuccessToast("Группа успешно удалена!");
            this.contactService.deleteContactsByGroupId(id);
            document.dispatchEvent(new CustomEvent(Events.GROUP_DELETED, { bubbles: true, composed: true }));
            return true;
        }
        return false;
    }
}