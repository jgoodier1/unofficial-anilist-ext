export interface Media {
  id: number;
  title: {
    userPreferred: string;
    romaji: string | undefined;
    english: string | undefined;
    native: string | undefined;
  };
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string | undefined;
  startDate: {
    year: number | undefined;
    month: number | undefined;
    day: number | undefined;
  };
  endDate: {
    year: number | undefined;
    month: number | undefined;
    day: number | undefined;
  };
  description: string;
  season: 'SPRING' | 'FALL' | 'SUMMER' | 'WINTER' | undefined;
  seasonYear: number | undefined;
  type: 'ANIME' | 'MANGA';
  format: string;
  status: string;
  episodes: number | undefined;
  duration: number | undefined;
  chapters: number | undefined;
  volumes: number | undefined;
  genres: string[] | undefined;
  synonyms: string[] | undefined;
  source: string;
  isAdult: boolean;
  meanScore: number | undefined;
  averageScore: number | undefined;
  popularity: number;
  favourites: number | undefined;
  hashtag: string | undefined;
  isFavourite: boolean;
  nextAiringEpisode: {
    airingAt: number | undefined;
    timeUntilAiring: number | undefined;
    episode: number | undefined;
  };
  relations: {
    edges: {
      id: number;
      relationType: string;
      node: {
        id: number;
        type: 'ANIME' | 'MANGA';
        title: {
          userPreferred: string;
        };
        format: string;
        status: string;
        coverImage: {
          medium: string;
        };
      };
    }[];
  };
  characters: {
    edges: {
      id: number;
      role: string;
      name: string;
      voiceActors: {
        id: number;
        name: {
          full: string;
        };
        language: string;
        image: {
          medium: string;
        };
      }[];
      node: {
        id: number;
        name: {
          full: string;
        };
        image: {
          medium: string;
        };
      };
    }[];
  };
  staffPreview: {
    edges: {
      id: number;
      role: string;
      node: {
        id: number;
        name: {
          full: string;
        };
        image: {
          medium: string;
        };
      };
    }[];
  };
  studios: {
    edges: {
      isMain: boolean;
      node: {
        id: number;
        name: string;
      };
    }[];
  };
  recommendations: {
    pageInfo: {
      total: number;
    };
    nodes: {
      id: number;
      rating: number;
      mediaRecommendation: {
        id: number;
        title: {
          userPreferred: string;
        };
        coverImage: {
          medium: string;
        };
        type: 'ANIME' | 'MANGA';
      };
    }[];
  };
  mediaListEntry: {
    id: number;
    status: string;
    score: number;
    progress: number;
  };
  stats: {
    statusDistribution: {
      status: number;
      amount: number;
    }[];
    scoreDistribution: {
      score: number;
      amount: number;
    }[];
  };
}
