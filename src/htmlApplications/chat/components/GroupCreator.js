import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
// import { withRouter } from "react-router";

import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
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
      activeStep: 0
    }
  }

  render() {
    const {
      t
    } = this.props;
    const {
      groupName,
      defaultChecked,
      activeStep
    } = this.state;

    return (
      <Box p={0} className={"maximumHeight"} style={{ overflowY: "auto" }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {t('New Chat')}
            </Typography>
          </Toolbar>
        </AppBar>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step key={"ChannelName"}>
          <FormGroup>
            <FormLabel component="legend">{t('Is this a group chat?')}</FormLabel>
            <FormControlLabel control={<Switch defaultChecked={defaultChecked} />} label={t('Group Chat')} />
            <FormControlLabel disabled control={<Switch />} label="Disabled" />
          </FormGroup>
          </Step>
        </Stepper>
      </Box>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    // connected: state.appState.connected,
    alerts: state.alerts,
    channels: state.channels.channels
  }
};

const mapDispatchToProps = (/* dispatch */) => {
  return {
  };
};

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(MyGroupCreator));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
