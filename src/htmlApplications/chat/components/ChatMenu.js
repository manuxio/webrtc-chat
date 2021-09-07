import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
// import withEvents from '../libs/withEvents';
import { withRouter } from "react-router";
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { loadMyChannels } from '../actions/channels';
import List from '@material-ui/core/List';
import ListItemButton from '@material-ui/core/ListItemButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TagIcon from '@material-ui/icons/Tag';
import AddIcon from '@material-ui/icons/Add';
import NewChannel from './NewChannel';
// import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
/*
.css-1wudjvl-MuiPaper-root-MuiAccordion-root.Mui-expanded
*/
const mainTheme = createTheme({
  components: {
    MuiPaper: {
      root: {
        MuiAccordion: {
          root: {
            '&.Mui-expanded': {
              margin: '0px'
            }
          }
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // No more ripple, on the whole application 💣!
      }
    },
    MuiAccordion: {
      defaultProps: {
        TransitionProps: { timeout: 100 }
      },
      root: {
        '&.Mui-expanded': {
          margin: '0px ​0'
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          '&:first-of-type': {
            '&:before': {
              display: 'block',
            },
          },
          // color: 'red',
          '&.Mui-expanded': {
            minHeight: '48px'
            // color: 'red',
            // // height: '48px',
            // minHeight: '48px',
          },
        },
        content: {
          '&.Mui-expanded': {
            margin: '0px 0'
            // margin: '0px',
            // color: {},
            // height: '48px',
            // minHeight: '48px',
          },
        },
      }
    }
  },
  props: {
    MuiButtonBase: {
      // The properties to apply
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
    MuiAccordion: {
      TransitionProps: { timeout: 10000 }
    }
  },
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65'
    },
    primary: {
      main: '#e8912d'
    },
    text: {
      primary: '#f2f2f2'
    }
  },
  typography: {
    fontWeightRegular: 300
  }
});

const mapStateToProps = (state) => {
  return {
    // todo: state.todo,
    // ping: state.ping,
    // login: state.login,
    // appState: state.appState,
    // user: state.appState.user,
    // connected: state.appState.connected,
    channels: state.channels.channels
  }
};

const mapDispatchToProps = (/* dispatch */) => {
  return {
    // loadMyChannels: () => {
    //   loadMyChannels(dispatch);
    // }
  };
};

class MyChatMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createChannelModalOpen: false,
      panels: {

      }
    }
  }

  componentDidMount() {
    // const {
    //   channels,
    //   loadMyChannels
    // } = this.props;
    // if (typeof channels === 'undefined') {
    //   loadMyChannels();
    // }
  }

  setExpanded(panel, expanded) {
    this.setState({
      panels: {
        ...this.state.panels,
        [panel]: expanded
      }
    });
  }

  generateChannelsList() {
    const {
      channels,
      history,
      location
    } = this.props;

    if (!channels) {
      return null;
    }
    const myChannels = channels.filter((c) => c.type === 'group').sort((a, b) => a.name > b.name);
    if (myChannels.length < 1 || !Array.isArray(myChannels)) {
      return null;
    }
    const subElements = myChannels.map((c) => {
      return (
        <ListItemButton key={c._id} onClick={() => {
            // console.log('location', location);
            if (location.pathname !== `/chat/${c._id}`) {
              history.push(`/chat/${c._id}`);
            }
        }}>
          <ListItemIcon>
            <TagIcon />
          </ListItemIcon>
          <ListItemText primary={c.name} />
        </ListItemButton>
      )
    });
    return (
      <List
        dense
        sx={{ width: '100%', bgcolor: 'background.paper' }}
        component="nav"
      >
      {subElements}
    </List>
    )
  }

  render() {
    const {
      panels,
      createChannelModalOpen
    } = this.state;
    const {
      t
    } = this.props;
    return (
      <ThemeProvider
        theme={mainTheme}
      >
        {
          createChannelModalOpen
          ? <NewChannel open={createChannelModalOpen} onClose={() => {
            this.setState({
              createChannelModalOpen: false
            })
          }}/>
          : null
        }
      <div>
        <Accordion elevation={0} square expanded={panels.channels ? panels.channels : false} onChange={(e, expanded) => {
          this.setExpanded('channels', expanded);
        }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ flexShrink: 0 }}>
              {t('Channels')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{
              padding: '0px'
            }}>
            {this.generateChannelsList()}
            <ListItemButton key="CreateChannel" onClick={() => {
              console.log('Modal will be', !createChannelModalOpen);
              this.setState({
                createChannelModalOpen: !createChannelModalOpen
              })
            }}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t("Join Channel")} />
            </ListItemButton>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0} square expanded={panels.direct ? panels.direct : false} onChange={(e, expanded) => {
          this.setExpanded('direct', expanded);
        }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ flexShrink: 0 }}>
              {t('Direct messages')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
              Aliquam eget maximus est, id dignissim quam..
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
      </ThemeProvider>
    );
  }
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation('chat')(withRouter(MyChatMenu)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
