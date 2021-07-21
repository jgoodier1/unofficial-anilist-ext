import { gql } from '@apollo/client';

/**
 * Fetches the users id from the Anilist API
 * Not using apollo because this also serves to verify the token
 * @param {string} token - is the auth token from storage
 * @returns - a number (the userId) or an error message
 */
export async function getUser(token: string) {
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

export const GET_LISTS = gql`
  query GetList($userId: Int, $type: MediaType) {
    MediaListCollection(userId: $userId, type: $type) {
      lists {
        status
        entries {
          id
          status
          score
          progress
          updatedAt
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
