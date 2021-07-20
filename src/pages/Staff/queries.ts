import { gql } from '@apollo/client';

export const GET_STAFF = gql`
  query GetStaffPage($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        # need medium for keyArg, not actually being used
        medium
        large
      }
      description
      favourites
      isFavourite
      age
      gender
      yearsActive
      homeTown
      primaryOccupations
      dateOfBirth {
        year
        month
        day
      }
      dateOfDeath {
        year
        month
        day
      }
      characterMedia(page: $page, sort: $sort, onList: $onList) {
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
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            # startDate {
            #   year
            # }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
              # need medium for keyArgs. Not actually using it
              medium
            }
          }
        }
      }
      staffMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              medium
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

export const GET_MORE_CHARACTER = gql`
  query GetMoreCharacters($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      characterMedia(page: $page, sort: $sort, onList: $onList) {
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
          characterName
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              medium
            }
            # startDate {
            #   year
            # }
            mediaListEntry {
              id
              status
            }
          }
          characters {
            id
            name {
              full
            }
            image {
              large
              # need medium for keyArgs. Not actually using it
              medium
            }
          }
        }
      }
    }
  }
`;

export const GET_MORE_ROLES = gql`
  query GetMoreRoles($id: Int, $onList: Boolean, $page: Int, $sort: [MediaSort]) {
    Staff(id: $id) {
      id
      staffMedia(page: $page, sort: $sort, onList: $onList) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        edges {
          id
          staffRole
          node {
            id
            type
            title {
              userPreferred
            }
            coverImage {
              large
              medium
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
