import { addEntry, editEntry, deleteEntry, checkIfOnList } from '../queries.js';
import { createRow } from '../utils.js';

export class EditView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }

      .wrapper {
        background-color: var(--colour-container);
        display: grid;
        grid-template-columns: 120px 243px 1fr;
        grid-gap: 10px 0;
        margin: 16px;
        padding: 16px;
      }

      .edit-title {
        font-size: 24px;
        font-weight: 500;
      }

      .edit-close {
        border: none;
        background-color: inherit;
        font-size: 18px;
        font-weight: bold;
        width: min-content;
        height: min-content;
        cursor: pointer;
        place-self: center;
      }

      .edit-form {
        grid-column: 1/4;
        display: grid;
        grid-template-columns: repeat(2, 50%);
        grid-gap: 10px 0;
        font-size: 18px;
      }

      .edit-status {
        grid-column: 1/3;
        grid-row: 1;
      }

      select {
        width: 100%;
        font-size: 16px;
        padding: 4px 0;
        background-color: white;
        border: 1px solid #8F8F9D;
        /* explicit height to match the height of the inputs */
        height: 31.6px;
      }
      option {
        height: 31.6px;
        padding-left: 6px;
        line-height: 1.6;
      }

      .edit-score {
        grid-column: 1/3;
        grid-row: 2;
      }

      .edit-progress {
        grid-column: 1/3;
        grid-row: 3;
      }

      .edit-score > input,
      .edit-progress > input {
        width: 100%;
        font-size: 16px;
        padding-left: 6px;
        line-height: 1.6;
      }

      .edit-button {
        border: none;
        padding: 10px;
        width: min-content;
        place-self: center;
        font-size: 18px;
        cursor: pointer;
      }

      .edit-save {
        background-color: #4ccefa;
        grid-row: 4;
      }
      .edit-delete {
        background-color: #fa4b4b;
        grid-column: 2;
        grid-row: 4;
      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  async connectedCallback() {
    const { mediaId, prevContainer } = this.data;

    const { mediaListEntry, ...media } = await checkIfOnList(mediaId);

    const editContainer = document.getElementById('edit');

    const wrapper = this.shadowRoot.querySelector('.wrapper');
    const image = wrapper.appendChild(document.createElement('img'));
    image.classList.add('edit-image');
    image.src = media.coverImage.medium;

    const title = wrapper.appendChild(document.createElement('h1'));
    title.classList.add('edit-title');
    title.textContent = media.title.userPreferred;

    const xButton = wrapper.appendChild(document.createElement('button'));
    xButton.classList.add('edit-close');
    xButton.textContent = 'X';
    xButton.addEventListener('click', () => {
      editContainer.removeChild(wrapper);
      editContainer.classList.add('hide');
      document.getElementById(prevContainer).classList.remove('hide');
    });

    const form = wrapper.appendChild(document.createElement('form'));
    form.classList.add('edit-form');

    const statusLabel = form.appendChild(document.createElement('label'));
    statusLabel.classList.add('edit-status');
    statusLabel.textContent = 'Status';
    statusLabel.setAttribute('for', 'status-select');

    const statusSelect = statusLabel.appendChild(document.createElement('select'));
    statusSelect.id = 'status-select';

    const optionCurrent = statusSelect.appendChild(document.createElement('option'));
    optionCurrent.value = 'CURRENT';
    optionCurrent.textContent = media.type === 'ANIME' ? 'Watching' : 'Reading';
    const optionCompleted = statusSelect.appendChild(document.createElement('option'));
    optionCompleted.value = 'COMPLETED';
    optionCompleted.textContent = 'Completed';
    const optionPaused = statusSelect.appendChild(document.createElement('option'));
    optionPaused.value = 'PAUSED';
    optionPaused.textContent = 'Paused';
    const optionDropped = statusSelect.appendChild(document.createElement('option'));
    optionDropped.value = 'DROPPED';
    optionDropped.textContent = 'Dropped';
    const optionPlanning = statusSelect.appendChild(document.createElement('option'));
    optionPlanning.value = 'PLANNING';
    // this would always say 'Read' if it's not in its own variable
    const planningContent = media.type === 'ANIME' ? 'Watch' : 'Read';
    optionPlanning.textContent = 'Planning to ' + planningContent;
    const optionRepeating = statusSelect.appendChild(document.createElement('option'));
    optionRepeating.value = 'REPEATING';
    optionRepeating.textContent = media.type === 'ANIME' ? 'Rewatching' : 'Rereading';

    if (mediaListEntry) statusSelect.value = mediaListEntry.status;

    const scoreLabel = form.appendChild(document.createElement('label'));
    scoreLabel.classList.add('edit-score');
    scoreLabel.setAttribute('for', 'score-input');
    scoreLabel.textContent = 'Score';

    const scoreInput = scoreLabel.appendChild(document.createElement('input'));
    scoreInput.id = 'score-input';
    scoreInput.setAttribute('type', 'number');
    // these are commented out because the popup on Firefox doesn't show the default browser error
    // if the value is not in this range, so I did validation myself below
    // scoreInput.setAttribute('min', '0');
    // scoreInput.setAttribute('max', '10');
    scoreInput.setAttribute('step', '0.5');
    if (mediaListEntry) scoreInput.value = mediaListEntry.score;

    const progressLabel = form.appendChild(document.createElement('label'));
    progressLabel.classList.add('edit-progress');
    progressLabel.setAttribute('for', 'progress-input');
    progressLabel.textContent = 'Progress';

    // have a max progress so that the mutation doesn't return an error
    let maxProgress;
    if (media.type === 'ANIME' && media.episodes !== null) {
      maxProgress = media.episodes;
    } else if (media.type === 'MANGA' && media.chapters !== null) {
      maxProgress = media.chapters;
    } else maxProgress = 99999;

    const progressInput = progressLabel.appendChild(document.createElement('input'));
    progressInput.id = 'progress-input';
    progressInput.setAttribute('type', 'number');
    // these are commented out because the popup on Firefox doesn't show the default browser error
    // if the value is not in this range, so I did validation myself below
    // progressInput.setAttribute('min', '0');
    // progressInput.setAttribute('max', maxProgress);
    progressInput.setAttribute('step', '1');
    if (mediaListEntry) progressInput.value = mediaListEntry.progress;

    const saveButton = form.appendChild(document.createElement('button'));
    saveButton.classList.add('edit-save', 'edit-button');
    saveButton.setAttribute('type', 'submit');
    saveButton.textContent = 'Save';

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const existingError = wrapper.querySelector('error-message');
      if (existingError) wrapper.removeChild(existingError);
      // input validation
      if (
        progressInput.value < 0 ||
        (maxProgress && progressInput.value > maxProgress) ||
        scoreInput.value < 0 ||
        scoreInput.value > 10
      ) {
        const error = document.createElement('error-message');
        error.style.gridColumn = '1/4';
        error.errors = [];
        if (
          progressInput.value < 0 ||
          (maxProgress && progressInput.value > maxProgress)
        ) {
          if (!maxProgress) error.errors.push('Progress must be above 0');
          else error.errors.push(`Progress must be between 0 and ${maxProgress}`);
        }
        if (scoreInput.value < 0 || scoreInput.value > 10) {
          error.errors.push('Score must be between 0 and 10');
        }
        wrapper.append(error);
        return;
      }
      // edit the entry if its on the list already
      if (mediaListEntry) {
        const scoreValue = scoreInput.value || 0;
        const progressValue = progressInput.value || 0;
        const editResults = await editEntry(
          mediaListEntry.id,
          statusSelect.value,
          scoreValue,
          progressValue
        );
        if (!editResults.hasError) {
          this.updatedListAndHome(
            { media: media, ...mediaListEntry },
            {
              status: statusSelect.value,
              score: scoreValue,
              progress: progressValue
            }
          );
          const editButton = document.querySelector('edit-button');
          if (editButton) editButton.setAttribute('data-status', statusSelect.value);
          editContainer.classList.add('hide');
          document.getElementById(prevContainer).classList.remove('hide');
        } else {
          // display error
          const error = document.createElement('error-message');
          error.style.gridColumn = '1/4';
          error.errors = editResults.errors;
          wrapper.append(error);
        }
        // add the entry if its not on the list already
      } else {
        const scoreValue = scoreInput.value || 0;
        const progressValue = progressInput.value || 0;
        const entry = await addEntry(
          media.id,
          statusSelect.value,
          scoreValue,
          progressValue
        );
        if (!entry.hasError) {
          this.addToListAndHome(entry.listEntry, statusSelect.value);

          const editButton = document.querySelector('edit-button');
          if (editButton) editButton.setAttribute('data-status', statusSelect.value);
          editContainer.classList.add('hide');
          document.getElementById(prevContainer).classList.remove('hide');
        } else {
          // display error
          const error = document.createElement('error-message');
          error.style.gridColumn = '1/4';
          error.errors = entry.errors;
          wrapper.append(error);
        }
      }
    });

    // only want the delete button if the entry already exists
    if (mediaListEntry) {
      const deleteButton = form.appendChild(document.createElement('button'));
      deleteButton.classList.add('edit-delete', 'edit-button');
      deleteButton.setAttribute('type', 'button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        const mutation = await deleteEntry(mediaListEntry.id);
        if (!mutation.hasError) {
          this.deleteFromListAndHome(mediaListEntry, media.type);
          const editButton = document.querySelector('edit-button');
          if (editButton) editButton.setAttribute('data-status', '');
          editContainer.classList.add('hide');
          document.getElementById('home').classList.remove('hide');
        } else {
          const error = document.createElement('error-message');
          error.style.gridColumn = '1/4';
          error.errors = mutation.errors;
          wrapper.append(error);
        }
      });
    }
  }

  /**
   * After editing and entry, this gets called and updates the home and list pages with the new data
   * @param {Object} oldEntry the entry that's already on the list
   * @param {Object} editedEntry the updated entry
   */
  updatedListAndHome(oldEntry, editedEntry) {
    let updatedStatus;
    if (oldEntry.status !== editedEntry.status) updatedStatus = editedEntry.status;

    let updatedScore;
    if (oldEntry.score !== editedEntry.score) updatedScore = editedEntry.score;

    let updatedProgress;
    if (oldEntry.progress !== editedEntry.progress)
      updatedProgress = editedEntry.progress;

    // update home
    if (oldEntry.status === 'CURRENT' || oldEntry.status === 'REPEATING') {
      const homeEntry = document.getElementById('home-' + oldEntry.id);
      if (updatedStatus === undefined) {
        if (updatedProgress) {
          // this triggers `attributeChangedCallback` in HomeCard
          homeEntry.setAttribute('data-progress', updatedProgress);
        }
      }

      // remove from home if status changes from current/repeating to something else
      // also fix all other popovers
      if (updatedStatus && updatedStatus !== 'CURRENT' && updatedStatus !== 'REPEATING') {
        this.adjustHomeCardsRemove(homeEntry, oldEntry.media.type);
      }
    }
    // this maybe should be `else if` since I only want it to do this if one of these
    // wasn't the old status
    if (updatedStatus && (updatedStatus === 'CURRENT' || updatedStatus === 'REPEATING')) {
      // add it to the home page in the right spot.
      this.createHomeCard(oldEntry);
      this.adjustHomeCards(oldEntry.media.type);
    }

    // update the list
    if (document.getElementById('list').firstChild) {
      const listEntry = document.getElementById('list-' + oldEntry.id);
      if (updatedScore)
        listEntry.querySelector('.list-row-score').textContent = updatedScore;
      if (updatedProgress)
        listEntry.querySelector('.list-row-progress').textContent = updatedProgress;

      if (updatedStatus) {
        // remove it from it's current spot.
        const currentSection = document.getElementById('list-' + oldEntry.status);
        const removedEntry = currentSection.removeChild(listEntry);

        // add it to the new one.
        this.addToListSection(
          removedEntry,
          updatedStatus,
          oldEntry.media.title.userPreferred
        );
      }
    }
  }

  /**
   * Adds the new list item to the home page and the list
   * @param {Object} entry the list entry
   * @param {string} status one of CURRENT, COMPLETED, PAUSED, DROPPED, PLANNING, or REPEATING
   */
  addToListAndHome(entry, status) {
    // home
    if (status === 'CURRENT' || status === 'REPEATING') {
      this.createHomeCard(entry);
      this.adjustHomeCards(entry.media.type);
    }

    // list (only if already rendered)
    if (document.getElementById('list').firstChild) {
      const row = createRow(entry);
      this.addToListSection(row, status, entry.media.title.userPreferred);
    }
  }

  /**
   * Removes the entry from the list and home pages, so that they can be removed without requerying
   * @param {Object} entry the list entry
   * @param {string} mediaType either ANIME or MANGA
   */
  deleteFromListAndHome(entry, mediaType) {
    if (entry.status === 'CURRENT' || entry.status === 'REPEATING') {
      const homeEntry = document.getElementById('home-' + entry.id);
      this.adjustHomeCardsRemove(homeEntry, mediaType);
    }

    // check if it's been rendered
    if (document.getElementById('list').firstChild) {
      const listEntry = document.getElementById('list-' + entry.id);
      const sectionWrapper = document.getElementById('list-' + entry.status);
      sectionWrapper.removeChild(listEntry);
    }

    document.getElementById('edit').classList.add('hide');
    document.getElementById('home').classList.remove('hide');
    // go back to home
  }

  /**
   * updates the `data-position` attribute on all home cards, triggering `attributeChangedCallback`
   * on the `HomeCard` component
   * @param {string} mediaType either ANIME or MANGA
   */
  adjustHomeCards(mediaType) {
    // TODO: differentiate between airing and not airing (so not necessarily the start)
    const allHomeCards = document.querySelectorAll(`home-card[data-type="${mediaType}"]`);
    allHomeCards.forEach(card => {
      const currentPosition = card.getAttribute('data-position');

      const newPosition = +currentPosition + 1;
      // triggers the `attributeChangedCallback` on the `HomeCard` component
      card.setAttribute('data-position', newPosition);
    });
  }

  /**
   * removes a `home-card` and adjusts the popover positions
   * @param {Object} entry the `home-card` element to be removd
   * @param {string} mediaType either ANIME or MANGA
   */
  adjustHomeCardsRemove(entry, mediaType) {
    const allHomeCards = document.querySelectorAll(`home-card[data-type="${mediaType}"]`);
    allHomeCards.forEach(card => {
      const currentPosition = card.getAttribute('data-position');
      const removedPosition = entry.getAttribute('data-position');
      if (currentPosition > removedPosition) {
        const newPosition = +currentPosition - 1;
        card.setAttribute('data-position', newPosition);
      }
    });
    document.getElementById('home-' + mediaType).removeChild(entry);
  }

  /**
   * function that moves a list row to the right spot in it's new section
   * @param {HTMLDivElement} row the HTML element
   * @param {string} status one of CURRENT, COMPLETED, PAUSED, DROPPED, PLANNING, or REPEATING
   * @param {string} title the media title
   */
  addToListSection(row, status, title) {
    // TODO: check if list section exists, and create it if not
    const section = document.getElementById('list-' + status);
    const titleNodes = document.querySelectorAll('#list-' + status + ' .title');
    const allTitles = [];
    titleNodes.forEach(title => allTitles.push(title.textContent));
    allTitles.push(title);
    const sortedTitles = allTitles.sort((a, b) => a > b);
    const newIndex = sortedTitles.indexOf(title);
    section.insertBefore(row, section.children[newIndex + 1]);
  }

  /**
   * creates the media card for the home page
   * ALL CHANGES HERE MUST ALSO BE MADE IN SCRIPT.JS IN THE IDENTICALLY NAMED FUNCTION.
   * This one is here because the two function are slightly different in
   * where they position the card. I think it also makes sense to move it here so that its
   * easier to understand what this component is doing
   * @param {Object} entry the list entry from the API
   */
  createHomeCard(entry) {
    const totalContent =
      entry.media.type === 'ANIME' ? entry.media.episodes : entry.media.chapters;

    let listContainer = document.getElementById('home-' + entry.media.type);
    // might not exist
    if (!listContainer) {
      listContainer = document.createElement('div');
      listContainer.id = 'home-' + entry.media.type;
      listContainer.classList.add('container-list');
      document.getElementById('home').appendChild(listContainer);
    }

    const homeCard = document.createElement('home-card');
    homeCard.id = 'home-' + entry.id;
    homeCard.entry = entry;
    homeCard.totalContent = totalContent;
    homeCard.setAttribute('data-position', 0);
    homeCard.setAttribute('data-type', entry.media.type);
    homeCard.setAttribute('data-progress', entry.progress);

    listContainer.insertBefore(homeCard, listContainer.children[0]);
  }
}
