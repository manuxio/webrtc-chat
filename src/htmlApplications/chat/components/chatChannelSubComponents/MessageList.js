import React from 'react';
import debounce from 'debounce';

import MessageItem from './MessageItem';

class MessageList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.scrollElement = React.createRef();
    this.scrollLog = debounce(console.log, 100);
    this.onScrollEndDebounced = debounce(props.onScrollEnd ? props.onScrollEnd : () => {}, 100);
  }

  getSnapshotBeforeUpdate(propsPrecedenti, statePrecedente) {
    // Stiamo aggiungendo nuovi elementi alla lista?
    // Salviamo la posizione dello scroll in modo da poterla aggiustare in seguito.
    const myScrollElement = this.scrollElement.current;
    const { scrollHeight, scrollTop, clientHeight } = myScrollElement;
    console.log('Before render', {
      scrollHeight,
      scrollTop,
      clientHeight
    });
    
    return null;
  }

  componentDidUpdate() {
    const myScrollElement = this.scrollElement.current;
    const { scrollHeight, scrollTop, clientHeight } = myScrollElement;
    this.scrollLog('After render', {
      scrollHeight,
      scrollTop,
      clientHeight,
    });
  }

  render() {
    let { onScrollTop, onScrollBottom, innerRef } = this.props;
    if (onScrollTop) {
      onScrollTop = debounce(onScrollTop, 50);
    }
    if (onScrollBottom) {
      onScrollBottom = debounce(onScrollBottom, 50);
    }
    const reversedMessages = this.props.messages.slice(0).reverse();
    return (
      <div
        ref={(el) => {
          console.log('Assigning Ref', this.scrollElement);
          this.scrollElement.current = el;
          innerRef.current = el;
        }}
        className={'chatApp__convTimeline'}
        onScroll={(e) => {
          let element = e.target;
          const { scrollHeight, scrollTop, clientHeight } = element;
          // this.scrollLog('New Scroll', {
          //   scrollHeight,
          //   scrollTop,
          //   clientHeight,
          // });
          this.onScrollEndDebounced({
            scrollHeight,
            scrollTop,
            clientHeight,
          });
          if (onScrollBottom && scrollTop > -10) {
            onScrollBottom();
          } else if (
            onScrollTop &&
            scrollHeight + scrollTop < clientHeight + 10
          ) {
            onScrollTop();
          }
        }}
      >
        {reversedMessages.map((messageItem, pos) => (
          <MessageItem
            onReply={this.props.onReply}
            prevMessage={reversedMessages[pos + 1] || null}
            nextMessage={reversedMessages[pos - 1] || null}
            key={messageItem.id}
            owner={this.props.owner}
            sender={messageItem.from}
            senderAvatar={messageItem.senderAvatar}
            message={messageItem.message}
            date={messageItem.date}
            msgid={messageItem._id}
          />
        ))}
      </div>
    );
  }
}

// React.forwardRef((props, ref) => (
//   <MessageList {...props} innerRef={ref}/>
// ));
export default React.forwardRef((props, ref) => (
  <MessageList {...props} innerRef={ref} />
));
