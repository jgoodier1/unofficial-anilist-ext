import { showMediaPage } from '../../pages/media.js';

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
