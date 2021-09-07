import * as React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';

export default function FormDialog(props) {
  const [open, /*setOpen*/] = React.useState(props.open);
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
        onClose={() => {
          if (props.onClose) {
            props.onClose();
          }
          // setOpen(false);
        }}
        fullWidth
      >
        <DialogTitle>{t('Join existing channel or create new one')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="channelname"
            label={t("Please enter channel name without #")}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>{t("Join")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
