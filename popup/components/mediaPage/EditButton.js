import { openEditView } from '../../script.js';

export class EditButton extends HTMLElement {
  static get observedAttributes() {
    return ['data-status'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const button = document.createElement('button');

    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }

      button {
        width: -moz-fit-content;
        height: -moz-fit-content;
        font-size: 16px;
        border: none;
        background-color: #02b2d9;
        padding: 5px 12px;
        color: white;
        cursor: pointer;
        border-radius: 8px;
      }
    `;

    this.shadowRoot.append(button, style);
  }

  connectedCallback() {
    const button = this.shadowRoot.querySelector('button');

    button.addEventListener('click', () => {
      openEditView(this.mediaId, 'page');
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-status') {
      this.setTextContent(newValue);
    }
  }

  setTextContent(value) {
    const button = this.shadowRoot.querySelector('button');
    const type = this.mediaType;
    switch (value) {
      case 'CURRENT':
        if (type === 'ANIME') button.textContent = 'Watching';
        else button.textContent = 'Reading';
        break;
      case 'COMPLETED':
        button.textContent = 'Completed';
        break;
      case 'PLANNING':
        button.textContent = 'Planning';
        break;
      case 'DROPPED':
        button.textContent = 'Dropped';
        break;
      case 'PAUSED':
        button.textContent = 'Paused';
        break;
      case 'REPEATING':
        if (type === 'ANIME') button.textContent = 'Rewatching';
        else button.textContent = 'Rereading';
        break;
      default:
        button.textContent = 'Add to List';
        break;
    }
  }
}
