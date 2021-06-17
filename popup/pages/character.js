import { getCharacterPage, getCharacterAppearances } from '../queries.js';
import { createTopSection } from '../utils.js';
import { MONTHS } from '../constants.js';

/**
 * Renders the character's page
 * @param {number} id
 */
export async function showCharacterPage(id) {
  let onList = false;
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  let character = await getCharacterPage(id, onList);

  // name and image
  createTopSection(character);

  const descriptionWrapper = pageContainer.appendChild(document.createElement('section'));
  descriptionWrapper.classList.add('char-desc');

  if (character.dateOfBirth.month !== null) {
    const birthday = descriptionWrapper.appendChild(document.createElement('p'));
    birthday.classList.add('char-desc-row');
    const birthMonth = MONTHS[character.dateOfBirth.month];
    birthday.textContent = character.dateOfBirth.year
      ? `${birthMonth} ${character.dateOfBirth.day}, ${character.dateOfBirth.year} `
      : birthMonth + ' ' + character.dateOfBirth.day;
    const key = document.createElement('strong');
    key.textContent = 'Birth: ';
    birthday.prepend(key);
  }
  if (character.age !== null) {
    const age = descriptionWrapper.appendChild(document.createElement('p'));
    age.classList.add('char-desc-row');
    age.textContent = character.age;
    const key = document.createElement('strong');
    key.textContent = 'Age: ';
    age.prepend(key);
  }
  if (character.gender !== null) {
    const gender = descriptionWrapper.appendChild(document.createElement('p'));
    gender.classList.add('char-desc-row');
    gender.textContent = character.gender;
    const key = document.createElement('strong');
    key.textContent = 'Gender: ';
    gender.prepend(key);
  }

  if (character.description) {
    const parsedDescription = document.createElement('parsed-markdown');
    parsedDescription.setAttribute('data', character.description);
    descriptionWrapper.append(parsedDescription);
  }

  // from here down are character and staff roles
  const onListLabel = document.createElement('label');
  onListLabel.classList.add('onlist-label');
  onListLabel.textContent = 'On My List';
  pageContainer.appendChild(onListLabel);

  const onListCheckbox = document.createElement('input');
  onListCheckbox.type = 'checkbox';
  onListLabel.append(onListCheckbox);

  onListCheckbox.addEventListener('click', async e => {
    if (e.target.checked) {
      onList = true;
    } else {
      onList = false;
    }
    character = await getCharacterPage(id, onList);
    // console.log(onListLabel.nextSibling);
    while (onListLabel.nextSibling) pageContainer.removeChild(onListLabel.nextSibling);
    createAllCards(character);
    // console.log(staff);
  });

  function createAllCards(character) {
    const outerWrapper = pageContainer.appendChild(document.createElement('section'));
    outerWrapper.classList.add('char-card-outer-wrapper');

    const heading = outerWrapper.appendChild(document.createElement('h2'));
    heading.textContent = 'Appearances';
    heading.classList.add('char-card-heading');

    const cardWrapper = outerWrapper.appendChild(document.createElement('div'));
    cardWrapper.classList.add('char-card-wrapper');

    /**
     * creates the appearance cards
     * @param {Object[]} dataArray array of data to create the appearance cards
     */
    function createCharacterCards(dataArray) {
      dataArray.forEach(media => {
        const card = document.createElement('char-media');
        card.data = media.node;
        card.data.voiceActors = media.voiceActorRoles;
        cardWrapper.append(card);
      });
    }

    createCharacterCards(character.media.edges);

    // pagination
    if (character.media.pageInfo.hasNextPage) {
      let page = 2;
      const nextAppearButton = outerWrapper.appendChild(document.createElement('button'));
      nextAppearButton.classList.add('char-button');
      nextAppearButton.textContent = 'Show More Appearances';
      nextAppearButton.addEventListener('click', async () => {
        const newAppearances = await getCharacterAppearances(id, page, onList);
        createCharacterCards(newAppearances.media.edges);
        if (newAppearances.media.pageInfo.hasNextPage) page++;
        else {
          nextAppearButton.remove();
        }
      });
    }
  }
  createAllCards(character);
}
