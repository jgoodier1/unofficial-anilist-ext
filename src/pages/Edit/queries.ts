import { gql } from '@apollo/client';

export const GET_EDIT_DATA = gql`
  query GetEditData($id: Int) {
    Media(id: $id) {
      id
      title {
        userPreferred
      }
      coverImage {
        large
        # not using this. Taking it so that it can be used as keyfield
        medium
      }
      bannerImage
      type
      status(version: 2)
      episodes
      chapters
      volumes
      mediaListEntry {
        id
        mediaId
        status
        score
        progress
        progressVolumes
        repeat
        private
        hiddenFromStatusLists
        notes
        updatedAt
        startedAt {
          year
          month
          day
        }
        completedAt {
          year
          month
          day
        }
      }
    }
  }
`;

export const EDIT_ENTRY = gql`
  mutation EditEntry(
    $id: Int
    $mediaId: Int
    $status: MediaListStatus
    $score: Float
    $progress: Int
  ) {
    SaveMediaListEntry(
      id: $id
      mediaId: $mediaId
      status: $status
      progress: $progress
      score: $score
    ) {
      id
      mediaId
      score
      progress
      status
      updatedAt
      media {
        id
        title {
          userPreferred
        }
        episodes
        chapters
        coverImage {
          medium
        }
        type
        status
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: Int) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`;
