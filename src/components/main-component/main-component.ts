import html from './main-component.html?raw';
import cssUrl from './main-component.scss?url';

const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="${cssUrl}">
  ${html}
`;

export class MainComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('main-component', MainComponent);
