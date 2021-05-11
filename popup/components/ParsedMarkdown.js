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
