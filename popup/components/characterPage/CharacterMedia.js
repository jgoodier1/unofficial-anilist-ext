import { showMediaPage, showStaffPage } from '../../script.js';

/**
 * The media card for the character page. Show the media image and title,
 * and, if applicable, voice actor image and name
 */
export class CharacterMedia extends HTMLElement {
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
      .media-button {
        width: 121px;
        height: 170px;
      }
      .actor-button {
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
      .title {
        font-size: 14px;
        font-weight: 600;
        margin-top: 8px;
        margin-bottom: 0;
        cursor: pointer;
      }
      .actor-name {
        font-size: 12px;
        margin-top: 0;
        cursor: pointer;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const character = this.data;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const mediaButton = wrapper.appendChild(document.createElement('button'));
    mediaButton.setAttribute('class', 'button media-button');
    mediaButton.addEventListener('click', () => {
      showMediaPage(character.id, character.type);
    });

    const coverImageElement = mediaButton.appendChild(document.createElement('img'));
    coverImageElement.setAttribute('class', 'image');
    coverImageElement.src = character.coverImage.large;
    coverImageElement.alt = character.title.userPreferred;

    const titleElement = wrapper.appendChild(document.createElement('h3'));
    titleElement.setAttribute('class', 'title');
    titleElement.textContent = character.title.userPreferred;
    titleElement.addEventListener('click', () => {
      showMediaPage(character.id, character.type);
    });

    if (character.voiceActors.length > 0) {
      const actorElement = wrapper.appendChild(document.createElement('p'));
      actorElement.setAttribute('class', 'actor-name');
      actorElement.textContent = character.voiceActors[0].voiceActor.name.full;
      actorElement.addEventListener('click', () => {
        showStaffPage(character.voiceActors[0].voiceActor.id);
      });
      const actorButton = wrapper.appendChild(document.createElement('button'));
      actorButton.setAttribute('class', 'button actor-button');
      actorButton.addEventListener('click', () => {
        showStaffPage(character.voiceActors[0].voiceActor.id);
      });
      const actorImageElement = actorButton.appendChild(document.createElement('img'));
      actorImageElement.setAttribute('class', 'image');
      actorImageElement.src = character.voiceActors[0].voiceActor.image.medium;
      actorImageElement.alt = character.voiceActors[0].voiceActor.name.full;
    }
  }
}
