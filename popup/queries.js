/**
 * Fetches the list from the Anilist API
 * @param {string} type - can be either 'MANGA' or 'ANIME'
 * @returns - an array of objects, each object is a list grouped by status
 */
export async function getCurrentList(type) {
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

  const lists = [];

  const query = `
  query($userId: Int, $type: MediaType, $status: MediaListStatus){
    MediaListCollection(userId: $userId, type: $type, status: $status) {
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
            status
            type
            nextAiringEpisode {
              airingAt
              timeUntilAiring
              episode
            }
          }
        }
      }
    }
  }
  `;

  const options1 = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: {
        userId: userId,
        type: type,
        status: 'CURRENT'
      }
    })
  };
  const options2 = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: {
        userId: userId,
        type: type,
        status: 'REPEATING'
      }
    })
  };

  await fetch('https://graphql.anilist.co', options1)
    .then(res => res.json())
    .then(json => {
      lists.push(json.data.MediaListCollection.lists[0].entries);
    });
  await fetch('https://graphql.anilist.co', options2)
    .then(res => res.json())
    .then(json => {
      if (json.data.MediaListCollection.lists.length !== 0) {
        lists.push(json.data.MediaListCollection.lists[0].entries);
      }
    });

  return lists;
}

export async function getFullList(type) {
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
          score
          progress
          media {
            title {
              userPreferred
            }
            episodes
            chapters
            coverImage {
              medium
            }
            type
            status
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

/**
 * Fetches the users id from the Anilist API
 * @param {string} token - is the auth token from storage
 * @returns - a number (the userId) or an error message
 */
export async function getUser(token) {
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
      else {
        Promise.reject(json.errors);
        return json.errors;
      }
    })
    .catch(err => console.error(err));
}

/**
 * Updates the list on the Anilist API
 * @param {number} id - the entry id for the list
 * @param {string} status - 'CURRENT' or 'REPEATING
 * @param {number} progress - the updated progress
 */
export async function updateEntry(id, status, progress) {
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

export async function editEntry(id, status, score, progress) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  mutation($id: Int, $status: MediaListStatus, $score: Float, $progress: Int){
    SaveMediaListEntry(id: $id, status: $status, score: $score, progress: $progress) {
      id
      status
      score
      progress
    }
  }
  `;

  const variables = {
    id,
    status,
    score,
    progress
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

export async function deleteEntry(id) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
    mutation($id:Int) {
      DeleteMediaListEntry(id:$id) {
        deleted
      }
    }
  `;

  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: { id }
    })
  };
  fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => console.log(json));
}

export async function search(searchValue) {
  console.log(searchValue);
  const results = [];

  const mediaQuery = `
  query($search:String, $type: MediaType){
    Page(perPage: 6) {
        media(search: $search type: $type isAdult: false) {
        id
        title {
          userPreferred
        }
        startDate {
          year
        }
        format
        coverImage {
          medium
        }
      }
    }
  }
  `;
  const animeOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: mediaQuery,
      variables: { search: searchValue, type: 'ANIME' }
    })
  };
  await fetch('https://graphql.anilist.co', animeOptions)
    .then(res => res.json())
    .then(json => results.push(json.data.Page.media));

  const mangaOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: mediaQuery,
      variables: { search: searchValue, type: 'MANGA' }
    })
  };
  await fetch('https://graphql.anilist.co', mangaOptions)
    .then(res => res.json())
    .then(json => results.push(json.data.Page.media));

  const characterQuery = `
  query($search:String){
    Page(perPage: 6) {
      characters(search: $search) {
        id
        name {
          full
        }
        image{
          medium
        }
      }
    }
  }`;
  const characterOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: characterQuery,
      variables: { search: searchValue }
    })
  };
  await fetch('https://graphql.anilist.co', characterOptions)
    .then(res => res.json())
    .then(json => {
      results.push(json.data.Page.characters);
      console.log(json);
    });

  const staffQuery = `
  query($search:String){
    Page(perPage: 6) {
        staff(search: $search) {
        id
        name {
          full
        }
        image {
          medium
        }
      }
    }
  }`;

  const staffOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: staffQuery,
      variables: { search: searchValue }
    })
  };
  await fetch('https://graphql.anilist.co', staffOptions)
    .then(res => res.json())
    .then(json => results.push(json.data.Page.staff));

  return results;
}
