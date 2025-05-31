import html from './group-list-component.html?raw';
import cssUrl from './group-list-component.scss?url';
import deleteIconSVG from '../../icons/delete-icon.svg';
import { GroupService } from '../../services/group-service';
import { ToastService } from '../../services/toast-service';
import { Injector } from '../../services/injector';
import type { Group } from '../../models/Group';
import { Events } from '../../enum/events-enum';
import { ConfirmationDialogComponent } from '../confirmation-dialog-component/confirmation-dialog-component';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class GroupListComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private groupService = Injector.get(GroupService);
    private toastService = Injector.get(ToastService);
    private groupListElement: HTMLUListElement | null = null;
    private addGroupButton: HTMLButtonElement | null = null;
    private saveGroupsButton: HTMLButtonElement | null = null;
    private confirmationDialog: ConfirmationDialogComponent | null = null;
    private newGroupInputs = new Map<string, HTMLInputElement>();

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
        this.groupService.loadGroups();
    }

    connectedCallback() {
        this.groupListElement = this.shadowRootRef.querySelector('.group-list');
        this.addGroupButton = this.shadowRootRef.querySelector('.add-group-button');
        this.saveGroupsButton = this.shadowRootRef.querySelector('.save-groups-button');

        this.confirmationDialog = document.querySelector('confirmation-dialog');
        if (!this.confirmationDialog) {
            console.error('Confirmation dialog component not found in the DOM.');
        }

        this.renderGroups();

        this.addGroupButton?.addEventListener('click', this.handleAddGroup.bind(this));
        this.saveGroupsButton?.addEventListener('click', this.handleSaveGroups.bind(this));
    }

    disconnectedCallback() {
        this.addGroupButton?.removeEventListener('click', this.handleAddGroup.bind(this));
    }

    private renderGroups() {
        if (!this.groupListElement) return;

        this.groupListElement.innerHTML = '';
        const groups = this.groupService.getGroups();

        if (groups.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Нет групп.';
            li.classList.add("default-message")
            this.groupListElement.appendChild(li);
            return;
        }

        groups.forEach(group => 
            this.groupListElement?.appendChild(
                this.createGroupItem(group.id, this.createSavedInput(group), (e) => this.handleDeleteGroup(e, group))
            )
        );

        this.newGroupInputs.forEach((newGroupInput, key) => {
            this.addGroupItem(key, newGroupInput);
        })
    }

    private createGroupItem(id: string, inputElement: HTMLInputElement, deleteHandler: (this: HTMLButtonElement, ev: MouseEvent) => any) : HTMLLIElement {
        const li = document.createElement('li');
        li.classList.add('group-item');
        li.dataset.groupId = id;
        li.appendChild(inputElement);
        li.appendChild(this.createGroupActions(deleteHandler));
        return li;
    }

    private createSavedInput(group: Group) : HTMLInputElement {
        const groupNameInput = document.createElement('input');
        groupNameInput.value = group.name;
        groupNameInput.classList.add('group-name-input');
        groupNameInput.readOnly = true;
        return groupNameInput;
    }

    private createGroupActions(deleteHandler: (this: HTMLButtonElement, ev: MouseEvent) => any) : HTMLDivElement {
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('group-actions');
        actionsDiv.appendChild(this.createDeleteButton(deleteHandler));
        return actionsDiv;
    }

    private createDeleteButton(deleteHandler: (this: HTMLButtonElement, ev: MouseEvent) => any) : HTMLButtonElement {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-group-button');
        deleteButton.title = 'Удалить группу';
        fetch(deleteIconSVG)
        .then(response => response.text())
        .then(svgContent => {
            deleteButton.innerHTML = svgContent;
        });
        deleteButton.addEventListener('click', deleteHandler);
        return deleteButton;
    }

    private createAddedInput() : HTMLInputElement {
        const groupNameInput = document.createElement('input');
        groupNameInput.classList.add('new-group-name-input');
        groupNameInput.placeholder = "Введите название";
        return groupNameInput;
    }

    private handleAddGroup() {
        const groups = this.groupService.getGroups();
        if (groups.length === 0 && this.groupListElement) {
           this.groupListElement.innerHTML = '';
        }
        const id = Date.now().toString();
        const newInput = this.createAddedInput();
        this.newGroupInputs.set(id, newInput);
        this.addGroupItem(id, newInput);
    }

    private addGroupItem(id: string, newInput: HTMLInputElement){
        this.groupListElement?.appendChild(
            this.createGroupItem(id, newInput, () => {
                this.newGroupInputs.delete(id);
                const listItemToRemove = this.groupListElement?.querySelector(`li[data-group-id="${id}"]`);
                if(listItemToRemove){
                    this.groupListElement?.removeChild(listItemToRemove);
                }
                if(this.newGroupInputs.size === 0){
                    this.renderGroups();
                }
            })
        )
    }

    private handleSaveGroups() {
        let isSuccess = false;
        this.newGroupInputs.forEach((newGroupInput, key) => {
            if (newGroupInput) {
                const groupName = newGroupInput.value.trim();
                if (groupName) {
                    isSuccess = this.groupService.addGroup(groupName)
                    if (isSuccess) {
                        this.newGroupInputs.delete(key)
                        this.dispatchEvent(new CustomEvent(Events.GROUP_ADDED, { bubbles: true, composed: true, detail: { groupName } }));
                    }
                } else {
                    this.toastService.showErrorToast('Название группы не может быть пустым!')
                }
            }
        })
        if(isSuccess){
            this.renderGroups();
        }
    }

    private handleDeleteGroup(event: Event, group: Group) {
        event.stopPropagation();
        const groupId = group.id;
        const title = `Удалить группу?`;
        const message = 'Удаление группы повлечет за собой удаление контактов, связанных с этой группой.';

        if(!this.confirmationDialog){
            return
        }

        this.confirmationDialog.show(title, message, 'Да, удалить').then(confirmed => {
            if (confirmed) {
                if (this.groupService.deleteGroup(groupId)) {
                    this.renderGroups();
                    this.dispatchEvent(new CustomEvent(Events.GROUP_DELETED, { bubbles: true, composed: true, detail: { groupId } }));
                } else {
                    this.toastService.showErrorToast('Не удалось удалить группу!')
                }
            }
        })
    }
}

customElements.define('group-list-component', GroupListComponent);