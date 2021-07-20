export interface Character {
  id: number;
  name: {
    full: string;
    native: string;
    alternative: string[];
  };
  image: {
    large: string;
  };
  favourites: number;
  isFavourite: boolean;
  description: string;
  age: number | null;
  gender: string | null;
  dateOfBirth: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  media: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: number;
    };
    edges: {
      id: number;
      characterRole: string;
      voiceActorRoles: {
        voiceActor: {
          id: number;
          name: {
            full: string;
          };
          image: {
            medium: string;
          };
          language: string;
        };
      }[];
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        title: {
          userPreferred: string;
        };
        coverImage: {
          large: string;
        };
        startDate: {
          year: number;
        };
        mediaListEntry: {
          id: number;
          status:
            | 'CURRENT'
            | 'COMPLETED'
            | 'PLANNING'
            | 'DROPPED'
            | 'PAUSED'
            | 'REPEATING';
        } | null;
      };
    }[];
  };
}
