import {
  getCurrentList,
  getFullList,
  getUser,
  search,
  getMediaPage,
  getCharacterPage,
  getStaffPage,
  getCharacterMedia,
  getRoleMedia,
  getCharacterAppearances
} from './queries.js';

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

import { COLOURS, MONTHS } from './constants.js';

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

// used by the list so that it doesn't requery and rerender unnecessarily
let currentListType = '';

/**
 * Displays the entire list
 * @param {string} listType either 'ANIME' or 'MANGA'
 */
async function showList(listType) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));
  const list = document.getElementById('list');
  list.classList.remove('hide');

  if (currentListType === listType) return;
  currentListType = listType;
  while (list.firstChild) list.removeChild(list.firstChild);
  const lists = await getFullList(listType);

  const current = lists.filter(list => {
    return list.entries[0].status === 'CURRENT';
  });
  const completed = lists.filter(list => {
    return list.entries[0].status === 'COMPLETED';
  });
  const planning = lists.filter(list => {
    return list.entries[0].status === 'PLANNING';
  });
  const dropped = lists.filter(list => {
    return list.entries[0].status === 'DROPPED';
  });
  const paused = lists.filter(list => {
    return list.entries[0].status === 'PAUSED';
  });
  const repeating = lists.filter(list => {
    return list.entries[0].status === 'REPEATING';
  });

  if (current.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = listType === 'ANIME' ? 'Watching' : 'Reading';
    showListByStatus(current, 'CURRENT');
  }
  if (repeating.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = listType === 'ANIME' ? 'Rewatching' : 'Rereading';
    showListByStatus(repeating, 'REPEATING');
  }
  if (completed.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = 'Completed';
    showListByStatus(completed, 'COMPLETED');
  }
  if (paused.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = 'Paused';
    showListByStatus(paused, 'PAUSED');
  }
  if (dropped.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = 'Dropped';
    showListByStatus(dropped, 'DROPPED');
  }
  if (planning.length !== 0) {
    const header = list.appendChild(document.createElement('h2'));
    header.classList.add('list-header');
    header.textContent = 'Planning';
    showListByStatus(planning, 'PLANNING');
  }
}

/**
 * Renders the one status' section of the total list
 * @param {Object} statusList the list from the API
 * @param {string} statusType one of CURRENT, COMPLETED, PAUSED, DROPPED, PLANNING, or REPREATING
 */
function showListByStatus(statusList, statusType) {
  const list = document.getElementById('list');
  const section = list.appendChild(document.createElement('section'));
  section.id = 'list-' + statusType;
  const heading = section.appendChild(document.createElement('div'));
  heading.classList.add('list-row');
  const titleHeading = heading.appendChild(document.createElement('p'));
  titleHeading.classList.add('title-heading', 'list-heading');
  titleHeading.textContent = 'Title';
  const scoreHeading = heading.appendChild(document.createElement('p'));
  scoreHeading.classList.add('score-heading', 'list-heading');
  scoreHeading.textContent = 'Score';
  const progressHeading = heading.appendChild(document.createElement('p'));
  progressHeading.classList.add('progress-heading', 'list-heading');
  progressHeading.textContent = 'Progress';

  statusList.forEach(list => {
    const entries = list.entries;
    entries.sort((a, b) => a.media.title.userPreferred > b.media.title.userPreferred);
    entries.forEach(entry => {
      const row = createRow(entry, section);
      section.appendChild(row);
    });
  });
}

/**
 * Renders the editing page
 * Media and entry are separated because sometimes the user won't have it on their list already,
 * but the entry will have the entire media object on it too
 * @param {Object} media just the media section of the list entry
 * @param {string} listType either ANIME or MANGA
 * @param {string} prevContainer the container from which this function is called.
 * One of `list`, `search`, or `page`
 * @param {Object} entry optional, the entire list entry
 */
// function openEditView(media, listType, prevContainer, entry) {
export function openEditView(mediaId, prevContainer) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const editContainer = document.getElementById('edit');
  editContainer.classList.remove('hide');
  while (editContainer.firstChild) editContainer.removeChild(editContainer.firstChild);

  const view = document.createElement('edit-view');
  view.data = {
    mediaId,
    prevContainer
  };

  editContainer.append(view);
}

/**
 * creates the list row
 * @param {Object} entry the list entry
 * @returns the HTMLElement
 */
export function createRow(entry) {
  const row = document.createElement('div');
  row.id = 'list-' + entry.id;
  row.classList.add('list-row');
  const image = row.appendChild(document.createElement('img'));
  image.src = entry.media.coverImage.medium;

  // edit button on the image
  const editButton = row.appendChild(document.createElement('button'));
  editButton.classList.add('list-row-button');
  const svg = editButton.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  );
  svg.setAttributeNS(null, 'viewBox', '0 -1 401.52289 401');
  svg.setAttributeNS(null, 'fill', 'white');
  svg.classList.add('list-row-svg');
  const path1 = svg.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', 'path')
  );
  path1.setAttributeNS(
    null,
    'd',
    'm370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0'
  );
  const path2 = svg.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', 'path')
  );
  path2.setAttributeNS(
    null,
    'd',
    'm376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0'
  );

  editButton.addEventListener('click', () => {
    openEditView(entry.media.id, 'list');
  });

  const title = row.appendChild(document.createElement('h3'));
  title.setAttribute('tabIndex', '0');
  title.classList.add('list-row-title');
  title.textContent = entry.media.title.userPreferred;
  title.addEventListener('click', () => {
    showMediaPage(entry.media.id, entry.media.type);
  });

  const score = row.appendChild(document.createElement('p'));
  score.classList.add('list-row-score');
  if (entry.score === 0) score.textContent = '';
  else score.textContent = entry.score;

  const progress = row.appendChild(document.createElement('p'));
  progress.classList.add('list-row-progress');
  progress.textContent = entry.progress;

  return row;
}

/**
 * renders the search page
 */
async function searchPage() {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));
  const searchContainer = document.getElementById('search');
  searchContainer.classList.remove('hide');

  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  searchInput.focus();
  const searchQueryButton = document.getElementById('search-button');

  searchInput.addEventListener('keydown', async e => {
    if (searchInput.value === '') return;
    if (e.code === 'Enter') {
      e.preventDefault();
      const results = await search(searchInput.value);
      showSearchResults(results);
    }
  });
  searchQueryButton.addEventListener('click', async () => {
    if (searchInput.value === '') return;
    const results = await search(searchInput.value);
    showSearchResults(results);
  });
}

/**
 * renders the search results
 * @param {Object[]} allResults all the results from the query
 */
function showSearchResults(allResults) {
  const searchContainer = document.getElementById('search');
  const searchBar = document.getElementById('search-bar');
  while (searchBar.nextSibling) searchContainer.removeChild(searchBar.nextSibling);

  allResults.forEach((results, i) => {
    if (results.length === 0) return;
    let headingContent;
    if (i === 0) headingContent = 'Anime';
    else if (i === 1) headingContent = 'Manga';
    else if (i === 2) headingContent = 'Characters';
    else if (i === 3) headingContent = 'Staff';

    const resultsSection = searchContainer.appendChild(document.createElement('section'));
    const heading = resultsSection.appendChild(document.createElement('h2'));
    heading.classList.add('search-section-heading');

    heading.textContent = headingContent;
    const rowContainer = resultsSection.appendChild(document.createElement('div'));
    rowContainer.classList.add('search-row-container');

    results.forEach(result => {
      const row = rowContainer.appendChild(document.createElement('div'));
      row.id = 'search-' + result.id;
      row.classList.add('search-row');

      const image = row.appendChild(document.createElement('img'));
      // if media, show the cover image, else if they're a person, show their image
      if (i === 0 || i === 1) {
        image.src = result.coverImage.medium;
      } else if (i === 2 || i === 3) {
        image.src = result.image.medium;
      }
      image.classList.add('search-image');

      const title = row.appendChild(document.createElement('h3'));

      // media
      if (i === 0 || i === 1) {
        title.textContent = result.title.userPreferred;
        title.classList.add('search-title');
        title.addEventListener('click', () => {
          showMediaPage(result.id, result.type);
        });
        const yearAndFormat = row.appendChild(document.createElement('p'));
        yearAndFormat.textContent = result.startDate.year + ' ' + result.format;
        yearAndFormat.classList.add('search-media-year');

        // put an edit button on the end
        const editButton = row.appendChild(document.createElement('button'));
        editButton.classList.add('search-edit-button');
        const svg = editButton.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        );
        svg.setAttributeNS(null, 'viewBox', '0 -1 401.52289 401');
        svg.setAttributeNS(null, 'fill', 'black');
        svg.classList.add('search-edit-svg');
        const path1 = svg.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'path')
        );
        path1.setAttributeNS(
          null,
          'd',
          'm370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0'
        );
        const path2 = svg.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'path')
        );
        path2.setAttributeNS(
          null,
          'd',
          'm376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0'
        );

        editButton.addEventListener('click', async () => {
          openEditView(result.id, 'search');
        });
        // people
      } else if (i === 2 || i === 3) {
        title.textContent = result.name.full;
        title.classList.add('search-title', 'search-char-staff-title');
        if (i === 2) {
          title.addEventListener('click', () => showCharacterPage(result.id));
        } else if (i === 3) {
          title.addEventListener('click', () => showStaffPage(result.id));
        }
      }
    });
  });
}

/**
 * displays the page for media
 * @param {number} id
 * @param {string} type either 'ANIME' or 'MANGA'
 */
export async function showMediaPage(id, type) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const media = await getMediaPage(id, type);

  if (media.bannerImage !== null) {
    const bannerImage = pageContainer.appendChild(document.createElement('img'));
    bannerImage.src = media.bannerImage;
    bannerImage.classList.add('page-banner-img');
  }

  // topContainer contains the cover image, title, and media entry editing button
  const topContainer = pageContainer.appendChild(document.createElement('section'));
  topContainer.classList.add('page-top-container');
  const coverImage = topContainer.appendChild(document.createElement('img'));
  coverImage.src = media.coverImage.large;
  coverImage.classList.add('page-cover-img');
  if (media.bannerImage === null) coverImage.style.marginTop = '16px';

  const topContent = topContainer.appendChild(document.createElement('div'));
  topContent.classList.add('page-top-content');
  const title = topContent.appendChild(document.createElement('h1'));
  title.textContent = media.title.userPreferred;
  title.classList.add('page-top-title');

  const button = document.createElement('edit-button');
  const buttonStatus = media.mediaListEntry ? media.mediaListEntry.status : 'Add to List';
  button.mediaType = media.type;
  button.mediaId = media.id;
  button.setAttribute('data-status', buttonStatus);
  button.classList.add('page-top-button');
  topContent.append(button);

  // this is going to be really long, so bear with me
  const dataSection = pageContainer.appendChild(document.createElement('section'));
  dataSection.classList.add('page-section', 'page-data-section');

  function createDataComponent(title, value) {
    const component = document.createElement('data-comp');
    component.setAttribute('data-title', title);
    component.setAttribute('data-value', value);
    dataSection.append(component);
  }

  if (media.nextAiringEpisode !== null) {
    const DAY = 86400;
    const HOUR = 3600;
    const MINUTE = 60;
    const days = Math.trunc(media.nextAiringEpisode.timeUntilAiring / DAY);
    const dayRemainder = media.nextAiringEpisode.timeUntilAiring % DAY;
    const hours = Math.trunc(dayRemainder / HOUR);
    const hourRemainder = dayRemainder % HOUR;
    const minutes = Math.trunc(hourRemainder / MINUTE);

    let timeTilEpisode = '';
    if (days === 0) {
      if (hours === 0) timeTilEpisode = `${minutes}m`;
      else if (minutes === 0) timeTilEpisode = `${hours}h`;
      else timeTilEpisode = `${hours}h ${minutes}m`;
    } else {
      if (hours !== 0 && minutes !== 0) {
        timeTilEpisode = `${days}d ${hours}h ${minutes}m`;
      } else if (minutes === 0) timeTilEpisode = `${days} ${hours}h`;
      else if (hours === 0) timeTilEpisode = `${days}d ${minutes}m`;
      else timeTilEpisode = `${days}d`;
    }
    createDataComponent(
      'Airing',
      `Ep ${media.nextAiringEpisode.episode}: ${timeTilEpisode}`
    );
  }

  createDataComponent('Format', media.format);

  if (media.type === 'ANIME') {
    if (media.episodes !== null) {
      createDataComponent('Episodes', media.episodes);
    }
    if (media.duration) {
      createDataComponent('Episode Duration', `${media.duration} min`);
    }
  } else if (media.type === 'MANGA') {
    if (media.chapters !== null) {
      createDataComponent('Chapters', media.chapters);
    }
    if (media.volumes !== null) {
      createDataComponent('Volumes', media.volumes);
    }
  }

  if (media.startDate.day !== null) {
    createDataComponent(
      'Start Date',
      `${MONTHS[media.startDate.month]} ${media.startDate.day}, ${media.startDate.year}`
    );
  }

  if (media.endDate.day !== null) {
    createDataComponent(
      'End Date',
      `${MONTHS[media.endDate.month]} ${media.endDate.day}, ${media.endDate.year}`
    );
  }

  if (media.type === 'ANIME' && media.season !== null) {
    createDataComponent('Season', media.season + ' ' + media.seasonYear);
  }

  if (media.averageScore) {
    createDataComponent('Average Score', media.averageScore + '%');
  }
  if (media.meanScore) {
    createDataComponent('Mean Score', media.meanScore + '%');
  }
  createDataComponent('Popularity', media.popularity);

  createDataComponent('Favourites', media.favourites);

  if (media.type === 'ANIME') {
    if (media.studios !== null) {
      const mainStudio = media.studios.edges.filter(studio => studio.isMain);
      createDataComponent('Studios', mainStudio[0].node.name);
      if (media.studios.edges.length > 1) {
        const producers = media.studios.edges.filter(studio => !studio.isMain);
        const producerName = producers.map(prod => prod.node.name);
        const producersString = producerName.join(', ');
        createDataComponent('Producers', producersString);
      }
    }
  }
  createDataComponent('Source', media.source);

  if (media.hashtag !== null) {
    createDataComponent('Hashtag', media.hashtag);
  }

  if (media.genres.length > 0) {
    const genres = media.genres.join(', ');
    createDataComponent('Genres', genres);
  }

  if (media.title.romaji) {
    createDataComponent('Romaji', media.title.romaji);
  }
  if (media.title.english) {
    createDataComponent('English', media.title.english);
  }
  if (media.title.native) {
    createDataComponent('Native', media.title.native);
  }

  if (media.synonyms.length > 0) {
    const synonyms = media.synonyms.join(', ');
    createDataComponent('Synonyms', synonyms);
  }
  // end data

  const descriptionSection = pageContainer.appendChild(document.createElement('section'));
  descriptionSection.classList.add('page-section', 'page-desc-section');

  const descriptionHeading = descriptionSection.appendChild(document.createElement('h2'));
  descriptionHeading.textContent = 'Description';
  descriptionHeading.classList.add('page-sub-heading');

  const descriptionParagraph = descriptionSection.appendChild(
    document.createElement('p')
  );
  descriptionParagraph.innerHTML = media.description;
  descriptionParagraph.classList.add('page-desc-p');

  //relations
  if (media.relations.edges.length > 0) {
    const relationsSection = pageContainer.appendChild(document.createElement('section'));
    relationsSection.classList.add('page-section');

    const relationsHeading = relationsSection.appendChild(document.createElement('h2'));
    relationsHeading.textContent = 'Relations';
    relationsHeading.classList.add('page-sub-heading');

    const releationsCarousel = relationsSection.appendChild(
      document.createElement('div')
    );
    releationsCarousel.classList.add('carousel-wrapper');

    // create the relations cards (media that is related to this one)
    media.relations.edges.forEach(relation => {
      const relationElement = document.createElement('relation-card');
      relationElement.dataNode = relation.node;
      relationElement.dataRelation = relation.relationType;
      releationsCarousel.appendChild(relationElement);
    });
  }

  if (media.characters.edges !== null) {
    const charactersSection = pageContainer.appendChild(
      document.createElement('section')
    );
    charactersSection.classList.add('page-section');
    const charactersHeading = charactersSection.appendChild(document.createElement('h2'));
    charactersHeading.textContent = 'Characters';
    charactersHeading.classList.add('page-sub-heading');

    // creates the character cards
    media.characters.edges.forEach(character => {
      const characterElement = document.createElement('character-card');
      characterElement.dataCharacter = character.node;
      characterElement.dataCharacter.role = character.role;
      characterElement.dataCharacter.voiceActors = character.voiceActors;

      charactersSection.append(characterElement);
    });
  }

  const staffSection = pageContainer.appendChild(document.createElement('section'));
  staffSection.classList.add('page-section');

  const staffHeading = staffSection.appendChild(document.createElement('h2'));
  staffHeading.textContent = 'Staff';
  staffHeading.classList.add('page-sub-heading');

  // creates the staff cards
  media.staffPreview.edges.forEach(staff => {
    const staffElement = document.createElement('staff-card');
    staffElement.dataStaff = staff.node;
    staffElement.dataStaff.role = staff.role;

    staffSection.append(staffElement);
  });

  const statusStatsSection = pageContainer.appendChild(document.createElement('section'));
  statusStatsSection.classList.add('page-section');

  const statusStatsHeading = statusStatsSection.appendChild(document.createElement('h2'));
  statusStatsHeading.textContent = 'Status Distribution';
  statusStatsHeading.classList.add('page-sub-heading');

  const sortedStats = media.stats.statusDistribution.sort((a, b) => a.amount < b.amount);

  const statsInnerWrapper = statusStatsSection.appendChild(document.createElement('div'));
  statsInnerWrapper.classList.add('page-stats-wrapper');

  // creates the status cards
  sortedStats.forEach((stat, i) => {
    const statusCard = document.createElement('status-card');
    statusCard.index = i;
    statusCard.stat = stat;

    statsInnerWrapper.appendChild(statusCard);
  });

  // bar at the bottom bellow the statuses that illustrates the % of each status
  const percentageBar = statsInnerWrapper.appendChild(document.createElement('div'));
  percentageBar.classList.add('page-percentage-bar');
  sortedStats.forEach((stat, i) => {
    const bar = percentageBar.appendChild(document.createElement('span'));
    bar.style.width = `${(stat.amount / media.popularity) * 400}px`;
    switch (i) {
      case 0:
        bar.style.backgroundColor = COLOURS.green;
        break;
      case 1:
        bar.style.backgroundColor = COLOURS.blue;
        break;
      case 2:
        bar.style.backgroundColor = COLOURS.purple;
        break;
      case 3:
        bar.style.backgroundColor = COLOURS.pink;
        break;
      case 4:
        bar.style.backgroundColor = COLOURS.red;
        break;

      default:
        break;
    }
  });

  // a graph showing the distribution of scores
  if (media.stats.scoreDistribution.length > 0) {
    const scoreSection = pageContainer.appendChild(document.createElement('section'));
    scoreSection.classList.add('page-section');

    const scoreHeading = scoreSection.appendChild(document.createElement('h2'));
    scoreHeading.textContent = 'Score Distribution';
    scoreHeading.classList.add('page-sub-heading');

    const scoreInnerWrapper = scoreSection.appendChild(document.createElement('div'));
    scoreInnerWrapper.classList.add('page-score-wrapper');

    const largestAmount = media.stats.scoreDistribution.reduce((max, score) => {
      return max.amount > score.amount ? max : score;
    });

    media.stats.scoreDistribution.forEach(score => {
      const graphBar = document.createElement('graph-bar');
      graphBar.data = score;
      graphBar.data.max = largestAmount.amount;
      scoreInnerWrapper.appendChild(graphBar);
    });
  }

  const recommendSection = pageContainer.appendChild(document.createElement('section'));
  recommendSection.classList.add('page-section');

  const recommendHeading = recommendSection.appendChild(document.createElement('h2'));
  recommendHeading.textContent = 'Recommendations';
  recommendHeading.classList.add('page-sub-heading');

  const recommendCarousel = recommendSection.appendChild(document.createElement('div'));
  recommendCarousel.classList.add('carousel-wrapper');

  // creates the recommendation cards
  media.recommendations.nodes.forEach(rec => {
    const recElement = document.createElement('recommend-card');
    recElement.dataRec = rec.mediaRecommendation;

    recommendCarousel.append(recElement);
  });
}

/**
 * Renders the character's page
 * @param {number} id
 */
export async function showCharacterPage(id) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const character = await getCharacterPage(id);

  // name and image
  createTopSection(character);

  const descriptionWrapper = pageContainer.appendChild(document.createElement('section'));
  descriptionWrapper.classList.add('char-desc');

  if (character.dateOfBirth.month !== null) {
    const birthday = descriptionWrapper.appendChild(document.createElement('p'));
    birthday.classList.add('char-desc-row');
    const birthMonth = MONTHS[character.dateOfBirth.month];
    birthday.textContent = character.dateOfBirth.year
      ? `${birthMonth} ${character.dateOfBirth.day}, ${character.dateOfBirth.year} `
      : birthMonth + ' ' + character.dateOfBirth.day;
    const key = document.createElement('strong');
    key.textContent = 'Birth: ';
    birthday.prepend(key);
  }
  if (character.age !== null) {
    const age = descriptionWrapper.appendChild(document.createElement('p'));
    age.classList.add('char-desc-row');
    age.textContent = character.age;
    const key = document.createElement('strong');
    key.textContent = 'Age: ';
    age.prepend(key);
  }
  if (character.gender !== null) {
    const gender = descriptionWrapper.appendChild(document.createElement('p'));
    gender.classList.add('char-desc-row');
    gender.textContent = character.gender;
    const key = document.createElement('strong');
    key.textContent = 'Gender: ';
    gender.prepend(key);
  }

  if (character.description) {
    const parsedDescription = document.createElement('parsed-markdown');
    parsedDescription.setAttribute('data', character.description);
    descriptionWrapper.append(parsedDescription);
  }

  const outerWrapper = pageContainer.appendChild(document.createElement('section'));
  outerWrapper.classList.add('char-card-outer-wrapper');

  const heading = outerWrapper.appendChild(document.createElement('h2'));
  heading.textContent = 'Appearances';
  heading.classList.add('char-card-heading');

  const cardWrapper = outerWrapper.appendChild(document.createElement('div'));
  cardWrapper.classList.add('char-card-wrapper');

  /**
   * creates the appearance cards
   * @param {Object[]} dataArray array of data to create the appearance cards
   */
  function createCharacterCards(dataArray) {
    dataArray.forEach(media => {
      const card = document.createElement('char-media');
      card.data = media.node;
      card.data.voiceActors = media.voiceActorRoles;
      cardWrapper.append(card);
    });
  }

  createCharacterCards(character.media.edges);

  // pagination
  if (character.media.pageInfo.hasNextPage) {
    let page = 2;
    const nextAppearButton = outerWrapper.appendChild(document.createElement('button'));
    nextAppearButton.classList.add('char-button');
    nextAppearButton.textContent = 'Show More Appearances';
    nextAppearButton.addEventListener('click', async () => {
      const newAppearances = await getCharacterAppearances(id, page);
      createCharacterCards(newAppearances.media.edges);
      if (newAppearances.media.pageInfo.hasNextPage) page++;
      else {
        nextAppearButton.remove();
      }
    });
  }
}

/**
 * Renders the page for the staff member
 * @param {number} id
 */
export async function showStaffPage(id) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const staff = await getStaffPage(id);

  // names and images
  createTopSection(staff);

  const descriptionWrapper = pageContainer.appendChild(document.createElement('section'));
  descriptionWrapper.classList.add('char-desc');

  if (staff.dateOfBirth.month !== null) {
    const birthday = descriptionWrapper.appendChild(document.createElement('p'));
    birthday.classList.add('char-desc-row');
    const birthMonth = MONTHS[staff.dateOfBirth.month];
    birthday.textContent = staff.dateOfBirth.year
      ? `${birthMonth} ${staff.dateOfBirth.day}, ${staff.dateOfBirth.year} `
      : birthMonth + ' ' + staff.dateOfBirth.day;
    const key = document.createElement('strong');
    key.textContent = 'Birth: ';
    birthday.prepend(key);
  }
  if (staff.age !== null) {
    const age = descriptionWrapper.appendChild(document.createElement('p'));
    age.classList.add('char-desc-row');
    age.textContent = staff.age;
    const key = document.createElement('strong');
    key.textContent = 'Age: ';
    age.prepend(key);
  }
  if (staff.gender !== null) {
    const gender = descriptionWrapper.appendChild(document.createElement('p'));
    gender.classList.add('char-desc-row');
    gender.textContent = staff.gender;
    const key = document.createElement('strong');
    key.textContent = 'Gender: ';
    gender.prepend(key);
  }
  if (staff.yearsActive.length > 0) {
    const yearsActive = descriptionWrapper.appendChild(document.createElement('p'));
    yearsActive.classList.add('char-desc-row');
    if (staff.yearsActive.length > 1) {
      yearsActive.textContent = staff.yearsActive.join('-');
    } else yearsActive.textContent = staff.yearsActive[0] + '-';
    const key = document.createElement('strong');
    key.textContent = 'Years Active: ';
    yearsActive.prepend(key);
  }
  if (staff.homeTown !== null) {
    const homeTown = descriptionWrapper.appendChild(document.createElement('p'));
    homeTown.classList.add('char-desc-row');
    homeTown.textContent = staff.homeTown;
    const key = document.createElement('strong');
    key.textContent = 'Home Town: ';
    homeTown.prepend(key);
  }

  // parses the markdown and sets inner html
  if (staff.description) {
    const parsedDescription = document.createElement('parsed-markdown');
    parsedDescription.setAttribute('data', staff.description);
    descriptionWrapper.append(parsedDescription);
  }

  /**
   * Creates the character role cards
   * @param {Object[]} dataArray Array of data to create character cards
   */
  function createCharacterCards(dataArray) {
    dataArray.forEach(character => {
      const card = document.createElement('staff-char');
      card.dataNode = character.node;
      card.dataChar = character.characters[0];
      card.dataChar.role = character.characterRole;

      document.getElementById('card-wrapper').append(card);
    });
  }

  if (staff.characterMedia.pageInfo.total !== 0) {
    const charWrapper = pageContainer.appendChild(document.createElement('section'));
    charWrapper.classList.add('char-card-outer-wrapper');

    const charHeading = charWrapper.appendChild(document.createElement('h2'));
    charHeading.textContent = 'Character Roles';
    charHeading.classList.add('char-card-heading');

    const cardWrapper = charWrapper.appendChild(document.createElement('div'));
    cardWrapper.id = 'card-wrapper';
    cardWrapper.classList.add('char-card-wrapper');

    createCharacterCards(staff.characterMedia.edges);

    if (staff.characterMedia.pageInfo.hasNextPage) {
      let charPage = 2;
      const nextCharButton = charWrapper.appendChild(document.createElement('button'));
      nextCharButton.classList.add('char-button');
      nextCharButton.textContent = 'Show More Characters';
      nextCharButton.addEventListener('click', async () => {
        const newCharacters = await getCharacterMedia(id, charPage);
        createCharacterCards(newCharacters.characterMedia.edges);
        if (newCharacters.characterMedia.pageInfo.hasNextPage) charPage++;
        else {
          nextCharButton.remove();
        }
      });
    }
  }

  /**
   * Creates the staff role cards
   * In it's own function so that is can be used in pagination
   * @param {Object[]} dataArray Array of data needed to create the card
   */
  function createRoleCards(dataArray) {
    dataArray.forEach(role => {
      const card = document.createElement('staff-role');
      card.data = role.node;
      card.data.role = role.staffRole;

      document.getElementById('role-card-wrapper').append(card);
    });
  }
  if (staff.staffMedia.pageInfo.total !== 0) {
    const roleWrapper = pageContainer.appendChild(document.createElement('section'));
    roleWrapper.classList.add('char-card-outer-wrapper');

    const roleHeading = roleWrapper.appendChild(document.createElement('h2'));
    roleHeading.textContent = 'Staff Roles';
    roleHeading.classList.add('char-card-heading');

    const roleCardWrapper = roleWrapper.appendChild(document.createElement('div'));
    roleCardWrapper.id = 'role-card-wrapper';
    roleCardWrapper.classList.add('char-card-wrapper');

    createRoleCards(staff.staffMedia.edges);

    // pagination
    if (staff.staffMedia.pageInfo.hasNextPage) {
      let staffPage = 2;
      const nextRoleButton = roleWrapper.appendChild(document.createElement('button'));
      nextRoleButton.classList.add('char-button');
      nextRoleButton.textContent = 'Show More Roles';
      nextRoleButton.addEventListener('click', async () => {
        const newCharacters = await getRoleMedia(id, staffPage);
        createRoleCards(newCharacters.staffMedia.edges);
        if (newCharacters.staffMedia.pageInfo.hasNextPage) staffPage++;
        else {
          nextRoleButton.remove();
        }
      });
    }
  }
}

/**
 * Used to create the top section of the character and staff pages.
 * It renders their name, alternative names, and their image
 * @param {Object} data The data that is returned from queries
 */
function createTopSection(data) {
  const pageContainer = document.getElementById('page');

  const topWrapper = pageContainer.appendChild(document.createElement('header'));
  topWrapper.classList.add('char-top-wrapper');

  const nameElement = topWrapper.appendChild(document.createElement('h1'));
  nameElement.textContent = data.name.full;

  if (data.name.native && data.name.alternative[0] !== '') {
    const nativeAndAltNames = topWrapper.appendChild(document.createElement('p'));
    const altNames = data.name.alternative.join(', ');
    nativeAndAltNames.textContent =
      (data.name.native ? data.name.native : '') + ', ' + altNames;
  }

  const charImage = topWrapper.appendChild(document.createElement('img'));
  charImage.src = data.image.large;
  charImage.alt = data.name.full;
  charImage.classList.add('char-image');
}

// call homePage when the popup is opened
homePage();
