import {
  getCurrentList,
  getFullList,
  getUser,
  updateEntry,
  editEntry,
  deleteEntry,
  search,
  checkIfOnList,
  addEntry,
  getMediaPage
} from './queries.js';

// for displaying the popover on the home page
const LEFT_POSITIONS = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];

// used for searches and in the nav buttons, and changed by homePage
let currentListType = '';

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
// const signOutButton = document.getElementById('sign-out-button');
// signOutButton.addEventListener('click', () => {
//   browser.storage.local.remove('token');
//   const homeWrapper = document.getElementById('home');
//   while (homeWrapper.firstChild) homeWrapper.removeChild(homeWrapper.firstChild);
//   settingsContainer.style.transform = 'translateY(-150px)';
//   settingsContainer.style.opacity = 0;
//   backdrop.classList.add('hide');
//   settingsState = 'closed';
//   homePage();
// });

/**
 * Function that displays the selected list
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
    await currentList('ANIME');
    await currentList('MANGA');
  } else {
    unauthorized();
  }
}

async function currentList(listType) {
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
  const headingElement = document.createElement('h1');
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
    createHomeCard(entry.media, position, false, entry);

    position++;
  });
  finishedAiring.forEach(entry => {
    if (position > 32) return;
    createHomeCard(entry.media, position, false, entry);

    position++;
  });
}

function createHomeCard(media, position, moved, entry) {
  const totalContent = media.type === 'ANIME' ? media.episodes : media.chapters;

  // the div for the individual entry
  const divElement = document.createElement('div');
  divElement.id = 'home-' + entry.id;
  divElement.classList.add('list-item-container');

  let listContainer = document.getElementById('home-' + media.type);
  // might not exist
  if (!listContainer) {
    listContainer = document.createElement('div');
    listContainer.id = 'home-' + media.type;
    listContainer.classList.add('container-list');
    document.getElementById('home').appendChild(listContainer);
  }
  if (moved) {
    listContainer.insertBefore(divElement, listContainer.children[0]);
  } else {
    listContainer.appendChild(divElement);
  }

  // the cover art. Clicking it opens the page for the entry on Anilist
  // DON'T LEAVE AS DIV
  const imgLinkElement = document.createElement('div');
  imgLinkElement.style.setProperty('background-image', `url(${media.coverImage.medium})`);
  imgLinkElement.classList.add('list-item-img');
  imgLinkElement.classList.add('cover');
  divElement.appendChild(imgLinkElement);

  imgLinkElement.addEventListener('click', () => {
    showMediaPage(media.id, media.type);
  });

  // the popover element that shows the title and progress
  // popover is on the right if the entry is on the left, vice versa
  const popoverElement = document.createElement('div');
  if (moved) {
    popoverElement.setAttribute('data-position', '0'); // 0 because it get updated immediately
  } else {
    popoverElement.setAttribute('data-position', position);
  }
  popoverElement.classList.add('list-item-popover', 'home-popover-' + media.type);
  if (LEFT_POSITIONS.includes(position))
    popoverElement.classList.add('list-item-popover-left');
  else popoverElement.classList.add('list-item-popover-right');

  // the content of the popover
  const titleElement = document.createElement('p');
  titleElement.textContent = media.title.userPreferred;
  titleElement.classList.add('popover-title');
  popoverElement.appendChild(titleElement);
  const progressElement = document.createElement('p');
  progressElement.textContent = `Progress: ${entry.progress} ${
    totalContent ? '/' + totalContent : ''
  }`;
  progressElement.classList.add('popover-progress');
  popoverElement.appendChild(progressElement);
  divElement.appendChild(popoverElement);

  if (media.nextAiringEpisode !== null) {
    const nextEpisodeElement = imgLinkElement.appendChild(document.createElement('div'));
    nextEpisodeElement.classList.add('list-item-next-episode', 'list-item-on-img');
    const episodeNumber = nextEpisodeElement.appendChild(document.createElement('p'));
    episodeNumber.textContent = `Ep ${media.nextAiringEpisode.episode}`;

    const DAY = 86400;
    const HOUR = 3600;
    const MINUTE = 60;
    const days = Math.trunc(media.nextAiringEpisode.timeUntilAiring / DAY);
    const dayRemainder = media.nextAiringEpisode.timeUntilAiring % DAY;
    const hours = Math.trunc(dayRemainder / HOUR);
    const hourRemainder = dayRemainder % HOUR;
    const minutes = Math.trunc(hourRemainder / MINUTE);

    const timeUntilEpisode = nextEpisodeElement.appendChild(document.createElement('p'));
    if (days === 0) timeUntilEpisode.textContent = `${hours}h ${minutes}m`;
    if (days === 0 && hours === 0) timeUntilEpisode.textContent = `$ ${minutes}m`;
    else timeUntilEpisode.textContent = `${days}d ${hours}h ${minutes}m`;

    if (media.nextAiringEpisode.episode - entry.progress > 1) {
      nextEpisodeElement.style.borderBottom = '4px solid #ff6d6d';
    }
  }

  // the popover at the bottom of the image that lets you update the entry
  const progressUpdateElement = document.createElement('div');
  let progress = entry.progress;
  progressUpdateElement.textContent = `${progress} +`;
  progressUpdateElement.classList.add('popover-progress-updater', 'list-item-on-img');
  progressUpdateElement.addEventListener('click', () => {
    updateEntry(entry.id, entry.status, progress + 1);
    progressUpdateElement.textContent = `${progress + 1} +`;
    progressElement.textContent = `Progress: ${progress + 1} ${
      totalContent ? '/' + totalContent : ''
    }`;
    progress += 1;
  });
  imgLinkElement.appendChild(progressUpdateElement);

  // remove and add the href so that the user can update the entry without opening the link
  progressUpdateElement.addEventListener('mouseenter', () => {
    imgLinkElement.removeAttribute('href');
  });
  progressUpdateElement.addEventListener('mouseleave', () => {
    imgLinkElement.setAttribute('href', media.siteUrl);
  });
}

/**
 * Function that shows the log in page
 */
function unauthorized() {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));
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

function openEditView(media, listType, prevContainer, entry) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const editContainer = document.getElementById('edit');
  editContainer.classList.remove('hide');
  while (editContainer.firstChild) editContainer.removeChild(editContainer.firstChild);

  const wrapper = editContainer.appendChild(document.createElement('div'));
  wrapper.classList.add('edit-wrapper');

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
  // this alway say 'Read' if it's not in its own variable
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
    if (entry) {
      const scoreValue = scoreInput.value || 0;
      const progressValue = progressInput.value || 0;
      editEntry(entry.id, statusSelect.value, scoreValue, progressValue);
      updatedListAndHome(entry, {
        status: statusSelect.value,
        score: scoreInput.value,
        progress: progressInput.value
      });
    } else {
      const scoreValue = scoreInput.value || 0;
      const progressValue = progressInput.value || 0;
      const entry = await addEntry(
        media.id,
        statusSelect.value,
        scoreValue,
        progressValue
      );
      addToListAndHome(
        media,
        {
          status: statusSelect.value,
          score: scoreInput.value,
          progress: progressInput.value
        },
        entry
      );
    }
    editContainer.classList.add('hide');
    document.getElementById('home').classList.remove('hide');
  });

  if (entry) {
    const deleteButton = form.appendChild(document.createElement('button'));
    deleteButton.classList.add('edit-delete', 'edit-button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteEntry(entry.id);
      deleteFromListAndHome(entry);
      editContainer.classList.add('hide');
      document.getElementById('home').classList.remove('hide');
    });
  }
}

function updatedListAndHome(oldEntry, editedEntry) {
  let updatedStatus;
  if (oldEntry.status !== editedEntry.status) updatedStatus = editedEntry.status;

  let updatedScore;
  if (oldEntry.score !== editedEntry.score) updatedScore = editedEntry.score;

  let updatedProgress;
  if (oldEntry.progress !== editedEntry.progress) updatedProgress = editedEntry.progress;

  // update home
  if (
    (oldEntry.status === 'CURRENT' || oldEntry.status === 'REPEATING') &&
    (updatedStatus === 'CURRENT' || updatedStatus === 'REPEATING')
  ) {
    const homeEntry = document.getElementById('home-' + oldEntry.id);
    if (updatedProgress)
      homeEntry.querySelector('.progress').textContent = updatedProgress;

    // remove from home if status changes from current/repeating to something else
    if (updatedStatus && updatedStatus !== 'CURRENT' && updatedStatus !== 'REPEATING') {
      document.getElementById('home-' + oldEntry.media.status).removeChild(homeEntry);
    }
  }

  if (updatedStatus && (updatedStatus === 'CURRENT' || updatedStatus === 'REPEATING')) {
    // add it to the home page in the right spot.
    createHomeCard(oldEntry.media, 1, true, oldEntry);
    addHomeCardToStart(oldEntry.media.type);
  }

  // update the list
  if (document.getElementById('list').firstChild) {
    const listEntry = document.getElementById('list-' + oldEntry.id);
    if (updatedScore) listEntry.querySelector('.score').textContent = updatedScore;
    if (updatedProgress)
      listEntry.querySelector('.progress').textContent = updatedProgress;

    if (updatedStatus) {
      // remove it from it's current spot.
      const currentSection = document.getElementById('list-' + oldEntry.status);
      const removedEntry = currentSection.removeChild(listEntry);

      // add it to the new one.
      addToListSection(removedEntry, updatedStatus, oldEntry.media.title.userPreferred);
    }
  }
}

function addToListAndHome(media, formValues, entry) {
  // home
  if (formValues.status === 'CURRENT' || formValues.status === 'REPEATING') {
    createHomeCard(media, 1, true, formValues);
    addHomeCardToStart(media.type);
  }

  // list
  if (document.getElementById('list').firstChild) {
    const row = createRow(entry);
    addToListSection(row, formValues.status, media.title.userPreferred);
  }
}

function addHomeCardToStart(mediaType) {
  // createHomeCard(oldEntry.media, 1, true, oldEntry);
  const allPopovers = document.querySelectorAll('.home-popover-' + mediaType);
  allPopovers.forEach(popover => {
    const oldPosition = popover.getAttribute('data-position');
    const newPosition = +oldPosition + 1;
    popover.setAttribute('data-position', newPosition);
    if (LEFT_POSITIONS.includes(newPosition)) {
      popover.classList.add('list-item-popover-left');
      popover.classList.remove('list-item-popover-right');
    } else {
      popover.classList.add('list-item-popover-right');
      popover.classList.remove('list-item-popover-left');
    }
  });
}

function addToListSection(row, status, title) {
  const section = document.getElementById('list-' + status);
  const titleNodes = document.querySelectorAll('#list-' + status + ' .title');
  const allTitles = [];
  titleNodes.forEach(title => allTitles.push(title.textContent));
  allTitles.push(title);
  const sortedTitles = allTitles.sort((a, b) => a > b);
  const newIndex = sortedTitles.indexOf(title);
  section.insertBefore(row, section.children[newIndex + 1]);
}

function createRow(entry) {
  const row = document.createElement('div');
  row.id = 'list-' + entry.id;
  row.classList.add('list-row');
  const image = row.appendChild(document.createElement('img'));
  image.src = entry.media.coverImage.medium;

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
    openEditView(entry.media, entry.media.type, 'list', entry);
  });

  const title = row.appendChild(document.createElement('h3'));
  title.classList.add('title');
  title.textContent = entry.media.title.userPreferred;

  const score = row.appendChild(document.createElement('p'));
  score.classList.add('score');
  if (entry.score === 0) score.textContent = '';
  else score.textContent = entry.score;

  const progress = row.appendChild(document.createElement('p'));
  progress.classList.add('progress');
  progress.textContent = entry.progress;

  return row;
}

function deleteFromListAndHome(entry) {
  if (entry.status === 'CURRENT' || entry.status === 'REPEATING') {
    const homeEntry = document.getElementById('home-' + entry.id);
    const homeWrapper = document.getElementById('home-' + entry.media.type);
    homeWrapper.removeChild(homeEntry);
  }

  const listEntry = document.getElementById('list-' + entry.id);
  const sectionWrapper = document.getElementById('section-' + entry.status);
  sectionWrapper.removeChild(listEntry);
}

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
      if (i === 0 || i === 1) {
        image.src = result.coverImage.medium;
      } else if (i === 2 || i === 3) {
        image.src = result.image.medium;
      }
      image.classList.add('search-image');

      const title = row.appendChild(document.createElement('h3'));

      if (i === 0 || i === 1) {
        title.textContent = result.title.userPreferred;
        title.classList.add('search-title');
        const yearAndFormat = row.appendChild(document.createElement('p'));
        yearAndFormat.textContent = result.startDate.year + ' ' + result.format;
        yearAndFormat.classList.add('search-media-year');

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
          if (i === 0) {
            const entry = await checkIfOnList(result.id);
            if (entry.exists) {
              openEditView(entry.data.media, 'ANIME', 'search', entry.data);
            } else {
              openEditView(entry.data, 'ANIME');
            }
          } else {
            const entry = await checkIfOnList(result.id);
            if (entry.exists) {
              openEditView(entry.data.media, 'MANGA', 'search', entry.data);
            } else {
              openEditView(entry.data, 'MANGA');
            }
          }
        });
      } else if (i === 2 || i === 3) {
        title.textContent = result.name.full;
        title.classList.add('search-title', 'search-char-staff-title');
      }
    });
  });
}

async function showMediaPage(id, type) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const media = await getMediaPage(id, type);
  console.log(media);

  if (media.bannerImage !== null) {
    const bannerImage = pageContainer.appendChild(document.createElement('img'));
    bannerImage.src = media.bannerImage;
    bannerImage.classList.add('page-banner-img');
  }

  const topContainer = pageContainer.appendChild(document.createElement('div'));
  topContainer.classList.add('page-top-container');
  const coverImage = topContainer.appendChild(document.createElement('img'));
  coverImage.src = media.coverImage.large;
  coverImage.classList.add('page-cover-img');

  const topContent = topContainer.appendChild(document.createElement('div'));
  topContent.classList.add('page-top-content');
  const title = topContent.appendChild(document.createElement('h1'));
  title.textContent = media.title.userPreferred;
  title.classList.add('page-top-title');
  const button = topContent.appendChild(document.createElement('button'));
  button.textContent = media.mediaListEntry.status;
  button.classList.add('page-top-button');

  const descriptionSection = pageContainer.appendChild(document.createElement('section'));
  descriptionSection.classList.add('page-desc-section');

  const descriptionHeading = descriptionSection.appendChild(document.createElement('h2'));
  descriptionHeading.textContent = 'Description';
  descriptionHeading.classList.add('page-desc-heading');

  const descriptionParagraph = descriptionSection.appendChild(
    document.createElement('p')
  );
  descriptionParagraph.innerHTML = media.description;
  descriptionParagraph.classList.add('page-desc-p');
}

// call homePage when the popup is opened
homePage();
