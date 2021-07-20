export interface Staff {
  id: number;
  name: {
    full: string;
    native: string;
    alternative: string[];
  };
  image: {
    large: string;
  };
  description: string;
  favourites: number;
  isFavourite: boolean;
  age: number | null;
  gender: string | null;
  yearsActive: number[];
  homeTown: string;
  primaryOccupations: string[];
  dateOfBirth: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  dateOfDeath: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  characterMedia: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: number;
    };
    edges: {
      id: number;
      characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
      characterName: string | null;
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        title: {
          userPreferred: string;
        };
        coverImage: {
          medium: string;
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
      characters: {
        id: number;
        name: {
          full: string;
        };
        image: {
          large: string;
        };
      }[];
    }[];
  };
  staffMedia: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: number;
    };
    edges: {
      id: number;
      staffRole: string;
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        title: {
          userPreferred: string;
        };
        coverImage: {
          large: string;
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

export interface StaffRole {
  id: number;
  staffRole: string;
  node: {
    id: number;
    type: 'ANIME' | 'MANGA';
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
    mediaListEntry: {
      id: number;
      status: 'CURRENT' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED' | 'REPEATING';
    } | null;
  };
}
