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
