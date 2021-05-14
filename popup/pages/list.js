import { getFullList } from '../queries.js';
import { createRow } from '../utils.js';

// used by the list so that it doesn't requery and rerender unnecessarily
let currentListType = '';

/**
 * Displays the entire list
 * @param {string} listType either 'ANIME' or 'MANGA'
 */
export async function showList(listType) {
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
