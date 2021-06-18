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
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: query,
    }),
  };

  return fetch('https://graphql.anilist.co', options)
    .then((res) => res.json())
    .then((json) => {
      if (json.data.UpdateUser !== null) return json.data.UpdateUser.id;
      else {
        Promise.reject(json.errors);
        return json.errors;
      }
    })
    .catch((err) => console.error(err));
}
