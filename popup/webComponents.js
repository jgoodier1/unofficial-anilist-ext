import { showMediaPage } from './script.js';

export class DataComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'data-comp-wrapper');

    const title = wrapper.appendChild(document.createElement('p'));
    title.textContent = this.getAttribute('data-title');
    title.setAttribute('class', 'data-comp-p data-comp-title');

    const value = wrapper.appendChild(document.createElement('p'));
    value.textContent = this.getAttribute('data-value');
    value.setAttribute('class', 'data-comp-p data-comp-value');

    const style = document.createElement('style');
    style.textContent = `
    .data-comp-wrapper {
      margin-right: 16px;
    }

    .data-comp-p {
      width: max-content;
      font-size: 14px;
    }

    .data-comp-title {
      font-weight: 500;
    }
    `;

    this.shadowRoot.append(style, wrapper);
  }
}

export class RelationCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('button');
    wrapper.setAttribute('class', 'wrapper');

    const id = this.getAttribute('data-id');
    const type = this.getAttribute('data-type');
    wrapper.addEventListener('click', () => showMediaPage(id, type));

    const image = wrapper.appendChild(document.createElement('img'));
    image.setAttribute('class', 'image');
    image.src = this.getAttribute('data-src');

    const contentWrapper = wrapper.appendChild(document.createElement('div'));
    contentWrapper.setAttribute('class', 'content-wrapper');

    const relationType = contentWrapper.appendChild(document.createElement('p'));
    relationType.textContent = this.getAttribute('data-relation');

    const title = contentWrapper.appendChild(document.createElement('p'));
    title.textContent = this.getAttribute('data-title');

    const bottomLine = contentWrapper.appendChild(document.createElement('p'));
    bottomLine.textContent = this.getAttribute('data-bottom');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: grid;
        grid-template-columns: 80px auto;
        padding: 0;
        padding-bottom: 8px;
        border: none;
        background-color: #fafafa;
        height: 108px;
        cursor:pointer;
        margin-right: 16px;
      }
      .image {
        height: 108px;
        max-width: 70px;
        object-fit: cover;
      }
      .content-wrapper {
        display: flex;
        flex-flow: column;
        justify-content: space-around;
        min-width: 250px;
        max-width: 400px
      }
      .content-wrapper > * {
        text-align:left;
        font-size: 14px;
        margin: 0;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }
}

export class CharacterCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    // const charId = this.getAttribute('data-char-id')
    // const actorId = this.getAttribute('data-act-id')

    const characterButton = wrapper.appendChild(document.createElement('button'));
    characterButton.setAttribute('class', 'button char-button');
    const characterImage = characterButton.appendChild(document.createElement('img'));
    characterImage.src = this.getAttribute('data-char-src');
    characterImage.setAttribute('class', 'img');

    const characterName = characterButton.appendChild(document.createElement('p'));
    characterName.textContent = this.getAttribute('data-char-name');
    const role = characterButton.appendChild(document.createElement('p'));
    role.textContent = this.getAttribute('data-role');

    if (this.getAttribute('data-actor-name')) {
      const actorButton = wrapper.appendChild(document.createElement('button'));
      actorButton.setAttribute('class', 'button act-button');
      const actorName = actorButton.appendChild(document.createElement('p'));
      actorName.textContent = this.getAttribute('data-actor-name');
      const language = actorButton.appendChild(document.createElement('p'));
      language.textContent = this.getAttribute('data-language');
      const actorImage = actorButton.appendChild(document.createElement('img'));
      actorImage.src = this.getAttribute('data-actor-src');
      actorImage.setAttribute('class', 'img act-img');
    }

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: grid;
        grid-template-columns: 200px 200px;
        border:none;
        background-color: #fafafa;
        width: 100%;
        margin-bottom: 16px;
        padding: 0;
      }
      .button {
        display: grid;
        padding: 0;
        border: 0;
        background-color: inherit;
        height: 100px;
        cursor:pointer;
      }
      .char-button {
        grid-template-columns: 70px auto;
        justify-items: start;
      }
      .act-button {
        grid-template-columns: auto 70px;
        justify-items: end;
      }
      .img {
        height: 100px;
        grid-row: 1/3;
        max-width: 60px;
        object-fit: cover;
      }
      .act-img {
        grid-column: 2;
      }
      p {
        align-self: center;
        font-size: 14px;
        text-align: left;
      }

    `;

    this.shadowRoot.append(wrapper, style);
  }
}

export class StaffCard extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('button');
    wrapper.setAttribute('class', 'wrapper');

    // const id = this.getAttribute('data-id')

    const image = wrapper.appendChild(document.createElement('img'));
    image.src = this.getAttribute('data-src');
    image.setAttribute('class', 'image');
    const name = wrapper.appendChild(document.createElement('p'));
    name.textContent = this.getAttribute('data-name');
    const role = wrapper.appendChild(document.createElement('p'));
    role.textContent = this.getAttribute('data-role');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        border: 0;
        padding: 0;
        background-color: #fafafa;
        cursor: pointer;
        display: grid;
        grid-template-columns: 50px auto;
        margin-bottom: 16px;
        width: 100%;
        text-align: left;
        grid-gap: 0 10px;
        font-size: 12px;
      }
      .image {
        height: 70px;
        grid-row: 1/3;
        max-width: 50px;
        object-fit: cover;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }
}
