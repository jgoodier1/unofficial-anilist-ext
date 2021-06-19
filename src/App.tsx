import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { getUser } from './queries';
import Home from './components/Home';
import NavBar from './components/NavBar';
import List from './components/List';
import Search from './components/Search';

function App() {
  const [token, setToken] = useState('');
  const [authState, setAuthState] = useState<'auth' | 'unauth' | 'error'>('unauth');

  const TokenContext = React.createContext('');

  useEffect(() => {
    // setAuthState('auth');
    browser.storage.local.get('token').then(result => {
      if (result.token && typeof result.token === 'string') {
        setToken(result.token);
        setAuthState('auth');
      }
    });
  });

  const submitToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let newToken = e.currentTarget.token.value;
    newToken.trim();

    const res = await getUser(newToken);
    console.log(res);
    if (typeof res === 'number') {
      setToken(newToken);
      setAuthState('auth');
      await browser.storage.local.set({ token: newToken });
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
      <Route path='/anime'>
        <List />
      </Route>
      <Route path='/manga'>
        <List />
      </Route>
      <Route path='/search'>
        <Search />
      </Route>
      <Route path='/'>
        <Home authState={authState} submitToken={submitToken} />
      </Route>
    </Switch>
  );

  return (
    <TokenContext.Provider value={token}>
      {authState === 'auth' && <NavBar logOut={logOut} />}
      {routes}
    </TokenContext.Provider>
  );
}

export default App;
