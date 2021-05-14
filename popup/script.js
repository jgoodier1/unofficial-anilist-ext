import { getCurrentList, getUser } from './queries.js';

import {
  EditView,
  HomeCard,
  DataComponent,
  RelationCard,
  CharacterCard,
  StaffCard,
  RecommendationCard,
  StatusCard,
  GraphBar,
  ParsedMarkdown,
  CharacterMedia,
  StaffChar,
  StaffRole,
  ErrorMessage,
  EditButton
} from './components/index.js';

import { showList } from './pages/list.js';
import { searchPage } from './pages/search.js';

customElements.define('home-card', HomeCard);
customElements.define('data-comp', DataComponent);
customElements.define('relation-card', RelationCard);
customElements.define('character-card', CharacterCard);
customElements.define('staff-card', StaffCard);
customElements.define('recommend-card', RecommendationCard);
customElements.define('status-card', StatusCard);
customElements.define('graph-bar', GraphBar);
customElements.define('parsed-markdown', ParsedMarkdown);
customElements.define('char-media', CharacterMedia);
customElements.define('staff-char', StaffChar);
customElements.define('staff-role', StaffRole);
customElements.define('error-message', ErrorMessage);
customElements.define('edit-view', EditView);
customElements.define('edit-button', EditButton);

// nav buttons
document.getElementById('home-button').addEventListener('click', () => {
  homePage();
});
document.getElementById('anime-button').addEventListener('click', () => {
  showList('ANIME');
});
document.getElementById('manga-button').addEventListener('click', () => {
  showList('MANGA');
});
document.getElementById('search-nav-button').addEventListener('click', () => {
  searchPage();
});

// // the sign out button within the settings menu
document.getElementById('sign-out-button').addEventListener('click', () => {
  browser.storage.local.remove('token');
  const homeWrapper = document.getElementById('home');
  while (homeWrapper.firstChild) homeWrapper.removeChild(homeWrapper.firstChild);
  homePage();
});

/**
 * Function that displays the home list
 */
async function homePage() {
  const token = (await browser.storage.local.get('token')).token;
  if (token) {
    const allContainers = document.querySelectorAll('.container');
    allContainers.forEach(container => container.classList.add('hide'));
    const homeWrapper = document.getElementById('home');
    homeWrapper.classList.remove('hide');
    document.getElementById('nav').classList.remove('hide');

    if (homeWrapper.firstChild) return;
    await homeList('ANIME');
    await homeList('MANGA');
  } else {
    unauthorized();
  }
}

/**
 * renders the list for the home page
 * @param {string} listType either ANIME or MANGA
 * @returns void
 */
async function homeList(listType) {
  const homeWrapper = document.getElementById('home');
  const lists = await getCurrentList(listType);

  // if there aren't any current or repeating, don't show anything
  if (lists.length === 0) {
    return;
  }

  // put all of the entries into one array and sort them
  const entries = [];
  lists.forEach(list => {
    list.forEach(entry => entries.push(entry));
  });
  const currentlyAiring = entries.filter(entry => entry.media.nextAiringEpisode !== null);
  currentlyAiring.sort(
    (a, b) =>
      a.media.nextAiringEpisode.timeUntilAiring >
      b.media.nextAiringEpisode.timeUntilAiring
  );
  const finishedAiring = entries.filter(entry => entry.media.nextAiringEpisode === null);
  finishedAiring.sort((a, b) => a.updatedAt < b.updatedAt);

  // the heading above the list
  const headingElement = document.createElement('h2');
  headingElement.classList.add('heading-list');
  headingElement.textContent =
    listType === 'ANIME' ? 'Anime In Progress' : 'Manga In Progress';
  homeWrapper.appendChild(headingElement);

  // create the container for the list entries
  const listContainer = document.createElement('div');
  listContainer.id = 'home-' + listType;
  listContainer.classList.add('container-list');
  homeWrapper.appendChild(listContainer);

  let position = 1;
  // creates the list items
  currentlyAiring.forEach(entry => {
    if (position > 32) return;
    createHomeCard(entry, position, false);
    position++;
  });
  finishedAiring.forEach(entry => {
    if (position > 32) return;
    createHomeCard(entry, position);
    position++;
  });
}

/**
 * creates the media card for the home page
 * ALL UPDATES HERE SHOULD ALSO BE DONE TO EDITVIEW.JS. It has a copy of the function that is
 * slightly different. I copied it rather than just reusing it because it made sense to me
 * to have the logic inside the component
 * @param {Object} entry list entry from the API
 * @param {number} position the position that the card is to be place in
 */
function createHomeCard(entry, position) {
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
  homeCard.setAttribute('data-position', position);
  homeCard.setAttribute('data-type', entry.media.type);
  homeCard.setAttribute('data-progress', entry.progress);

  listContainer.append(homeCard);
}

/**
 * Function that shows the log-in page
 */
function unauthorized() {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));
  document.getElementById('nav').classList.add('hide');
  const unauthorizedContainer = document.getElementById('unauthorized');
  unauthorizedContainer.classList.remove('hide');

  async function verifyToken() {
    const token = textareaElement.value;
    token.trim();
    // verify the token
    const res = await getUser(token);
    // if return an id, show the lists
    if (typeof res === 'number') {
      browser.storage.local.set({ token: textareaElement.value });
      textareaElement.value = '';
      homePage();
    }
    // else stay unauthorized and display an error
    else {
      const popupElement = document.createElement('div');
      popupElement.classList.add('auth-error');
      popupElement.textContent = res[0].message;
      unauthorizedContainer.appendChild(popupElement);
      const backdrop = document.getElementById('backdrop');
      backdrop.classList.remove('hide');
      backdrop.addEventListener('click', () => {
        unauthorizedContainer.removeChild(popupElement);
        textareaElement.value = '';
        backdrop.classList.add('hide');
      });
    }
  }

  // When the submit is pressed or enter is pressed, add token to storage and call homePage again
  const buttonElement = document.getElementById('submit-token');
  const textareaElement = document.getElementById('token');
  buttonElement.addEventListener('click', verifyToken);
  textareaElement.addEventListener('keydown', e => {
    if (textareaElement.value === '') return;
    if (e.code === 'Enter') {
      verifyToken();
    }
  });
}

// call homePage when the popup is opened
homePage();
