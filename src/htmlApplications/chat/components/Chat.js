import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Route } from 'react-router-dom';

// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
// import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Stack from '@material-ui/core/Stack';
import ChatMenu from './ChatMenu';
import ChatNoChannel from './ChatNoChannel';
import ChatChannel from './ChatChannel';
import GroupCreator from './GroupCreator';
// import { NavLink, Route } from 'react-router-dom';

import '../styles/App.css';

// const mainTheme = createTheme({
//   palette: {
//     mode: 'dark',
//     secondary: {
//       main: '#ff2a65'
//     },
//     primary: {
//       main: '#e8912d'
//     }
//   },
// });

const mapStateToProps = () => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    // connected: state.appState.connected
  }
};

const mapDispatchToProps = () => {
  return {
  };
};

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false
    }
  }

  componentDidMount() {
    const {
      history
    } = this.props;
    // console.log('App History', history);
    // console.log('Navigating to /dashboard/');
    // history.replace('/dashboard/');
    if (history.location.pathname === '/chat.html') {
      history.replace('/dashboard/');
    }
    // console.log('App did mount', history.location);
  }

  render() {
    // const {
    //   user
    // } = this.props;
    return (
      <>
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
            width: 190,
            backgroundColor: '#1e272c',
            paddingTop: '0px',
            borderRight: '1px solid #333f44',
            overflow: 'auto'
          }}
        >
          <ChatMenu/>
        </Box>
        <Box
          component="main"
          sx={{
            height: '100vh',
            backgroundColor: '#1e272c',
            paddingTop: '0px',
            borderRight: '1px solid #333f44',
            flexGrow: 1
          }}
        >
          <Route exact path="/chat/">
            <ChatNoChannel />
          </Route>
          <Route exact path="/chat/createchannel" render={() => {
              return (
                <GroupCreator />);
          }} />
          <Route exact path="/chat/channel/:channel" render={(routeProps) => {
              console.log('Router rendering', routeProps.match.params.channel);
              return (
                <ChatChannel channelId={routeProps.match.params.channel} />);
          }} />
        </Box>
      </Stack>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withRouter(Chat)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

