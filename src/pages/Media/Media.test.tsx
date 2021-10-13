import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route } from 'react-router-dom';

import Media from './Media';
import { GET_MEDIA, GET_CHARACTER_MEDIA } from './queries';
import { cache } from '../../cache';

it('displays loading state', () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getMediaMock]} cache={cache}>
        <Media />
      </MockedProvider>
    </MemoryRouter>
  );

  // screen.debug();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('renders the page with data from the API', async () => {
  // need Route or else the params is empty
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cowboy bebop/i);
});

// all of these test are reusing the cache from the previous tests
// not sure if that's what I want, but I'm leaving it like that for now
it("renders the character tab when the 'Characters' button is clicked", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getCharacterMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  // screen.debug();
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(screen.getByText(/Unshou Ishizuka/i)).toBeInTheDocument();
});

it('shows a "show more" button when there is `hasNextPage` is true', async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getCharacterMock, getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  // screen.debug();
  expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
});

// this one can't use the same cache or else it will fail
// because it would use the mock data from the previous test
it("doesn't show a 'show more' button when `hasNextPage` is false", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getCharacterMockNextPageFalse, getMediaMock]}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(screen.queryByText(/show more/i)).toBeNull();
});

it("renders the next set of characters from the API when the 'show more' button is pressed", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider
        mocks={[getCharacterMock, getCharacterMockPage2, getMediaMock]}
        cache={cache}
      >
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  userEvent.click(screen.getByRole('button', { name: /show more/i }));
  expect(await screen.findByText(/Norio Wakamoto/i)).toBeInTheDocument();
  // screen.debug();
});

function createCharacterMock(
  id: number,
  role: string,
  actorId: number,
  actorName: string,
  actorImg: string,
  charId: number,
  charName: string,
  charImg: string
) {
  return {
    id,
    role,
    name: null,
    voiceActors: [
      {
        id: actorId,
        name: {
          full: actorName,
          __typename: 'StaffName'
        },
        language: 'Japanese',
        image: {
          medium: actorImg,
          __typename: 'StaffImage'
        },
        __typename: 'Staff'
      }
    ],
    node: {
      id: charId,
      name: {
        full: charName,
        __typename: 'CharacterName'
      },
      image: {
        medium: charImg,
        __typename: 'CharacterImage'
      },
      __typename: 'Character'
    },
    __typename: 'CharacterEdge'
  };
}

const getMediaMock = {
  request: {
    query: GET_MEDIA,
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
          romaji: 'Cowboy Bebop',
          english: 'Cowboy Bebop',
          native: 'カウボーイビバップ',
          __typename: 'MediaTitle'
        },
        coverImage: {
          large:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-CXtrrkMpJ8Zq.png',
          medium:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx1-CXtrrkMpJ8Zq.png',
          __typename: 'MediaCoverImage'
        },
        bannerImage:
          'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-T3PJUjFJyRwg.jpg',
        startDate: {
          year: 1998,
          month: 4,
          day: 3,
          __typename: 'FuzzyDate'
        },
        endDate: {
          year: 1999,
          month: 4,
          day: 24,
          __typename: 'FuzzyDate'
        },
        description:
          'Enter a world in the distant future, where Bounty Hunters roam the solar system. Spike and Jet, bounty hunting partners, set out on journeys in an ever struggling effort to win bounty rewards to survive.<br><br>\nWhile traveling, they meet up with other very interesting people. Could Faye, the beautiful and ridiculously poor gambler, Edward, the computer genius, and Ein, the engineered dog be a good addition to the group?',
        season: 'SPRING',
        seasonYear: 1998,
        type: 'ANIME',
        format: 'TV',
        status: 'FINISHED',
        episodes: 26,
        duration: 24,
        chapters: null,
        volumes: null,
        genres: ['Action', 'Adventure', 'Drama', 'Sci-Fi'],
        synonyms: ['카우보이 비밥', 'קאובוי ביבופ'],
        source: 'ORIGINAL',
        isAdult: false,
        meanScore: 86,
        averageScore: 86,
        popularity: 199325,
        favourites: 14084,
        hashtag: null,
        isFavourite: false,
        nextAiringEpisode: null,
        relations: {
          edges: [
            {
              id: 3,
              relationType: 'SIDE_STORY',
              node: {
                id: 5,

                type: 'ANIME',
                title: {
                  userPreferred: 'Cowboy Bebop: Tengoku no Tobira',
                  __typename: 'MediaTitle'
                },
                format: 'MOVIE',
                status: 'FINISHED',
                coverImage: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/b5-Zs2cbrglTu67.png',
                  __typename: 'MediaCoverImage'
                },
                __typename: 'Media'
              },
              __typename: 'MediaEdge'
            }
          ],
          __typename: 'MediaConnection'
        },
        characters: {
          edges: [
            createCharacterMock(
              2504,
              'MAIN',
              95011,
              'Kouichi Yamadera',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png',
              1,
              'Spike Spiegel',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
            )
          ],
          __typename: 'CharacterConnection'
        },
        staffPreview: {
          edges: [
            {
              id: 4313,
              role: 'Original Creator',
              node: {
                id: 97197,
                name: {
                  full: 'Hajime Yatate',
                  __typename: 'StaffName'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/staff/medium/n97197-6NsKNt4EPoul.jpg',
                  __typename: 'StaffImage'
                },
                __typename: 'Staff'
              },
              __typename: 'StaffEdge'
            }
          ],
          __typename: 'StaffConnection'
        },
        studios: {
          edges: [
            {
              isMain: true,
              node: {
                id: 13,
                name: 'Sunrise',
                __typename: 'Studio'
              },
              __typename: 'StudioEdge'
            },
            {
              isMain: false,
              node: {
                id: 15,
                name: 'Bandai Visual',
                __typename: 'Studio'
              },
              __typename: 'StudioEdge'
            },
            {
              isMain: false,
              node: {
                id: 177,
                name: 'Bandai Entertainment',
                __typename: 'Studio'
              },
              __typename: 'StudioEdge'
            }
          ],
          __typename: 'StudioConnection'
        },
        recommendations: {
          pageInfo: {
            total: 1,
            __typename: 'PageInfo'
          },
          nodes: [
            {
              id: 1468,
              rating: 680,
              mediaRecommendation: {
                id: 205,
                title: {
                  userPreferred: 'Samurai Champloo',
                  __typename: 'MediaTitle'
                },
                coverImage: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx205-xxonQKyJtVcw.png',
                  __typename: 'MediaCoverImage'
                },
                type: 'ANIME',
                __typename: 'Media'
              },
              __typename: 'Recommendation'
            }
          ],
          __typename: 'RecommendationConnection'
        },
        mediaListEntry: null,
        stats: {
          statusDistribution: [
            {
              status: 'CURRENT',
              amount: 15500,
              __typename: 'StatusDistribution'
            },
            {
              status: 'PLANNING',
              amount: 73167,
              __typename: 'StatusDistribution'
            },
            {
              status: 'COMPLETED',
              amount: 94062,
              __typename: 'StatusDistribution'
            },
            {
              status: 'DROPPED',
              amount: 3864,
              __typename: 'StatusDistribution'
            },
            {
              status: 'PAUSED',
              amount: 12732,
              __typename: 'StatusDistribution'
            }
          ],
          scoreDistribution: [
            {
              score: 10,
              amount: 253,
              __typename: 'ScoreDistribution'
            },
            {
              score: 20,
              amount: 68,
              __typename: 'ScoreDistribution'
            },
            {
              score: 30,
              amount: 158,
              __typename: 'ScoreDistribution'
            },
            {
              score: 40,
              amount: 393,
              __typename: 'ScoreDistribution'
            },
            {
              score: 50,
              amount: 1004,
              __typename: 'ScoreDistribution'
            },
            {
              score: 60,
              amount: 1961,
              __typename: 'ScoreDistribution'
            },
            {
              score: 70,
              amount: 6060,
              __typename: 'ScoreDistribution'
            },
            {
              score: 80,
              amount: 13312,
              __typename: 'ScoreDistribution'
            },
            {
              score: 90,
              amount: 21000,
              __typename: 'ScoreDistribution'
            },
            {
              score: 100,
              amount: 21312,
              __typename: 'ScoreDistribution'
            }
          ],
          __typename: 'MediaStats'
        },
        __typename: 'Media'
      }
    }
  }
};

const getCharacterMock = {
  request: {
    query: GET_CHARACTER_MEDIA,
    variables: {
      id: '1',
      page: 1
    }
  },
  result: {
    data: {
      Media: {
        id: 1,
        characters: {
          edges: [
            createCharacterMock(
              2504,
              'MAIN',
              95011,
              'Kouichi Yamadera',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png',
              1,
              'Spike Spiegel',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
            ),
            createCharacterMock(
              3013,
              'MAIN',
              95014,
              'Megumi Hayashibara',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95014-VqxNuufY94V3.png',
              2,
              'Faye Valentine',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b2-0Iszg6Izgt4p.png'
            ),
            createCharacterMock(
              31911,
              'MAIN',
              95357,
              'Unshou Ishizuka',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95357-Eu4fSOugGbQ4.png',
              3,
              'Jet Black',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b3-JjH9Si9UM1NZ.png'
            ),
            createCharacterMock(
              36164,
              'MAIN',
              95658,
              'Aoi Tada',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95658-paHKYOWkhoOd.png',
              16,
              'Edward Wong Hau Pepelu Tivrusky IV',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b16-80wd87nl1Rue.png'
            )
          ],
          pageInfo: {
            total: 58,
            currentPage: 1,
            hasNextPage: true,
            __typename: 'PageInfo'
          },
          __typename: 'CharacterConnection'
        },
        __typename: 'Media'
      }
    }
  }
};

const getCharacterMockNextPageFalse = {
  request: {
    query: GET_CHARACTER_MEDIA,
    variables: {
      id: '1',
      page: 1
    }
  },
  result: {
    data: {
      Media: {
        id: 1,
        characters: {
          edges: [
            createCharacterMock(
              2504,
              'MAIN',
              95011,
              'Kouichi Yamadera',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png',
              1,
              'Spike Spiegel',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
            ),
            createCharacterMock(
              3013,
              'MAIN',
              95014,
              'Megumi Hayashibara',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95014-VqxNuufY94V3.png',
              2,
              'Faye Valentine',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b2-0Iszg6Izgt4p.png'
            ),
            createCharacterMock(
              31911,
              'MAIN',
              95357,
              'Unshou Ishizuka',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95357-Eu4fSOugGbQ4.png',
              3,
              'Jet Black',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b3-JjH9Si9UM1NZ.png'
            ),
            createCharacterMock(
              36164,
              'MAIN',
              95658,
              'Aoi Tada',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95658-paHKYOWkhoOd.png',
              16,
              'Edward Wong Hau Pepelu Tivrusky IV',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b16-80wd87nl1Rue.png'
            )
          ],
          pageInfo: {
            total: 58,
            currentPage: 1,
            hasNextPage: false
          }
        }
      }
    }
  }
};

const getCharacterMockPage2 = {
  request: {
    query: GET_CHARACTER_MEDIA,
    variables: {
      id: '1',
      page: 2
    }
  },
  result: {
    data: {
      Media: {
        id: 1,
        characters: {
          edges: [
            createCharacterMock(
              2505,
              'SUPPORTING',
              95011,
              'Kouichi Yamadera',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png',
              4,
              'Ein',
              'https://s4.anilist.co/file/anilistcdn/character/medium/4.jpg'
            ),
            createCharacterMock(
              10844,
              'SUPPORTING',
              95084,
              'Norio Wakamoto',
              'https://s4.anilist.co/file/anilistcdn/staff/medium/n95084-RTrZSU38POPF.png',
              2734,
              'Vicious',
              'https://s4.anilist.co/file/anilistcdn/character/medium/b2734-aglO8RKNVxnn.jpg'
            )
          ],
          pageInfo: {
            total: 58,
            currentPage: 2,
            hasNextPage: false,
            __typename: 'PageInfo'
          },
          __typename: 'CharacterConnection'
        },
        __typename: 'Media'
      }
    }
  }
};
