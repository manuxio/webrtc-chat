import React from 'react';
import Title from './Title';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import InputMessage from './InputMessage';
import './ChatBox.css';

class ChatBox extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			isLoading: false
		};
		this.sendMessageLoading = this.sendMessageLoading.bind(this);
		var timeout = null;
	}
	/* catch the sendMessage signal and update the loading state then continues the sending instruction */
	sendMessageLoading(sender, senderAvatar, message) {
		this.setState({ isLoading: true });
		this.props.sendMessage(sender, senderAvatar, message);
		setTimeout(() => {
			this.setState({ isLoading: false });
		}, 400);
	}
	render() {
    const {
      onScrollTop,
      onScrollBottom
    } = this.props;
    console.log('this.props.boxHeight', this.props.boxHeight);
		return (
			<div className={"chatApp__conv"} style={{
        height: this.props.boxHeight}}>
				<MessageList
          onScrollTop={onScrollTop}
          onScrollBottom={onScrollBottom}
					owner={this.props.owner}
					messages={this.props.messages}
          onReply={this.props.onReply}
				/>
			</div>
		);
	}
}

export default ChatBox;
