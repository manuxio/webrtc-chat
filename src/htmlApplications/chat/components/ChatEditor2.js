import ReactQuill, { Quill } from 'react-quill';
import AutoLinks from 'quill-auto-links';

import { useEffect, useRef, useState, React } from 'react';
import 'react-quill/dist/quill.snow.css';
import "quill-mention";
import "quill-mention/dist/quill.mention.css";
// import TurndownService from 'turndown';
// import showdown from 'showdown';
import cheerio from 'cheerio';

import '../styles/ChatEditor.css';
import { NodeHtmlMarkdown } from 'node-html-markdown';
// const converter = new showdown.Converter();
// console.log('quillEmojiMartPicker', Emoji);
// const turndownService = new TurndownService();
Quill.register('modules/autoLinks', AutoLinks);

// import { Emoji, EmojiBlot } from '../../../extra/quill-emoji-mart-picker';
import { emojis } from '../../../extra/quill-emoji-mart-picker';
import '../styles/mentions.css';

// Quill.register(
//     {
//         "formats/emoji": quillEmoji.EmojiBlot,
//         "modules/emoji-toolbar": quillEmoji.ToolbarEmoji,
//         "modules/emoji-textarea": quillEmoji.TextAreaEmoji,
//         "modules/emoji-shortname": quillEmoji.ShortNameEmoji,
//     },
//     true,
// );

let atValues = [
];

const formats = [
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

// const emojiList = [ {
//     "name": "100",
//     "unicode": "1f4af",
//     "shortname": ":100:",
//     "code_decimal": "&#128175;",
//     "category": "s",
//     "emoji_order": "2119"
//   }, ];

const modules = {
  autoLinks: {
      paste: true,
      type: true
    },
  toolbar: [
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, 'link'],
  ],
  'emoji-module': {
     emojiData: emojis,
     disableOnPaste: true,
     // customEmojiData: this.customEmojis,
     preventDrag: true,
     showTitle: true,
     // indicator: ':',
     convertEmoticons: true,
     convertShortNames: true,
     // set: () => this.set
 },
  // "emoji-toolbar": true,
  //       "emoji-textarea": true,
  //       "emoji-shortname": true,
  mention: {
    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    mentionDenotationChars: ['@'], // , '#'
    onOpen: () => {
      // console.log('Mentions open');
    },
    source: function (searchTerm, renderItem, mentionChar) {
      let values;
      if (mentionChar === '@' || mentionChar === '#') {
        values = atValues;
      }
      if (searchTerm.length === 0) {
        renderItem(values, searchTerm);
      } else {
        const matches = [];
        for (let i = 0; i < values.length; i++)
          if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()))
            matches.push(values[i]);

        renderItem(matches, searchTerm);
      }
    }
  }
};

export default function Editor({ channelName, tags, onSubmit, passEditor }) {
  const editor = useRef(null);
  const [commentInput, setCommentInput] = useState('');
  const [, setJsonOutput] = useState({});
  const [mentionsOpen, setMentionsOpen] = useState(false);
  useEffect(() => {
    if (editor && passEditor) {
      passEditor(editor);
    }
  });

  modules.mention.onOpen = () => {
    setMentionsOpen(true);
  }

  modules.mention.onClose = () => {
    setTimeout(() => {
      setMentionsOpen(false);
    }, 1);
  }


  // function onHandleSubmit(e) {
  //   e.preventDefault();
  //
  //   let tagValues = [];
  //
  //   jsonOutput.ops.map((object) => {
  //     if (typeof object.insert === 'object') {
  //       tagValues.push(object.insert.mention.value);
  //     }
  //   });
  //
  //   setCommentInput('');
  //   setJsonOutput({});
  // }

  function handleChange(content/*, delta, source, editor*/) {
    setCommentInput(content);
    setJsonOutput(editor.current.editor.getContents());
  }

  useEffect(() => {
    atValues = tags;
  }, [tags]);

  return (
      <ReactQuill
        modules={modules}
        formats={formats}
        value={commentInput}
        ref={editor}
        placeholder={`Write something...`}
        onKeyDown={(e) => {
          // console.log(args);
          const {
            shiftKey,
            ctrlKey,
            code
          } = e;
          // console.log(code, shiftKey, ctrlKey, mentionsOpen);
          if ((code === 'Enter' || code === 'NumpadEnter') && !shiftKey && !ctrlKey && !mentionsOpen) {
            const html = editor.current.getEditor().root.innerHTML;
            handleChange('\n');
            const $ = cheerio.load(html);
            const mentions = [];
            $('span.mention').each(function() {
                // console.log($(this).text()) // for testing do text()
                // console.log($(this).data('value'));
                const exists = mentions.filter((m) => m.id === $(this).data('id'));
                if (exists.length > 0) {
                  return;
                }
                mentions.push({
                  _id: $(this).data('id'),
                  name: $(this).data('value')
                });

                $(this).replaceWith($(`<span data-mention-id="${$(this).data('id')}" data-mention-name="${$(this).data('value')}">@${$(this).data('value')}</span>`))
            });
            $('img.ql-emoji').each(function() {
                // console.log($(this).text()) // for testing do text()
                // console.log($(this).data('value'));
                const alt = $(this).attr('alt');
                $(this).replaceWith($(`<span>${alt}</span>`));
            });
            // console.log('Filtered HTML', $('body').html());
            const filteredHtml = $('body').html();
            const markDown = NodeHtmlMarkdown.translate(filteredHtml);
            // console.log(html);
            // console.log(filteredHtml);
            // console.log('markDown', markDown);
            const newMessage = {
              html: filteredHtml,
              markDown,
              mentions
            };
            // console.log(JSON.stringify(result));
            if (onSubmit) {
              // editor.current.getEditor().enable(false);
              setImmediate(() => {
                onSubmit(newMessage)
              });
                // .then(
                //   (result) => {
                //     console.log('Message sent in editor', result);
                //   }
                // )
                // .then(
                //   () => {

                //     // editor.current.getEditor().enable(true);
                //   }
                // )
            }
          }
        }}
        onChange={handleChange}
      />
  );
}
