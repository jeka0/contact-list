import html from './sidebar-component.html?raw';
import cssUrl from './sidebar-component.scss?url';
import { Events } from '../../enum/events-enum';

export class SidebarComponent extends HTMLElement {
    private shadowRootRef: ShadowRoot;
    private closeButton: HTMLButtonElement | null = null;
    private contentContainer: HTMLDivElement | null = null;
    private sidebarElement: HTMLElement | null = null;

    static get observedAttributes() {
        return ['open'];
    }

    constructor() {
        super();
        this.shadowRootRef = this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">
            ${html}
        `;
        this.shadowRootRef.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.closeButton = this.shadowRootRef.querySelector('.close-sidebar');
        this.contentContainer = this.shadowRootRef.querySelector('.sidebar-content');
        this.sidebarElement = this.shadowRootRef.querySelector('.sidebar');

        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.closeSidebar.bind(this));
        }

        this.updateSidebarVisibility();
    }

    disconnectedCallback() {
        if (this.closeButton) {
            this.closeButton.removeEventListener('click', this.closeSidebar.bind(this));
        }
    }
    
    attributeChangedCallback(name: string) {
        if (name === 'open') {
            this.updateSidebarVisibility();
        }
    }

    closeSidebar() {
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent(Events.SIDEBAR_CLOSED, { bubbles: true, composed: true }));
    }

    setContent(component: HTMLElement, props: { [key: string]: any } = {}) {
        if (!this.contentContainer) {
            return;
        }
        
        this.contentContainer.innerHTML = '';
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                (component as any)[key] = props[key];
            }
        }
        
        this.contentContainer.appendChild(component);
    }

    private updateSidebarVisibility() {
        if (!this.sidebarElement) {
            return;
        }

        if (this.hasAttribute('open')) {
            this.sidebarElement.classList.add('open');
        } else {
            this.sidebarElement.classList.remove('open');
        }
    }
}

customElements.define('sidebar-component', SidebarComponent);