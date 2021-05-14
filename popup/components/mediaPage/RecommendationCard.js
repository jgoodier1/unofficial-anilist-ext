import { showMediaPage } from '../../pages/media.js';

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
