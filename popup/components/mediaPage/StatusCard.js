import { COLOURS } from '../../constants.js';

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
        background-color: ${COLOURS.green};
      }
      .green span {
        color: ${COLOURS.green};
      }
      .blue .status {
        background-color: ${COLOURS.blue};
      }
      .blue span {
        color: ${COLOURS.blue};
      }
      .purple .status {
        background-color: ${COLOURS.purple};
      }
      .purple span {
        color: ${COLOURS.purple};
      }
      .pink .status {
        background-color: ${COLOURS.pink};
      }
      .pink span {
        color: ${COLOURS.pink};
      }
      .red .status {
        background-color: ${COLOURS.red};
      }
      .red span {
        color: ${COLOURS.red};
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
    count.textContent = stat.amount;
    countWrapper.append(count, ' Users');
  }
}
