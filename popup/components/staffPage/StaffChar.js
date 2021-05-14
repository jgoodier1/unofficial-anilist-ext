import { showMediaPage } from '../../pages/media.js';
import { showCharacterPage } from '../../pages/character.js';

/**
 * Character role card for the Staff page. Shows the character image and name,
 * and what media they belong to
 */
export class StaffChar extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
    .wrapper{
      position: relative;
      width: 121px;
    }
    .button {
      padding: 0;
      border: 0;
      cursor: pointer;
    }
    .char-button {
      width: 121px;
      height: 170px;
    }
    .media-button {
      top: 0;
      position: absolute;
      right: 0;
      width: 40px;
      height: 55px;
      border: 1px solid white;
    }
    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .name {
      font-size: 14px;
      font-weight: 400;
      margin-top: 8px;
      margin-bottom: 0;
      cursor: pointer;
    }
    .title {
      font-size: 12px;
      margin-top: 0;
      cursor: pointer;
    }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const character = this.dataChar;
    const media = this.dataNode;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const characterButton = wrapper.appendChild(document.createElement('button'));
    characterButton.setAttribute('class', 'button char-button');
    characterButton.addEventListener('click', () => showCharacterPage(character.id));

    const charImageElement = characterButton.appendChild(document.createElement('img'));
    charImageElement.setAttribute('class', 'image');
    charImageElement.src = character.image.large;
    charImageElement.alt = character.name.full;

    const mediaButton = wrapper.appendChild(document.createElement('button'));
    mediaButton.setAttribute('class', 'button media-button');
    mediaButton.addEventListener('click', () => showMediaPage(media.id));

    const mediaImageElement = mediaButton.appendChild(document.createElement('img'));
    mediaImageElement.setAttribute('class', 'image');
    mediaImageElement.src = media.coverImage.medium;
    mediaImageElement.alt = media.title.userPreferred;

    const nameElement = wrapper.appendChild(document.createElement('h3'));
    nameElement.setAttribute('class', 'name');
    const strongName = nameElement.appendChild(document.createElement('strong'));
    strongName.textContent = character.name.full;
    character.role === 'MAIN' && nameElement.append(' Main');
    nameElement.addEventListener('click', () => showCharacterPage(character.id));

    const titleElement = wrapper.appendChild(document.createElement('p'));
    titleElement.setAttribute('class', 'title');
    titleElement.textContent = media.title.userPreferred;
    titleElement.addEventListener('click', () => showMediaPage(media.id, media.type));
  }
}
