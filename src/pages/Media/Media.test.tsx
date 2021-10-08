import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  render,
  screen,
  waitForElementToBeRemoved,
  cleanup
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';

import { expect } from 'chai';

import Media from './Media';
import { GET_MEDIA, GET_CHARACTER_MEDIA } from './queries';
import { cache } from '../../cache';

it('displays loading state', () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  // screen.debug();
  expect(document.body.contains(screen.getByText(/loading/i)));
  cleanup();
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
  expect(document.body.contains(screen.getByRole('heading', { name: /cowboy bebop/i })));
  cleanup();
});

// i don't know why this one doesn't need to wait for 'loading' to be removed like the others
// it might be reusing the same environment from the previous one ???
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

  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(document.body.contains(screen.getByText(/Kouichi Yamadera/i)));
  cleanup();
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

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(document.body.contains(screen.getByRole('button', { name: /show more/i })));
  cleanup();
});

it("doesn't show a 'show more' button when `hasNextPage` is false", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getCharacterMockNextPageFalse, getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(screen.queryByText(/show more/i)).to.be.null;
  cleanup();
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
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  screen.debug();
  userEvent.click(screen.getByRole('button', { name: /show more/i }));
  // this shows an error with the GET_MEDIA query even though it has been called by this point
  // and shouldn't be called again after the first time
  expect(document.body.contains(await screen.findByText(/Jet Black/i)));
  cleanup();
});

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
          native: 'カウボーイビバップ'
        },
        coverImage: {
          large:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx1-CXtrrkMpJ8Zq.png',
          medium:
            'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx1-CXtrrkMpJ8Zq.png'
        },
        bannerImage:
          'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-T3PJUjFJyRwg.jpg',
        startDate: {
          year: 1998,
          month: 4,
          day: 3
        },
        endDate: {
          year: 1999,
          month: 4,
          day: 24
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
                  userPreferred: 'Cowboy Bebop: Tengoku no Tobira'
                },
                format: 'MOVIE',
                status: 'FINISHED',
                coverImage: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/b5-Zs2cbrglTu67.png'
                }
              }
            }
          ]
        },
        characters: {
          edges: [
            {
              id: 2504,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95011,
                  name: {
                    full: 'Kouichi Yamadera'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png'
                  }
                }
              ],
              node: {
                id: 1,
                name: {
                  full: 'Spike Spiegel'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
                }
              }
            }
          ]
        },
        staffPreview: {
          edges: [
            {
              id: 4313,
              role: 'Original Creator',
              node: {
                id: 97197,
                name: {
                  full: 'Hajime Yatate'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/staff/medium/n97197-6NsKNt4EPoul.jpg'
                }
              }
            }
          ]
        },
        studios: {
          edges: [
            {
              isMain: true,
              node: {
                id: 13,
                name: 'Sunrise'
              }
            },
            {
              isMain: false,
              node: {
                id: 15,
                name: 'Bandai Visual'
              }
            },
            {
              isMain: false,
              node: {
                id: 177,
                name: 'Bandai Entertainment'
              }
            }
          ]
        },
        recommendations: {
          pageInfo: {
            total: 1
          },
          nodes: [
            {
              id: 1468,
              rating: 680,
              mediaRecommendation: {
                id: 205,
                title: {
                  userPreferred: 'Samurai Champloo'
                },
                coverImage: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx205-xxonQKyJtVcw.png'
                },
                type: 'ANIME'
              }
            }
          ]
        },
        mediaListEntry: null,
        stats: {
          statusDistribution: [
            {
              status: 'CURRENT',
              amount: 15500
            },
            {
              status: 'PLANNING',
              amount: 73167
            },
            {
              status: 'COMPLETED',
              amount: 94062
            },
            {
              status: 'DROPPED',
              amount: 3864
            },
            {
              status: 'PAUSED',
              amount: 12732
            }
          ],
          scoreDistribution: [
            {
              score: 10,
              amount: 253
            },
            {
              score: 20,
              amount: 68
            },
            {
              score: 30,
              amount: 158
            },
            {
              score: 40,
              amount: 393
            },
            {
              score: 50,
              amount: 1004
            },
            {
              score: 60,
              amount: 1961
            },
            {
              score: 70,
              amount: 6060
            },
            {
              score: 80,
              amount: 13312
            },
            {
              score: 90,
              amount: 21000
            },
            {
              score: 100,
              amount: 21312
            }
          ]
        }
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
            {
              id: 2504,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95011,
                  name: {
                    full: 'Kouichi Yamadera'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png'
                  }
                }
              ],
              node: {
                id: 1,
                name: {
                  full: 'Spike Spiegel'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
                }
              }
            },
            {
              id: 3013,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95014,
                  name: {
                    full: 'Megumi Hayashibara'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95014-VqxNuufY94V3.png'
                  }
                }
              ],
              node: {
                id: 2,
                name: {
                  full: 'Faye Valentine'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b2-0Iszg6Izgt4p.png'
                }
              }
            }
          ],
          pageInfo: {
            total: 58,
            currentPage: 1,
            hasNextPage: true
          }
        }
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
            {
              id: 2504,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95011,
                  name: {
                    full: 'Kouichi Yamadera'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95011-2RfLzncNyvbR.png'
                  }
                }
              ],
              node: {
                id: 1,
                name: {
                  full: 'Spike Spiegel'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b1-ChxaldmieFlQ.png'
                }
              }
            },
            {
              id: 3013,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95014,
                  name: {
                    full: 'Megumi Hayashibara'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95014-VqxNuufY94V3.png'
                  }
                }
              ],
              node: {
                id: 2,
                name: {
                  full: 'Faye Valentine'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b2-0Iszg6Izgt4p.png'
                }
              }
            }
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
            {
              id: 31911,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95357,
                  name: {
                    full: 'Unshou Ishizuka'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95357-Eu4fSOugGbQ4.png'
                  }
                }
              ],
              node: {
                id: 3,
                name: {
                  full: 'Jet Black'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b3-JjH9Si9UM1NZ.png'
                }
              }
            },
            {
              id: 36164,
              role: 'MAIN',
              name: null,
              voiceActors: [
                {
                  id: 95658,
                  name: {
                    full: 'Aoi Tada'
                  },
                  language: 'Japanese',
                  image: {
                    medium:
                      'https://s4.anilist.co/file/anilistcdn/staff/medium/n95658-paHKYOWkhoOd.png'
                  }
                }
              ],
              node: {
                id: 16,
                name: {
                  full: 'Edward Wong Hau Pepelu Tivrusky IV'
                },
                image: {
                  medium:
                    'https://s4.anilist.co/file/anilistcdn/character/medium/b16-80wd87nl1Rue.png'
                }
              }
            }
          ],
          pageInfo: {
            total: 58,
            currentPage: 2,
            hasNextPage: false
          }
        }
      }
    }
  }
};
