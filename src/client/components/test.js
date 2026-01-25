class TestComponent extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<p>This is a test component!</p>`;
  }
}

customElements.define('test-component', TestComponent);
