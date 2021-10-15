import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  logOut: () => void;
}

const NavBar: React.FC<Props> = ({ logOut }) => {
  return (
    <Header>
      <nav>
        <NavUl>
          <li>
            <ResizedNavLink exact to='/' aria-label='home'>
              <Svg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                x='0px'
                y='0px'
                viewBox='0 0 254.182 254.182'
                fill='white'
              >
                <g>
                  <path
                    d='M211.655,137.102c-4.143,0-7.5,3.358-7.5,7.5v77.064h-41.373v-77.064c0-4.142-3.357-7.5-7.5-7.5H98.903
		c-4.143,0-7.5,3.358-7.5,7.5v77.064H50.026v-77.064c0-4.142-3.357-7.5-7.5-7.5c-4.143,0-7.5,3.358-7.5,7.5v84.564
		c0,4.142,3.357,7.5,7.5,7.5h56.377h56.379h56.373c4.143,0,7.5-3.358,7.5-7.5v-84.564
		C219.155,140.46,215.797,137.102,211.655,137.102z M106.403,221.666v-69.564h41.379v69.564H106.403z'
                  />
                  <path
                    d='M251.985,139.298L132.389,19.712c-2.928-2.929-7.677-2.928-10.607,0L2.197,139.298c-2.929,2.929-2.929,7.678,0,10.606
		c2.93,2.929,7.678,2.929,10.607,0L127.086,35.622l114.293,114.283c1.464,1.464,3.384,2.196,5.303,2.196
		c1.919,0,3.839-0.732,5.304-2.197C254.914,146.976,254.914,142.227,251.985,139.298z'
                  />
                </g>
              </Svg>
            </ResizedNavLink>
          </li>
          <li>
            <ResizedNavLink to='/anime' aria-label='anime-list'>
              <ListSvg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 92.123 63.123'
                fill='white'
              >
                <g>
                  <path d='M57.124,51.893H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,51.893,57.124,51.893z' />
                  <path
                    d='M57.124,33.062H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3
         C60.124,31.719,58.781,33.062,57.124,33.062z'
                  />
                  <path d='M57.124,14.231H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,14.231,57.124,14.231z' />
                  <circle cx='4.029' cy='11.463' r='4.029' />
                  <circle cx='4.029' cy='30.062' r='4.029' />
                  <circle cx='4.029' cy='48.661' r='4.029' />
                  <text x='60.7' y='61' style={{ fontSize: '40px', fontWeight: 600 }}>
                    A
                  </text>
                </g>
              </ListSvg>
            </ResizedNavLink>
          </li>
          <li>
            <ResizedNavLink to='/manga' aria-label='manga-list'>
              <ListSvg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 92.123 63.123'
                fill='white'
              >
                <g>
                  <path d='M57.124,51.893H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,51.893,57.124,51.893z' />
                  <path
                    d='M57.124,33.062H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3
       C60.124,31.719,58.781,33.062,57.124,33.062z'
                  />
                  <path d='M57.124,14.231H16.92c-1.657,0-3-1.343-3-3s1.343-3,3-3h40.203c1.657,0,3,1.343,3,3S58.781,14.231,57.124,14.231z' />
                  <circle cx='4.029' cy='11.463' r='4.029' />
                  <circle cx='4.029' cy='30.062' r='4.029' />
                  <circle cx='4.029' cy='48.661' r='4.029' />
                  <text x='60.7' y='61' style={{ fontSize: '40px', fontWeight: 600 }}>
                    M
                  </text>
                </g>
              </ListSvg>
            </ResizedNavLink>
          </li>
          <li>
            <ResizedNavLink to='/search' aria-label='search'>
              <Svg
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 56.966 56.966'
                fill='white'
              >
                <path
                  d='M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23
	s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92
	c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17
	s-17-7.626-17-17S14.61,6,23.984,6z'
                />
              </Svg>
            </ResizedNavLink>
          </li>
          <SettingsWrapper>
            <SettingsButton>
              <Svg
                viewBox='0 0 512 512'
                height='40'
                width='40'
                xmlns='http://www.w3.org/2000/svg'
                fill='white'
              >
                <path d='m272.066 512h-32.133c-25.989 0-47.134-21.144-47.134-47.133v-10.871c-11.049-3.53-21.784-7.986-32.097-13.323l-7.704 7.704c-18.659 18.682-48.548 18.134-66.665-.007l-22.711-22.71c-18.149-18.129-18.671-48.008.006-66.665l7.698-7.698c-5.337-10.313-9.792-21.046-13.323-32.097h-10.87c-25.988 0-47.133-21.144-47.133-47.133v-32.134c0-25.989 21.145-47.133 47.134-47.133h10.87c3.531-11.05 7.986-21.784 13.323-32.097l-7.704-7.703c-18.666-18.646-18.151-48.528.006-66.665l22.713-22.712c18.159-18.184 48.041-18.638 66.664.006l7.697 7.697c10.313-5.336 21.048-9.792 32.097-13.323v-10.87c0-25.989 21.144-47.133 47.134-47.133h32.133c25.989 0 47.133 21.144 47.133 47.133v10.871c11.049 3.53 21.784 7.986 32.097 13.323l7.704-7.704c18.659-18.682 48.548-18.134 66.665.007l22.711 22.71c18.149 18.129 18.671 48.008-.006 66.665l-7.698 7.698c5.337 10.313 9.792 21.046 13.323 32.097h10.87c25.989 0 47.134 21.144 47.134 47.133v32.134c0 25.989-21.145 47.133-47.134 47.133h-10.87c-3.531 11.05-7.986 21.784-13.323 32.097l7.704 7.704c18.666 18.646 18.151 48.528-.006 66.665l-22.713 22.712c-18.159 18.184-48.041 18.638-66.664-.006l-7.697-7.697c-10.313 5.336-21.048 9.792-32.097 13.323v10.871c0 25.987-21.144 47.131-47.134 47.131zm-106.349-102.83c14.327 8.473 29.747 14.874 45.831 19.025 6.624 1.709 11.252 7.683 11.252 14.524v22.148c0 9.447 7.687 17.133 17.134 17.133h32.133c9.447 0 17.134-7.686 17.134-17.133v-22.148c0-6.841 4.628-12.815 11.252-14.524 16.084-4.151 31.504-10.552 45.831-19.025 5.895-3.486 13.4-2.538 18.243 2.305l15.688 15.689c6.764 6.772 17.626 6.615 24.224.007l22.727-22.726c6.582-6.574 6.802-17.438.006-24.225l-15.695-15.695c-4.842-4.842-5.79-12.348-2.305-18.242 8.473-14.326 14.873-29.746 19.024-45.831 1.71-6.624 7.684-11.251 14.524-11.251h22.147c9.447 0 17.134-7.686 17.134-17.133v-32.134c0-9.447-7.687-17.133-17.134-17.133h-22.147c-6.841 0-12.814-4.628-14.524-11.251-4.151-16.085-10.552-31.505-19.024-45.831-3.485-5.894-2.537-13.4 2.305-18.242l15.689-15.689c6.782-6.774 6.605-17.634.006-24.225l-22.725-22.725c-6.587-6.596-17.451-6.789-24.225-.006l-15.694 15.695c-4.842 4.843-12.35 5.791-18.243 2.305-14.327-8.473-29.747-14.874-45.831-19.025-6.624-1.709-11.252-7.683-11.252-14.524v-22.15c0-9.447-7.687-17.133-17.134-17.133h-32.133c-9.447 0-17.134 7.686-17.134 17.133v22.148c0 6.841-4.628 12.815-11.252 14.524-16.084 4.151-31.504 10.552-45.831 19.025-5.896 3.485-13.401 2.537-18.243-2.305l-15.688-15.689c-6.764-6.772-17.627-6.615-24.224-.007l-22.727 22.726c-6.582 6.574-6.802 17.437-.006 24.225l15.695 15.695c4.842 4.842 5.79 12.348 2.305 18.242-8.473 14.326-14.873 29.746-19.024 45.831-1.71 6.624-7.684 11.251-14.524 11.251h-22.148c-9.447.001-17.134 7.687-17.134 17.134v32.134c0 9.447 7.687 17.133 17.134 17.133h22.147c6.841 0 12.814 4.628 14.524 11.251 4.151 16.085 10.552 31.505 19.024 45.831 3.485 5.894 2.537 13.4-2.305 18.242l-15.689 15.689c-6.782 6.774-6.605 17.634-.006 24.225l22.725 22.725c6.587 6.596 17.451 6.789 24.225.006l15.694-15.695c3.568-3.567 10.991-6.594 18.244-2.304z' />
                <path d='m256 367.4c-61.427 0-111.4-49.974-111.4-111.4s49.973-111.4 111.4-111.4 111.4 49.974 111.4 111.4-49.973 111.4-111.4 111.4zm0-192.8c-44.885 0-81.4 36.516-81.4 81.4s36.516 81.4 81.4 81.4 81.4-36.516 81.4-81.4-36.515-81.4-81.4-81.4z' />
              </Svg>
            </SettingsButton>
            <SettingsMenu id='settings-menu'>
              <SignOutButton onClick={logOut}>Sign Out</SignOutButton>
            </SettingsMenu>
          </SettingsWrapper>
        </NavUl>
      </nav>
    </Header>
  );
};

export default NavBar;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 2;
`;

const NavUl = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #003d99;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ResizedNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  height: 50px;
`;

const Svg = styled.svg`
  width: 25px;
  height: 25px;
`;

const ListSvg = styled.svg`
  width: 30px;
  height: 30px;
`;

const SettingsWrapper = styled.li`
  height: 50px;

  &:hover > #settings-menu {
    display: flex;
  }
`;

const SettingsButton = styled.button`
  background: inherit;
  border: none;
  cursor: pointer;
  padding: 8px;
  height: 100%;
`;

const SettingsMenu = styled.div`
  display: none;
  flex-flow: column;
  align-items: center;
  position: absolute;
  transition: all 0.3s ease-out;
  z-index: 2;
  background: #fafafa;
  right: 16px;
  top: 50px;
  width: 10rem;
  justify-content: center;
  box-shadow: 0 2px 5px black;
`;

const SignOutButton = styled.button`
  width: max-content;
  padding: 0;
  margin: 16px;
  font-weight: bold;
  font-size: 16px;
  background: inherit;
  border: none;
  cursor: pointer;
  color: black;

  &:hover {
    text-decoration: underline 2px #4ccefa;
  }
`;
