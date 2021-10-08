import { gql } from '@apollo/client';

// also had type as a variable before, but AFAICT, I don't need to
export const GET_MEDIA = gql`
  query GetMedia($id: Int) {
    Media(id: $id) {
      id
      title {
        userPreferred
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      description
      season
      seasonYear
      type
      format
      status(version: 2)
      episodes
      duration
      chapters
      volumes
      genres
      synonyms
      source(version: 2)
      isAdult
      meanScore
      averageScore
      popularity
      favourites
      hashtag
      isFavourite
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            type
            title {
              userPreferred
            }
            format
            status(version: 2)
            coverImage {
              medium
            }
          }
        }
      }
      characters(perPage: 6, sort: [ROLE, RELEVANCE, ID]) {
        edges {
          id
          role
          name
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              full
            }
            language: languageV2
            image {
              medium
            }
          }
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      staffPreview: staff(perPage: 4, sort: [RELEVANCE, ID]) {
        edges {
          id
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      studios {
        edges {
          isMain
          node {
            id
            name
          }
        }
      }
      recommendations(perPage: 7, sort: [RATING_DESC, ID]) {
        pageInfo {
          total
        }
        nodes {
          id
          rating
          mediaRecommendation {
            id
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            type
          }
        }
      }
      mediaListEntry {
        id
        status
        score
        progress
      }
      stats {
        statusDistribution {
          status
          amount
        }
        scoreDistribution {
          score
          amount
        }
      }
    }
  }
`;

export const GET_CHARACTER_MEDIA = gql`
  query GetCharacters($id: Int, $page: Int) {
    Media(id: $id) {
      id
      characters(page: $page, perPage: 25, sort: [ROLE, RELEVANCE, ID]) {
        edges {
          id
          role
          name
          voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
            id
            name {
              full
            }
            language: languageV2
            image {
              medium
            }
          }
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
        pageInfo {
          total
          currentPage
          hasNextPage
        }
      }
    }
  }
`;
