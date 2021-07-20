import { gql } from '@apollo/client';

export const GET_CHARACTER = gql`
  query getCharacterPage($id: Int, $page: Int, $onList: Boolean) {
    Character(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
        # need medium for keyArg, not actually being used
        medium
      }
      favourites
      isFavourite
      description
      age
      gender
      dateOfBirth {
        year
        month
        day
      }
      media(page: $page, sort: POPULARITY_DESC, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          voiceActorRoles(sort: [RELEVANCE, ID]) {
            voiceActor {
              id
              name {
                full
              }
              image {
                medium
              }
              language: languageV2
            }
          }
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              # need medium for keyArg, not actually being used
              medium
            }
            startDate {
              year
            }
            mediaListEntry {
              id
              status
            }
          }
        }
      }
    }
  }
`;

export const GET_CHARACTER_APPEARANCES = gql`
  query getCharacterAppearances($id: Int, $page: Int, $onList: Boolean) {
    Character(id: $id) {
      id
      media(page: $page, sort: POPULARITY_DESC, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          characterRole
          voiceActorRoles(sort: [RELEVANCE, ID]) {
            voiceActor {
              id
              name {
                full
              }
              image {
                medium
              }
              language: languageV2
            }
          }
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              # need medium for keyArg, not actually being used
              medium
            }
            startDate {
              year
            }
            type
            mediaListEntry {
              id
              status
            }
          }
        }
      }
    }
  }
`;
