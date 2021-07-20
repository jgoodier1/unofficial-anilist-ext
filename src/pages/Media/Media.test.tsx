import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { expect } from 'chai';

import Media from './Media';
import { GET_MEDIA } from './queries';

const mocks = [
  {
    request: {
      query: GET_MEDIA,
      variables: {
        id: 1
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
                  name: 'Sunrise'
                }
              },
              {
                isMain: false,
                node: {
                  name: 'Bandai Visual'
                }
              },
              {
                isMain: false,
                node: {
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
  }
];

it('renders without error', () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Media />
      </MockedProvider>
    </MemoryRouter>
  );

  expect(document.body.contains(screen.getByText(/loading/i)));
});

it('renders the page', async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Media />
      </MockedProvider>
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  expect(document.body.contains(screen.getByText(/cowboy beepop/i)));
});
