import React, { Component } from "react";
import Paper from '@material-ui/core/Paper';

// const toolbarOptions = ["bold"];

class ChanInfo extends Component {
  constructor(props) {
    super(props);
    this.myEditor = React.createRef();
    this.state = {
      value: '\n'
    };
  }
  render() {
    const {
      channel
    } = this.props;
    return <Paper
      sx={{
        height: '100%',
        padding: '5px'
      }}
      elevation={2}>
        #{channel.name}

      </Paper>
  }
}


export default ChanInfo;
