async function registerWebComponent(tagName: string, templateUrl: string) {
  try {
    const response = await fetch(templateUrl);

    const htmlText = await response.text();

    const parsed = new DOMParser();
    const doc = parsed.parseFromString(htmlText, 'text/html');
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

          if (template) {
            shadowRoot.appendChild(template.content.cloneNode(true));
          }
        }
      }
    );
  } catch (error) {}
}
