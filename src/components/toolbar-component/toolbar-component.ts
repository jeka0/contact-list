import html from './toolbar-component.html?raw';
import cssUrl from './toolbar-component.scss?url';

const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${cssUrl}">
  ${html}
`;

export class ToolbarComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('toolbar-component', ToolbarComponent);
