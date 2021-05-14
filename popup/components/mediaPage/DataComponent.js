/**
 * a component on the media page for all of the small bits of data
 */
export class DataComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
    .wrapper {
      margin-right: 16px;
    }
    .p {
      width: max-content;
      font-size: 14px;
    }
    .value {
      font-weight: 600;
    }
    `;

    this.shadowRoot.append(style, wrapper);
  }

  connectedCallback() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const title = wrapper.appendChild(document.createElement('p'));
    title.textContent = this.getAttribute('data-title');
    title.setAttribute('class', 'p title');

    const value = wrapper.appendChild(document.createElement('p'));
    value.textContent = this.getAttribute('data-value');
    value.setAttribute('class', 'p value');
  }
}
