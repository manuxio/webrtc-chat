import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import makeProxyRequest from '../libs/proxyRequest';
// import AppSkeleton from './AppSkeleton';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import { createTheme } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';

import { doInvoke } from '../actions/ipcRequest';
import { experimentalStyled as styled } from '@material-ui/core/styles';

import '../styles/App.css';
import { remote } from 'electron';

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

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(0),
  // textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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
    getDashboardMessages: (arg) => {
      return makeProxyRequest('rooms:getdashboardmessages')(dispatch)(arg);
    },
  };
};

class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteData: [],
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
    this.props.getDashboardMessages().then((retval) => {
      this.setState({
        remoteData: retval,
      });
    });
    // console.log('App did mount', history.location);
  }

  render() {
    const { user } = this.props;
    const { remoteData } = this.state;
    console.log('Remote Data', remoteData);
    return (
      <>
        <Box
          component="div"
          sx={{
            height: '100vh',
            backgroundColor: '#2f3c42',
          }}
        >
          <Box
            sx={{
              padding: '10px',
            }}
          >
            <Typography variant="h5" gutterBottom component="div" sx={{
                marginBottom: '20px'
              }}>
              Benvenuto {user.Name} {user.Surname}
            </Typography>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              {Array.from(remoteData).map((dataBlock, index) => (
                <Grid item xs={2} sm={4} md={4} key={index}>
                  <Item>
                    <Card>
                      <CardActionArea onClick={() => {
                        if (dataBlock.url) {
                          require("electron").shell.openExternal(dataBlock.url);
                        }
                      }}>
                        {dataBlock.media ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={dataBlock.media}
                          />
                        ) : null}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="div">
                            {dataBlock.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: dataBlock.html,
                              }}
                            />
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Item>
                </Grid>
              ))}
            </Grid>
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
