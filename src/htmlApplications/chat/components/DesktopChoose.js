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

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

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
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  maxHeight: 800,
  overflowY: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function BasicModal({ onClose, shareSources }) {
  const [isOpen, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
  };
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Finestre" value="1" />
            <Tab label="Schermi" value="2" />
          </Tabs>
          <TabPanel value={value} index={'1'}>
          <Box sx={{ width: '700px', height: 450, overflowY: 'auto' }}>
          <ImageList variant="masonry" cols={4} gap={20}>
              {shareSources
                .filter((s) => s.id.indexOf('window') === 0)
                .map((s) => {
                  return (

                    <ImageListItem key={s.id}>
                        <img
                          src={s.thumbnail.toDataURL()}
                          alt={s.name}
                          loading="lazy"
                          style={{ 'width': '140px'}}
                        />
                      <ImageListItemBar sx={{ textOverlow: 'ellipsis' }} subtitle={s.name} />
                    </ImageListItem>
                  );
                })}
            </ImageList>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={'2'}>
          <Box sx={{ width: '700px', height: 450, overflowY: 'auto' }}>
          <ImageList variant="masonry" cols={4} gap={20}>
          {shareSources
                .filter((s) => s.id.indexOf('screen') === 0)
                .map((s) => {
                  return (

                    <ImageListItem key={s.id}>
                        <img
                          src={s.thumbnail.toDataURL()}
                          alt={s.name}
                          loading="lazy"
                          style={{ 'width': '140px'}}
                        />
                      <ImageListItemBar sx={{ textOverlow: 'ellipsis' }} subtitle={s.name} />
                    </ImageListItem>
                  );
                })}
            </ImageList>
            </Box>
          </TabPanel>
        </Box>
      </Modal>
    </div>
  );
}
