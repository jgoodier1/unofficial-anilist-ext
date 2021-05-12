import { updateEntry } from '../queries.js';
import { showMediaPage } from '../script.js';
import { LEFT_POSITIONS } from '../constants.js';

/**
 * the card on the home page
 */
export class HomeCard extends HTMLElement {
  static get observedAttributes() {
    return ['data-position', 'data-progress'];
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
      // updating from the attribute because it needs to be the single source of truth
      // (if the list entry is updated from the edit view, `entry.progress` would be out of sync)
      let progress = Number(this.getAttribute('data-progress'));
      progress += 1;
      updateEntry(entry.id, entry.status, progress);
      // this triggers `attributeChangedCallback`, which updates the `home-card` progress indicator
      this.setAttribute('data-progress', progress);
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
      totalContent !== null ? '/ ' + totalContent : ''
    }`;
    progressElement.setAttribute('class', 'progress');
  }

  // update the position of the the popover when a new card is added to the home page
  // also update the progress count when changed in EditView
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-position' && oldValue !== null) {
      const popover = this.shadowRoot.querySelector('.popover');
      if (LEFT_POSITIONS.includes(+newValue)) {
        popover.setAttribute('class', 'left popover');
      } else popover.setAttribute('class', 'right popover');
    } else if (name === 'data-progress' && oldValue !== null) {
      const progressElement = this.shadowRoot.querySelector('.progress');
      const updateElement = this.shadowRoot.querySelector('.update');
      progressElement.textContent = `Progress: ${newValue} ${
        this.totalContent !== null ? '/ ' + this.totalContent : ''
      }`;
      updateElement.textContent = `${newValue} +`;
    }
  }
}
