import { showMediaPage } from './script.js';
import { updateEntry } from './queries.js';

const LEFT_POSITIONS = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];

export class HomeCard extends HTMLElement {
  static get observedAttributes() {
    return ['data-position'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: flex;
        position: relative;
      }
      .image {
        height: 115px;
        width: 85px;
        cursor: pointer;
        position: relative;
        border-radius: 3px;

        /* COVER */
        background-position: 50%;
        background-repeat: no-repeat;
        background-size: cover;
      }
      .update {
        padding: 8px 0;
        opacity: 0;
        cursor: pointer;
      }
      .on-img {
        isolation: isolate;
        position: absolute;
        text-align: center;
        background: #2e2d2dc4;
        width: 85px;
        color: white;
        font-size: 12px;
        transition: 0.2s;
        border-radius: 0 0 3px 3px;
        bottom: 0;
        font-weight: 300;
      }
      .episode {
        opacity: 1;
        border-bottom: 4px #2f2e2ec4;
        height: 45px;
      }
      .episode p {
          margin: 5px 0;
      }
      .popover {
        z-index: 5;
        display: none;
        background: #edf1f5;
        padding: 0 0.5rem;
        position: absolute;
        width: 226px;
        height: 118px;
        top: -1px;

      }
      .left {
        left:85px;
      }
      .right {
        right: 89px;
        justify-items: end;
        text-align: right;
      }
      .title {
        color:black;
        font-size: 14px;
        font-weight: lighter;
      }
      .progress {
        color: #93989c;
        font-size: 12px;
      }
      .image:hover ~ .popover,
      .update:hover ~ .popover {
        display: grid;
      }
      .image:hover + .update,
      .update:hover {
        opacity: 1;
      }
      .image:hover ~ .episode,
      .update:hover ~ .episode,
      .episode:hover {
        opacity: 0;
        height: 0px;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }
  connectedCallback() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');

    const mediaId = this.getAttribute('data-media-id');
    const type = this.getAttribute('data-type');
    const imageSrc = this.getAttribute('data-image');
    let progress = this.getAttribute('data-progress');
    const entryId = this.getAttribute('data-entry-id');
    const status = this.getAttribute('data-status');
    const nextEpisode = this.getAttribute('data-episode');
    const timeUntilEpisode = this.getAttribute('data-time');
    const title = this.getAttribute('data-title');
    const totalContent = this.getAttribute('data-total-content');
    const position = this.getAttribute('data-position');

    // don't leave as div
    const image = wrapper.appendChild(document.createElement('div'));
    image.style.setProperty('background-image', `url(${imageSrc})`);

    image.setAttribute('class', 'image');
    image.addEventListener('click', () => {
      showMediaPage(mediaId, type);
    });

    const updateElement = wrapper.appendChild(document.createElement('div'));
    updateElement.textContent = `${progress} +`;
    updateElement.setAttribute('class', 'update on-img');
    updateElement.addEventListener('click', () => {
      updateEntry(entryId, status, +progress + 1);
      updateElement.textContent = `${+progress + 1} +`;
      progressElement.textContent = `Progress: ${+progress + 1} ${
        totalContent !== 'null' ? '/' + totalContent : ''
      }`;
      progress += 1;
    });

    if (nextEpisode) {
      const episodeElement = wrapper.appendChild(document.createElement('div'));
      episodeElement.setAttribute('class', 'on-img episode');
      const episodeNumber = episodeElement.appendChild(document.createElement('p'));
      episodeNumber.textContent = `Ep ${nextEpisode}`;

      const DAY = 86400;
      const HOUR = 3600;
      const MINUTE = 60;
      const days = Math.trunc(timeUntilEpisode / DAY);
      const dayRemainder = timeUntilEpisode % DAY;
      const hours = Math.trunc(dayRemainder / HOUR);
      const hourRemainder = dayRemainder % HOUR;
      const minutes = Math.trunc(hourRemainder / MINUTE);

      const timeElement = episodeElement.appendChild(document.createElement('p'));
      if (days === 0) timeElement.textContent = `${hours}h ${minutes}m`;
      if (days === 0 && hours === 0) timeElement.textContent = `${minutes}m`;
      else timeElement.textContent = `${days}d ${hours}h ${minutes}m`;

      if (nextEpisode - progress > 1) {
        episodeElement.style.borderBottom = '4px solid #ff6d6d';
      }
    }

    // the popover element that shows the title and progress
    // popover is on the right if the entry is on the left, vice versa
    const popover = wrapper.appendChild(document.createElement('div'));
    if (LEFT_POSITIONS.includes(+position)) {
      popover.setAttribute('class', 'left popover');
    } else popover.setAttribute('class', 'right popover');

    const titleElement = popover.appendChild(document.createElement('p'));
    titleElement.textContent = title;
    titleElement.setAttribute('class', 'title');

    const progressElement = popover.appendChild(document.createElement('p'));
    progressElement.textContent = `Progress: ${progress} ${
      totalContent !== 'null' ? '/' + totalContent : ''
    }`;
    progressElement.setAttribute('class', 'progress');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== null) {
      const popover = this.shadowRoot.querySelector('.popover');
      if (LEFT_POSITIONS.includes(+newValue)) {
        popover.setAttribute('class', 'left popover');
      } else popover.setAttribute('class', 'right popover');
    }
  }
}

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
    .title {
      font-weight: 500;
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

export class RelationCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('button');
    wrapper.setAttribute('class', 'wrapper');

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

  connectedCallback() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');

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
  }
}

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
  }
}

export class StaffCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('button');
    wrapper.setAttribute('class', 'wrapper');

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

  connectedCallback() {
    const wrapper = this.shadowRoot.querySelector('.wrapper');

    // const id = this.getAttribute('data-id')

    const image = wrapper.appendChild(document.createElement('img'));
    image.src = this.getAttribute('data-src');
    image.setAttribute('class', 'image');
    const name = wrapper.appendChild(document.createElement('p'));
    name.textContent = this.getAttribute('data-name');
    const role = wrapper.appendChild(document.createElement('p'));
    role.textContent = this.getAttribute('data-role');
  }
}
