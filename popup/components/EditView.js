import { addEntry, editEntry, deleteEntry } from '../queries.js';
import { createRow } from '../script.js';

export class EditView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {

      }
    `;

    this.shadowRoot.append(wrapper, style);
  }

  connectedCallback() {
    const { media, entry, prevContainer, listType } = this.data;
    console.log(this.data);

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
    optionCurrent.textContent = listType === 'ANIME' ? 'Watching' : 'Reading';
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
    const planningContent = listType === 'ANIME' ? 'Watch' : 'Read';
    optionPlanning.textContent = 'Planning to ' + planningContent;
    const optionRepeating = statusSelect.appendChild(document.createElement('option'));
    optionRepeating.value = 'REPEATING';
    optionRepeating.textContent = listType === 'ANIME' ? 'Rewatching' : 'Rereading';

    if (entry) statusSelect.value = entry.status;

    const scoreLabel = form.appendChild(document.createElement('label'));
    scoreLabel.classList.add('edit-score');
    scoreLabel.setAttribute('for', 'score-input');
    scoreLabel.textContent = 'Score';

    const scoreInput = scoreLabel.appendChild(document.createElement('input'));
    scoreInput.id = 'score-input';
    scoreInput.setAttribute('type', 'number');
    scoreInput.setAttribute('min', '0');
    scoreInput.setAttribute('max', '10');
    scoreInput.setAttribute('step', '0.5');
    if (entry) scoreInput.value = entry.score;

    const progressLabel = form.appendChild(document.createElement('label'));
    progressLabel.classList.add('edit-progress');
    progressLabel.setAttribute('for', 'progress-input');
    progressLabel.textContent = 'Progress';

    // have a max progress so that the mutation doesn't return an error
    let maxProgress;
    if (listType === 'ANIME' && media.episodes !== null) {
      maxProgress = media.episodes;
    } else if (listType === 'MANGA' && media.chapters !== null) {
      maxProgress = media.chapters;
    } else maxProgress = 99999;

    const progressInput = progressLabel.appendChild(document.createElement('input'));
    progressInput.id = 'progress-input';
    progressInput.setAttribute('type', 'number');
    progressInput.setAttribute('min', '0');
    progressInput.setAttribute('max', maxProgress);
    progressInput.setAttribute('step', '1');
    if (entry) progressInput.value = entry.progress;

    const saveButton = form.appendChild(document.createElement('button'));
    saveButton.classList.add('edit-save', 'edit-button');
    saveButton.setAttribute('type', 'submit');
    saveButton.textContent = 'Save';

    form.addEventListener('submit', async event => {
      event.preventDefault();
      // if we come from the media page, we might have entry, put it would only have media
      //inside of entry, so, I should be checking if entry exists here, rather than in the search query
      if (entry && entry.id) {
        const scoreValue = scoreInput.value || 0;
        const progressValue = progressInput.value || 0;
        const mutationResult = await editEntry(
          entry.id,
          statusSelect.value,
          scoreValue,
          progressValue
        );
        if (mutationResult.hasError === false) {
          this.updatedListAndHome(entry, {
            status: statusSelect.value,
            score: scoreValue,
            progress: progressValue
          });
          editContainer.classList.add('hide');
          document.getElementById(prevContainer).classList.remove('hide');
        } else {
          // display error
          const error = document.createElement('error-message');
          error.style.gridColumn = '1/4';
          error.errors = mutationResult.errors;
          wrapper.append(error);
        }
      } else {
        const scoreValue = scoreInput.value || 0;
        const progressValue = progressInput.value || 0;
        const entry = await addEntry(
          media.id,
          statusSelect.value,
          scoreValue,
          progressValue
        );
        this.addToListAndHome(entry, statusSelect.value);
        editContainer.classList.add('hide');
        document.getElementById(prevContainer).classList.remove('hide');
      }
    });

    // only want the delete button if the entry already exists
    if (entry) {
      const deleteButton = form.appendChild(document.createElement('button'));
      deleteButton.classList.add('edit-delete', 'edit-button');
      deleteButton.setAttribute('type', 'button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        deleteEntry(entry.id);
        this.deleteFromListAndHome(entry);
        editContainer.classList.add('hide');
        document.getElementById('home').classList.remove('hide');
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
          // update it like how we update the popover position
          homeEntry.setAttribute('data-progress', updatedProgress);
        }
      }

      // remove from home if status changes from current/repeating to something else
      // also fix all other popovers
      if (updatedStatus && updatedStatus !== 'CURRENT' && updatedStatus !== 'REPEATING') {
        const allHomeCards = document.querySelectorAll(
          `home-card[data-type="${oldEntry.media.type}"]`
        );
        allHomeCards.forEach(card => {
          const currentPosition = card.getAttribute('data-position');
          const removedPosition = homeEntry.getAttribute('data-position');
          if (currentPosition > removedPosition) {
            const newPosition = +currentPosition - 1;
            card.setAttribute('data-position', newPosition);
          }
        });
        document.getElementById('home-' + oldEntry.media.type).removeChild(homeEntry);
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
   */
  deleteFromListAndHome(entry) {
    if (entry.status === 'CURRENT' || entry.status === 'REPEATING') {
      const homeEntry = document.getElementById('home-' + entry.id);
      const homeWrapper = document.getElementById('home-' + entry.media.type);
      homeWrapper.removeChild(homeEntry);
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

    // const totalContent = this.getAttribute('data-total-content');
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