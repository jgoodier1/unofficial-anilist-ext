export class ErrorMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const heading = wrapper.appendChild(document.createElement('h2'));
    heading.textContent = 'Error:';

    const errorList = document.createElement('ul');
    wrapper.append(errorList);

    const style = document.createElement('style');
    // h2 and ul have padding because adding top/bottom padding to the wrapper made the
    // whole thing jump, and this was the quickest solution
    // TODO: figure out why it's jumping
    style.textContent = `
      .wrapper{
        background-color: #fa4b4b;
        padding: 0 16px;
      }
      h2 {
        padding-top: 16px;
      }
      ul {
        padding-bottom: 16px;
      }
      `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const errors = this.errors;

    const list = this.shadowRoot.querySelector('ul');

    errors.forEach(error => {
      const listItem = document.createElement('li');
      listItem.textContent = error;
      list.append(listItem);
    });
  }
}
