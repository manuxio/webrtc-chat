import React, { Component } from "react";
import ReactQuill from "react-quill";
import "quill-mention";
import "quill-mention/dist/quill.mention.css";
// import "quill-emoji";
// import "quill-emoji/dist/quill-emoji.css";

const atValues = [
  { id: 1, value: "Fredrik Sundqvist" },
  { id: 2, value: "Patrik Sjölin" }
];

// const toolbarOptions = ["bold"];

class Editor extends Component {
  constructor(props) {
    super(props);
    this.myEditor = React.createRef();
    this.state = {
      value: '\n'
    };
  }
  get modules() {
    return {
      toolbar: [
        // [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        // ["emoji"],
        // ["link", "image"]
      ],
      // "emoji-toolbar": true,
      // "emoji-textarea": false,
      // "emoji-shortname": true,
      mention: {
        // onOpen: () => {
        //   this.setState({
        //     mentionOpen: true
        //   });
        // },
        // onClose: () => {
        //   this.setState({
        //     mentionOpen: false
        //   });
        // },
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@", "#"],
        source: function(searchTerm, renderItem, mentionChar) {
          let values;
          if (mentionChar === "@" || mentionChar === "#") {
            values = atValues;
          }
          if (searchTerm.length === 0) {
            renderItem(values, searchTerm);
          } else {
            const matches = [];
            for (let i = 0; i < values.length; i++)
              if (
                ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
              )
                matches.push(values[i]);
            renderItem(matches, searchTerm);
          }
        }
      }
    }
  }

  get formats() {
    return [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
      "mention",
      "emoji"
    ];
  }

  handleProcedureContentChange(/* content, delta, source, editor */) {
    // if (this.props.onChange) {
    //   this.props.onChange(content, delta, source, editor);
    // }
  }

  render() {
    return (
      <ReactQuill
        ref={this.myEditor}
        theme="snow"
        modules={this.modules}
        formats={this.formats}
        onChange={(value) => {
          this.setState({ value });
        }}
        value={this.state.value}
        onKeyDown={(e) => {
          const {
            // keyCode,
            shiftKey,
            ctrlKey,
            code
          } = e;
          if (code === 'Enter' && !shiftKey && !ctrlKey) {
            console.log('Enter', 'Mention', this.state.mentionOpen);

            this.setState({
              text: '\n'
            })
          }
        }}
      >
      </ReactQuill>
    );
  }
}

export default Editor;
