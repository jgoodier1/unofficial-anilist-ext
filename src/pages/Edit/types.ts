export interface Media {
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

export type Status =
  | 'CURRENT'
  | 'COMPLETED'
  | 'REPEATING'
  | 'DROPPED'
  | 'PLANNING'
  | 'PAUSED';

export interface Variable {
  mediaId: number;
  progress: number;
  score: number;
  status: 'CURRENT' | 'COMPLETED' | 'REPEATING' | 'DROPPED' | 'PLANNING' | 'PAUSED';
  id?: number;
}

export interface MediaListCollection {
  MediaListCollection: {
    __typename: string;
    lists: Lists[];
  };
}

export interface Lists {
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
}
