import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route } from 'react-router-dom';

import Media from './Media';
import { cache } from '../../cache';
import {
  getMediaMock,
  getCharacterMock,
  getCharacterMockNextPageFalse,
  getCharacterMockPage2,
  getStaffMock,
  getStaffMockNextPageFalse,
  getStaffMockPage2
} from '../../testMocks';

it('displays loading state', () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getMediaMock]} cache={cache}>
        <Media />
      </MockedProvider>
    </MemoryRouter>
  );

  // screen.debug();
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('renders the page with data from the API', async () => {
  // need Route or else the params is empty
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/cowboy bebop/i);
});

// all of these test are reusing the cache from the previous tests
// not sure if that's what I want, but I'm leaving it like that for now
it("renders the character tab when the 'Characters' button is clicked", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getCharacterMock, getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  // screen.debug();
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(screen.getByText(/Unshou Ishizuka/i)).toBeInTheDocument();
});

it('renders the staff tab when the "Staff" button is clicked', async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider mocks={[getStaffMock, getMediaMock]} cache={cache}>
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /staff/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(screen.getByText(/Shinichirou Watanabe/i)).toBeInTheDocument();
});

it('shows a "show more" button when there is `hasNextPage` is true', async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider
        mocks={[getCharacterMock, getStaffMock, getMediaMock]}
        cache={cache}
      >
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /staff/i }));
  expect(screen.getByText(/Shinichirou Watanabe/i)).toBeInTheDocument();
});

// this one can't use the same cache or else it will fail
// because it would use the mock data from the previous test
it("doesn't show a 'show more' button when `hasNextPage` is false", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider
        mocks={[getCharacterMockNextPageFalse, getStaffMockNextPageFalse, getMediaMock]}
      >
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  expect(screen.queryByText(/show more/i)).toBeNull();

  userEvent.click(screen.getByRole('button', { name: /staff/i }));
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
  // screen.debug();
  expect(screen.queryByText(/show more/i)).toBeNull();
});

it("renders the next set of characters from the API when the 'show more' button is pressed", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider
        mocks={[getCharacterMock, getCharacterMockPage2, getMediaMock]}
        cache={cache}
      >
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  userEvent.click(screen.getByRole('button', { name: /characters/i }));
  userEvent.click(screen.getByRole('button', { name: /show more/i }));
  expect(await screen.findByText(/Norio Wakamoto/i)).toBeInTheDocument();
  // screen.debug();
});

it("renders the next set of staff from the API when the 'show more' button is pressed", async () => {
  render(
    <MemoryRouter initialEntries={['/media/1']}>
      <MockedProvider
        mocks={[getStaffMock, getStaffMockPage2, getMediaMock]}
        cache={cache}
      >
        <Route path='/media/:id'>
          <Media />
        </Route>
      </MockedProvider>
    </MemoryRouter>
  );
  userEvent.click(screen.getByRole('button', { name: /staff/i }));
  userEvent.click(screen.getByRole('button', { name: /show more/i }));
  expect(await screen.findByText(/Keiko Nobumoto/i)).toBeInTheDocument();
  // screen.debug();
});
