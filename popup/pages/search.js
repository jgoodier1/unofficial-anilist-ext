import { search } from '../queries.js';
import { showMediaPage } from './media.js';
import { showCharacterPage } from './character.js';
import { showStaffPage } from './staff.js';
import { openEditView } from './edit.js';

/**
 * renders the search page
 */
export async function searchPage() {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));
  const searchContainer = document.getElementById('search');
  searchContainer.classList.remove('hide');

  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  searchInput.focus();
  const searchQueryButton = document.getElementById('search-button');

  searchInput.addEventListener('keydown', async e => {
    if (searchInput.value === '') return;
    if (e.code === 'Enter') {
      e.preventDefault();
      const results = await search(searchInput.value);
      showSearchResults(results);
    }
  });
  searchQueryButton.addEventListener('click', async () => {
    if (searchInput.value === '') return;
    const results = await search(searchInput.value);
    showSearchResults(results);
  });
}

/**
 * renders the search results
 * @param {Object[]} allResults all the results from the query
 */
function showSearchResults(allResults) {
  const searchContainer = document.getElementById('search');
  const searchBar = document.getElementById('search-bar');
  while (searchBar.nextSibling) searchContainer.removeChild(searchBar.nextSibling);

  allResults.forEach((results, i) => {
    if (results.length === 0) return;
    let headingContent;
    if (i === 0) headingContent = 'Anime';
    else if (i === 1) headingContent = 'Manga';
    else if (i === 2) headingContent = 'Characters';
    else if (i === 3) headingContent = 'Staff';

    const resultsSection = searchContainer.appendChild(document.createElement('section'));
    const heading = resultsSection.appendChild(document.createElement('h2'));
    heading.classList.add('search-section-heading');

    heading.textContent = headingContent;
    const rowContainer = resultsSection.appendChild(document.createElement('div'));
    rowContainer.classList.add('search-row-container');

    results.forEach(result => {
      const row = rowContainer.appendChild(document.createElement('div'));
      row.id = 'search-' + result.id;
      row.classList.add('search-row');

      const image = row.appendChild(document.createElement('img'));
      // if media, show the cover image, else if they're a person, show their image
      if (i === 0 || i === 1) {
        image.src = result.coverImage.medium;
      } else if (i === 2 || i === 3) {
        image.src = result.image.medium;
      }
      image.classList.add('search-image');

      const title = row.appendChild(document.createElement('h3'));

      // media
      if (i === 0 || i === 1) {
        title.textContent = result.title.userPreferred;
        title.classList.add('search-title');
        title.addEventListener('click', () => {
          showMediaPage(result.id, result.type);
        });
        const yearAndFormat = row.appendChild(document.createElement('p'));
        yearAndFormat.textContent = result.startDate.year + ' ' + result.format;
        yearAndFormat.classList.add('search-media-year');

        // put an edit button on the end
        const editButton = row.appendChild(document.createElement('button'));
        editButton.classList.add('search-edit-button');
        const svg = editButton.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        );
        svg.setAttributeNS(null, 'viewBox', '0 -1 401.52289 401');
        svg.setAttributeNS(null, 'fill', 'black');
        svg.classList.add('search-edit-svg');
        const path1 = svg.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'path')
        );
        path1.setAttributeNS(
          null,
          'd',
          'm370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0'
        );
        const path2 = svg.appendChild(
          document.createElementNS('http://www.w3.org/2000/svg', 'path')
        );
        path2.setAttributeNS(
          null,
          'd',
          'm376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0'
        );

        editButton.addEventListener('click', async () => {
          openEditView(result.id, 'search');
        });
        // people
      } else if (i === 2 || i === 3) {
        title.textContent = result.name.full;
        title.classList.add('search-title', 'search-char-staff-title');
        if (i === 2) {
          title.addEventListener('click', () => showCharacterPage(result.id));
        } else if (i === 3) {
          title.addEventListener('click', () => showStaffPage(result.id));
        }
      }
    });
  });
}
