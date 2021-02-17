async function homePage() {
  const token = (await browser.storage.local.get('token')).token;
  const unauthorizedContainer = document.getElementById('unauthorized');
  const listContainer = document.getElementById('list');
  if (token) {
    unauthorizedContainer.classList.add('hide');
    listContainer.classList.remove('hide');
  } else unauthorized();

  const lists = await getList('MANGA');
  const filtered = lists.filter(list => {
    return list.entries[0].status === 'CURRENT' || list.entries[0].status === 'REPEATING';
  });

  const entries = [];
  filtered.forEach(list => {
    list.entries.forEach(entry => entries.push(entry));
  });
  // filtered[0].entries.forEach(entry => entries.push(entry));
  // filtered[1].entries.forEach(entry => entries.push(entry));

  entries.sort((a, b) => a.updatedAt < b.updatedAt);

  entries.forEach(entry => {
    const titleElement = document.createElement('p');
    titleElement.textContent = entry.media.title.userPreferred;
    listContainer.appendChild(titleElement);
  });
}

// might not work like this lmao
function unauthorized() {
  const buttonElement = document.getElementById('submit-token');
  const textareaElement = document.getElementById('token');

  buttonElement.addEventListener('click', () => {
    browser.storage.local.set({ token: textareaElement.value });
    textareaElement.value = '';
  });
}

/**
 *  @param type can be either 'MANGA' or 'ANIME'
 */
async function getList(type) {
  const token = (await browser.storage.local.get('token')).token;

  const userId = await getUser(token);
  if (typeof userId !== 'number') {
    userId;
    return;
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

async function updateEntry() {
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
    id: 23085633,
    status: 'REPEATING',
    progress: 159
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
