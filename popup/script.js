let currentListType = '';

const animeButton = document.getElementById('anime-button');
const mangaButton = document.getElementById('manga-button');
animeButton.addEventListener('click', () => {
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage('ANIME');
});
mangaButton.addEventListener('click', () => {
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage('MANGA');
});

const animeOption = document.getElementById('anime-option');
const mangaOption = document.getElementById('manga-option');
animeOption.addEventListener('click', () => {
  browser.storage.local.set({ defaultListType: 'ANIME' });
});
mangaOption.addEventListener('click', () => {
  browser.storage.local.set({ defaultListType: 'MANGA' });
});

const searchInput = document.getElementById('search-input');
const searchQueryButton = document.getElementById('search-button-query');
searchInput.addEventListener('keydown', e => {
  if (searchInput.value === '') return;
  if (e.code === 'Enter') {
    e.preventDefault();
    browser.tabs.create({
      url: `https://anilist.co/search/${currentListType}?search=${searchInput.value}`
    });
  }
});
searchQueryButton.addEventListener('click', () => {
  if (searchInput.value === '') return;
  browser.tabs.create({
    url: `https://anilist.co/search/${currentListType}?search=${searchInput.value}`
  });
});

const signOutButton = document.getElementById('sign-out-button');
signOutButton.addEventListener('click', () => {
  browser.storage.local.remove('token');
  const outerContainer = document.getElementById('list');
  while (outerContainer.firstChild) outerContainer.removeChild(outerContainer.firstChild);
  homePage();
});

async function homePage(listType) {
  const token = (await browser.storage.local.get('token')).token;
  const unauthorizedContainer = document.getElementById('unauthorized');
  const outerContainer = document.getElementById('list');
  if (token) {
    if (listType === undefined) {
      listType = (await browser.storage.local.get('defaultListType')).defaultListType;
      if (listType === undefined) listType = 'ANIME';
    }
    currentListType = listType;
    unauthorizedContainer.classList.add('hide');
    outerContainer.classList.remove('hide');

    const headingElement = document.createElement('h1');
    headingElement.classList.add('heading-list');
    headingElement.textContent =
      listType === 'ANIME' ? 'Anime In Progress' : 'Manga In Progress';
    outerContainer.appendChild(headingElement);

    const listContainer = document.createElement('div');
    listContainer.classList.add('container-list');
    outerContainer.appendChild(listContainer);

    // change this for production
    // (only like this now so that I can work without DDOSing their servers)
    // let entries = (await browser.storage.local.get('entries')).entries;
    // if (entries === undefined) {
    const lists = await getList(listType);
    const filtered = lists.filter(list => {
      return (
        list.entries[0].status === 'CURRENT' || list.entries[0].status === 'REPEATING'
      );
    });
    const entries = [];
    filtered.forEach(list => {
      list.entries.forEach(entry => entries.push(entry));
    });

    entries.sort((a, b) => a.updatedAt < b.updatedAt);
    browser.storage.local.set({ entries });
    // }
    // console.log(entries);

    let leftPositions = [1, 2, 5, 6, 9, 10, 13, 14];
    let position = 1;
    entries.forEach(entry => {
      if (position > 16) return;
      const totalContent =
        listType === 'ANIME' ? entry.media.episodes : entry.media.chapters;

      const divElement = document.createElement('div');
      divElement.classList.add('list-item-container');
      const imgLinkElement = document.createElement('a');
      imgLinkElement.href = entry.media.siteUrl;
      imgLinkElement.style.setProperty(
        'background-image',
        `url(${entry.media.coverImage.medium})`
      );
      imgLinkElement.classList.add('list-item-img');
      imgLinkElement.classList.add('cover');
      divElement.appendChild(imgLinkElement);
      listContainer.appendChild(divElement);

      const popoverElement = document.createElement('div');

      popoverElement.classList.add('list-item-popover');
      if (leftPositions.includes(position))
        popoverElement.classList.add('list-item-popover-left');
      else popoverElement.classList.add('list-item-popover-right');

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

      // this feel wrong, but I want the progress updater to be on top of the link (and
      // nested under it in the DOM), but don't want the link to work when the updater is clicked
      progressUpdateElement.addEventListener('mouseenter', () => {
        imgLinkElement.removeAttribute('href');
      });
      progressUpdateElement.addEventListener('mouseleave', () => {
        imgLinkElement.setAttribute('href', entry.media.siteUrl);
      });

      imgLinkElement.addEventListener('mouseenter', () => {
        // divElement.appendChild(popoverElement);
        popoverElement.style.display = 'grid';

        progressUpdateElement.style.opacity = 1;
      });
      imgLinkElement.addEventListener('mouseleave', () => {
        // divElement.removeChild(popoverElement);
        popoverElement.style.display = 'none';
        progressUpdateElement.style.opacity = 0;
      });
      position++;
    });
  } else {
    unauthorized(listType);
  }
}

function unauthorized(listType) {
  const unauthorizedContainer = document.getElementById('unauthorized');
  const outerContainer = document.getElementById('list');
  unauthorizedContainer.classList.remove('hide');
  outerContainer.classList.add('hide');

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

/**
 *  @param type can be either 'MANGA' or 'ANIME'
 */
async function getList(type) {
  const token = (await browser.storage.local.get('token')).token;

  let userId = (await browser.storage.local.get('userId')).userId;
  if (userId === undefined) {
    userId = await getUser(token);
    if (typeof userId !== 'number') {
      userId;
      return;
    } else {
      browser.storage.local.set({ userId });
    }
  }

  const query = `
  query($userId: Int, $type: MediaType){
    MediaListCollection(userId: $userId, type: $type) {
      lists {
        entries {
          id
          status
          progress
          updatedAt
          media {
            title {
              userPreferred
            }
            episodes
            chapters
            siteUrl
            coverImage {
              medium
            }
          }
        }
      }
    }
  }
  `;

  const variables = {
    userId: userId,
    type: type
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  };
  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.MediaListCollection.lists;
    });
}

async function updateEntry(id, status, progress) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  mutation($id: Int, $status: MediaListStatus, $progress:Int) {
    SaveMediaListEntry(id: $id, status: $status, progress: $progress) {
      id
      status
      progress
    }
  }`;

  const variables = {
    id,
    status,
    progress
    // id: 23085633,
    // status: 'REPEATING',
    // progress: 159
  };
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  };
  fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => console.log(json));
}

/**
 * @param token is the auth token from storage
 * @returns a number (the userId) or an error message
 */
async function getUser(token) {
  const query = `
  mutation {
    UpdateUser {
      id
    }
  }`;

  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      if (json.data.UpdateUser !== null) return json.data.UpdateUser.id;
      else Promise.reject(json.errors);
    })
    .catch(err => console.error(err));
}

homePage();
