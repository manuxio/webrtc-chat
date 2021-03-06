import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { doInvoke } from '../actions/ipcRequest';

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

const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    doGetRandomNumber: (arg, callback) => {
      return doInvoke('getRandomNumber:request', arg, callback)(dispatch);
    },
  };
};

class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    // console.log('App History', history);
    // console.log('Navigating to /dashboard/');
    // history.replace('/dashboard/');
    if (history.location.pathname === '/chat.html') {
      history.replace('/dashboard/');
    }
    // console.log('App did mount', history.location);
  }

  render() {
    const { user } = this.props;
    return (
      <>
        <Box
          component="div"
          sx={{
            height: '100vh',
            backgroundColor: '#2f3c42'
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom component="div">
              Benvenuto {user.Name} {user.Surname}
            </Typography>
          </Box>
        </Box>
      </>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(withRouter(DashBoard)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
