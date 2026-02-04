async function registerWebComponent(tagName, templateUrl) {
  const response = await fetch(templateUrl);
  const htmlText = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const template = doc.querySelector('template');

  if (!template) {
    throw new Error(`No <template> found in ${templateUrl}`);
  }

  customElements.define(
    tagName,
    class extends HTMLElement {
      constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.appendChild(template.content.cloneNode(true));
      }
    },
  );
}
