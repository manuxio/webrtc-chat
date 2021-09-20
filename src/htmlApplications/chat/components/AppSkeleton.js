import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import Badge from '@material-ui/core/Badge';

import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
import ToggleButton from '@material-ui/core/ToggleButton';
import Stack from '@material-ui/core/Stack';
import DashBoard from './DashBoard';
import Chat from './Chat';
import { withRouter } from 'react-router';
import { NavLink, Route } from 'react-router-dom';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import VideoChat from './VideoChat';
// import { styled, ThemeProvider, createTheme } from '@material-ui/core/styles';

const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected,
    alerts: state.alerts,
    videoChat: state.videoChat
  };
};

const mapDispatchToProps = () => {
  return {};
};
const FancyLink = (props) => {
  // console.log('props', props);
  return (
    <ToggleButton
      sx={{
        borderRadius: '50%',
        marginBottom: '5px',
        border: '0px',
      }}
      selected={props.active}
      color="secondary"
      aria-label="delete"
      size="large"
      value={props.to}
    >
      {props.icon}
    </ToggleButton>
  );
};
FancyLink.displayName = 'MyLink';

const MyNavLink = (props) => {
  const {
    to,
    // match,
    location,
  } = props;
  const isActive = location.pathname.includes(to);
  return (
    <NavLink to={to}>
      <FancyLink
        active={isActive}
        icon={props.icon || props.children}
        to={to}
      />
    </NavLink>
  );
};

class AppSkeleton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
    };
  }

  render() {
    const { match, location, alerts, videoChat } = this.props;
    // console.log('Match', match);
    // console.log('Location', location);
    // console.log('Props Skeleton', this.props);
    const reduceHeight = videoChat && videoChat.sessionToken ? '120px' : '0px';
    return (
      <>
        <CssBaseline />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={0}
        >
          <VideoChat />
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
          >
            <Box
              component="nav"
              className={"maximumHeight"}
              sx={{
                width: 80,
                backgroundColor: '#263237',
                paddingTop: '15px',
                borderRight: '1px solid #333f44',
              }}
            >
              <Stack
                direction="column"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
              >
                <MyNavLink to="/dashboard/" match={match} location={location}>
                  <DashboardOutlinedIcon />
                </MyNavLink>
                <MyNavLink to="/chat/" match={match} location={location}>
                  <Badge
                    badgeContent={alerts.unseenMessages || null}
                    color={alerts.unseenMentions > 0 ? 'secondary' : 'primary'}
                  >
                    <ForumOutlinedIcon />
                  </Badge>
                </MyNavLink>
                <MyNavLink
                  to="/todos/"
                  match={match}
                  location={location}
                  icon={<PlaylistAddCheckOutlinedIcon />}
                />
              </Stack>
            </Box>
            <Box
              component="main"
              className={"maximumHeight"}
              sx={{
                width: 'calc(100vw - 80px)',
                backgroundColor: '#263237',
                paddingTop: '0px',
                borderRight: '1px solid #333f44',
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
        </Stack>
      </>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(withRouter(AppSkeleton)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
