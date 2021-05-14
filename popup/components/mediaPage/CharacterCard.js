import { showCharacterPage } from '../../pages/character.js';
import { showStaffPage } from '../../pages/staff.js';

/**
 * character card for the media page. Show the character name, their role and,
 * if applicable, the voice actor
 */
export class CharacterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

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

  connectedCallback() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const character = this.dataCharacter;

    const characterButton = wrapper.appendChild(document.createElement('button'));
    characterButton.setAttribute('class', 'button char-button');
    const characterImage = characterButton.appendChild(document.createElement('img'));
    characterImage.src = character.image.medium;
    characterImage.alt = character.name.full;
    characterImage.setAttribute('class', 'img');

    characterButton.addEventListener('click', () => {
      showCharacterPage(character.id);
    });

    const characterName = characterButton.appendChild(document.createElement('p'));
    characterName.textContent = character.name.full;
    const roleElement = characterButton.appendChild(document.createElement('p'));
    roleElement.textContent = character.role;

    if (character.voiceActors.length > 0) {
      const actorButton = wrapper.appendChild(document.createElement('button'));
      actorButton.setAttribute('class', 'button act-button');
      actorButton.addEventListener('click', () =>
        showStaffPage(character.voiceActors[0].id)
      );

      const actorNameElement = actorButton.appendChild(document.createElement('p'));
      actorNameElement.textContent = character.voiceActors[0].name.full;
      const languageElement = actorButton.appendChild(document.createElement('p'));
      languageElement.textContent = character.voiceActors[0].language;
      const actorImage = actorButton.appendChild(document.createElement('img'));
      actorImage.src = character.voiceActors[0].image.medium;
      actorImage.setAttribute('class', 'img act-img');
    }
  }
}
