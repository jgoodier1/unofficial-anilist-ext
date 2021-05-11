import { showStaffPage } from '../../script.js';

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
