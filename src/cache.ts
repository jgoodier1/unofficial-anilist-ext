import { InMemoryCache } from '@apollo/client';

interface Edge {
  __ref: string;
}

interface CacheInterface {
  edges: Edge[];
  pageInfo?: {
    total: number;
    currentPage: number;
    hasNextPage: boolean;
  };
}

interface ObjKey extends Edge {
  [key: string]: any;
}

export const cache = new InMemoryCache({
  typePolicies: {
    MediaTitle: {
      keyFields: ['userPreferred']
    },
    MediaCoverImage: {
      keyFields: ['medium']
    },
    StaffImage: {
      keyFields: ['medium']
    },
    StaffName: {
      keyFields: ['full']
    },
    CharacterImage: {
      keyFields: ['medium']
    },
    CharacterName: {
      keyFields: ['full']
    },
    Media: {
      fields: {
        characters: {
          keyArgs: false,
          merge(existing: CacheInterface, incoming: CacheInterface) {
            if (!incoming) return existing;
            if (!existing) return incoming;

            // get the exsting edges so that they can be compared to the new ones
            const existingValues = existing.edges.map((edge: ObjKey) => {
              for (const ref in edge) {
                return edge[ref];
              }
            });

            const edges: Edge[] = [];
            existing.edges.forEach(edge => {
              edges.push(edge);
            });

            incoming.edges.forEach(edge => {
              // only push new edge to cache if it's not already there
              if (!existingValues.includes(edge['__ref'])) {
                edges.push(edge);
              }
            });

            const result = {
              edges,
              pageInfo: incoming.pageInfo
            };
            return result;
          }
        },
        staff: {
          keyArgs: false,
          merge(existing: CacheInterface, incoming: CacheInterface) {
            if (!incoming) return existing;
            if (!existing) return incoming;

            const existingValues = existing.edges.map((edge: ObjKey) => {
              for (const ref in edge) {
                return edge[ref];
              }
            });

            const edges: Edge[] = [];
            existing.edges.forEach(edge => {
              edges.push(edge);
            });
            incoming.edges.forEach(edge => {
              if (!existingValues.includes(edge['__ref'])) {
                edges.push(edge);
              }
            });

            return {
              edges,
              pageInfo: incoming.pageInfo
            };
          }
        }
      }
    },
    Staff: {
      fields: {
        characterMedia: {
          keyArgs: ['onList'],
          merge(existing: CacheInterface, incoming: CacheInterface) {
            if (!incoming) return existing;
            if (!existing) return incoming;

            const existingValues = existing.edges.map((edge: ObjKey) => {
              for (const ref in edge) {
                return edge[ref];
              }
            });

            const edges: Edge[] = [];
            existing.edges.forEach(edge => {
              edges.push(edge);
            });
            incoming.edges.forEach(edge => {
              if (!existingValues.includes(edge['__ref'])) {
                edges.push(edge);
              }
            });

            return { edges, pageInfo: incoming.pageInfo };
          }
        },
        staffMedia: {
          keyArgs: ['onList'],
          merge(existing: CacheInterface, incoming: CacheInterface) {
            if (!incoming) return existing;
            if (!existing) return incoming;

            const existingValues = existing.edges.map((edge: ObjKey) => {
              for (const ref in edge) {
                return edge[ref];
              }
            });

            const edges: Edge[] = [];
            existing.edges.forEach(edge => {
              edges.push(edge);
            });
            incoming.edges.forEach(edge => {
              if (!existingValues.includes(edge['__ref'])) {
                edges.push(edge);
              }
            });

            return { edges, pageInfo: incoming.pageInfo };
          }
        }
      }
    },
    Character: {
      fields: {
        media: {
          keyArgs: ['onList'],
          merge(existing: CacheInterface, incoming: CacheInterface) {
            if (!incoming) return existing;
            if (!existing) return incoming;

            const existingValues = existing.edges.map((edge: ObjKey) => {
              for (const ref in edge) {
                return edge[ref];
              }
            });

            const edges: Edge[] = [];
            existing.edges.forEach(edge => {
              edges.push(edge);
            });
            incoming.edges.forEach(edge => {
              if (!existingValues.includes(edge['__ref'])) {
                edges.push(edge);
              }
            });

            return { edges, pageInfo: incoming.pageInfo };
          }
        }
      }
    }
  }
});
