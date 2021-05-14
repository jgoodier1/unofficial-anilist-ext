import { getStaffPage, getCharacterMedia, getRoleMedia } from '../queries.js';
import { createTopSection } from '../utils.js';
import { MONTHS } from '../constants.js';

/**
 * Renders the page for the staff member
 * @param {number} id
 */
export async function showStaffPage(id) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const staff = await getStaffPage(id);

  // names and images
  createTopSection(staff);

  const descriptionWrapper = pageContainer.appendChild(document.createElement('section'));
  descriptionWrapper.classList.add('char-desc');

  if (staff.dateOfBirth.month !== null) {
    const birthday = descriptionWrapper.appendChild(document.createElement('p'));
    birthday.classList.add('char-desc-row');
    const birthMonth = MONTHS[staff.dateOfBirth.month];
    birthday.textContent = staff.dateOfBirth.year
      ? `${birthMonth} ${staff.dateOfBirth.day}, ${staff.dateOfBirth.year} `
      : birthMonth + ' ' + staff.dateOfBirth.day;
    const key = document.createElement('strong');
    key.textContent = 'Birth: ';
    birthday.prepend(key);
  }
  if (staff.age !== null) {
    const age = descriptionWrapper.appendChild(document.createElement('p'));
    age.classList.add('char-desc-row');
    age.textContent = staff.age;
    const key = document.createElement('strong');
    key.textContent = 'Age: ';
    age.prepend(key);
  }
  if (staff.gender !== null) {
    const gender = descriptionWrapper.appendChild(document.createElement('p'));
    gender.classList.add('char-desc-row');
    gender.textContent = staff.gender;
    const key = document.createElement('strong');
    key.textContent = 'Gender: ';
    gender.prepend(key);
  }
  if (staff.yearsActive.length > 0) {
    const yearsActive = descriptionWrapper.appendChild(document.createElement('p'));
    yearsActive.classList.add('char-desc-row');
    if (staff.yearsActive.length > 1) {
      yearsActive.textContent = staff.yearsActive.join('-');
    } else yearsActive.textContent = staff.yearsActive[0] + '-';
    const key = document.createElement('strong');
    key.textContent = 'Years Active: ';
    yearsActive.prepend(key);
  }
  if (staff.homeTown !== null) {
    const homeTown = descriptionWrapper.appendChild(document.createElement('p'));
    homeTown.classList.add('char-desc-row');
    homeTown.textContent = staff.homeTown;
    const key = document.createElement('strong');
    key.textContent = 'Home Town: ';
    homeTown.prepend(key);
  }

  // parses the markdown and sets inner html
  if (staff.description) {
    const parsedDescription = document.createElement('parsed-markdown');
    parsedDescription.setAttribute('data', staff.description);
    descriptionWrapper.append(parsedDescription);
  }

  /**
   * Creates the character role cards
   * @param {Object[]} dataArray Array of data to create character cards
   */
  function createCharacterCards(dataArray) {
    dataArray.forEach(character => {
      const card = document.createElement('staff-char');
      card.dataNode = character.node;
      card.dataChar = character.characters[0];
      card.dataChar.role = character.characterRole;

      document.getElementById('card-wrapper').append(card);
    });
  }

  if (staff.characterMedia.pageInfo.total !== 0) {
    const charWrapper = pageContainer.appendChild(document.createElement('section'));
    charWrapper.classList.add('char-card-outer-wrapper');

    const charHeading = charWrapper.appendChild(document.createElement('h2'));
    charHeading.textContent = 'Character Roles';
    charHeading.classList.add('char-card-heading');

    const cardWrapper = charWrapper.appendChild(document.createElement('div'));
    cardWrapper.id = 'card-wrapper';
    cardWrapper.classList.add('char-card-wrapper');

    createCharacterCards(staff.characterMedia.edges);

    if (staff.characterMedia.pageInfo.hasNextPage) {
      let charPage = 2;
      const nextCharButton = charWrapper.appendChild(document.createElement('button'));
      nextCharButton.classList.add('char-button');
      nextCharButton.textContent = 'Show More Characters';
      nextCharButton.addEventListener('click', async () => {
        const newCharacters = await getCharacterMedia(id, charPage);
        createCharacterCards(newCharacters.characterMedia.edges);
        if (newCharacters.characterMedia.pageInfo.hasNextPage) charPage++;
        else {
          nextCharButton.remove();
        }
      });
    }
  }

  /**
   * Creates the staff role cards
   * In it's own function so that is can be used in pagination
   * @param {Object[]} dataArray Array of data needed to create the card
   */
  function createRoleCards(dataArray) {
    dataArray.forEach(role => {
      const card = document.createElement('staff-role');
      card.data = role.node;
      card.data.role = role.staffRole;

      document.getElementById('role-card-wrapper').append(card);
    });
  }
  if (staff.staffMedia.pageInfo.total !== 0) {
    const roleWrapper = pageContainer.appendChild(document.createElement('section'));
    roleWrapper.classList.add('char-card-outer-wrapper');

    const roleHeading = roleWrapper.appendChild(document.createElement('h2'));
    roleHeading.textContent = 'Staff Roles';
    roleHeading.classList.add('char-card-heading');

    const roleCardWrapper = roleWrapper.appendChild(document.createElement('div'));
    roleCardWrapper.id = 'role-card-wrapper';
    roleCardWrapper.classList.add('char-card-wrapper');

    createRoleCards(staff.staffMedia.edges);

    // pagination
    if (staff.staffMedia.pageInfo.hasNextPage) {
      let staffPage = 2;
      const nextRoleButton = roleWrapper.appendChild(document.createElement('button'));
      nextRoleButton.classList.add('char-button');
      nextRoleButton.textContent = 'Show More Roles';
      nextRoleButton.addEventListener('click', async () => {
        const newCharacters = await getRoleMedia(id, staffPage);
        createRoleCards(newCharacters.staffMedia.edges);
        if (newCharacters.staffMedia.pageInfo.hasNextPage) staffPage++;
        else {
          nextRoleButton.remove();
        }
      });
    }
  }
}
