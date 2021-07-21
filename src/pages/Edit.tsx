import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import styled from 'styled-components';

import { UserIdContext } from '../context';
import { GET_LISTS } from '../queries';

interface Media {
  id: number;
  title: {
    userPreferred: string;
  };
  coverImage: {
    large: string;
  };
  bannerImage: string;
  type: 'ANIME' | 'MANGA';
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  mediaListEntry: {
    id: number;
    mediaId: number;
    status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
    score: number;
    progress: number;
    progressVolumes: number | null;
    repeat: number;
    private: boolean;
    hiddenFromStatusLists: boolean;
    notes: string | null;
    updatedAt: number;
    startedAt: {
      year: number | null;
      month: number | null;
      day: number | null;
    };
    completedAt: {
      year: number | null;
      month: number | null;
      day: number | null;
    };
  } | null;
}

type Status = 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';

interface Variable {
  mediaId: number;
  progress: number;
  score: number;
  status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
  id?: number;
}

interface MediaListCollection {
  MediaListCollection: {
    __typename: string;
    lists: {
      __typename: string;
      status: Status;
      entries: {
        __typename: string;
        id: number;
        // this Media is a different shape, but works for now
        media: Media;
        progress: number;
        status: Status;
        updatedAt: number;
      }[];
    }[];
  };
}

const GET_EDIT_DATA = gql`
  query getEditData($id: Int) {
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

const EDIT_ENTRY = gql`
  mutation editEntry(
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

const DELETE_ENTRY = gql`
  mutation deleteEntry($id: Int) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`;

const Edit = () => {
  const [status, setStatus] = useState<
    'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED'
  >('CURRENT');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  const userId = useContext(UserIdContext);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const {
    data: queryData,
    loading: queryLoading,
    error: queryError
  } = useQuery(GET_EDIT_DATA, { variables: { id } });

  const [editEntry, { data: editData, loading: editLoading, error: editError }] =
    useMutation(EDIT_ENTRY, {
      update(cache, { data: { SaveMediaListEntry } }) {
        const listsFromCache: MediaListCollection | null = cache.readQuery({
          query: GET_LISTS,
          variables: {
            userId,
            type: SaveMediaListEntry.media.type
          }
        });

        if (listsFromCache !== null) {
          const newEntry = {
            ...SaveMediaListEntry,
            __typename: 'MediaList'
          };

          // find the right object
          const listToEdit = listsFromCache.MediaListCollection.lists.filter(
            list => list.status === SaveMediaListEntry.status
          );
          // edit that list
          const newList = {
            ...listToEdit[0],
            entries: [...listToEdit[0].entries, newEntry]
          };
          // put that list in with the others, replacing the old one
          const oldLists = listsFromCache.MediaListCollection.lists.filter(
            list => list.status !== SaveMediaListEntry.status
          );
          const lists = [...oldLists, newList];

          cache.writeQuery({
            query: GET_LISTS,
            data: {
              MediaListCollection: {
                __typename: listsFromCache.MediaListCollection.__typename,
                lists
              }
            },
            variables: {
              userId,
              type: SaveMediaListEntry.media.type
            }
          });
        } else console.log('query is null');
      }
    });

  const [deleteEntry, { data: deleteData, loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_ENTRY);

  useEffect(() => {
    if (queryData && queryData.Media.mediaListEntry) {
      setStatus(queryData.Media.mediaListEntry.status);
      setScore(queryData.Media.mediaListEntry.score);
      setProgress(queryData.Media.mediaListEntry.progress);
    }
  }, [queryData]);

  if (queryLoading) return <div>Loading...</div>;

  if (queryError) {
    console.log(queryError);
    return <div>There was an error</div>;
  }

  const media: Media = queryData.Media;

  const entryId = media.mediaListEntry && media.mediaListEntry.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLoading) return;
    setError(false);

    const variables: Variable = {
      mediaId: media.id,
      status,
      score,
      progress
    };

    if (entryId) variables.id = entryId;

    editEntry({
      variables
    });

    // TODO: Mutation errors don't work
    if (editError) {
      setError(true);
      console.log(editError, '1');
    }
    if (!editLoading) {
      // this will always go to the else block, even when there is an error
      if (editError) {
        setError(true);
        console.log(editError, '2');
      } else history.goBack();
    }
  };

  // TODO: error handling
  const handleDelete = () => {
    if (media.mediaListEntry) {
      if (deleteLoading) return;
      deleteEntry({ variables: { id: media.mediaListEntry.id } });
      // this is getting pushed back 2 pages because of an error on the with editEntry
      if (!deleteLoading) history.goBack();
    } else return;
  };

  const handleClose = () => {
    history.goBack();
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as Status);
  };

  return (
    <Wrapper>
      {/* <img src={media.bannerImage} alt='' /> */}
      <Image src={media.coverImage.large} alt='' />
      <Heading>{media.title.userPreferred}</Heading>
      <CloseButton onClick={handleClose}>X</CloseButton>

      <Form onSubmit={handleSubmit}>
        <StatusLabel htmlFor='status'>
          Status
          <Select id='status' onChange={handleSelectChange} value={status}>
            <Option value='CURRENT'>
              {media.type === 'ANIME' ? 'Watching' : 'Reading'}
            </Option>
            <Option value='COMPLETED'>Completed</Option>
            <Option value='PAUSED'>Paused</Option>
            <Option value='DROPPED'>Dropped</Option>
            <Option value='PLANNING'>
              Planning to {media.type === 'ANIME' ? 'Watch' : 'Read'}
            </Option>
            <Option value='REPEATING'>
              {media.type === 'ANIME' ? 'Rewatching' : 'Rereading'}
            </Option>
          </Select>
        </StatusLabel>

        <ScoreLabel htmlFor='score'>
          Score
          <Input
            id='score'
            type='number'
            step='0.5'
            onChange={e => setScore(Number(e.currentTarget.value))}
            value={score}
          />
        </ScoreLabel>

        <ProgressLabel htmlFor='progress'>
          Progress
          <Input
            id='progress'
            type='number'
            step='1'
            onChange={e => setProgress(Number(e.currentTarget.value))}
            value={progress}
          />
        </ProgressLabel>

        <SaveButton type='submit'>Save</SaveButton>
        {media.mediaListEntry && (
          <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
        )}
      </Form>
      {error && <div>There was a mutation error</div>}
    </Wrapper>
  );
};

export default Edit;

const Wrapper = styled.main`
  background-color: #fafafa;
  display: grid;
  grid-template-columns: 120px 243px 1fr;
  grid-gap: 10px 0;
  margin: 16px;
  padding: 16px;
`;

const Image = styled.img`
  max-width: 100px;
`;

const Heading = styled.h1`
  font-size: 24px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  border: none;
  background-color: inherit;
  font-size: 18px;
  font-weight: bold;
  width: min-content;
  height: min-content;
  cursor: pointer;
  place-self: center;
`;

const Form = styled.form`
  grid-column: 1/4;
  display: grid;
  grid-template-columns: repeat(2, 50%);
  grid-gap: 10px 0;
  font-size: 18px;
`;

const StatusLabel = styled.label`
  grid-column: 1/3;
  grid-row: 1;
`;

const Select = styled.select`
  width: 100%;
  font-size: 16px;
  padding: 4px 0;
  background-color: white;
  border: 1px solid #8f8f9d;
  /* explicit height to match the height of the inputs */
  height: 31.6px;
`;

const Option = styled.option`
  height: 31.6px;
  padding-left: 6px;
  line-height: 1.6;
`;

const ScoreLabel = styled.label`
  grid-column: 1/3;
  grid-row: 2;
`;

const ProgressLabel = styled.label`
  grid-column: 1/3;
  grid-row: 3;
`;

const Input = styled.input`
  width: 100%;
  font-size: 16px;
  padding-left: 6px;
  line-height: 1.6;
`;

const Button = styled.button`
  border: none;
  padding: 10px;
  width: min-content;
  place-self: center;
  font-size: 18px;
  cursor: pointer;
`;

const SaveButton = styled(Button)`
  background-color: #4ccefa;
  grid-row: 4;
`;

const DeleteButton = styled(Button)`
  background-color: #fa4b4b;
  grid-column: 2;
  grid-row: 4;
`;
