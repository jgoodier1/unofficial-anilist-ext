import { getMediaCharacter, getMediaPage, getMediaStaff } from '../queries.js';
import { MONTHS, COLOURS } from '../constants.js';

/**
 * displays the page for media
 * @param {number} id
 * @param {string} type either 'ANIME' or 'MANGA'
 */
export async function showMediaPage(id, type) {
  const allContainers = document.querySelectorAll('.container');
  allContainers.forEach(container => container.classList.add('hide'));

  const pageContainer = document.getElementById('page');
  pageContainer.classList.remove('hide');
  while (pageContainer.firstChild) pageContainer.removeChild(pageContainer.firstChild);

  const media = await getMediaPage(id, type);

  if (media.bannerImage !== null) {
    const bannerImage = pageContainer.appendChild(document.createElement('img'));
    bannerImage.src = media.bannerImage;
    bannerImage.classList.add('page-banner-img');
  }

  // topContainer contains the cover image, title, and media entry editing button
  const topContainer = pageContainer.appendChild(document.createElement('section'));
  topContainer.classList.add('page-top-container');
  const coverImage = topContainer.appendChild(document.createElement('img'));
  coverImage.src = media.coverImage.large;
  coverImage.classList.add('page-cover-img');
  if (media.bannerImage === null) coverImage.style.marginTop = '16px';

  const topContent = topContainer.appendChild(document.createElement('div'));
  topContent.classList.add('page-top-content');
  const title = topContent.appendChild(document.createElement('h1'));
  title.textContent = media.title.userPreferred;
  title.classList.add('page-top-title');

  const button = document.createElement('edit-button');
  const buttonStatus = media.mediaListEntry ? media.mediaListEntry.status : 'Add to List';
  button.mediaType = media.type;
  button.mediaId = media.id;
  button.setAttribute('data-status', buttonStatus);
  button.classList.add('page-top-button');
  topContent.append(button);

  const tabsSection = pageContainer.appendChild(document.createElement('section'));
  tabsSection.classList.add('page-tab');
  const overviewTab = tabsSection.appendChild(document.createElement('button'));
  overviewTab.textContent = 'Overview';
  overviewTab.classList.add('page-tab-button');
  const characterTab = tabsSection.appendChild(document.createElement('button'));
  characterTab.textContent = 'Characters';
  characterTab.classList.add('page-tab-button');
  const staffTab = tabsSection.appendChild(document.createElement('button'));
  staffTab.textContent = 'Staff';
  staffTab.classList.add('page-tab-button');

  let currentTab = 'overview';

  overviewTab.addEventListener('click', () => {
    if (currentTab === 'overview') return;
    else currentTab = 'overview';
    const allTabs = document.querySelectorAll('.tab-wrapper');
    allTabs.forEach(tab => tab.classList.add('hide'));
    const overviewTab = document.getElementById('overview-tab');
    overviewTab.classList.remove('hide');
  });

  characterTab.addEventListener('click', async () => {
    if (currentTab === 'character') return;
    else currentTab = 'character';

    const allTabs = document.querySelectorAll('.tab-wrapper');
    allTabs.forEach(tab => tab.classList.add('hide'));
    const characterTab = document.getElementById('character-tab');
    characterTab.classList.remove('hide');

    if (characterTab.firstChild) return;

    let characters = await getMediaCharacter(id, 1);

    const characterCardWrapper = document.createElement('div');
    characterTab.append(characterCardWrapper);

    characters.edges.forEach(character => {
      const characterElement = document.createElement('character-card');
      characterElement.dataCharacter = character.node;
      characterElement.dataCharacter.role = character.role;
      characterElement.dataCharacter.voiceActors = character.voiceActors;

      characterCardWrapper.append(characterElement);
    });

    if (characters.pageInfo.hasNextPage) {
      const moreCharactersButton = document.createElement('button');
      moreCharactersButton.textContent = 'Show More Characters';
      moreCharactersButton.classList.add('char-button');
      characterTab.append(moreCharactersButton);
      // create button
      moreCharactersButton.addEventListener('click', async () => {
        characters = await getMediaCharacter(id, characters.pageInfo.currentPage + 1);
        characters.edges.forEach(character => {
          const characterElement = document.createElement('character-card');
          characterElement.dataCharacter = character.node;
          characterElement.dataCharacter.role = character.role;
          characterElement.dataCharacter.voiceActors = character.voiceActors;

          characterCardWrapper.append(characterElement);
        });
        if (!characters.pageInfo.hasNextPage) moreCharactersButton.remove();
      });
    }
  });

  staffTab.addEventListener('click', async () => {
    if (currentTab === 'staff') return;
    else currentTab = 'staff';

    const allTabs = document.querySelectorAll('.tab-wrapper');
    allTabs.forEach(tab => tab.classList.add('hide'));
    const staffTab = document.getElementById('staff-tab');
    staffTab.classList.remove('hide');

    if (staffTab.firstChild) return;

    const staffCardWrapper = document.createElement('div');
    staffTab.append(staffCardWrapper);

    let staffMembers = await getMediaStaff(id, 1);
    staffMembers.edges.forEach(staff => {
      const staffElement = document.createElement('staff-card');
      staffElement.dataStaff = staff.node;
      staffElement.dataStaff.role = staff.role;

      staffCardWrapper.append(staffElement);
    });

    if (staffMembers.pageInfo.hasNextPage) {
      const moreStaffButton = document.createElement('button');
      moreStaffButton.textContent = 'Show More Staff';
      moreStaffButton.classList.add('char-button');
      staffTab.append(moreStaffButton);

      moreStaffButton.addEventListener('click', async () => {
        staffMembers = await getMediaStaff(id, staffMembers.pageInfo.currentPage + 1);

        staffMembers.edges.forEach(staff => {
          const staffElement = document.createElement('staff-card');
          staffElement.dataStaff = staff.node;
          staffElement.dataStaff.role = staff.role;

          staffCardWrapper.append(staffElement);
        });

        if (!staffMembers.pageInfo.hasNextPage) moreStaffButton.remove();
      });
    }
  });

  // this is going to be really long, so bear with me
  const dataSection = pageContainer.appendChild(document.createElement('section'));
  dataSection.classList.add('page-section', 'page-data-section');

  function createDataComponent(title, value) {
    const component = document.createElement('data-comp');
    component.setAttribute('data-title', title);
    component.setAttribute('data-value', value);
    dataSection.append(component);
  }

  if (media.nextAiringEpisode !== null) {
    const DAY = 86400;
    const HOUR = 3600;
    const MINUTE = 60;
    const days = Math.trunc(media.nextAiringEpisode.timeUntilAiring / DAY);
    const dayRemainder = media.nextAiringEpisode.timeUntilAiring % DAY;
    const hours = Math.trunc(dayRemainder / HOUR);
    const hourRemainder = dayRemainder % HOUR;
    const minutes = Math.trunc(hourRemainder / MINUTE);

    let timeTilEpisode = '';
    if (days === 0) {
      if (hours === 0) timeTilEpisode = `${minutes}m`;
      else if (minutes === 0) timeTilEpisode = `${hours}h`;
      else timeTilEpisode = `${hours}h ${minutes}m`;
    } else {
      if (hours !== 0 && minutes !== 0) {
        timeTilEpisode = `${days}d ${hours}h ${minutes}m`;
      } else if (minutes === 0) timeTilEpisode = `${days} ${hours}h`;
      else if (hours === 0) timeTilEpisode = `${days}d ${minutes}m`;
      else timeTilEpisode = `${days}d`;
    }
    createDataComponent(
      'Airing',
      `Ep ${media.nextAiringEpisode.episode}: ${timeTilEpisode}`
    );
  }

  createDataComponent('Format', media.format);

  if (media.type === 'ANIME') {
    if (media.episodes !== null) {
      createDataComponent('Episodes', media.episodes);
    }
    if (media.duration) {
      createDataComponent('Episode Duration', `${media.duration} min`);
    }
  } else if (media.type === 'MANGA') {
    if (media.chapters !== null) {
      createDataComponent('Chapters', media.chapters);
    }
    if (media.volumes !== null) {
      createDataComponent('Volumes', media.volumes);
    }
  }

  if (media.startDate.day !== null) {
    createDataComponent(
      'Start Date',
      `${MONTHS[media.startDate.month]} ${media.startDate.day}, ${media.startDate.year}`
    );
  }

  if (media.endDate.day !== null) {
    createDataComponent(
      'End Date',
      `${MONTHS[media.endDate.month]} ${media.endDate.day}, ${media.endDate.year}`
    );
  }

  if (media.type === 'ANIME' && media.season !== null) {
    createDataComponent('Season', media.season + ' ' + media.seasonYear);
  }

  if (media.averageScore) {
    createDataComponent('Average Score', media.averageScore + '%');
  }
  if (media.meanScore) {
    createDataComponent('Mean Score', media.meanScore + '%');
  }
  createDataComponent('Popularity', media.popularity);

  createDataComponent('Favourites', media.favourites);

  if (media.type === 'ANIME') {
    if (media.studios !== null) {
      const mainStudio = media.studios.edges.filter(studio => studio.isMain);
      createDataComponent('Studios', mainStudio[0].node.name);
      if (media.studios.edges.length > 1) {
        const producers = media.studios.edges.filter(studio => !studio.isMain);
        const producerName = producers.map(prod => prod.node.name);
        const producersString = producerName.join(', ');
        createDataComponent('Producers', producersString);
      }
    }
  }
  createDataComponent('Source', media.source);

  if (media.hashtag !== null) {
    createDataComponent('Hashtag', media.hashtag);
  }

  if (media.genres.length > 0) {
    const genres = media.genres.join(', ');
    createDataComponent('Genres', genres);
  }

  if (media.title.romaji) {
    createDataComponent('Romaji', media.title.romaji);
  }
  if (media.title.english) {
    createDataComponent('English', media.title.english);
  }
  if (media.title.native) {
    createDataComponent('Native', media.title.native);
  }

  if (media.synonyms.length > 0) {
    const synonyms = media.synonyms.join(', ');
    createDataComponent('Synonyms', synonyms);
  }
  // end data

  const overviewWrapper = pageContainer.appendChild(document.createElement('div'));
  overviewWrapper.classList.add('tab-wrapper');
  overviewWrapper.id = 'overview-tab';

  const descriptionSection = overviewWrapper.appendChild(
    document.createElement('section')
  );
  descriptionSection.classList.add('page-section', 'page-desc-section');

  const descriptionHeading = descriptionSection.appendChild(document.createElement('h2'));
  descriptionHeading.textContent = 'Description';
  descriptionHeading.classList.add('page-sub-heading');

  const descriptionParagraph = descriptionSection.appendChild(
    document.createElement('p')
  );
  descriptionParagraph.innerHTML = media.description;
  descriptionParagraph.classList.add('page-desc-p');

  //relations
  if (media.relations.edges.length > 0) {
    const relationsSection = overviewWrapper.appendChild(
      document.createElement('section')
    );
    relationsSection.classList.add('page-section');

    const relationsHeading = relationsSection.appendChild(document.createElement('h2'));
    relationsHeading.textContent = 'Relations';
    relationsHeading.classList.add('page-sub-heading');

    const releationsCarousel = relationsSection.appendChild(
      document.createElement('div')
    );
    releationsCarousel.classList.add('carousel-wrapper');

    // create the relations cards (media that is related to this one)
    media.relations.edges.forEach(relation => {
      const relationElement = document.createElement('relation-card');
      relationElement.dataNode = relation.node;
      relationElement.dataRelation = relation.relationType;
      releationsCarousel.appendChild(relationElement);
    });
  }

  if (media.characters.edges !== null) {
    const charactersSection = overviewWrapper.appendChild(
      document.createElement('section')
    );
    charactersSection.classList.add('page-section');
    const charactersHeading = charactersSection.appendChild(document.createElement('h2'));
    charactersHeading.textContent = 'Characters';
    charactersHeading.classList.add('page-sub-heading');

    // creates the character cards
    media.characters.edges.forEach(character => {
      const characterElement = document.createElement('character-card');
      characterElement.dataCharacter = character.node;
      characterElement.dataCharacter.role = character.role;
      characterElement.dataCharacter.voiceActors = character.voiceActors;

      charactersSection.append(characterElement);
    });
  }

  const staffSection = overviewWrapper.appendChild(document.createElement('section'));
  staffSection.classList.add('page-section');

  const staffHeading = staffSection.appendChild(document.createElement('h2'));
  staffHeading.textContent = 'Staff';
  staffHeading.classList.add('page-sub-heading');

  // creates the staff cards
  media.staffPreview.edges.forEach(staff => {
    const staffElement = document.createElement('staff-card');
    staffElement.dataStaff = staff.node;
    staffElement.dataStaff.role = staff.role;

    staffSection.append(staffElement);
  });

  const statusStatsSection = overviewWrapper.appendChild(
    document.createElement('section')
  );
  statusStatsSection.classList.add('page-section');

  const statusStatsHeading = statusStatsSection.appendChild(document.createElement('h2'));
  statusStatsHeading.textContent = 'Status Distribution';
  statusStatsHeading.classList.add('page-sub-heading');

  const sortedStats = media.stats.statusDistribution.sort((a, b) => a.amount < b.amount);

  const statsInnerWrapper = statusStatsSection.appendChild(document.createElement('div'));
  statsInnerWrapper.classList.add('page-stats-wrapper');

  // creates the status cards
  sortedStats.forEach((stat, i) => {
    const statusCard = document.createElement('status-card');
    statusCard.index = i;
    statusCard.stat = stat;

    statsInnerWrapper.appendChild(statusCard);
  });

  // bar at the bottom bellow the statuses that illustrates the % of each status
  const percentageBar = statsInnerWrapper.appendChild(document.createElement('div'));
  percentageBar.classList.add('page-percentage-bar');
  sortedStats.forEach((stat, i) => {
    const bar = percentageBar.appendChild(document.createElement('span'));
    bar.style.width = `${(stat.amount / media.popularity) * 400}px`;
    switch (i) {
      case 0:
        bar.style.backgroundColor = COLOURS.green;
        break;
      case 1:
        bar.style.backgroundColor = COLOURS.blue;
        break;
      case 2:
        bar.style.backgroundColor = COLOURS.purple;
        break;
      case 3:
        bar.style.backgroundColor = COLOURS.pink;
        break;
      case 4:
        bar.style.backgroundColor = COLOURS.red;
        break;

      default:
        break;
    }
  });

  // a graph showing the distribution of scores
  if (media.stats.scoreDistribution.length > 0) {
    const scoreSection = overviewWrapper.appendChild(document.createElement('section'));
    scoreSection.classList.add('page-section');

    const scoreHeading = scoreSection.appendChild(document.createElement('h2'));
    scoreHeading.textContent = 'Score Distribution';
    scoreHeading.classList.add('page-sub-heading');

    const scoreInnerWrapper = scoreSection.appendChild(document.createElement('div'));
    scoreInnerWrapper.classList.add('page-score-wrapper');

    const largestAmount = media.stats.scoreDistribution.reduce((max, score) => {
      return max.amount > score.amount ? max : score;
    });

    media.stats.scoreDistribution.forEach(score => {
      const graphBar = document.createElement('graph-bar');
      graphBar.data = score;
      graphBar.data.max = largestAmount.amount;
      scoreInnerWrapper.appendChild(graphBar);
    });
  }

  const recommendSection = overviewWrapper.appendChild(document.createElement('section'));
  recommendSection.classList.add('page-section');

  const recommendHeading = recommendSection.appendChild(document.createElement('h2'));
  recommendHeading.textContent = 'Recommendations';
  recommendHeading.classList.add('page-sub-heading');

  const recommendCarousel = recommendSection.appendChild(document.createElement('div'));
  recommendCarousel.classList.add('carousel-wrapper');

  // creates the recommendation cards
  media.recommendations.nodes.forEach(rec => {
    const recElement = document.createElement('recommend-card');
    recElement.dataRec = rec.mediaRecommendation;

    recommendCarousel.append(recElement);
  });

  // create the wrappers for the character and staff tabs
  const characterTabWrapper = pageContainer.appendChild(document.createElement('div'));
  characterTabWrapper.classList.add('tab-wrapper', 'page-tab-wrapper', 'hide');
  characterTabWrapper.id = 'character-tab';
  const staffTabWrapper = pageContainer.appendChild(document.createElement('div'));
  staffTabWrapper.classList.add('tab-wrapper', 'page-tab-wrapper', 'hide');
  staffTabWrapper.id = 'staff-tab';
}
