/**
 * Renders the editing page
 * Media and entry are separated because sometimes the user won't have it on their list already,
 * but the entry will have the entire media object on it too
 * @param {Object} media just the media section of the list entry
 * @param {string} listType either ANIME or MANGA
 * @param {string} prevContainer the container from which this function is called.
 * One of `list`, `search`, or `page`
 * @param {Object} entry optional, the entire list entry
 */
export function openEditView(mediaId, prevContainer) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const editContainer = document.getElementById('edit');
  editContainer.classList.remove('hide');
  while (editContainer.firstChild) editContainer.removeChild(editContainer.firstChild);

  const view = document.createElement('edit-view');
  view.data = {
    mediaId,
    prevContainer
  };

  editContainer.append(view);
}
