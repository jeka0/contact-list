import html from './custom-dropdown-component.html?raw';
import cssUrl from './custom-dropdown-component.scss?url';
import type { DropdownOption } from '../../models/DropdownOption';
import { Events } from '../../enum/events-enum';

const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    ${html}
`;

export class CustomDropdownComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private dropdownContainer: HTMLDivElement | null = null;
    private selectedValueText: HTMLSpanElement | null = null;
    private optionsContainer: HTMLDivElement | null = null;
    private dropdownSelectedValue: HTMLDivElement | null = null;

    private _options: DropdownOption[] = [];
    private _selectedValue: string = '';
    private _placeholder: string = 'Выберите группу';
    private _isValid = true;

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.dropdownContainer = this.shadowRootRef.querySelector('.custom-dropdown-container');
        this.selectedValueText = this.shadowRootRef.querySelector('.value-text');
        this.optionsContainer = this.shadowRootRef.querySelector('.dropdown-options');
        this.dropdownSelectedValue = this.shadowRootRef.querySelector('.dropdown-selected-value');

        this.dropdownContainer?.addEventListener('click', this.toggleDropdown.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        this.updatePlaceholder();
        this.renderOptions();
    }

    disconnectedCallback() {
        this.dropdownContainer?.removeEventListener('click', this.toggleDropdown.bind(this));
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

    set options(newOptions: DropdownOption[]) {
        this._options = newOptions;
        this.renderOptions();
    }

    get options(): DropdownOption[] {
        return this._options;
    }

    set value(newValue: string) {
        if (this._selectedValue !== newValue) {
            this._selectedValue = newValue;
            this.updateSelectedValueDisplay();
            this.dispatchEvent(new CustomEvent(Events.DROPDOWN_CHANGE, {
                detail: { value: this._selectedValue },
                bubbles: true,
                composed: true
            }));
        }
    }

    get value(): string {
        return this._selectedValue;
    }

    set placeholder(newPlaceholder: string) {
        this._placeholder = newPlaceholder;
        this.updatePlaceholder();
    }

    get placeholder(): string {
        return this._placeholder;
    }

    set isValid(value: boolean){
        this._isValid = value;
        this.updateValidStatus();
    }

    get isValid(){
        return this._isValid;
    }

    private updatePlaceholder() {
        if (this.selectedValueText && !this._selectedValue) {
            this.selectedValueText.textContent = this._placeholder;
            this.selectedValueText.style.color = '#757575';
        }
    }

    private renderOptions() {
        if (!this.optionsContainer) return;

        this.optionsContainer.innerHTML = '';
        this._options.forEach(optionData => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('dropdown-option');
            optionElement.textContent = optionData.text;
            (optionElement as HTMLElement).dataset.value = optionData.value;

            optionElement.addEventListener('click', (e) => this.selectOption(e, optionData.value));

            this.optionsContainer?.appendChild(optionElement);
        });
        this.updateSelectedValueDisplay();
    }

    private updateSelectedValueDisplay() {
        if (this.selectedValueText) {
            const selectedOption = this._options.find(opt => opt.value === this._selectedValue);
            if (selectedOption) {
                this.selectedValueText.textContent = selectedOption.text;
                this.selectedValueText.style.color = '#333';
            } else {
                this.selectedValueText.textContent = this._placeholder;
                this.selectedValueText.style.color = '#757575';
            }
        }

        if (this.optionsContainer) {
            this.optionsContainer.querySelectorAll('.dropdown-option').forEach(opt => {
                const htmlOpt = opt as HTMLElement;
                if (htmlOpt.dataset.value === this._selectedValue) {
                    htmlOpt.classList.add('selected');
                } else {
                    htmlOpt.classList.remove('selected');
                }
            });
        }
    }

    private updateValidStatus() {
        if(!this.dropdownSelectedValue){
            return;
        }

        if(this._isValid){
            this.dropdownSelectedValue.classList.remove('invalid');
        }else {
            this.dropdownSelectedValue.classList.add('invalid');
        }
    }

    private toggleDropdown(event: Event) {
        event.stopPropagation();
        this.dropdownContainer?.classList.toggle('open');
    }

    private selectOption(event: Event, value: string) {
        event.stopPropagation();
        this.value = value;
        this.dropdownContainer?.classList.remove('open');
    }

    private handleOutsideClick(event: MouseEvent) {
        if (this.dropdownContainer && !this.dropdownContainer.contains(event.target as Node)) {
            this.dropdownContainer.classList.remove('open');
        }
    }
}

customElements.define('custom-dropdown', CustomDropdownComponent);