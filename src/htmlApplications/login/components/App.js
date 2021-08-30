import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Avatar from '@material-ui/core/Avatar';
import LoadingButton from '@material-ui/lab/LoadingButton';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import withEvents from '../libs/withEvents';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
// import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
// import Link from '@material-ui/core/Link';
// import Grid from '@material-ui/core/Grid';
// import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { addTodo } from '../actions/todo';
import { ping } from '../actions/ping';
import { doLogin } from '../actions/login';
import { closeMe } from '../actions/closeMe';
// import {
//   PING_SUCCESS,
//   PING_STARTED
// } from '../actiontypes/ping';

import '../styles/App.css';

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

const mapDispatchToProps = dispatch => {
  return {
    doLogin: (username, password) => {
      doLogin(username, password)(dispatch);
    },
    onAddTodo: todo => {
      dispatch(addTodo(todo));
    },
    doPing: () => {
      dispatch(ping());
    }
  };
};

class LegacyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false
    }
  }
  componentDidUpdate(prevProps) {
    // console.log('appState', this.props.appState);
    // Typical usage (don't forget to compare props):
    if (this.props.connected !== prevProps.connected) {
      console.log('Requesting close');
      closeMe(1000);
    }
  }
  render() {
    const {
      username,
      password,
      showPassword
    } = this.state;
    const {
      loggingIn,
      loggedIn,
      loginError,
    } = this.props.login;
    const { t } = this.props;
    const {
      user,
      connected
    } = this.props;
    if (user && connected) {
      const n = `${user.Name} ${user.Surname}`;
      return (
        <Container disableGutters component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            padding={1}
            sx={{
              marginTop: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOpenOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h6" align="center">
              {t("Welcome")}
            </Typography>
            <Typography component="h1" variant="h6" align="center">
              {n}
            </Typography>
          </Box>
        </Container>
      );
    }
    return (
      <Container disableGutters component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          border={1}
          padding={1}
          sx={{
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t("Sign In To Rooms")}
          </Typography>
          <Box component="form" noValidate sx={{ p: 1 }}>
            <FormControl error={loginError} disabled={loggingIn} fullWidth required variant="standard">
              <InputLabel htmlFor="outlined-username">{t("Username")}</InputLabel>
              <Input
                id="outlined-username"
                type={'text'}
                value={username}
                fullWidth
                label="Username"
                onChange={(e) => {
                  const v = e.target.value;
                  this.setState({
                    username: v
                  });
                }}
              />
            <FormHelperText id="my-helper-text">{loginError ? t('Wrong username or password.')  : t("Use credentials from CRM")}</FormHelperText>
            </FormControl>
            <FormControl disabled={loggingIn} fullWidth required variant="standard">
            <InputLabel htmlFor="standard-adornment-password">{t("Password")}</InputLabel>
            <Input
              id="standard-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                this.setState({
                  password: v
                });
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => {
                      this.setState({
                        showPassword: !showPassword
                      })
                    }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
            <LoadingButton
              loading={loggingIn}
              disabled={loggingIn}
              loadingPosition="start"
              type="submit"
              fullWidth
              variant="contained"
              startIcon={<VpnKeyIcon />}
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                if (username && username.length > 0 && password && password.length > 0) {
                  console.log('Logging in!');
                  this.props.doLogin(username, password);
                }
              }}
            >
              {t("Sign In")}
            </LoadingButton>
          </Box>
        </Box>
      </Container>
    );
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('login')(withEvents(LegacyComponent)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

