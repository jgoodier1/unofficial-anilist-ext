import { getList, updateEntry } from './queries.js';

// used for searches and in the nav buttons, and changed by homePage
let currentListType = '';

// nav buttons that change which type of list is displayed
const animeButton = document.getElementById('anime-button');
const mangaButton = document.getElementById('manga-button');
animeButton.addEventListener('click', () => {
  if (currentListType === 'ANIME') return;
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage('ANIME');
});
mangaButton.addEventListener('click', () => {
  if (currentListType === 'MANGA') return;
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage('MANGA');
});

// nav button that opens and closes the search bar
const searchNavButton = document.getElementById('search-nav-button');
const searchContainer = document.getElementById('search-container');
let searchState = 'closed';
searchNavButton.addEventListener('click', () => {
  const backdrop = document.getElementById('backdrop');
  if (searchState === 'closed') {
    searchContainer.style.transform = 'translateY(250px)';
    searchContainer.style.opacity = 1;
    backdrop.classList.remove('hide');
    searchInput.focus();
    searchState = 'open';
  }
});

// the search bar
// takes the values of the search input and the currentListType
// and opens a new tab with the search query on Anilist
const searchInput = document.getElementById('search-input');
const searchQueryButton = document.getElementById('search-button-query');
searchInput.addEventListener('keydown', e => {
  if (searchInput.value === '') return;
  if (e.code === 'Enter') {
    e.preventDefault();
    browser.tabs.create({
      url: `https://anilist.co/search/${currentListType}?search=${searchInput.value}`
    });
    searchInput.value = '';
  }
});
searchQueryButton.addEventListener('click', () => {
  if (searchInput.value === '') return;
  browser.tabs.create({
    url: `https://anilist.co/search/${currentListType}?search=${searchInput.value}`
  });
  searchInput.value = '';
});

// nav button that opens the settings menu
const settingsButton = document.getElementById('settings-button');
const settingsContainer = document.getElementById('settings-container');
let settingsState = 'closed';
settingsButton.addEventListener('click', () => {
  if (settingsState === 'closed') {
    settingsContainer.style.transform = 'translateY(183px)';
    settingsContainer.style.opacity = 1;
    backdrop.classList.remove('hide');
    selectedDefaultList();
    settingsState = 'open';
  }
});

// options in the settings that change which list is displayed when the popup is opened
const animeOption = document.getElementById('anime-option');
const mangaOption = document.getElementById('manga-option');
animeOption.addEventListener('click', () => {
  browser.storage.local.set({ defaultListType: 'ANIME' });
});
mangaOption.addEventListener('click', () => {
  browser.storage.local.set({ defaultListType: 'MANGA' });
});

// function that changes which option is selected in the settings
async function selectedDefaultList() {
  const list = (await browser.storage.local.get('defaultListType')).defaultListType;
  if (list === 'ANIME' || list === undefined) animeOption.selected = true;
  if (list === 'MANGA') mangaOption.selected = true;
}

// the sign out button within the settings menu
const signOutButton = document.getElementById('sign-out-button');
signOutButton.addEventListener('click', () => {
  browser.storage.local.remove('token');
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage();
});

// a backdrop that appears when the searchbar or settings menu are open
// clicking it closes them
const backdrop = document.getElementById('backdrop');
backdrop.addEventListener('click', () => {
  if (settingsState === 'open') {
    settingsContainer.style.transform = 'translateY(-150px)';
    settingsContainer.style.opacity = 0;
    backdrop.classList.add('hide');
    settingsState = 'closed';
  }
  if (searchState === 'open') {
    searchContainer.style.transform = 'translateY(-150px)';
    searchContainer.style.opacity = 0;
    backdrop.classList.add('hide');
    searchState = 'closed';
    searchInput.value = '';
  }
});

/**
 * Function that displays the selected list
 * @param {string} listType - either 'ANIME' or 'MANGA'
 */
async function homePage(listType) {
  const token = (await browser.storage.local.get('token')).token;
  if (token) {
    // if the listType is not given, check storage to see if they've set a preferred type
    // if not, render the anime list
    if (listType === undefined) {
      listType = (await browser.storage.local.get('defaultListType')).defaultListType;
      if (listType === undefined) listType = 'ANIME';
    }
    // this is for search and to disable one of the nav buttons
    currentListType = listType;

    const unauthorizedContainer = document.getElementById('unauthorized');
    const outerContainer = document.getElementById('list');
    unauthorizedContainer.classList.add('hide');
    outerContainer.classList.remove('hide');

    // get the lists from the API, filter them so that you only have the current and repeating
    const lists = await getList(listType);
    const filtered = lists.filter(list => {
      return (
        list.entries[0].status === 'CURRENT' || list.entries[0].status === 'REPEATING'
      );
    });

    // if there aren't any current or repeating, display a message to the user
    if (filtered.length === 0) {
      const emptyListHeading = document.createElement('h1');
      emptyListHeading.classList.add('heading-empty');
      emptyListHeading.textContent = `You are not currently ${
        listType === 'ANIME' ? 'watching' : 'reading'
      } anything`;
      outerContainer.appendChild(emptyListHeading);
      return;
    }

    // put all of the entries into one array and sort them
    const entries = [];
    filtered.forEach(list => {
      list.entries.forEach(entry => entries.push(entry));
    });
    entries.sort((a, b) => a.updatedAt < b.updatedAt);

    // the heading above the list
    const headingElement = document.createElement('h1');
    headingElement.classList.add('heading-list');
    headingElement.textContent =
      listType === 'ANIME' ? 'Anime In Progress' : 'Manga In Progress';
    outerContainer.appendChild(headingElement);

    // create the container for the list entries
    const listContainer = document.createElement('div');
    listContainer.classList.add('container-list');
    outerContainer.appendChild(listContainer);

    // want the popover to show up to the right for items on the left half
    let leftPositions = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];
    let position = 1;

    // creates the list items
    entries.forEach(entry => {
      if (position > 32) return;
      const totalContent =
        listType === 'ANIME' ? entry.media.episodes : entry.media.chapters;

      // the div for the individual entry
      const divElement = document.createElement('div');
      divElement.classList.add('list-item-container');
      listContainer.appendChild(divElement);

      // the cover art. Clicking it opens the page for the entry on Anilist
      const imgLinkElement = document.createElement('a');
      imgLinkElement.href = entry.media.siteUrl;
      imgLinkElement.style.setProperty(
        'background-image',
        `url(${entry.media.coverImage.medium})`
      );
      imgLinkElement.classList.add('list-item-img');
      imgLinkElement.classList.add('cover');
      divElement.appendChild(imgLinkElement);

      // the popover element that shows the title and progress
      // popover is on the right if the entry is on the left, vice versa
      const popoverElement = document.createElement('div');
      popoverElement.classList.add('list-item-popover');
      if (leftPositions.includes(position))
        popoverElement.classList.add('list-item-popover-left');
      else popoverElement.classList.add('list-item-popover-right');

      // the content of the popover
      const titleElement = document.createElement('p');
      titleElement.textContent = entry.media.title.userPreferred;
      titleElement.classList.add('popover-title');
      popoverElement.appendChild(titleElement);
      const progressElement = document.createElement('p');
      progressElement.textContent = `Progress: ${entry.progress} ${
        totalContent ? '/' + totalContent : ''
      }`;
      progressElement.classList.add('popover-progress');
      popoverElement.appendChild(progressElement);
      divElement.appendChild(popoverElement);

      // the popover at the bottom of the image that lets you update the entry
      const progressUpdateElement = document.createElement('div');
      progressUpdateElement.textContent = `${entry.progress} +`;
      progressUpdateElement.classList.add('popover-progress-updater');
      progressUpdateElement.addEventListener('click', () => {
        updateEntry(entry.id, entry.status, entry.progress + 1);
        progressUpdateElement.textContent = `${entry.progress + 1} +`;
        progressElement.textContent = `Progress: ${entry.progress + 1} ${
          totalContent ? '/' + totalContent : ''
        }`;
      });
      imgLinkElement.appendChild(progressUpdateElement);

      // remove and add the href so that the user can update the entry without opening the link
      progressUpdateElement.addEventListener('mouseenter', () => {
        imgLinkElement.removeAttribute('href');
      });
      progressUpdateElement.addEventListener('mouseleave', () => {
        imgLinkElement.setAttribute('href', entry.media.siteUrl);
      });

      // hover over the image, show popover
      imgLinkElement.addEventListener('mouseenter', () => {
        popoverElement.style.display = 'grid';
        progressUpdateElement.style.opacity = 1;
      });
      imgLinkElement.addEventListener('mouseleave', () => {
        popoverElement.style.display = 'none';
        progressUpdateElement.style.opacity = 0;
      });
      position++;
    });
  } else {
    unauthorized(listType);
  }
}

/**
 * Function that shows the log in page
 * @param {string} listType - either 'ANIME' or 'MANGA'
 */
function unauthorized(listType) {
  const unauthorizedContainer = document.getElementById('unauthorized');
  const outerContainer = document.getElementById('list');
  unauthorizedContainer.classList.remove('hide');
  outerContainer.classList.add('hide');

  // When the submit is pressed or enter is pressed, add token to storage and call homePage again
  const buttonElement = document.getElementById('submit-token');
  const textareaElement = document.getElementById('token');
  buttonElement.addEventListener('click', () => {
    browser.storage.local.set({ token: textareaElement.value });
    textareaElement.value = '';
    homePage(listType);
  });
  textareaElement.addEventListener('keydown', e => {
    if (textareaElement.value === '') return;
    if (e.code === 'Enter') {
      browser.storage.local.set({ token: textareaElement.value });
      textareaElement.value = '';
      homePage(listType);
    }
  });
}

// call homePage when the popup is opened
homePage();
