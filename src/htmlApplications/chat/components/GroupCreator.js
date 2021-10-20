import React, { Suspense } from 'react';
import { withRouter } from 'react-router';
import { getMe } from './selectors/chatChannel';
import log from 'electron-log';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { doInvoke } from '../actions/ipcRequest';
// import { withRouter } from "react-router";

import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/core/Alert';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

class MyGroupCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channelProps: {
        isPublic: true,
        name: '',
        participants: [props.me._id]
      }
    };
  }

  render() {
    const { t } = this.props;
    const { name, isPublic, activeStep } = this.state.channelProps;

    return (
      <Box p={0} className={'maximumHeight'} style={{ overflowY: 'auto' }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {t('Join or create group')}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box p={2}>
          <FormGroup>
            <TextField
              value={name}
              onChange={(v) => {
                this.setState({
                  error: null,
                  channelProps: {
                    ...this.state.channelProps,
                    name: v.target.value
                  }
                })
              }}
              id="standard-basic"
              label={t('Group name')}
              variant="standard"
            />
          </FormGroup>
        </Box>
        <Box p={2}>
          <FormGroup>
            <FormControlLabel
              labelPlacement="end"
              control={<Switch
                checked={!isPublic}
                onChange={(v) => {
                  const checked = v.target.checked;
                  this.setState({
                    channelProps: {
                      ...this.state.channelProps,
                      isPublic: !checked
                    }
                  })
                }}
              />}
              label={t('Invite only')}
            />
          </FormGroup>
        </Box>
        <Box p={2}>
          { this.state.error ? <Alert m={2} severity="info">{t(this.state.error)}</Alert> : null }
          { this.state.error === 'Channel exists'
            ? (
              <Box pt={2} pb={2}><FormGroup>
                <Button color="secondary" onClick={() => {
                  this.props.joinGroup(name)
                    .then(
                      (newChan) => {
                        console.log('Joined new channel');
                        this.props.history.push(`/chat/channel/${newChan._id}`);
                      }
                    )
                    .catch(
                      (e) => {
                        if (e.message.indexOf('Cannot join') > -1) {
                          this.setState({
                            error: 'Cannot join'
                          })
                        }
                      }
                    )
                }}
                variant="contained">{`${t('Join group')} #${name}`}</Button></FormGroup></Box>
            )
            : null
          }
          {!this.state.error ? (<FormGroup>
            <Button disabled={!name} onClick={() => {
              this.props.createGroup(this.state.channelProps)
                .then(
                  (newGroup) => {
                    console.log('Got new channel', newGroup);
                    this.props.history.push(`/chat/channel/${newGroup._id}`);
                  }
                )
                .catch(
                  (e) => {
                    if (e.message.indexOf('Channel exists') > -1) {
                      this.setState({
                        error: 'Channel exists'
                      })
                    }
                    console.log('Error creating new channel', e);
                  }
                )
            }} variant="contained">{t('Create new group')}</Button>
          </FormGroup>) : null }
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state, props, getState) => {
  return {
    me: getMe(state, props, getState),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createGroup: (channelProps) => {
      return doInvoke(
        'proxy',
        'chat:creategroup',
        channelProps,
      )(dispatch)
        .then((newGroup) => {
          log.info('new channel created', newGroup);
          return newGroup;
        })
        .catch((e) => {
          log.error(e);
          throw e;
        });
    },
    joinGroup: (channelName) => {
      return doInvoke(
        'proxy',
        'chat:joingroup',
        channelName,
      )(dispatch)
        .then((newGroup) => {
          log.info('Channel Joined', newGroup);
          return newGroup;
        })
        .catch((e) => {
          log.error(e);
          throw e;
        });
    },
  };
};

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(withRouter(MyGroupCreator)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
