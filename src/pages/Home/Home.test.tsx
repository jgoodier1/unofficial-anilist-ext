import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import Home from './Home';
import Edit from '../Edit';
import Media from '../Media';
import { GET_LISTS } from '../../queries';
import { GET_EDIT_DATA, EDIT_ENTRY } from '../Edit/queries';
import { UPDATE_ENTRY } from './components/HomeCard';
import { UserIdContext } from '../../context';
import { cache } from '../../cache';
import NavBar from '../../components/NavBar';
import { getMediaMock } from '../../testMocks';

it('renders the current lists', async () => {
  render(
    <MemoryRouter>
      <MockedProvider mocks={[homeMockAnime, homeMockManga]} cache={cache}>
        <UserIdContext.Provider value={1}>
          <Home />
        </UserIdContext.Provider>
      </MockedProvider>
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.getAllByText(/loading/i));
  // screen.debug();
  expect(screen.getByText(/Cowboy Bebop/i)).toBeInTheDocument();
  expect(screen.getByText(/Attack on Titan/i)).toBeInTheDocument();
  expect(screen.queryByText(/Naruto Shippuden/i)).toBeNull();
  expect(screen.queryByText(/Digimon/i)).toBeNull();
  expect(screen.queryByText(/Bleach/i)).toBeNull();
  expect(screen.queryByText(/One Piece/i)).toBeNull();

  expect(screen.getByText(/Dandadan/i)).toBeInTheDocument();
  expect(screen.getByText(/Tokyo Ghoul/i)).toBeInTheDocument();
  expect(screen.queryByText(/Naruto/i)).toBeNull();
  expect(screen.queryByText(/Punpun/i)).toBeNull();
  expect(screen.queryByText(/Boring/i)).toBeNull();
  expect(screen.queryByText(/Berserk/i)).toBeNull();
});

it('updates when the update button is clicked', async () => {
  render(
    <MemoryRouter>
      <MockedProvider
        mocks={[homeMockAnime, homeMockManga, updateEntryMock]}
        cache={cache}
      >
        <UserIdContext.Provider value={1}>
          <Home />
        </UserIdContext.Provider>
      </MockedProvider>
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /^2 +/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(screen.getByRole('button', { name: /^3 +/i })).toBeInTheDocument();
  // screen.debug();
});

// DOESN'T WORK YET
it('removes an entry when status is changed from "CURRENT" or "REPEATING', async () => {
  render(
    <MemoryRouter>
      <MockedProvider
        mocks={[homeMockAnime, homeMockManga, getMediaMock, editDataMock, editEntryMock]}
        cache={cache}
      >
        <UserIdContext.Provider value={1}>
          <NavBar logOut={() => {}} />
          <Switch>
            <Route path='/media/:id'>
              <Media />
            </Route>
            <Route path='/edit/:id'>
              <Edit />
            </Route>
            <Route path='/'>
              <Home />
            </Route>
          </Switch>
        </UserIdContext.Provider>
      </MockedProvider>
    </MemoryRouter>
  );

  // find the link on the home page, click it to go to media page
  userEvent.click(screen.getByRole('link', { name: /Cowboy Bebop/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  // on media, click the edit button
  userEvent.click(screen.getByRole('link', { name: /Watching/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  // change the values
  userEvent.selectOptions(screen.getByRole('combobox', { name: /status/i }), [
    'COMPLETED'
  ]);
  // screen.debug();
  userEvent.click(screen.getByRole('button', { name: /save/i }));
  // await waitForElementToBeRemoved(() => screen.getByText(/watching/i));
  // expect(screen.getByRole('link', { name: /completed/i })).toBeInTheDocument();

  // go home and check entry is still there
  userEvent.click(screen.getByRole('link', { name: /home/i }));
  expect(screen.queryByText(/cowboy bebop/i)).toBeNull();
});

function createMockEntry(
  id: number,
  status: string,
  score: number,
  progress: number,
  mediaId: number,
  title: string,
  episodes: number | null,
  chapters: number | null,
  image: string,
  type: 'ANIME' | 'MANGA',
  mediaStatus: string
) {
  return {
    id,
    status,
    score,
    progress,
    updatedAt: 1596887889,
    media: {
      id: mediaId,
      title: {
        userPreferred: title,
        __typename: 'MediaTitle'
      },
      episodes,
      chapters,
      coverImage: {
        medium: image,
        __typename: 'MediaCoverImage'
      },
      type,
      status: mediaStatus,
      nextAiringEpisode: null,
      __typename: 'Media'
    },
    __typename: 'MediaList'
  };
}

const updateEntryMock = {
  request: {
    query: UPDATE_ENTRY,
    variables: {
      id: 35523,
      status: 'REPEATING',
      progress: 3
    }
  },
  result: {
    data: {
      SaveMediaListEntry: {
        id: 35523,
        status: 'REPEATING',
        progress: 3,
        updatedAt: 455443532
      }
    }
  }
};

const homeMockAnime = {
  request: {
    query: GET_LISTS,
    variables: {
      userId: 1,
      type: 'ANIME'
    }
  },
  result: {
    data: {
      MediaListCollection: {
        lists: [
          {
            status: 'COMPLETED',
            entries: [
              createMockEntry(
                1,
                'COMPLETED',
                7,
                12,
                46346,
                'Naruto Shippuden',
                12,
                null,
                'imageurl',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'CURRENT',
            entries: [
              createMockEntry(
                12,
                'CURRENT',
                7,
                12,
                1,
                'Cowboy Bebop',
                26,
                null,
                'imageurl2',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'PLANNING',
            entries: [
              createMockEntry(
                124,
                'PLANNING',
                0,
                0,
                4334,
                'Digimon',
                56,
                null,
                'imageurl3',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'DROPPED',
            entries: [
              createMockEntry(
                16564,
                'DROPPED',
                6.5,
                0,
                8908,
                'Bleach',
                653,
                null,
                'imageurl23131',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'PAUSED',
            entries: [
              createMockEntry(
                12321,
                'PAUSED',
                6.5,
                600,
                44,
                'One Piece',
                null,
                null,
                'imageurl3342',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'REPEATING',
            entries: [
              createMockEntry(
                35523,
                'REPEATING',
                8,
                2,
                43905434,
                'Attack on Titan',
                24,
                null,
                'imageurl3543',
                'ANIME',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          }
        ],
        __typename: 'MediaListCollection'
      }
    }
  }
};

const homeMockManga = {
  request: {
    query: GET_LISTS,
    variables: {
      userId: 1,
      type: 'MANGA'
    }
  },
  result: {
    data: {
      MediaListCollection: {
        lists: [
          {
            status: 'COMPLETED',
            entries: [
              createMockEntry(
                700,
                'COMPLETED',
                8,
                700,
                4334,
                'Naruto',
                null,
                700,
                'imageurl8',
                'MANGA',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'CURRENT',
            entries: [
              createMockEntry(
                6823,
                'CURRENT',
                9,
                20,
                4559343,
                'Dandadan',
                null,
                null,
                'imageurl54354',
                'MANGA',
                'RELEASING'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'PLANNING',
            entries: [
              createMockEntry(
                85490855,
                'PLANNING',
                0,
                7000,
                65465665,
                'Punpun',
                null,
                null,
                'imageurl34242443',
                'MANGA',
                'RELASING'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'DROPPED',
            entries: [
              createMockEntry(
                5423,
                'DROPPED',
                3,
                200,
                454898092,
                'Boring',
                null,
                643,
                'imageurl3442',
                'MANGA',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'PAUSED',
            entries: [
              createMockEntry(
                8549054,
                'PAUSED',
                0,
                300,
                4385867,
                'Berserk',
                null,
                null,
                'imageurl345785',
                'MANGA',
                'HIATUS'
              )
            ],
            __typename: 'MediaListGroup'
          },
          {
            status: 'REPEATING',
            entries: [
              createMockEntry(
                5432,
                'REPEATING',
                8,
                54,
                9432432,
                'Tokyo Ghoul',
                null,
                124,
                'imageurl3342',
                'MANGA',
                'FINISHED'
              )
            ],
            __typename: 'MediaListGroup'
          }
        ],
        __typename: 'MediaListCollection'
      }
    }
  }
};

const editDataMock = {
  request: {
    query: GET_EDIT_DATA,
    variables: {
      id: '1'
    }
  },
  result: {
    data: {
      Media: {
        id: 1,
        title: {
          userPreferred: 'Cowboy Bebop',
          __typename: 'MediaTitle'
        },
        coverImage: {
          medium:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx1-CXtrrkMpJ8Zq.png',
          large:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-CXtrrkMpJ8Zq.png',
          __typename: 'MediaCoverImage'
        },
        bannerImage:
          'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-T3PJUjFJyRwg.jpg',
        type: 'ANIME',
        status: 'FINISHED',
        episodes: 26,
        chapters: null,
        volumes: null,
        mediaListEntry: {
          id: 12,
          mediaId: 1,
          status: 'CURRENT',
          score: 7,
          progress: 12,
          progressVolumes: null,
          repeat: null,
          private: false,
          hiddenFromStatusLists: false,
          notes: null,
          updatedAt: 940329403,
          startedAt: {
            year: 2014,
            month: 12,
            day: 12,
            __typename: 'FuzzyDate'
          },
          completedAt: {
            year: null,
            month: null,
            day: null
          },
          __typename: 'MediaList'
        },
        __typename: 'Media'
      }
    }
  }
};

const editEntryMock = {
  request: {
    query: EDIT_ENTRY,
    variables: {
      mediaId: 1,
      status: 'COMPLETED',
      score: 7,
      progress: 12
    }
  },
  result: {
    data: {
      SaveMediaListEntry: {
        id: 12,
        mediaId: 1,
        score: 7,
        progress: 12,
        status: 'COMPLETED',
        updatedAt: 1243443,
        media: {
          id: 1,
          title: {
            userPreferred: 'Cowboy Bebop',
            __typename: 'MediaTitle'
          },
          episodes: 26,
          chapters: null,
          coverImage: {
            medium: '',
            __typename: 'MediaCoverIamge'
          },
          type: 'ANIME',
          status: 'FINISHED',
          nextAiringEpisode: null,
          __typename: 'Media'
        },
        __typename: 'MediaList'
      }
    }
  }
};
