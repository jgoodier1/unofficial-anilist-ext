import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { getUser } from './queries';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import Media from './pages/Media';
import NavBar from './components/NavBar';
import List from './pages/List';
import Search from './pages/Search';
import Edit from './pages/Edit';
import Staff from './pages/Staff';
import { UserIdContext } from './context';
import Character from './pages/Character';

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

function App() {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState<number>(0);
  const [authState, setAuthState] = useState<'auth' | 'unauth' | 'error'>('unauth');

  useEffect(() => {
    // setAuthState('auth');
    browser.storage.local.get('token').then(result => {
      if (result.token && typeof result.token === 'string') {
        setToken(result.token);
        setAuthState('auth');
      }
    });
  });

  useEffect(() => {
    browser.storage.local.get('userId').then(result => {
      if (result.userId && typeof result.userId === 'number') {
        setUserId(result.userId);
      }
    });
  });

  const submitToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newToken = e.currentTarget.token.value;
    newToken.trim();

    const res = await getUser(newToken);
    if (typeof res === 'number') {
      setToken(newToken);
      setUserId(res);
      setAuthState('auth');
      await browser.storage.local.set({ token: newToken });
      await browser.storage.local.set({ userId: res });
    } else {
      setAuthState('error');
    }
  };

  const logOut = async () => {
    setAuthState('unauth');
    await browser.storage.local.remove('token');
  };

  const routes = (
    <Switch>
      <Route path='/media/:id'>
        <Media />
      </Route>
      <Route path='/anime'>
        <List />
      </Route>
      <Route path='/manga'>
        <List />
      </Route>
      <Route path='/search'>
        <Search />
      </Route>
      <Route path='/edit/:id'>
        <Edit />
      </Route>
      <Route path='/staff/:id'>
        <Staff />
      </Route>
      <Route path='/character/:id'>
        <Character />
      </Route>
      {authState === 'auth' && (
        <Route path='/'>
          <Home />
        </Route>
      )}
      {authState === 'unauth' && (
        <Route path='/'>
          <Unauthorized submitToken={submitToken} />
        </Route>
      )}
      {authState === 'error' && (
        <Route path='/'>
          <p>Error.</p>
        </Route>
      )}
    </Switch>
  );

  const cache = new InMemoryCache({
    typePolicies: {
      MediaListCollection: {
        // keyFields(obj1, { typename }) {
        //   console.log(obj1, typename);
        //   if (typename) {
        //     const keyField = typename + ':' + obj1.lists[0].entries[0].media.type;

        //     return [keyField];
        //   } else return false;
        // }
        keyFields: false
      },
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
  // this is here because this is where I get the token
  // if I put it in index, then I don't think I'd be able to log in because ApolloProvider would not get
  // the new token
  const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache,
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  return (
    <ApolloProvider client={client}>
      <UserIdContext.Provider value={userId}>
        {authState === 'auth' && <NavBar logOut={logOut} />}
        {routes}
      </UserIdContext.Provider>
    </ApolloProvider>
  );
}

export default App;
