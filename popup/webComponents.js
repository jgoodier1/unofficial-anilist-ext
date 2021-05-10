import { showCharacterPage, showMediaPage, showStaffPage } from './script.js';
import { updateEntry } from './queries.js';

const LEFT_POSITIONS = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];

/**
 * the card on the home page
 */
export class HomeCard extends HTMLElement {
  // listen for changes so that the popover positions can be updated
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
      *:focus {
        outline: 4px solid #00c0ff;
      }
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
        width: 214px;
        height: 118px;
        top: -1px;

      }
      .left {
        left: 85px;
      }
      .right {
        right: 85px;
        justify-items: end;
        text-align: right;
      }
      .title {
        color:black;
        font-size: 14px;
        /* font-weight: lighter; */
      }
      .progress {
        color: #4f4f4f;
        font-size: 12px;
      }
      .image:hover ~ .popover,
      .image:focus ~ .popover,
      .update:focus ~ .popover,
      .update:hover ~ .popover {
        display: grid;
      }
      .image:hover + .update,
      .image:focus + .update,
      .update:hover,
      .update:focus {
        opacity: 1;
      }
      .image:hover ~ .episode,
      .image:focus ~ .episode,
      .update:hover ~ .episode,
      .update:focus ~ .episode,
      .episode:hover {
        opacity: 0;
        height: 0px;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }
  connectedCallback() {
    const entry = this.entry;
    const totalContent = this.totalContent;
    const position = this.getAttribute('data-position');

    const wrapper = this.shadowRoot.querySelector('.wrapper');

    const image = wrapper.appendChild(document.createElement('div'));
    image.style.setProperty('background-image', `url(${entry.media.coverImage.medium})`);
    image.setAttribute('class', 'image');
    image.setAttribute('tabIndex', '0');
    image.addEventListener('click', () => {
      showMediaPage(entry.media.id, entry.media.type);
    });

    const updateElement = wrapper.appendChild(document.createElement('div'));
    updateElement.textContent = `${entry.progress} +`;
    updateElement.setAttribute('class', 'update on-img');
    updateElement.setAttribute('tabIndex', '0');
    updateElement.addEventListener('click', () => {
      updateEntry(entry.id, status, entry.progress + 1);
      updateElement.textContent = `${entry.progress + 1} +`;
      progressElement.textContent = `Progress: ${entry.progress + 1} ${
        totalContent !== 'null' ? '/' + totalContent : ''
      }`;
      entry.progress += 1;
    });

    if (entry.media.nextAiringEpisode && entry.media.nextAiringEpisode.episode) {
      const episodeElement = wrapper.appendChild(document.createElement('div'));
      episodeElement.setAttribute('class', 'on-img episode');
      const episodeNumber = episodeElement.appendChild(document.createElement('p'));
      episodeNumber.textContent = `Ep ${entry.media.nextAiringEpisode.episode}`;

      const DAY = 86400;
      const HOUR = 3600;
      const MINUTE = 60;
      const days = Math.trunc(entry.media.nextAiringEpisode.timeUntilAiring / DAY);
      const dayRemainder = entry.media.nextAiringEpisode.timeUntilAiring % DAY;
      const hours = Math.trunc(dayRemainder / HOUR);
      const hourRemainder = dayRemainder % HOUR;
      const minutes = Math.trunc(hourRemainder / MINUTE);

      const timeElement = episodeElement.appendChild(document.createElement('p'));
      if (days === 0) timeElement.textContent = `${hours}h ${minutes}m`;
      if (days === 0 && hours === 0) timeElement.textContent = `${minutes}m`;
      else timeElement.textContent = `${days}d ${hours}h ${minutes}m`;

      if (entry.media.nextAiringEpisode.episode - entry.progress > 1) {
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
    titleElement.textContent = entry.media.title.userPreferred;
    titleElement.setAttribute('class', 'title');

    const progressElement = popover.appendChild(document.createElement('p'));
    progressElement.textContent = `Progress: ${entry.progress} ${
      totalContent !== 'null' ? '/' + totalContent : ''
    }`;
    progressElement.setAttribute('class', 'progress');
  }

  // update the position of the the popover when a new card is added to the home page
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== null) {
      const popover = this.shadowRoot.querySelector('.popover');
      if (LEFT_POSITIONS.includes(+newValue)) {
        popover.setAttribute('class', 'left popover');
      } else popover.setAttribute('class', 'right popover');
    }
  }
}

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

/**
 * the relation card on the media page. ie. source material, adapations, etc.
 */
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
    const relation = this.dataNode;
    const type = this.dataRelation;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    wrapper.addEventListener('click', () => showMediaPage(relation.id, relation.type));

    const image = wrapper.appendChild(document.createElement('img'));
    image.setAttribute('class', 'image');
    image.src = relation.coverImage.medium;
    image.alt = relation.title.userPreferred;

    const contentWrapper = wrapper.appendChild(document.createElement('div'));
    contentWrapper.setAttribute('class', 'content-wrapper');

    const relationType = contentWrapper.appendChild(document.createElement('p'));
    relationType.textContent = type;

    const titleElement = contentWrapper.appendChild(document.createElement('p'));
    titleElement.textContent = relation.title.userPreferred;

    const bottomLine = contentWrapper.appendChild(document.createElement('p'));
    bottomLine.textContent = relation.format + ' • ' + relation.status;
  }
}

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

/**
 * the staff card for the media page. Show their name, image and what their role was
 */
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
        grid-template-columns: 55px auto;
        margin-bottom: 16px;
        width: 100%;
        text-align: left;
        grid-gap: 0 10px;
        font-size: 12px;
      }
      .image {
        height: 78px;
        grid-row: 1/3;
        max-width: 55px;
        object-fit: cover;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const staff = this.dataStaff;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    wrapper.addEventListener('click', () => showStaffPage(staff.id));

    const image = wrapper.appendChild(document.createElement('img'));
    image.src = staff.image.medium;
    image.alt = staff.name.full;
    image.setAttribute('class', 'image');
    const nameElement = wrapper.appendChild(document.createElement('p'));
    nameElement.textContent = staff.name.full;
    const roleElement = wrapper.appendChild(document.createElement('p'));
    roleElement.textContent = staff.role;
  }
}

/**
 * the recommendation card for the media page. Shows the image and title
 */
export class RecommendationCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('button');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper{
        border: 0;
        cursor: pointer;
        margin-right: 16px;
        display: flex;
        flex-flow: column;
        justify-content: start;
        max-width: 70px;
        padding: 0;
      }
      .image {
        height: 100px;
        max-width: 70px;
        object-fit: cover;
      }
      .title {
        font-size: 12px;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const recommendation = this.dataRec;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    wrapper.addEventListener('click', () => {
      showMediaPage(recommendation.id, recommendation.type);
    });

    const image = wrapper.appendChild(document.createElement('img'));
    image.src = recommendation.coverImage.medium;
    image.alt = recommendation.title.userPreferred;
    image.setAttribute('class', 'image');

    const title = wrapper.appendChild(document.createElement('p'));
    title.textContent = recommendation.title.userPreferred;
    title.setAttribute('class', 'title');
  }
}

/**
 * the status card for the media page. Shows how many people have the media set as that status
 */
export class StatusCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: flex;
        flex-flow: column;
      }
      .status {
        padding: 4px 8px;
        color: white;
        width: max-content;
        border-radius: 8px;
      }
      .count-wrapper {
        margin-bottom: 0;
        text-align: center;
      }
      .green .status {
        background-color: #36CC02;
      }
      .green span {
        color: #36CC02;
      }
      .blue .status {
        background-color: #0283CC;
      }
      .blue span {
        color: #0283CC;
      }
      .purple .status {
        background-color: #5B02CC;
      }
      .purple span {
        color: #5B02CC;
      }
      .pink .status {
        background-color: #FA06F0;
      }
      .pink span {
        color: #FA06F0;
      }
      .red .status {
        background-color: #FA0606;
      }
      .red span {
        color: #FA0606;
      }

    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const stat = this.stat;
    const index = this.index;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const status = wrapper.appendChild(document.createElement('div'));
    status.setAttribute('class', 'status');
    status.textContent = stat.status;
    switch (index) {
      case 0:
        wrapper.classList.add('green');
        break;
      case 1:
        wrapper.classList.add('blue');
        break;
      case 2:
        wrapper.classList.add('purple');
        break;
      case 3:
        wrapper.classList.add('pink');
        break;
      case 4:
        wrapper.classList.add('red');
        break;
      default:
        break;
    }
    const countWrapper = wrapper.appendChild(document.createElement('p'));
    countWrapper.classList.add('count-wrapper');
    const count = document.createElement('span');
    count.textContent = stat.count;
    countWrapper.append(count, ' Users');
  }
}

/**
 * the individual bar component for the bar chart on the media page.
 */
export class GraphBar extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: flex;
        flex-flow: column;
        align-items: center;
      }
      .wrapper p {
        font-size: 12px;
      }
      .bar {
        max-height: 75px;
        min-height: 17px;
        width: 16px;
        background-color: black;
        border-radius: 20px;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const graphData = this.data;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const amount = wrapper.appendChild(document.createElement('p'));
    amount.textContent = graphData.amount;

    const bar = wrapper.appendChild(document.createElement('div'));
    bar.style.height = `${(graphData.amount / graphData.max) * 75}px`;
    bar.setAttribute('class', 'bar');

    switch (graphData.score) {
      case 10:
        bar.style.backgroundColor = '#FF0909';
        break;
      case 20:
        bar.style.backgroundColor = '#FD3E02';
        break;
      case 30:
        bar.style.backgroundColor = '#FF9900';
        break;
      case 40:
        bar.style.backgroundColor = '#F5BF00';
        break;
      case 50:
        bar.style.backgroundColor = '#FFE600';
        break;
      case 60:
        bar.style.backgroundColor = '#FAFF00';
        break;
      case 70:
        bar.style.backgroundColor = '#D2F400';
        break;
      case 80:
        bar.style.backgroundColor = '#ADFF00';
        break;
      case 90:
        bar.style.backgroundColor = '#8FFF00';
        break;
      case 100:
        bar.style.backgroundColor = '#62FF02';
        break;

      default:
        break;
    }

    const score = wrapper.appendChild(document.createElement('p'));
    score.textContent = graphData.score;
  }
}

/**
 * a component that translates markdown into html. Only does a few elements
 */
export class ParsedMarkdown extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const paragraph = document.createElement('p');
    paragraph.setAttribute('class', 'paragraph');

    const style = document.createElement('style');
    style.textContent = `
      .paragraph{
        margin-top: 0;
      }
      .spoiler::before {
        content: "SPOILER, HOVER TO VIEW";
        cursor: pointer;
        padding: 8px;
        font-size: 16px;
        font-weight: 600;
      }
      .hidden {
        display: none;
      }
      .spoiler:hover > .hidden {
        display: inline;
      }
      `;

    this.shadowRoot.append(paragraph, style);
  }

  connectedCallback() {
    const paragraph = this.shadowRoot.querySelector('.paragraph');

    const data = this.getAttribute('data');

    const newData = data
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*)__/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/_(.*)_/gim, '<em>$1</em>')
      .replace(
        /~!(.*)!~/gim,
        `<span class="spoiler"><br><span class='hidden'>$1</span><br></span>`
      )
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
    paragraph.innerHTML = newData;
  }
}

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

/**
 * Staff role card for the staff page. Roles are for example, original creator, song performance, etc.
 * The car show the media image and title, along with the role
 */
export class StaffRole extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const style = document.createElement('style');
    style.textContent = `
    .wrapper{
      width: 121px;
    }
    .button {
      padding: 0;
      border: 0;
      cursor: pointer;
      width: 121px;
      height: 170px;
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
    .role {
      font-size: 12px;
      margin-top: 0;
      cursor: pointer;
    }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const role = this.data;

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const button = wrapper.appendChild(document.createElement('button'));
    button.setAttribute('class', 'button');
    button.addEventListener('click', () => showMediaPage(role.id, role.type));

    const imageElement = button.appendChild(document.createElement('img'));
    imageElement.setAttribute('class', 'image');
    imageElement.src = role.coverImage.large;
    imageElement.alt = role.title.userPreferred;

    const titleElement = wrapper.appendChild(document.createElement('h3'));
    titleElement.setAttribute('class', 'title');
    titleElement.textContent = role.title.userPreferred;
    titleElement.addEventListener('click', () => showMediaPage(role.id, role.type));

    const roleElement = wrapper.appendChild(document.createElement('p'));
    roleElement.setAttribute('class', 'role');
    roleElement.textContent = role.role;
  }
}
