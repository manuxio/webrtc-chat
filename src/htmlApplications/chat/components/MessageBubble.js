import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
// import TagFaces from '@material-ui/icons/TagFaces';
import Reply from '@material-ui/icons/Reply';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { format } from 'date-fns';
import { convert } from 'html-to-text';
// import memoizee from 'memoizee';
// import Promise from 'bluebird';

const useStyles = makeStyles(({ palette, spacing/*, measure */ }) => {
  const radius = spacing(2.5);
  const size = 30;
  const leftBgColor = palette.primary.dark;
  const rightBgColor = 'rgb(101 101 101)';
  // if you want the same as facebook messenger, use this color '#09f'
  return {
    avatar: {
      width: size,
      height: size,
    },
    rightRow: {
      marginLeft: 'auto',
    },
    msgBox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 4,
      '&:hover $iconBtn': {
        opacity: 1,
      },
    },
    leftMsgBox: {
      textAlign: 'left',
    },
    rightMsgBox: {
      textAlign: 'right',
      flexDirection: 'row-reverse',
    },
    msg: {
      maxWidth: '70%',
      padding: spacing(1, 2),
      borderRadius: 4,
      display: 'inline-block',
      wordBreak: 'break-word',
      fontFamily:
        // eslint-disable-next-line max-len
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '14px',
    },
    left: {
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
      backgroundColor: leftBgColor,
      minWidth: '200px'
    },
    right: {
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
      backgroundColor: rightBgColor,
      textAlign: 'right',
      color: palette.common.white,
      minWidth: '200px',
      '&author': {
        color: palette.text.disabled,
        display: 'none'
      }
    },
    leftFirst: {
      borderTopLeftRadius: radius,
    },
    leftLast: {
      borderBottomLeftRadius: radius,
    },
    rightFirst: {
      borderTopRightRadius: radius,
    },
    rightLast: {
      borderBottomRightRadius: radius,
    },
    author: {
      color: palette.text.disabled
    },
    date: {
      color: palette.text.disabled,
      textAlign: 'right',
      fontSize: '80%'
    },
    fromMarkdown: {
      '& P': {
        "margin": "0px"
      },
      '& blockquote': {
        borderLeft: '2px solid #ff6a00',
        margin: "7px 2px 7px 2px",
        paddingLeft: "4px",
        textAlign: "left"
      },
    },
    iconBtn: {
      opacity: 0,
      padding: 6,
      color: 'rgba(255,255,255,0.34)',
      '&:hover': {
        color: 'rgba(255,255,255,0.87)',
      },
      margin: '0 4px',
      '& svg': {
        fontSize: 20,
      },
    },
    image: {
      maxWidth: 120,
      maxHeight: 120,
    },
  };
});

const MessageBubble = ({ from, avatar, messages, side, dates, ids, onReply }) => {
  const styles = useStyles();
  const attachClass = index => {
    if (index === 0) {
      return styles[`${side}First`];
    }
    if (index === messages.length - 1) {
      return styles[`${side}Last`];
    }
    return '';
  };
  const name = `${from.Name} ${from.Surname}`;
  return (
    <Grid
      container
      spacing={2}
      justify={side === 'right' ? 'flex-end' : 'flex-start'}
    >
      {side === 'left' && (
        <Grid item>
          <Avatar src={avatar} className={cx(styles.avatar)} />
        </Grid>
      )}
      <Grid item xs>
        {messages.map((msg, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div
              key={msg.id || i}
              className={cx(styles.row, styles[`${side}Row`])}
            >
              <div className={cx(styles.msgBox, styles[`${side}MsgBox`])}>
                {typeof msg === 'string' && (
                  <Typography
                    align={'left'}
                    className={cx(styles.msg, styles[side], attachClass(i))}
                  >
                    {
                      i === 0
                      ? <div className={cx(styles.author)}>{name}</div>
                      : null
                    }
                    <div className={cx(styles.fromMarkdown)} dangerouslySetInnerHTML={{__html: msg }} />
                    <div className={cx(styles.date)}>{`${format(new Date(dates[i]), 'Pp')}`}</div>
                  </Typography>
                )}
                {typeof msg === 'object' && msg.type === 'image' && (
                  <img className={styles.image} alt={msg.alt} {...msg} />
                )}
                <IconButton className={styles.iconBtn} onClick={() => {
                  if (onReply) {
                    onReply({ msgid: ids[i], textversion: convert(msg) || ""});
                  }
                }}>
                  <Reply />
                </IconButton>
                <IconButton className={styles.iconBtn}>
                  <MoreHoriz />
                </IconButton>
              </div>
            </div>
          );
        })}
      </Grid>
    </Grid>
  );
};

MessageBubble.propTypes = {
  avatar: PropTypes.string,
  messages: PropTypes.arrayOf(PropTypes.string),
  side: PropTypes.oneOf(['left', 'right']),
};
MessageBubble.defaultProps = {
  avatar: '',
  messages: [],
  side: 'left',
};

export default function SuspendedMessageBubble(props) {
  return (
    <Suspense fallback="Please wait">
      <MessageBubble {...props} />
    </Suspense>
  );
}
