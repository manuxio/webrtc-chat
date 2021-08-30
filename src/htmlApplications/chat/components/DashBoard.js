import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import AppSkeleton from './AppSkeleton';
import withEvents from '../libs/withEvents';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import '../styles/App.css';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65'
    },
    primary: {
      main: '#e8912d'
    }
  },
});

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

class DashBoard extends Component {
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
    const {
      user
    } = this.props;
    return (
      <>
        <Box
          component="nav"
          sx={{
            height: '100vh',
            width: 'calc(100vw - 80px)',
            backgroundColor: '#2f3c42',
            padding: '15px',
          }}
        >
        <Typography variant="h5" gutterBottom component="div">
          Benvenuto {user.Name} {user.Surname}
        </Typography>
        <Typography variant="body1" gutterBottom>
        body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
        neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum
        quasi quidem quibusdam.
      </Typography>
      <Typography variant="body2" gutterBottom>
        body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
        neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum
        quasi quidem quibusdam.
      </Typography>
      </Box>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withEvents(withRouter(DashBoard))));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

