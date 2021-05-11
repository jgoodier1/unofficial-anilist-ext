import { showMediaPage } from '../../script.js';

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
