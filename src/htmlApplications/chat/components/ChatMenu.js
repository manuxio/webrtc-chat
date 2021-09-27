import React, { Component, Suspense } from 'react';
import { connect } from 'react-redux';
import Badge from '@material-ui/core/Badge';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItemButton from '@material-ui/core/ListItemButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TagIcon from '@material-ui/icons/Tag';
import AddIcon from '@material-ui/icons/Add';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import InputAdornment from '@material-ui/core/InputAdornment';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import { doInvoke } from '../actions/ipcRequest';
import { addChannelLocal } from '../actions/channels';
import PersonOutlinedIcon from '@material-ui/icons/PersonOutlined';
import capitalize from 'capitalize-the-first-letter';
import log from 'electron-log';

// import { Link } from 'react-router-dom';
import {
  getUserChannels,
  getGroupChannels,
  getMe,
} from './selectors/chatChannel';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { Scrollbars } from 'react-custom-scrollbars-2';
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
              margin: '0px',
            },
          },
        },
      },
    },

    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
      root: {
        MuiListItemButton: {
          root: {
            paddingTop: '100px',
            color: 'red',
            margin: '100px',
            '&.Mui-selected': {
              margin: '100px',
            }
          }
        },
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '30px'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#42423fad'
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#42423fad'
          }
        }
      }
    },
    MuiAccordion: {
      defaultProps: {
        TransitionProps: { timeout: 100 },
      },
      root: {
        '&.Mui-expanded': {
          margin: '0px ​0',
        },
      },
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
            minHeight: '48px',
            // color: 'red',
            // // height: '48px',
            // minHeight: '48px',
          },
        },
        content: {
          '&.Mui-expanded': {
            margin: '0px 0',
            // margin: '0px',
            // color: {},
            // height: '48px',
            // minHeight: '48px',
          },
        },
      },
    },
  },
  props: {
    MuiButtonBase: {
      // The properties to apply
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
    MuiAccordion: {
      TransitionProps: { timeout: 10000 },
    },
  },
  palette: {
    mode: 'dark',
    secondary: {
      main: '#ff2a65',
    },
    primary: {
      main: '#e8912d',
    },
    text: {
      primary: '#f2f2f2',
    },
  },
  typography: {
    fontWeightRegular: 300,
  },
});

const mapStateToProps = (state, props, getState) => {
  return {
    alerts: state.alerts,
    groupchannels: getGroupChannels(state, props, getState),
    directchannels: getUserChannels(state, props, getState),
    users: state.users.users,
    me: getMe(state, props, getState),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addChannelLocal: (channel) => {
      return addChannelLocal(dispatch)(channel);
    },
    createPrivateChannel: (chanProps) => {
      return doInvoke(
        'proxy',
        'chat:createprivatechannel',
        chanProps,
      )(dispatch)
        .then((response) => {
          log.info('Got new private channel reply in a promise', response);
          return response;
        })
        .catch((e) => {
          log.error(e);
        });
    },
  };
};

class MyChatMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createChannelModalOpen: false,
      panels: {},
      usersFilter: '',
    };
  }

  componentDidMount() {}

  setExpanded(panel, expanded) {
    this.setState({
      panels: {
        ...this.state.panels,
        [panel]: expanded,
      },
    });
  }

  generateChannelsList() {
    const { groupchannels, history, location, alerts } = this.props;

    if (!groupchannels) {
      return null;
    }
    const myChannels = groupchannels.sort((a, b) => a.name > b.name);
    if (myChannels.length < 1 || !Array.isArray(myChannels)) {
      return null;
    }
    const subElements = myChannels.map((c) => {
      const chanAlert =
        alerts && alerts.byChannel ? alerts.byChannel[c._id] : {};
      return (
        <ListItemButton
          dense
          key={c._id}
          selected={c.isVisible}
          onClick={() => {
            // console.log('location', location);
            if (location.pathname !== `/chat/channel/${c._id}`) {
              history.push(`/chat/channel/${c._id}`);
            }
          }}
        >
          <ListItemIcon>
            <Badge
              badgeContent={chanAlert?.unseenMessages || null}
              color={chanAlert?.unseenMentions > 0 ? 'secondary' : 'primary'}
            >
              <TagIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText primary={c.name} />
        </ListItemButton>
      );
    });
    return (
      <List
        dense
        sx={{ width: '100%', bgcolor: 'background.paper' }}
        component="nav"
      >
        {subElements}
      </List>
    );
  }

  generateUsersList(usersToShow) {
    const { history, location, alerts, createPrivateChannel, me } = this.props;
    const subElements = usersToShow.map(({ user, channel }) => {
      // console.log('USER', user.Name, channel);
      const chanAlert =
        channel && alerts && alerts.byChannel
          ? alerts.byChannel[channel._id]
          : {};
      return (
        <ListItemButton
          dense
          selected={channel?.isVisible}
          key={user._id}
          onClick={() => {
            // console.log('location', location);
            // if (location.pathname !== `/chat/channel/${c._id}`) {
            //   history.push(`/chat/channel/${c._id}`);
            // }
            if (channel) {
              if (location.pathname !== `/chat/channel/${channel._id}`) {
                history.push(`/chat/channel/${channel._id}`);
              }
            } else {
              this.setState({ backdrop: true }, () => {
                return createPrivateChannel({
                  type: 'direct',
                  participants: [me._id, user._id],
                }).then((result) => {
                  log.log('Result in chat menu', result);
                  if (!result.error) {
                    this.props.addChannelLocal(result);
                    log.log('Channel locally added');
                    this.setState({
                      backdrop: false,
                      usersFilter: ''
                    });
                    if (location.pathname !== `/chat/channel/${result._id}`) {
                      history.push(`/chat/channel/${result._id}`);
                    }
                  }
                });
              });
            }
          }}
        >
          <ListItemIcon>
            <Badge
              badgeContent={chanAlert?.unseenMessages || null}
              color={chanAlert?.unseenMentions > 0 ? 'secondary' : 'primary'}
            >
              {channel ? <PersonOutlinedIcon /> : <PersonAddOutlinedIcon />}
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={capitalize(
              `${user.Name} ${user.Surname}`
                .trim()
                .replace(/\s\s+/g, ' ')
                .toLowerCase(),
            )}
            primaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      );
    });
    return (
      <List
        dense
        sx={{ width: '100%', bgcolor: 'background.paper' }}
        component="nav"
      >
        {subElements}
      </List>
    );
  }

  render() {
    const { panels, createChannelModalOpen, usersFilter, backdrop } =
      this.state;
    const { t, history, users, me, directchannels } = this.props;
    // console.log('directchannels', directchannels);
    const usersToShow =
      directchannels && users
        ? users
            .filter((u) => {
              if (u._id === me._id) return false;
              if (usersFilter) {
                const toMatch = `${u.Name} ${u.Surname}`;
                return new RegExp(usersFilter, 'ig').test(toMatch);
              }
              const uid = u._id;
              // console.log('Lookup', u._id);
              return directchannels.reduce((prev, curr) => {
                if (prev) return prev;
                if (curr.participants.indexOf(uid) > -1) {
                  return true;
                }
                return false;
              }, false);
            })
            .map((u) => {
              const uid = u._id;
              const userChannel = directchannels.reduce((prev, curr) => {
                if (prev) return prev;
                if (curr.participants.indexOf(uid) > -1) {
                  return curr;
                }
                return prev;
              }, null);
              return {
                user: u,
                channel: userChannel,
              };
            })
            .sort((a, b) => {
              if (a.channel && !b.channel) return -1;
              if (b.channel && !a.channel) return 1;
              if (!a.channel && !b.channel) {
                // console.log('Son qui?', `${a.user.Name.toLowerCase()} ${a.user.Surname.toLowerCase()}` > `${b.user.Name.toLowerCase()} ${b.user.Surname.toLowerCase()}`)
                return `${a.user.Name.toLowerCase()} ${a.user.Surname.toLowerCase()}` >
                  `${b.user.Name.toLowerCase()} ${b.user.Surname.toLowerCase()}`
                  ? 1
                  : -1;
              }
              if (a.channell && b.channel) {
                return a.channel.lastMessageDate > b.channel.lastMessageDate;
              }
            })
        : [];
    return (
      <ThemeProvider theme={mainTheme}>
        {backdrop ? (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : null}
        <div style={{ height: '100vh'}}>
          <Scrollbars
            // This will activate auto hide
            autoHide
            // Hide delay in ms
            autoHideTimeout={1000}
            // Duration for hide animation in ms.
            autoHideDuration={200}
            style={{
              flex: '1 1 auto',
            }}
          >
            <Accordion
              elevation={0}
              square
              expanded={panels.channels ? panels.channels : false}
              onChange={(e, expanded) => {
                this.setExpanded('channels', expanded);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ flexShrink: 0 }}>{t('Groups')}</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: '0px',
                }}
              >
                {this.generateChannelsList()}
                <ListItemButton
                  dense
                  key="CreateChannel"
                  onClick={() => {
                    console.log('Modal will be', !createChannelModalOpen);
                    history.push(`/chat/createchannel`);
                  }}
                >
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('Nuovo gruppo')} />
                </ListItemButton>
              </AccordionDetails>
            </Accordion>
            <Accordion
              elevation={0}
              square
              expanded={panels.direct ? panels.direct : false}
              onChange={(e, expanded) => {
                this.setExpanded('direct', expanded);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ flexShrink: 0 }}>
                  {t('Colleagues')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: '0px',
                }}
              >
                <Typography>
                  <Input
                    sx={{
                      marginLeft: '16px',
                      width: 'calc(250px - 16px - 16px)',
                    }}
                    placeholder={t('Search colleague')}
                    value={this.state.usersFilter}
                    onChange={(e) => {
                      const v = e.target.value;
                      this.setState({
                        usersFilter: v.replace('?', '').replace('*', ''),
                      });
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            this.setState({
                              usersFilter: '',
                            });
                          }}
                        >
                          <HighlightOffOutlinedIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Typography>
                {this.generateUsersList(usersToShow)}
              </AccordionDetails>
            </Accordion>
          </Scrollbars>
        </div>
      </ThemeProvider>
    );
  }
}

const MyComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('chat')(withRouter(MyChatMenu)));
export default function App() {
  return (
    <Suspense fallback="loading">
      <MyComponent />
    </Suspense>
  );
}
