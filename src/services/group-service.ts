import type { Group } from '../models/Group';
import { LocalStorageService } from './local-storage-service';
import type { ContactService } from './contact-service';

export class GroupService {
    private GROUPS_KEY = 'groups';
    private groups: Group[] = [];

    loadGroups(): void {
        this.groups = LocalStorageService.loadData<Group>(this.GROUPS_KEY);
    }

    saveGroups(): void {
        LocalStorageService.saveData<Group>(this.GROUPS_KEY, this.groups);
    }

    getGroups(): Group[] {
        return [...this.groups];
    }

    addGroup(name: string): boolean {
        if (this.groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
            return false;
        }

        const newGroup: Group = {
            id: Date.now().toString(),
            name
        };
        this.groups.push(newGroup);
        this.saveGroups();
        return true;
    }

    editGroup(id: string, newName: string): boolean {
        const index = this.groups.findIndex(group => group.id === id);
        if (index === -1) {
            return false;
        }
        if (this.groups.some(group => group.name.toLowerCase() === newName.toLowerCase() && group.id !== id)) {
            return false;
        }

        this.groups[index] = { ...this.groups[index], name: newName };
        this.saveGroups();
        return true;
    }

    deleteGroup(id: string, contactService: ContactService): boolean {
        const initialLength = this.groups.length;
        this.groups = this.groups.filter(group => group.id !== id);
        if (this.groups.length < initialLength) {
            this.saveGroups();
            contactService.deleteContactsByGroupId(id);
            return true;
        }
        return false;
    }
}