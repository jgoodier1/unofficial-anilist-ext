/**
 * Fetches the list from the Anilist API
 * @param {string} type - can be either 'MANGA' or 'ANIME'
 * @returns - an array of objects, each object is a list grouped by status
 */
export async function getList(type) {
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
