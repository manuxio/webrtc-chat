import React from 'react';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import capitalize from 'capitalize-the-first-letter';
import showdown from 'showdown';
import { format } from 'date-fns';
const converter = new showdown.Converter();

class MessageItem extends React.Component {
  render() {
    const { prevMessage, nextMessage } = this.props;
    const isFirst =
      !prevMessage || prevMessage.from._id !== this.props.sender._id;
    const isLast =
      !nextMessage || nextMessage.from._id !== this.props.sender._id;
    const isIncoming = this.props.sender._id !== this.props.owner._id;
    const fromName = capitalize(
      `${this.props.sender.Name} ${this.props.sender.Surname}`
        .trim()
        .replace(/\s\s+/g, ' ')
        .toLowerCase(),
    );
    // console.log(
    //   'this.props.sender._id',
    //   this.props.message,
    //   this.props.sender,
    //   this.props.sender._id,
    //   this.props.owner._id,
    //   isIncoming,
    //   isFirst,
    //   isLast,
    //   prevMessage
    // );
    /* message position formatting - right if I'm the author */
    let messagePosition = isIncoming
      ? 'chatApp__convMessageItem--left'
      : 'chatApp__convMessageItem--right';
    let isFirstClass = isFirst ? 'chatApp_convMessageItem--first' : '';
    let isLastClass = isLast ? 'chatApp_convMessageItem--last' : '';
    return (
      <div
        className={`chatApp__convMessageItem ${messagePosition} ${isFirstClass} ${isLastClass} clearfix`}
      >
        {isIncoming && isFirst ? (
          this.props.senderAvatar ? (
            <img
              src={this.props.senderAvatar}
              alt={this.props.sender.Name}
              className="chatApp__convMessageAvatar"
            />
          ) : (
            <AccountCircleOutlinedIcon
              sx={{ fontSize: 42, marginRight: '5px' }}
            />
          )
        ) : isIncoming ? (
          <div style={{ height: '42px', width: '42px', marginRight: '5px' }} />
        ) : <div style={{ height: '10px', width: '10px', marginRight: '5px' }} />}
        {isIncoming && isFirst}
        <div className="chatApp__convMessageValue">
          {isIncoming && isFirst ? (
            <div className="chatApp__convMessageFrom">{fromName}</div>
          ) : null}
          <div
            className={`chatApp__convMessageText ${
              isIncoming ? 'incoming' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: converter.makeHtml(this.props.message) }}
          />
          <div
            className={`chatApp__convMessageDate ${
              isIncoming ? 'incoming' : ''
            }`}
          >{`${format(new Date(this.props.date), 'Pp')}`}</div>
        </div>
      </div>
    );
  }
}

export default MessageItem;
