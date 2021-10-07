import React from 'react';

class Title extends React.Component {
	constructor(props, context) {
		super(props, context);
	}
	render() {
		return (
			<div className={"chatApp__convTitle"}>{this.props.owner}&#39;s display</div>
		);
	}
}

export default Title;
