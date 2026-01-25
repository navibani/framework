const template = document.createElement('template');
template.innerHTML = `<p>This is a test component: <slot></slot></p>`;

class TestComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('test-component', TestComponent);
