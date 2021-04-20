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
            id
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
            id
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
  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.SaveMediaListEntry;
    });
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
  const token = (await browser.storage.local.get('token')).token;

  const results = [];

  const mediaQuery = `
  query($search:String, $type: MediaType){
    Page(perPage: 6) {
        media(search: $search type: $type isAdult: false) {
        id
        type
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
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
  `;
  const animeOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
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
      Authorization: 'Bearer ' + token,
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
      Authorization: 'Bearer ' + token,
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
      Authorization: 'Bearer ' + token,
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

export async function checkIfOnList(mediaId) {
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
  query($mediaId: Int, $userId: Int){
    MediaList(mediaId: $mediaId, userId: $userId) {
      id
      status
      progress
      score
      media {
        id
        chapters
        episodes
        title {
          userPreferred
        }
        coverImage {
          medium
        }
        type
      }
    }
  }`;

  const query2 = `
  query($mediaId: Int){
    Media(id: $mediaId) {
      id
      episodes
      chapters
      title {
        userPreferred
      }
      coverImage {
        medium
      }
      type
    }
  }`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query,
      variables: { mediaId, userId }
    })
  };
  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(async json => {
      if (json.errors && json.errors[0].message === 'Not Found.') {
        // it's not on their list
        return fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            query: query2,
            variables: { mediaId }
          })
        })
          .then(res => res.json())
          .then(json => {
            return { data: json.data.Media, exists: false };
          });
      } else {
        return { data: json.data.MediaList, exists: true };
      }
    });
}

export async function addEntry(mediaId, status, score, progress) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  mutation ($mediaId: Int, $status: MediaListStatus, $score: Float, $progress: Int){
    SaveMediaListEntry(mediaId: $mediaId status: $status progress: $progress score:$score) {
      id
      mediaId
      status
      score
      progress
      media {
        id
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
  }`;

  const variables = {
    mediaId,
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
  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.MediaList;
    });
}

export async function getMediaPage(id, type) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id:Int,$type:MediaType){
    Media(id:$id, type: $type) {
      id
      title {
        userPreferred
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      description
      season
      seasonYear
      type
      format
      status(version: 2)
      episodes
      duration
      chapters
      volumes
      genres
      synonyms
      source(version: 2)
      isAdult
      meanScore
      averageScore
      popularity
      favourites
      hashtag
      isFavourite
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            type
            title {
              userPreferred
            }
            format
            status(version: 2)
            coverImage {
              medium
            }
          }
        }
      }
      characters(perPage: 6, sort: [ROLE, RELEVANCE, ID]) {
        edges {
          id
          role
          name
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              full
            }
            language: languageV2
            image {
              medium
            }
          }
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      staffPreview: staff(perPage: 4, sort: [RELEVANCE, ID]) {
        edges {
          id
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      studios {
        edges {
          isMain
          node {
            id
            name
          }
        }
      }
      recommendations(perPage: 7, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
        }
        nodes {
          id
          rating
          mediaRecommendation {
            id
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            type
          }
        }
      }
      externalLinks {
        site
        url
      }
      tags {
        id
        name
        description
        rank
        isMediaSpoiler
        isGeneralSpoiler
      }
      mediaListEntry {
        id
        status
        score
        progress
      }
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
      }
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
      query: query,
      variables: { id, type }
    })
  };
  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Media;
    });
}

export async function getCharacterPage(id, page) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id: Int, $page: Int){
    Character(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
      }
      favourites
      isFavourite
      description
      age
      gender
      dateOfBirth {
        year
        month
        day
      }
      media(page: $page, sort: POPULARITY_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          voiceActorRoles(sort: [RELEVANCE, ID]) {
            roleNotes
            voiceActor {
              id
              name {
                full
              }
              image {
                medium
              }
              language: languageV2
            }
          }
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
            }
            startDate {
              year
            }
            type
            mediaListEntry {
              id
              status
            }
          }
        }
      }
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
      variables: { id, page }
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Character;
    });
}

export async function getStaffPage(id, charPage, staffPage) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id: Int, $charPage: Int, $staffPage: Int){
    Staff(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
      }
      description
      favourites
      isFavourite
      age
      gender
      yearsActive
      homeTown
      primaryOccupations
      dateOfBirth {
        year
        month
        day
      }
      dateOfDeath {
        year
        month
        day
      }
      characterMedia(page: $charPage, sort: START_DATE_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          characterRole
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            startDate {
              year
            }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
      staffMedia(page: $staffPage, type: null, sort: START_DATE_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
            }
            mediaListEntry {
              id
              status
            }
          }
        }
      }
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
      variables: { id, charPage, staffPage }
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Staff;
    });
}

export async function getCharacterAppearances(id, page) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id: Int, $page: Int) {
    Character(id: $id) {
      id
      media(page: $page, sort: POPULARITY_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          voiceActorRoles(sort: [RELEVANCE, ID]) {
            roleNotes
            voiceActor {
              id
              name {
                full
              }
              image {
                medium
              }
              language: languageV2
            }
          }
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
            }
            startDate {
              year
            }
            type
            mediaListEntry {
              id
              status
            }
          }
        }
      }
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
      query: query,
      variables: { id, page }
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Character;
    });
}
export async function getCharacterMedia(id, page) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id: Int, $page: Int, ){
    Staff(id: $id) {
      id
      characterMedia(page: $page, sort: START_DATE_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          characterRole
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            startDate {
              year
            }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
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
      query: query,
      variables: { id, page }
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Staff;
    });
}

export async function getRoleMedia(id, page) {
  const token = (await browser.storage.local.get('token')).token;

  const query = `
  query($id: Int, $page: Int, ){
    Staff(id: $id) {
      id
      staffMedia(page: $page, type: null, sort: START_DATE_DESC) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
            }
            mediaListEntry {
              id
              status
            }
          }
        }
      }
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
      query: query,
      variables: { id, page }
    })
  };

  return fetch('https://graphql.anilist.co', options)
    .then(res => res.json())
    .then(json => {
      return json.data.Staff;
    });
}
