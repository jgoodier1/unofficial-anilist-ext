import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import styled from 'styled-components';

import { Media, MediaListCollection, Variable, Status, Lists } from './types';
import { GET_EDIT_DATA, EDIT_ENTRY, DELETE_ENTRY } from './queries';
import { UserIdContext } from '../../context';
import { GET_LISTS } from '../../queries';

const Edit = () => {
  const [status, setStatus] = useState<Status>('CURRENT');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [deletedMediaList, setDeletedMediaList] = useState({
    id: 0,
    type: '',
    mediaId: 0
  });

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
        //get and update the lists
        const listsFromCache: MediaListCollection | null = cache.readQuery({
          query: GET_LISTS,
          variables: {
            userId,
            type: SaveMediaListEntry.media.type
          }
        });

        function addEntryToCache(lists: Lists[], listCollection: MediaListCollection) {
          // create new entry and add it to the right list, the add that list back with the others
          const newEntry = {
            ...SaveMediaListEntry,
            __typename: 'MediaList'
          };

          // find the right object
          const listToEdit = lists.filter(
            list => list.status === SaveMediaListEntry.status
          );
          // edit that list
          const newList = {
            ...listToEdit[0],
            entries: [...listToEdit[0].entries, newEntry]
          };
          // put that list in with the others, replacing the old one
          const oldLists = lists.filter(
            list => list.status !== SaveMediaListEntry.status
          );
          const combinedLists = [...oldLists, newList];

          cache.writeQuery({
            query: GET_LISTS,
            data: {
              MediaListCollection: {
                __typename: listCollection.MediaListCollection.__typename,
                lists: combinedLists
              }
            },
            variables: {
              userId,
              type: SaveMediaListEntry.media.type
            }
          });

          // also need to add the entry to the Media object
          // this will update the 'add to list' button and the edit page
          cache.writeFragment({
            id: `Media:${SaveMediaListEntry.mediaId}`,
            fragment: gql`
              fragment NewEntry on Media {
                mediaListEntry {
                  id
                  mediaId
                  score
                  progress
                  status
                  updatedAt
                }
              }
            `,
            data: {
              mediaListEntry: SaveMediaListEntry
            }
          });
        }

        if (listsFromCache !== null) {
          // look through the lists to see if the entry already exists
          // if it does, remove it. If not, continue
          const listWithExistingEntry = listsFromCache.MediaListCollection.lists.filter(
            list => {
              // search each list for the entry
              return list.entries.some(entry => {
                return entry.media.id === SaveMediaListEntry.mediaId;
              });
            }
          );

          if (listWithExistingEntry.length > 0) {
            // remove that entry from the list
            const listWithEntryRemoved = listWithExistingEntry.map(list => {
              return {
                ...list,
                entries: list.entries.filter(entry => {
                  return entry.media.id !== SaveMediaListEntry.mediaId;
                })
              };
            });
            const otherLists = listsFromCache.MediaListCollection.lists.filter(list => {
              // return lists that don't have the entry
              return !list.entries.some(entry => {
                return entry.media.id === SaveMediaListEntry.mediaId;
              });
            });
            const newLists = [...otherLists, ...listWithEntryRemoved];

            addEntryToCache(newLists, listsFromCache);
          } else
            addEntryToCache(listsFromCache.MediaListCollection.lists, listsFromCache);
        } else console.log('query is null');
      }
    });

  const [deleteEntry, { loading: deleteLoading, error: deleteError }] = useMutation(
    DELETE_ENTRY,
    {
      update(cache, { data: { DeleteMediaListEntry } }) {
        if (DeleteMediaListEntry.deleted) {
          // get the list from the cache
          const listsFromCache: MediaListCollection | null = cache.readQuery({
            query: GET_LISTS,
            variables: {
              userId,
              type: deletedMediaList.type
            }
          });
          if (listsFromCache) {
            const listWithExistingEntry = listsFromCache.MediaListCollection.lists.filter(
              list => {
                // search each list for the entry
                return list.entries.some(entry => {
                  return entry.id === deletedMediaList.id;
                });
              }
            );
            if (listWithExistingEntry.length > 0) {
              // remove that entry from the list
              const listWithEntryRemoved = listWithExistingEntry.map(list => {
                return {
                  ...list,
                  entries: list.entries.filter(entry => {
                    return entry.id !== deletedMediaList.id;
                  })
                };
              });
              const otherLists = listsFromCache.MediaListCollection.lists.filter(list => {
                // return lists that don't have the entry
                return !list.entries.some(entry => {
                  return entry.id === deletedMediaList.id;
                });
              });
              const lists = [...otherLists, ...listWithEntryRemoved];

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
                  type: deletedMediaList.type
                }
              });

              // also remove the entry from the media object
              // this will update the 'add to list' button and the edit page
              cache.writeFragment({
                id: `Media:${deletedMediaList.mediaId}`,
                fragment: gql`
                  fragment DeletedEntry on Media {
                    mediaListEntry
                  }
                `,
                data: {
                  mediaListEntry: null
                }
              });
            }
          }
        }
      }
    }
  );

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

    if (editError) {
      setError(true);
      console.log(editError, '1');
    }
    if (!editLoading) {
      // this will always go to the else block, even when there is an error
      if (editError) {
        setError(true);
        console.log(editError, '2');
      } else history.push(`/media/${media.id}`);
    }
  };

  const handleDelete = () => {
    if (media.mediaListEntry) {
      if (deleteLoading) return;
      setDeletedMediaList({
        id: media.mediaListEntry.id,
        type: media.type,
        mediaId: media.id
      });
      setTimeout(() => {
        if (media.mediaListEntry) {
          deleteEntry({ variables: { id: media.mediaListEntry.id } });
          if (!deleteLoading) history.push(`/media/${media.id}`);
        }
      }, 500);
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
            min='0'
            max='10'
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
            min='0'
            max={media.chapters ? media.chapters : media.episodes ? media.episodes : 9999}
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
