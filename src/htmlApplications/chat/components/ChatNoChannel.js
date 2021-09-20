import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from "react-router";
import Box from '@material-ui/core/Box';
// import Button from '@material-ui/core/Button';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import { doInvoke } from '../actions/ipcRequest';
import Typography from '@material-ui/core/Typography';
import '../styles/App.css';

const mapStateToProps = (state) => {
  return {
    todo: state.todo,
    ping: state.ping,
    login: state.login,
    appState: state.appState,
    user: state.appState.user,
    connected: state.appState.connected,
    ipcRequests: state.ipcRequests.ipcRequests
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    doGetRandomNumber: (arg, callback) => {
      doInvoke('getRandomNumber:request', arg, callback)(dispatch);
    }
  };
};

class ChatNoChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      showPassword: false,
      buttonFace: 'Get random number'
    }
  }

  componentDidMount() {
    // console.log('App did mount', history.location);
  }

  render() {
    // const {
    //   buttonFace
    // } = this.state;
    return (
      <>
        <Box
          className={"maximumHeight"}
          sx={{
            width: 'calc(100vw - 80px - 250px)',
            backgroundColor: '#2f3c42',
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontSize: '300px'
          }}
        >
        <ForumOutlinedIcon fontSize={"inherit"} color={'disabled'} />
        <Typography variant="h5" gutterBottom component="div" sx={{ color: 'text.disabled'}}>
          So many things to say...
        </Typography>
      </Box>
      </>
    )
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withRouter(ChatNoChannel)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}

