import * as React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageList from '@material-ui/core/ImageList';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import { styled } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

// const ImageListItem

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const style = {
  // position: 'absolute',
  // top: '50%',
  // left: '50%',
  // transform: 'translate(-50%, -50%)',
  // width: 800,
  // maxHeight: 800,
  // overflowY: 'auto',
  // bgcolor: 'background.paper',
  // border: '2px solid #000',
  // boxShadow: 24,
  // p: 4,
};

const imgStyle = {
  height: '500px',
  backgroundColor: 'red',
  '&:hover': {
    border: '1px solid primary',
  },
};

export default function BasicModal({ onClose, shareSources, setSource }) {
  const [isOpen, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
  };
  const [value, setValue] = React.useState('1');
  const [screenId, setScreenId] = React.useState(null);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Finestre" value="1" />
          <Tab label="Schermi" value="2" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', height: '450px', overflowY: 'auto' }}>
          <TabPanel value={value} index={'1'}>
            <ImageList variant="masonry" cols={4} gap={20}>
              {shareSources
                .filter((s) => s.id.indexOf('window') === 0)
                .map((s) => {
                  return (
                    <ImageListItem
                      key={s.id}
                      onClick={() => {
                        setScreenId(s.id);
                      }}
                    >
                      <img
                        src={s.thumbnail.toDataURL()}
                        alt={s.name}
                        loading="lazy"
                        style={{
                          width: '140px',
                          border: s.id === screenId ? '3px solid red' : '3px solid transparent',
                        }}
                      />
                      <ImageListItemBar
                        sx={{ textOverlow: 'ellipsis' }}
                        subtitle={s.name}
                      />
                    </ImageListItem>
                  );
                })}
            </ImageList>
          </TabPanel>
          <TabPanel value={value} index={'2'}>
            <ImageList variant="masonry" cols={4} gap={20}>
              {shareSources
                .filter((s) => s.id.indexOf('screen') === 0)
                .map((s) => {
                  return (
                    <ImageListItem
                      sx={{
                        color: 'success.dark',
                        display: 'inline',
                        fontWeight: 'medium',
                        mx: 1,
                      }}
                      onClick={() => {
                        setScreenId(s.id);
                      }}
                      key={s.id}
                    >
                      <img
                        src={s.thumbnail.toDataURL()}
                        alt={s.name}
                        loading="lazy"
                        style={{ width: '160px', border: s.id === screenId ? '3px solid red' : '3px solid transparent',}}
                      />
                      <ImageListItemBar
                        sx={{ textOverlow: 'ellipsis' }}
                        subtitle={s.name}
                      />
                    </ImageListItem>
                  );
                })}
            </ImageList>
          </TabPanel>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {handleClose()}}>Cancel</Button>
        <Button variant="contained" disabled={!screenId} onClick={() => {
          setSource(screenId);
        }}>Share</Button>
      </DialogActions>
    </Dialog>
  );
}
