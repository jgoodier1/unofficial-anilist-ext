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
import { UserIdContext } from './context';

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

    let newToken = e.currentTarget.token.value;
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

  // this is here because this is where I get the token
  // if I put it in index, then I don't think I'd be able to log in because ApolloProvider would not get
  // the new token
  const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache(),
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
