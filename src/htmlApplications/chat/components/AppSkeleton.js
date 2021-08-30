import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import withEvents from '../libs/withEvents';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';

import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
import ToggleButton from '@material-ui/core/ToggleButton';
import Stack from '@material-ui/core/Stack';
import DashBoard from './DashBoard';
import Chat from './Chat';
import { withRouter } from "react-router";
import { NavLink, Route } from 'react-router-dom';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';

// import { styled, ThemeProvider, createTheme } from '@material-ui/core/styles';


const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected
  }
};

const mapDispatchToProps = () => {
  return {
  };
};
const FancyLink = (props) => {
  // console.log('props', props);
  return (
    <ToggleButton sx={{
        borderRadius: '50%',
        marginBottom: '5px',
        border: '0px'
    }} selected={props.active} color="secondary" aria-label="delete" size="large">
      {props.icon}
    </ToggleButton>
  );
};
FancyLink.displayName = 'MyLink';

const MyNavLink = (props) => {
  const {
    to,
    match,
    location
  } = props;
  const isActive = location.pathname.includes(to);
  return (
    <NavLink to={to}>
      <FancyLink active={isActive} icon={props.icon} />
    </NavLink>
  )
}


class AppSkeleton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false
    }
  }

  render() {
    const {
      match,
      location
    } = this.props;
    // console.log('Match', match);
    // console.log('Location', location);
    // console.log('Props Skeleton', this.props);
    return (
      <>
        <CssBaseline />
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={0}
        >
          <Box
            component="nav"
            sx={{
              width: 80,
              height: '100vh',
              backgroundColor: '#263237',
              paddingTop: '15px',
              borderRight: '1px solid #333f44'
            }}
          >
          <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            >
              <MyNavLink to="/dashboard/" match={match} location={location} icon={<DashboardOutlinedIcon />} />
              <MyNavLink to="/chat/" match={match} location={location} icon={<ForumOutlinedIcon />} />
              <MyNavLink to="/todos/" match={match} location={location} icon={<PlaylistAddCheckOutlinedIcon />} />
            </Stack>
          </Box>
          <Box
            component="main"
            sx={{
              width: 'calc(100vw - 80px)',
              height: '100vh',
              backgroundColor: '#263237',
              paddingTop: '0px',
              borderRight: '1px solid #333f44'
            }}
          >
            <Route path="/dashboard/">
              <DashBoard />
            </Route>
            <Route path="/chat/">
              <Chat />
            </Route>
          </Box>
        </Stack>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withEvents(withRouter(AppSkeleton))));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}