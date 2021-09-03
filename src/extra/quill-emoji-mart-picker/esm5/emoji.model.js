import { __assign, __read, __spread, __values } from "tslib";
import unicodeRe from 'emoji-regex';
import Quill from 'quill';
var Delta = Quill.import('delta');
var Emoji = /** @class */ (function () {
    function Emoji() {
    }
    Emoji.toCodePoint = function (unicodeSurrogates, sep) {
        var r = [];
        var c = 0;
        var p = 0;
        var i = 0;
        while (i < unicodeSurrogates.length) {
            c = unicodeSurrogates.charCodeAt(i++);
            if (p) {
                // tslint:disable-next-line:no-bitwise
                r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
                p = 0;
            }
            else if (0xD800 <= c && c <= 0xDBFF) {
                p = c;
            }
            else {
                r.push(c.toString(16));
            }
        }
        return r.join(sep || '-');
    };
    Emoji.unicodeToEmoji = function (unicode) {
        return Emoji.getEmojiDataFromUnified(Emoji.toCodePoint(unicode));
    };
    Emoji.emoticonToEmoji = function (emoticon) {
        return Emoji.getEmojiDataFromEmoticon(emoticon);
    };
    Emoji.shortNameToEmoji = function (shortName) {
        return Emoji.getEmojiDataFromShortName(shortName);
    };
    Emoji.getEmojiDataFromUnified = function (unified) {
        var emoji = Emoji.unified[unified.toUpperCase()];
        return emoji ? emoji : null;
    };
    Emoji.getEmojiDataFromEmoticon = function (emoticon) {
        var emoji = Emoji.emoticons[emoticon];
        return emoji ? emoji : null;
    };
    Emoji.getEmojiDataFromShortName = function (shortName) {
        var emoji = Emoji.shortNames[shortName.toLowerCase()];
        return emoji ? emoji : null;
    };
    Emoji.uncompress = function (list, options) {
        var e_1, _a;
        list.map(function (emoji) {
            var e_2, _a, e_3, _b, e_4, _c;
            var emojiRef = Emoji.unified[emoji.unified] = {
                unified: emoji.unified,
                id: emoji.shortName,
                sheet: emoji.sheet,
                emoticons: emoji.emoticons
            };
            Emoji.shortNames[emoji.shortName] = emojiRef;
            // Additional shortNames
            if (emoji.shortNames) {
                try {
                    for (var _d = __values(emoji.shortNames), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var d = _e.value;
                        Emoji.shortNames[d] = emojiRef;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (options.convertEmoticons && emoji.emoticons) {
                try {
                    for (var _f = __values(emoji.emoticons), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var d = _g.value;
                        Emoji.emoticons[d] = emojiRef;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            if (emoji.skinVariations) {
                try {
                    for (var _h = __values(emoji.skinVariations), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var d = _j.value;
                        Emoji.unified[d.unified] = {
                            unified: d.unified,
                            id: emojiRef.id,
                            sheet: d.sheet,
                            emoticons: emojiRef.emoticons
                        };
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        });
        if (options.customEmojiData) {
            try {
                for (var _b = __values(options.customEmojiData), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var customEmoji = _c.value;
                    if (customEmoji.shortNames) {
                        customEmoji = __assign(__assign({}, customEmoji), { id: customEmoji.shortNames[0] });
                        Emoji.shortNames[customEmoji.id] = customEmoji;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    Emoji.unifiedToNative = function (unified) {
        var codePoints = unified.split('-').map(function (u) { return parseInt("0x" + u, 16); });
        return String.fromCodePoint.apply(String, __spread(codePoints));
    };
    Emoji.emojiSpriteStyles = function (sheet, set, backgroundImageFn, size, sheetSize, sheetColumns) {
        if (size === void 0) { size = 24; }
        if (sheetSize === void 0) { sheetSize = 64; }
        if (sheetColumns === void 0) { sheetColumns = 52; }
        return {
            width: size + "px",
            height: size + "px",
            display: 'inline-block',
            'background-image': "url(" + backgroundImageFn(set, sheetSize) + ")",
            'background-size': 100 * sheetColumns + "%",
            'background-position': Emoji.getSpritePosition(sheet, sheetColumns),
        };
    };
    Emoji.getSpritePosition = function (sheet, sheetColumns) {
        var _a = __read(sheet, 2), sheetX = _a[0], sheetY = _a[1];
        var multiply = 100 / (sheetColumns - 1);
        return multiply * sheetX + "% " + multiply * sheetY + "%";
    };
    Emoji.toHex = function (str) {
        var hex;
        var result = '';
        for (var i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ('000' + hex).slice(-4);
        }
        return result;
    };
    Emoji.buildImage = function (emoji, node, set, options) {
        if (typeof emoji === 'string') {
            var unicodeRegex = unicodeRe();
            if (unicodeRegex.test(emoji)) {
                emoji = Emoji.unicodeToEmoji(emoji);
            }
            else {
                var shortNameRegex = new RegExp(Emoji.shortNameRe);
                var match = shortNameRegex.exec(emoji);
                if (match && match.length > 1) {
                    emoji = Emoji.shortNameToEmoji(match[1]);
                }
            }
        }
        if (emoji && typeof emoji === 'object') {
            node.classList.add(Emoji.emojiPrefix + emoji.id);
            // Custom image
            if (emoji.imageUrl) {
                node.classList.add(Emoji.emojiPrefix + 'custom');
                node.style.backgroundImage = "url(\"" + emoji.imageUrl + "\")";
                node.style.backgroundSize = 'contain';
            }
            else {
                // Using a sprite
                var style = null;
                // Default emoji using a set
                if (emoji.sheet) {
                    style = Emoji.emojiSpriteStyles(emoji.sheet, set, options.backgroundImageFn);
                }
                else if (emoji.spriteUrl) { // Emoji using a sprite URL
                    node.classList.add(Emoji.emojiPrefix + 'custom');
                    style = Emoji.emojiSpriteStyles([emoji.sheet_x, emoji.sheet_y], '', function () { return emoji.spriteUrl; }, 24, emoji.size, emoji.sheetColumns);
                }
                if (style) {
                    node.style.display = 'inline-block';
                    node.style.backgroundImage = style['background-image'];
                    node.style.backgroundSize = style['background-size'];
                    node.style.backgroundPosition = style['background-position'];
                }
            }
            node.style.fontSize = 'inherit';
            node.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
            node.setAttribute('draggable', 'false');
            if (emoji.unified) {
                var native = Emoji.unifiedToNative(emoji.unified);
                node.setAttribute('alt', native);
            }
            else {
                node.setAttribute('alt', options.indicator + emoji.id + options.indicator);
            }
            if (options.showTitle) {
                var emoticons = emoji.emoticons;
                var title = '';
                if (options.convertEmoticons && emoticons && emoticons.length > 0) {
                    title = emoticons[0] + '\u2002,\u2002';
                }
                title += options.indicator + emoji.id + options.indicator;
                node.setAttribute('title', title);
            }
        }
        return node;
    };
    Emoji.convertInput = function (delta, replacements) {
        var changes = new Delta();
        var position = 0;
        delta.ops.forEach(function (op) {
            var e_5, _a;
            if (op.insert) {
                if (typeof op.insert === 'object') {
                    position++;
                }
                else if (typeof op.insert === 'string') {
                    var text = op.insert;
                    var emojiText = '';
                    var index = void 0;
                    try {
                        for (var replacements_1 = __values(replacements), replacements_1_1 = replacements_1.next(); !replacements_1_1.done; replacements_1_1 = replacements_1.next()) {
                            var replacement = replacements_1_1.value;
                            // tslint:disable-next-line: no-conditional-assignment
                            while ((replacement.match = replacement.regex.exec(text))) {
                                // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                                index = replacement.match.index + (replacement.match[0].length - replacement.match[replacement.replacementIndex].length);
                                emojiText = replacement.match[replacement.matchIndex];
                                var emoji = replacement.fn(emojiText);
                                var changeIndex = position + index;
                                if (changeIndex > 0) {
                                    changes.retain(changeIndex);
                                }
                                changes.delete(replacement.match[replacement.replacementIndex].length);
                                if (emoji) {
                                    changes.insert({ emoji: emoji });
                                }
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (replacements_1_1 && !replacements_1_1.done && (_a = replacements_1.return)) _a.call(replacements_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    position += op.insert.length;
                }
            }
        });
        return changes;
    };
    Emoji.convertPaste = function (delta, replacements) {
        var e_6, _a;
        var changes = new Delta();
        var op = null;
        // Matchers are called recursively, so iterating is not necessary
        if (delta) {
            op = delta.ops[0];
        }
        if (op && op.insert && typeof op.insert === 'string') {
            var text = op.insert;
            var emojiText = '';
            var currentReplacement = null;
            var index = 0;
            var i = 0;
            do {
                // Getting our first match
                var tempReplacement = null;
                try {
                    for (var replacements_2 = (e_6 = void 0, __values(replacements)), replacements_2_1 = replacements_2.next(); !replacements_2_1.done; replacements_2_1 = replacements_2.next()) {
                        var replacement = replacements_2_1.value;
                        // Select the first match in the replacements array
                        if (replacement.match === undefined || currentReplacement === replacement) {
                            replacement.match = replacement.regex.exec(text);
                        }
                        if (replacement.match) {
                            if (!tempReplacement || !tempReplacement.match ||
                                (replacement.match.index < tempReplacement.match.index)) {
                                tempReplacement = replacement;
                            }
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (replacements_2_1 && !replacements_2_1.done && (_a = replacements_2.return)) _a.call(replacements_2);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                currentReplacement = tempReplacement;
                if (currentReplacement && currentReplacement.match) {
                    // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                    index = currentReplacement.match.index +
                        (currentReplacement.match[0].length - currentReplacement.match[currentReplacement.replacementIndex].length);
                    if (index !== i) {
                        changes.insert(text.slice(i, index));
                    }
                    emojiText = currentReplacement.match[currentReplacement.matchIndex];
                    var emoji = currentReplacement.fn(emojiText);
                    if (emoji) {
                        changes.insert({ emoji: emoji });
                    }
                    i = index + currentReplacement.match[currentReplacement.replacementIndex].length;
                }
            } while (currentReplacement && currentReplacement.match);
            // Check if there is text left
            if (i < text.length) {
                changes.insert(text.slice(i));
            }
        }
        return changes;
    };
    Emoji.insertEmoji = function (quill, event) {
        if (quill && quill.isEnabled()) {
            var range = quill.getSelection(true);
            var delta = new Delta().retain(range.index).delete(range.length).insert({ emoji: event.emoji });
            // Using silent to not trigger text-change, but checking if the editor is enabled
            quill.updateContents(delta, Quill.sources.SILENT);
            quill.setSelection(++range.index, 0, Quill.sources.SILENT);
        }
    };
    Emoji.unified = {};
    Emoji.emoticons = {};
    Emoji.shortNames = {};
    Emoji.emojiPrefix = 'qle-';
    // tslint:disable-next-line: max-line-length
    Emoji.emoticonRe = "(?:\\s|^)((?:8\\))|(?:\\(:)|(?:\\):)|(?::'\\()|(?::\\()|(?::\\))|(?::\\*)|(?::-\\()|(?::-\\))|(?::-\\*)|(?::-/)|(?::->)|(?::-D)|(?::-O)|(?::-P)|(?::-\\\\)|(?::-b)|(?::-o)|(?::-p)|(?::-\\|)|(?::/)|(?::>)|(?::D)|(?::O)|(?::P)|(?::\\\\)|(?::b)|(?::o)|(?::p)|(?::\\|)|(?:;\\))|(?:;-\\))|(?:;-P)|(?:;-b)|(?:;-p)|(?:;P)|(?:;b)|(?:;p)|(?:<3)|(?:</3)|(?:=\\))|(?:=-\\))|(?:>:\\()|(?:>:-\\()|(?:C:)|(?:D:)|(?:c:))(?=\\s|$)";
    Emoji.shortNameRe = '(?:[^\\*]|^)(\\*([a-z0-9_\\-\\+]+)\\*)(?!\\*)';
    return Emoji;
}());
export { Emoji };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkubW9kZWwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AbnV0cmlmeS9xdWlsbC1lbW9qaS1tYXJ0LXBpY2tlci8iLCJzb3VyY2VzIjpbImVtb2ppLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBSTFCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUE2RHBDO0lBQUE7SUEwWUEsQ0FBQztJQTlYUSxpQkFBVyxHQUFsQixVQUFtQixpQkFBeUIsRUFBRSxHQUFZO1FBRXhELElBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNuQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsc0NBQXNDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNQO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDeEI7U0FDRjtRQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLG9CQUFjLEdBQXJCLFVBQXNCLE9BQWU7UUFDbkMsT0FBTyxLQUFLLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFTSxxQkFBZSxHQUF0QixVQUF1QixRQUFnQjtRQUNyQyxPQUFPLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sc0JBQWdCLEdBQXZCLFVBQXdCLFNBQWlCO1FBQ3ZDLE9BQU8sS0FBSyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSw2QkFBdUIsR0FBOUIsVUFBK0IsT0FBZTtRQUU1QyxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRU0sOEJBQXdCLEdBQS9CLFVBQWdDLFFBQWdCO1FBRTlDLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFeEMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFFTSwrQkFBeUIsR0FBaEMsVUFBaUMsU0FBaUI7UUFFaEQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV4RCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVNLGdCQUFVLEdBQWpCLFVBQWtCLElBQTJCLEVBQUUsT0FBMkI7O1FBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLOztZQUVaLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHO2dCQUM5QyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLEVBQUUsRUFBRSxLQUFLLENBQUMsU0FBUztnQkFDbkIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO2dCQUNsQixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7YUFDM0IsQ0FBQztZQUVGLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUU3Qyx3QkFBd0I7WUFDeEIsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFOztvQkFDcEIsS0FBZ0IsSUFBQSxLQUFBLFNBQUEsS0FBSyxDQUFDLFVBQVUsQ0FBQSxnQkFBQSw0QkFBRTt3QkFBN0IsSUFBTSxDQUFDLFdBQUE7d0JBQ1YsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7cUJBQ2hDOzs7Ozs7Ozs7YUFDRjtZQUVELElBQUksT0FBTyxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7O29CQUMvQyxLQUFnQixJQUFBLEtBQUEsU0FBQSxLQUFLLENBQUMsU0FBUyxDQUFBLGdCQUFBLDRCQUFFO3dCQUE1QixJQUFNLENBQUMsV0FBQTt3QkFDVixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztxQkFDL0I7Ozs7Ozs7OzthQUNGO1lBRUQsSUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFOztvQkFDeEIsS0FBZ0IsSUFBQSxLQUFBLFNBQUEsS0FBSyxDQUFDLGNBQWMsQ0FBQSxnQkFBQSw0QkFBRTt3QkFBakMsSUFBTSxDQUFDLFdBQUE7d0JBQ1YsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUc7NEJBQ3pCLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTzs0QkFDbEIsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFOzRCQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSzs0QkFDZCxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7eUJBQzlCLENBQUM7cUJBQ0g7Ozs7Ozs7OzthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUU7O2dCQUMzQixLQUF3QixJQUFBLEtBQUEsU0FBQSxPQUFPLENBQUMsZUFBZSxDQUFBLGdCQUFBLDRCQUFFO29CQUE1QyxJQUFJLFdBQVcsV0FBQTtvQkFDbEIsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFO3dCQUMxQixXQUFXLHlCQUFRLFdBQVcsS0FBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDO3dCQUNoRSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUM7cUJBQ2hEO2lCQUNGOzs7Ozs7Ozs7U0FDRjtJQUNILENBQUM7SUFFTSxxQkFBZSxHQUF0QixVQUF1QixPQUFlO1FBQ3BDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsUUFBUSxDQUFDLE9BQUssQ0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDdkUsT0FBTyxNQUFNLENBQUMsYUFBYSxPQUFwQixNQUFNLFdBQWtCLFVBQVUsR0FBRTtJQUM3QyxDQUFDO0lBRU0sdUJBQWlCLEdBQXhCLFVBQ0UsS0FBMEIsRUFDMUIsR0FBa0IsRUFDbEIsaUJBQTZELEVBQzdELElBQWlCLEVBQ2pCLFNBQWlDLEVBQ2pDLFlBQWlCO1FBRmpCLHFCQUFBLEVBQUEsU0FBaUI7UUFDakIsMEJBQUEsRUFBQSxjQUFpQztRQUNqQyw2QkFBQSxFQUFBLGlCQUFpQjtRQUdqQixPQUFPO1lBQ0wsS0FBSyxFQUFLLElBQUksT0FBSTtZQUNsQixNQUFNLEVBQUssSUFBSSxPQUFJO1lBQ25CLE9BQU8sRUFBRSxjQUFjO1lBQ3ZCLGtCQUFrQixFQUFFLFNBQU8saUJBQWlCLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxNQUFHO1lBQy9ELGlCQUFpQixFQUFLLEdBQUcsR0FBRyxZQUFZLE1BQUc7WUFDM0MscUJBQXFCLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7U0FDcEUsQ0FBQztJQUNKLENBQUM7SUFFTSx1QkFBaUIsR0FBeEIsVUFBeUIsS0FBMEIsRUFBRSxZQUFvQjtRQUNqRSxJQUFBLHFCQUF3QixFQUF2QixjQUFNLEVBQUUsY0FBZSxDQUFDO1FBQy9CLElBQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxPQUFVLFFBQVEsR0FBRyxNQUFNLFVBQUssUUFBUSxHQUFHLE1BQU0sTUFBRyxDQUFDO0lBQ3ZELENBQUM7SUFFTSxXQUFLLEdBQVosVUFBYSxHQUFXO1FBQ3RCLElBQUksR0FBVyxDQUFDO1FBQ2hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVNLGdCQUFVLEdBQWpCLFVBQ0UsS0FBc0IsRUFDdEIsSUFBaUIsRUFDakIsR0FBYSxFQUNiLE9BQTJCO1FBRzNCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBRTdCLElBQU0sWUFBWSxHQUFHLFNBQVMsRUFBRSxDQUFDO1lBRWpDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFFNUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7YUFFckM7aUJBQU07Z0JBRUwsSUFBTSxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRCxJQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDN0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDMUM7YUFDRjtTQUNGO1FBRUQsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBRXRDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWpELGVBQWU7WUFDZixJQUFLLEtBQStCLENBQUMsUUFBUSxFQUFFO2dCQUU3QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxDQUFDO2dCQUVqRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxXQUFTLEtBQStCLENBQUMsUUFBUSxRQUFJLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQzthQUN2QztpQkFBTTtnQkFFTCxpQkFBaUI7Z0JBQ2pCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFakIsNEJBQTRCO2dCQUM1QixJQUFLLEtBQW9CLENBQUMsS0FBSyxFQUFFO29CQUUvQixLQUFLLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFFLEtBQW9CLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFFOUY7cUJBQU0sSUFBSyxLQUFnQyxDQUFDLFNBQVMsRUFBRSxFQUFFLDJCQUEyQjtvQkFFbkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQztvQkFFakQsS0FBSyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FDN0IsQ0FBRSxLQUFnQyxDQUFDLE9BQU8sRUFBRyxLQUFnQyxDQUFDLE9BQU8sQ0FBQyxFQUN0RixFQUFFLEVBQ0YsY0FBTSxPQUFDLEtBQWdDLENBQUMsU0FBUyxFQUEzQyxDQUEyQyxFQUNqRCxFQUFFLEVBQ0QsS0FBZ0MsQ0FBQyxJQUFJLEVBQ3JDLEtBQWdDLENBQUMsWUFBWSxDQUMvQyxDQUFDO2lCQUNIO2dCQUVELElBQUksS0FBSyxFQUFFO29CQUNULElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUM5RDthQUVGO1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBRWhDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGdGQUFnRixDQUFDLENBQUM7WUFDM0csSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFeEMsSUFBSyxLQUFvQixDQUFDLE9BQU8sRUFBRTtnQkFDakMsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBRSxLQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNsQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzVFO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUNyQixJQUFNLFNBQVMsR0FBSSxLQUFvQixDQUFDLFNBQVMsQ0FBQztnQkFFbEQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUVmLElBQUksT0FBTyxDQUFDLGdCQUFnQixJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDakUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUM7aUJBQ3hDO2dCQUVELEtBQUssSUFBSSxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFFMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbkM7U0FFRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVNLGtCQUFZLEdBQW5CLFVBQW9CLEtBQVUsRUFBRSxZQUErQjtRQUU3RCxJQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBRTVCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUVqQixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQU87O1lBRXhCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTtnQkFFYixJQUFJLE9BQU8sRUFBRSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7b0JBQ2pDLFFBQVEsRUFBRSxDQUFDO2lCQUNaO3FCQUFNLElBQUksT0FBTyxFQUFFLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBRTtvQkFFeEMsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztvQkFFdkIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO29CQUNuQixJQUFJLEtBQUssU0FBUSxDQUFDOzt3QkFFbEIsS0FBMEIsSUFBQSxpQkFBQSxTQUFBLFlBQVksQ0FBQSwwQ0FBQSxvRUFBRTs0QkFBbkMsSUFBTSxXQUFXLHlCQUFBOzRCQUVwQixzREFBc0Q7NEJBQ3RELE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0NBRXpELHVHQUF1RztnQ0FDdkcsS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FFekgsU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dDQUV0RCxJQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dDQUV4QyxJQUFNLFdBQVcsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dDQUVyQyxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUU7b0NBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7aUNBQzNCO2dDQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FFdkUsSUFBSSxLQUFLLEVBQUU7b0NBQ1QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsQ0FBQztpQ0FDM0I7NkJBQ0Y7eUJBQ0Y7Ozs7Ozs7OztvQkFFRCxRQUFRLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7aUJBQzlCO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxrQkFBWSxHQUFuQixVQUFvQixLQUFVLEVBQUUsWUFBK0I7O1FBRTdELElBQU0sT0FBTyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7UUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWQsaUVBQWlFO1FBQ2pFLElBQUksS0FBSyxFQUFFO1lBQ1QsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkI7UUFFRCxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFFcEQsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUV2QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxrQkFBa0IsR0FBbUIsSUFBSSxDQUFDO1lBQzlDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVkLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVWLEdBQUc7Z0JBQ0QsMEJBQTBCO2dCQUMxQixJQUFJLGVBQWUsR0FBbUIsSUFBSSxDQUFDOztvQkFDM0MsS0FBMEIsSUFBQSxnQ0FBQSxTQUFBLFlBQVksQ0FBQSxDQUFBLDBDQUFBLG9FQUFFO3dCQUFuQyxJQUFNLFdBQVcseUJBQUE7d0JBRXBCLG1EQUFtRDt3QkFDbkQsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxrQkFBa0IsS0FBSyxXQUFXLEVBQUU7NEJBQ3pFLFdBQVcsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ2xEO3dCQUVELElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTs0QkFFckIsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLO2dDQUMxQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQ3REO2dDQUNELGVBQWUsR0FBRyxXQUFXLENBQUM7NkJBQ2pDO3lCQUNGO3FCQUNGOzs7Ozs7Ozs7Z0JBRUQsa0JBQWtCLEdBQUcsZUFBZSxDQUFDO2dCQUVyQyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtvQkFFbEQsdUdBQXVHO29CQUN2RyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEtBQUs7d0JBQ3RDLENBQ0Usa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQzFHLENBQUM7b0JBRUYsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO3dCQUNmLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztxQkFDdEM7b0JBRUQsU0FBUyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEUsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUUvQyxJQUFJLEtBQUssRUFBRTt3QkFDVCxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDO3FCQUMzQjtvQkFFRCxDQUFDLEdBQUcsS0FBSyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztpQkFDbEY7YUFDRixRQUFRLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtZQUV6RCw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0I7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxpQkFBVyxHQUFsQixVQUFtQixLQUFVLEVBQUUsS0FBVTtRQUN2QyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFFOUIsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV2QyxJQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFbEcsaUZBQWlGO1lBQ2pGLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDO0lBdllNLGFBQU8sR0FBOEIsRUFBRSxDQUFDO0lBQ3hDLGVBQVMsR0FBOEIsRUFBRSxDQUFDO0lBQzFDLGdCQUFVLEdBQThCLEVBQUUsQ0FBQztJQUUzQyxpQkFBVyxHQUFHLE1BQU0sQ0FBQztJQUU1Qiw0Q0FBNEM7SUFDckMsZ0JBQVUsR0FBRywrWkFBK1osQ0FBQztJQUM3YSxpQkFBVyxHQUFHLCtDQUErQyxDQUFDO0lBZ1l2RSxZQUFDO0NBQUEsQUExWUQsSUEwWUM7U0ExWVksS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmljb2RlUmUgZnJvbSAnZW1vamktcmVnZXgnO1xuaW1wb3J0IFF1aWxsIGZyb20gJ3F1aWxsJztcblxuaW1wb3J0IHsgRW1vamlNb2R1bGVPcHRpb25zLCBFbW9qaVNldCB9IGZyb20gJy4vZW1vamkucXVpbGwtbW9kdWxlJztcblxuY29uc3QgRGVsdGEgPSBRdWlsbC5pbXBvcnQoJ2RlbHRhJyk7XG5cbmV4cG9ydCB0eXBlIElDdXN0b21FbW9qaSA9IElDdXN0b21JbWFnZUVtb2ppVmlldyB8IElDdXN0b21TcHJpdGVFbW9qaVZpZXc7XG5leHBvcnQgdHlwZSBJRW1vamkgPSBJRW1vamlWaWV3IHwgSUN1c3RvbUVtb2ppO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXByZXNzZWRFbW9qaURhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hvcnROYW1lOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGtleXdvcmRzPzogc3RyaW5nW107XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbiAgdGV4dD86IHN0cmluZztcbiAgc2tpblZhcmlhdGlvbnM/OiBFbW9qaVZhcmlhdGlvbltdO1xuICBvYnNvbGV0ZWRCeT86IHN0cmluZztcbiAgb2Jzb2xldGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElFbW9qaVJlcGxhY2VyIHtcbiAgcmVnZXg6IFJlZ0V4cDtcbiAgZm46IChzdHI6IHN0cmluZykgPT4gSUVtb2ppO1xuICBtYXRjaEluZGV4OiBudW1iZXI7XG4gIHJlcGxhY2VtZW50SW5kZXg6IG51bWJlcjsgLy8gV29ya2Fyb3VuZCB0byBzdXBwb3J0IHJlZ2V4IGxvb2thaGVhZCBvbiBhbGwgYnJvd3NlcnNcbiAgbWF0Y2g/OiBSZWdFeHBFeGVjQXJyYXk7XG59XG5cbmV4cG9ydCB0eXBlIElFbW9qaVJlcGxhY2VtZW50ID0gSUVtb2ppUmVwbGFjZXJbXTtcblxuXG5pbnRlcmZhY2UgSUVtb2ppVmlldyB7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGVtb3RpY29ucz86IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgSUN1c3RvbUltYWdlRW1vamlWaWV3IHtcbiAgaWQ6IHN0cmluZztcbiAgaW1hZ2VVcmw6IHN0cmluZztcbiAgc2hvcnROYW1lcz86IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgSUN1c3RvbVNwcml0ZUVtb2ppVmlldyB7XG4gIGlkOiBzdHJpbmc7XG4gIHNwcml0ZVVybDogc3RyaW5nO1xuICBzaGVldF94OiBudW1iZXI7XG4gIHNoZWV0X3k6IG51bWJlcjtcbiAgc2l6ZTogMTYgfCAyMCB8IDMyIHwgNjQ7XG4gIHNoZWV0Q29sdW1uczogbnVtYmVyO1xuICBzaGVldFJvd3M/OiBudW1iZXI7IC8vIE5vdCByZWFsbHkgbmVjZXNzYXJ5XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIEVtb2ppVmFyaWF0aW9uIHtcbiAgdW5pZmllZDogc3RyaW5nO1xuICBzaGVldDogW251bWJlciwgbnVtYmVyXTtcbiAgaGlkZGVuPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBFbW9qaSB7XG5cbiAgc3RhdGljIHVuaWZpZWQ6IHsgW2tleTogc3RyaW5nXTogSUVtb2ppIH0gPSB7fTtcbiAgc3RhdGljIGVtb3RpY29uczogeyBba2V5OiBzdHJpbmddOiBJRW1vamkgfSA9IHt9O1xuICBzdGF0aWMgc2hvcnROYW1lczogeyBba2V5OiBzdHJpbmddOiBJRW1vamkgfSA9IHt9O1xuXG4gIHN0YXRpYyBlbW9qaVByZWZpeCA9ICdxbGUtJztcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1saW5lLWxlbmd0aFxuICBzdGF0aWMgZW1vdGljb25SZSA9IGAoPzpcXFxcc3xeKSgoPzo4XFxcXCkpfCg/OlxcXFwoOil8KD86XFxcXCk6KXwoPzo6J1xcXFwoKXwoPzo6XFxcXCgpfCg/OjpcXFxcKSl8KD86OlxcXFwqKXwoPzo6LVxcXFwoKXwoPzo6LVxcXFwpKXwoPzo6LVxcXFwqKXwoPzo6LS8pfCg/OjotPil8KD86Oi1EKXwoPzo6LU8pfCg/OjotUCl8KD86Oi1cXFxcXFxcXCl8KD86Oi1iKXwoPzo6LW8pfCg/OjotcCl8KD86Oi1cXFxcfCl8KD86Oi8pfCg/Ojo+KXwoPzo6RCl8KD86Ok8pfCg/OjpQKXwoPzo6XFxcXFxcXFwpfCg/OjpiKXwoPzo6byl8KD86OnApfCg/OjpcXFxcfCl8KD86O1xcXFwpKXwoPzo7LVxcXFwpKXwoPzo7LVApfCg/OjstYil8KD86Oy1wKXwoPzo7UCl8KD86O2IpfCg/OjtwKXwoPzo8Myl8KD86PC8zKXwoPzo9XFxcXCkpfCg/Oj0tXFxcXCkpfCg/Oj46XFxcXCgpfCg/Oj46LVxcXFwoKXwoPzpDOil8KD86RDopfCg/OmM6KSkoPz1cXFxcc3wkKWA7XG4gIHN0YXRpYyBzaG9ydE5hbWVSZSA9ICcoPzpbXlxcXFwqXXxeKShcXFxcKihbYS16MC05X1xcXFwtXFxcXCtdKylcXFxcKikoPyFcXFxcKiknO1xuXG4gIHN0YXRpYyB0b0NvZGVQb2ludCh1bmljb2RlU3Vycm9nYXRlczogc3RyaW5nLCBzZXA/OiBzdHJpbmcpIHtcblxuICAgIGNvbnN0IHIgPSBbXTtcbiAgICBsZXQgYyA9IDA7XG4gICAgbGV0IHAgPSAwO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgdW5pY29kZVN1cnJvZ2F0ZXMubGVuZ3RoKSB7XG4gICAgICBjID0gdW5pY29kZVN1cnJvZ2F0ZXMuY2hhckNvZGVBdChpKyspO1xuICAgICAgaWYgKHApIHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgICAgICAgci5wdXNoKCgweDEwMDAwICsgKChwIC0gMHhEODAwKSA8PCAxMCkgKyAoYyAtIDB4REMwMCkpLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgIHAgPSAwO1xuICAgICAgfSBlbHNlIGlmICgweEQ4MDAgPD0gYyAmJiBjIDw9IDB4REJGRikge1xuICAgICAgICBwID0gYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHIucHVzaChjLnRvU3RyaW5nKDE2KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHIuam9pbihzZXAgfHwgJy0nKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmljb2RlVG9FbW9qaSh1bmljb2RlOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tVW5pZmllZChFbW9qaS50b0NvZGVQb2ludCh1bmljb2RlKSk7XG4gIH1cblxuICBzdGF0aWMgZW1vdGljb25Ub0Vtb2ppKGVtb3RpY29uOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb24pO1xuICB9XG5cbiAgc3RhdGljIHNob3J0TmFtZVRvRW1vamkoc2hvcnROYW1lOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tU2hvcnROYW1lKHNob3J0TmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW1vamlEYXRhRnJvbVVuaWZpZWQodW5pZmllZDogc3RyaW5nKTogSUVtb2ppIHtcblxuICAgIGNvbnN0IGVtb2ppID0gRW1vamkudW5pZmllZFt1bmlmaWVkLnRvVXBwZXJDYXNlKCldO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIGdldEVtb2ppRGF0YUZyb21FbW90aWNvbihlbW90aWNvbjogc3RyaW5nKTogSUVtb2ppIHtcblxuICAgIGNvbnN0IGVtb2ppID0gRW1vamkuZW1vdGljb25zW2Vtb3RpY29uXTtcblxuICAgIHJldHVybiBlbW9qaSA/IGVtb2ppIDogbnVsbDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFbW9qaURhdGFGcm9tU2hvcnROYW1lKHNob3J0TmFtZTogc3RyaW5nKTogSUVtb2ppIHtcblxuICAgIGNvbnN0IGVtb2ppID0gRW1vamkuc2hvcnROYW1lc1tzaG9ydE5hbWUudG9Mb3dlckNhc2UoKV07XG5cbiAgICByZXR1cm4gZW1vamkgPyBlbW9qaSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgdW5jb21wcmVzcyhsaXN0OiBDb21wcmVzc2VkRW1vamlEYXRhW10sIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIGxpc3QubWFwKGVtb2ppID0+IHtcblxuICAgICAgY29uc3QgZW1vamlSZWYgPSBFbW9qaS51bmlmaWVkW2Vtb2ppLnVuaWZpZWRdID0ge1xuICAgICAgICB1bmlmaWVkOiBlbW9qaS51bmlmaWVkLFxuICAgICAgICBpZDogZW1vamkuc2hvcnROYW1lLFxuICAgICAgICBzaGVldDogZW1vamkuc2hlZXQsXG4gICAgICAgIGVtb3RpY29uczogZW1vamkuZW1vdGljb25zXG4gICAgICB9O1xuXG4gICAgICBFbW9qaS5zaG9ydE5hbWVzW2Vtb2ppLnNob3J0TmFtZV0gPSBlbW9qaVJlZjtcblxuICAgICAgLy8gQWRkaXRpb25hbCBzaG9ydE5hbWVzXG4gICAgICBpZiAoZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIEVtb2ppLnNob3J0TmFtZXNbZF0gPSBlbW9qaVJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb252ZXJ0RW1vdGljb25zICYmIGVtb2ppLmVtb3RpY29ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuZW1vdGljb25zKSB7XG4gICAgICAgICAgRW1vamkuZW1vdGljb25zW2RdID0gZW1vamlSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtb2ppLnNraW5WYXJpYXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBlbW9qaS5za2luVmFyaWF0aW9ucykge1xuICAgICAgICAgIEVtb2ppLnVuaWZpZWRbZC51bmlmaWVkXSA9IHtcbiAgICAgICAgICAgIHVuaWZpZWQ6IGQudW5pZmllZCxcbiAgICAgICAgICAgIGlkOiBlbW9qaVJlZi5pZCxcbiAgICAgICAgICAgIHNoZWV0OiBkLnNoZWV0LFxuICAgICAgICAgICAgZW1vdGljb25zOiBlbW9qaVJlZi5lbW90aWNvbnNcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5jdXN0b21FbW9qaURhdGEpIHtcbiAgICAgIGZvciAobGV0IGN1c3RvbUVtb2ppIG9mIG9wdGlvbnMuY3VzdG9tRW1vamlEYXRhKSB7XG4gICAgICAgIGlmIChjdXN0b21FbW9qaS5zaG9ydE5hbWVzKSB7XG4gICAgICAgICAgY3VzdG9tRW1vamkgPSB7IC4uLmN1c3RvbUVtb2ppLCBpZDogY3VzdG9tRW1vamkuc2hvcnROYW1lc1swXSB9O1xuICAgICAgICAgIEVtb2ppLnNob3J0TmFtZXNbY3VzdG9tRW1vamkuaWRdID0gY3VzdG9tRW1vamk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdW5pZmllZFRvTmF0aXZlKHVuaWZpZWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGNvZGVQb2ludHMgPSB1bmlmaWVkLnNwbGl0KCctJykubWFwKHUgPT4gcGFyc2VJbnQoYDB4JHt1fWAsIDE2KSk7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpO1xuICB9XG5cbiAgc3RhdGljIGVtb2ppU3ByaXRlU3R5bGVzKFxuICAgIHNoZWV0OiBJRW1vamlWaWV3WydzaGVldCddLFxuICAgIHNldDogRW1vamlTZXQgfCAnJyxcbiAgICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nLFxuICAgIHNpemU6IG51bWJlciA9IDI0LFxuICAgIHNoZWV0U2l6ZTogMTYgfCAyMCB8IDMyIHwgNjQgPSA2NCxcbiAgICBzaGVldENvbHVtbnMgPSA1MlxuICAgICkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiBgJHtzaXplfXB4YCxcbiAgICAgIGhlaWdodDogYCR7c2l6ZX1weGAsXG4gICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke2JhY2tncm91bmRJbWFnZUZuKHNldCwgc2hlZXRTaXplKX0pYCxcbiAgICAgICdiYWNrZ3JvdW5kLXNpemUnOiBgJHsxMDAgKiBzaGVldENvbHVtbnN9JWAsXG4gICAgICAnYmFja2dyb3VuZC1wb3NpdGlvbic6IEVtb2ppLmdldFNwcml0ZVBvc2l0aW9uKHNoZWV0LCBzaGVldENvbHVtbnMpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0U3ByaXRlUG9zaXRpb24oc2hlZXQ6IElFbW9qaVZpZXdbJ3NoZWV0J10sIHNoZWV0Q29sdW1uczogbnVtYmVyKSB7XG4gICAgY29uc3QgW3NoZWV0WCwgc2hlZXRZXSA9IHNoZWV0O1xuICAgIGNvbnN0IG11bHRpcGx5ID0gMTAwIC8gKHNoZWV0Q29sdW1ucyAtIDEpO1xuICAgIHJldHVybiBgJHttdWx0aXBseSAqIHNoZWV0WH0lICR7bXVsdGlwbHkgKiBzaGVldFl9JWA7XG4gIH1cblxuICBzdGF0aWMgdG9IZXgoc3RyOiBzdHJpbmcpIHtcbiAgICBsZXQgaGV4OiBzdHJpbmc7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4ID0gc3RyLmNoYXJDb2RlQXQoaSkudG9TdHJpbmcoMTYpO1xuICAgICAgICByZXN1bHQgKz0gKCcwMDAnICsgaGV4KS5zbGljZSgtNCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBidWlsZEltYWdlKFxuICAgIGVtb2ppOiBzdHJpbmcgfCBJRW1vamksXG4gICAgbm9kZTogSFRNTEVsZW1lbnQsXG4gICAgc2V0OiBFbW9qaVNldCxcbiAgICBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnNcbiAgICApIHtcblxuICAgIGlmICh0eXBlb2YgZW1vamkgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgIGNvbnN0IHVuaWNvZGVSZWdleCA9IHVuaWNvZGVSZSgpO1xuXG4gICAgICBpZiAodW5pY29kZVJlZ2V4LnRlc3QoZW1vamkpKSB7XG5cbiAgICAgICAgZW1vamkgPSBFbW9qaS51bmljb2RlVG9FbW9qaShlbW9qaSk7XG5cbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgY29uc3Qgc2hvcnROYW1lUmVnZXggPSBuZXcgUmVnRXhwKEVtb2ppLnNob3J0TmFtZVJlKTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzaG9ydE5hbWVSZWdleC5leGVjKGVtb2ppKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBlbW9qaSA9IEVtb2ppLnNob3J0TmFtZVRvRW1vamkobWF0Y2hbMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVtb2ppICYmIHR5cGVvZiBlbW9qaSA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKEVtb2ppLmVtb2ppUHJlZml4ICsgZW1vamkuaWQpO1xuXG4gICAgICAvLyBDdXN0b20gaW1hZ2VcbiAgICAgIGlmICgoZW1vamkgYXMgSUN1c3RvbUltYWdlRW1vamlWaWV3KS5pbWFnZVVybCkge1xuXG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArICdjdXN0b20nKTtcblxuICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoXCIkeyhlbW9qaSBhcyBJQ3VzdG9tSW1hZ2VFbW9qaVZpZXcpLmltYWdlVXJsfVwiKWA7XG4gICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnY29udGFpbic7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFVzaW5nIGEgc3ByaXRlXG4gICAgICAgIGxldCBzdHlsZSA9IG51bGw7XG5cbiAgICAgICAgLy8gRGVmYXVsdCBlbW9qaSB1c2luZyBhIHNldFxuICAgICAgICBpZiAoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnNoZWV0KSB7XG5cbiAgICAgICAgICBzdHlsZSA9IEVtb2ppLmVtb2ppU3ByaXRlU3R5bGVzKChlbW9qaSBhcyBJRW1vamlWaWV3KS5zaGVldCwgc2V0LCBvcHRpb25zLmJhY2tncm91bmRJbWFnZUZuKTtcblxuICAgICAgICB9IGVsc2UgaWYgKChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zcHJpdGVVcmwpIHsgLy8gRW1vamkgdXNpbmcgYSBzcHJpdGUgVVJMXG5cbiAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyAnY3VzdG9tJyk7XG5cbiAgICAgICAgICBzdHlsZSA9IEVtb2ppLmVtb2ppU3ByaXRlU3R5bGVzKFxuICAgICAgICAgICAgWyhlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldF94LCAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2hlZXRfeV0sXG4gICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICgpID0+IChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zcHJpdGVVcmwsXG4gICAgICAgICAgICAyNCxcbiAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaXplLFxuICAgICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNoZWV0Q29sdW1uc1xuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IHN0eWxlWydiYWNrZ3JvdW5kLWltYWdlJ107XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IHN0eWxlWydiYWNrZ3JvdW5kLXNpemUnXTtcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9IHN0eWxlWydiYWNrZ3JvdW5kLXBvc2l0aW9uJ107XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBub2RlLnN0eWxlLmZvbnRTaXplID0gJ2luaGVyaXQnO1xuXG4gICAgICBub2RlLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQUFBQUFQLy8veUg1QkFFQUFBQUFMQUFBQUFBQkFBRUFBQUlCUkFBNycpO1xuICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsICdmYWxzZScpO1xuXG4gICAgICBpZiAoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnVuaWZpZWQpIHtcbiAgICAgICAgY29uc3QgbmF0aXZlID0gRW1vamkudW5pZmllZFRvTmF0aXZlKChlbW9qaSBhcyBJRW1vamlWaWV3KS51bmlmaWVkKTtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2FsdCcsIG5hdGl2ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgnYWx0Jywgb3B0aW9ucy5pbmRpY2F0b3IgKyBlbW9qaS5pZCArIG9wdGlvbnMuaW5kaWNhdG9yKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuc2hvd1RpdGxlKSB7XG4gICAgICAgIGNvbnN0IGVtb3RpY29ucyA9IChlbW9qaSBhcyBJRW1vamlWaWV3KS5lbW90aWNvbnM7XG5cbiAgICAgICAgbGV0IHRpdGxlID0gJyc7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY29udmVydEVtb3RpY29ucyAmJiBlbW90aWNvbnMgJiYgZW1vdGljb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aXRsZSA9IGVtb3RpY29uc1swXSArICdcXHUyMDAyLFxcdTIwMDInO1xuICAgICAgICB9XG5cbiAgICAgICAgdGl0bGUgKz0gb3B0aW9ucy5pbmRpY2F0b3IgKyBlbW9qaS5pZCArIG9wdGlvbnMuaW5kaWNhdG9yO1xuXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCd0aXRsZScsIHRpdGxlKTtcbiAgICAgIH1cblxuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHN0YXRpYyBjb252ZXJ0SW5wdXQoZGVsdGE6IGFueSwgcmVwbGFjZW1lbnRzOiBJRW1vamlSZXBsYWNlbWVudCk6IGFueSB7XG5cbiAgICBjb25zdCBjaGFuZ2VzID0gbmV3IERlbHRhKCk7XG5cbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuXG4gICAgZGVsdGEub3BzLmZvckVhY2goKG9wOiBhbnkpID0+IHtcblxuICAgICAgaWYgKG9wLmluc2VydCkge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygb3AuaW5zZXJ0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHBvc2l0aW9uKys7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gJ3N0cmluZycpIHtcblxuICAgICAgICAgIGNvbnN0IHRleHQgPSBvcC5pbnNlcnQ7XG5cbiAgICAgICAgICBsZXQgZW1vamlUZXh0ID0gJyc7XG4gICAgICAgICAgbGV0IGluZGV4OiBudW1iZXI7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50IG9mIHJlcGxhY2VtZW50cykge1xuXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgICAgICAgICAgIHdoaWxlICgocmVwbGFjZW1lbnQubWF0Y2ggPSByZXBsYWNlbWVudC5yZWdleC5leGVjKHRleHQpKSkge1xuXG4gICAgICAgICAgICAgIC8vIFNldHRpbmcgdGhlIGluZGV4IGFuZCB1c2luZyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXRjaGVzIGFzIGEgd29ya2Fyb3VuZCBmb3IgYSBsb29rYWhlYWQgcmVnZXhcbiAgICAgICAgICAgICAgaW5kZXggPSByZXBsYWNlbWVudC5tYXRjaC5pbmRleCArIChyZXBsYWNlbWVudC5tYXRjaFswXS5sZW5ndGggLSByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgIGVtb2ppVGV4dCA9IHJlcGxhY2VtZW50Lm1hdGNoW3JlcGxhY2VtZW50Lm1hdGNoSW5kZXhdO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGVtb2ppID0gcmVwbGFjZW1lbnQuZm4oZW1vamlUZXh0KTtcblxuICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VJbmRleCA9IHBvc2l0aW9uICsgaW5kZXg7XG5cbiAgICAgICAgICAgICAgaWYgKGNoYW5nZUluZGV4ID4gMCkge1xuICAgICAgICAgICAgICBjaGFuZ2VzLnJldGFpbihjaGFuZ2VJbmRleCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjaGFuZ2VzLmRlbGV0ZShyZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgIGlmIChlbW9qaSkge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHsgZW1vamkgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbiArPSBvcC5pbnNlcnQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHN0YXRpYyBjb252ZXJ0UGFzdGUoZGVsdGE6IGFueSwgcmVwbGFjZW1lbnRzOiBJRW1vamlSZXBsYWNlbWVudCk6IGFueSB7XG5cbiAgICBjb25zdCBjaGFuZ2VzID0gbmV3IERlbHRhKCk7XG4gICAgbGV0IG9wID0gbnVsbDtcblxuICAgIC8vIE1hdGNoZXJzIGFyZSBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGl0ZXJhdGluZyBpcyBub3QgbmVjZXNzYXJ5XG4gICAgaWYgKGRlbHRhKSB7XG4gICAgICBvcCA9IGRlbHRhLm9wc1swXTtcbiAgICB9XG5cbiAgICBpZiAob3AgJiYgb3AuaW5zZXJ0ICYmIHR5cGVvZiBvcC5pbnNlcnQgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgIGNvbnN0IHRleHQgPSBvcC5pbnNlcnQ7XG5cbiAgICAgIGxldCBlbW9qaVRleHQgPSAnJztcbiAgICAgIGxldCBjdXJyZW50UmVwbGFjZW1lbnQ6IElFbW9qaVJlcGxhY2VyID0gbnVsbDtcbiAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgIGxldCBpID0gMDtcblxuICAgICAgZG8ge1xuICAgICAgICAvLyBHZXR0aW5nIG91ciBmaXJzdCBtYXRjaFxuICAgICAgICBsZXQgdGVtcFJlcGxhY2VtZW50OiBJRW1vamlSZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgcmVwbGFjZW1lbnRzKSB7XG5cbiAgICAgICAgICAvLyBTZWxlY3QgdGhlIGZpcnN0IG1hdGNoIGluIHRoZSByZXBsYWNlbWVudHMgYXJyYXlcbiAgICAgICAgICBpZiAocmVwbGFjZW1lbnQubWF0Y2ggPT09IHVuZGVmaW5lZCB8fCBjdXJyZW50UmVwbGFjZW1lbnQgPT09IHJlcGxhY2VtZW50KSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaCA9IHJlcGxhY2VtZW50LnJlZ2V4LmV4ZWModGV4dCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm1hdGNoKSB7XG5cbiAgICAgICAgICAgIGlmICghdGVtcFJlcGxhY2VtZW50IHx8ICF0ZW1wUmVwbGFjZW1lbnQubWF0Y2ggfHxcbiAgICAgICAgICAgICAgICAocmVwbGFjZW1lbnQubWF0Y2guaW5kZXggPCB0ZW1wUmVwbGFjZW1lbnQubWF0Y2guaW5kZXgpXG4gICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0ZW1wUmVwbGFjZW1lbnQgPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQgPSB0ZW1wUmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRSZXBsYWNlbWVudCAmJiBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2gpIHtcblxuICAgICAgICAgIC8vIFNldHRpbmcgdGhlIGluZGV4IGFuZCB1c2luZyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXRjaGVzIGFzIGEgd29ya2Fyb3VuZCBmb3IgYSBsb29rYWhlYWQgcmVnZXhcbiAgICAgICAgICBpbmRleCA9IGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaC5pbmRleCArXG4gICAgICAgICAgKFxuICAgICAgICAgICAgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoWzBdLmxlbmd0aCAtIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFtjdXJyZW50UmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF0ubGVuZ3RoXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpbmRleCAhPT0gaSkge1xuICAgICAgICAgICAgY2hhbmdlcy5pbnNlcnQodGV4dC5zbGljZShpLCBpbmRleCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVtb2ppVGV4dCA9IGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFtjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hJbmRleF07XG4gICAgICAgICAgY29uc3QgZW1vamkgPSBjdXJyZW50UmVwbGFjZW1lbnQuZm4oZW1vamlUZXh0KTtcblxuICAgICAgICAgIGlmIChlbW9qaSkge1xuICAgICAgICAgICAgY2hhbmdlcy5pbnNlcnQoeyBlbW9qaSB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpID0gaW5kZXggKyBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoY3VycmVudFJlcGxhY2VtZW50ICYmIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaCk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIHRleHQgbGVmdFxuICAgICAgaWYgKGkgPCB0ZXh0Lmxlbmd0aCkge1xuICAgICAgICBjaGFuZ2VzLmluc2VydCh0ZXh0LnNsaWNlKGkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH1cblxuICBzdGF0aWMgaW5zZXJ0RW1vamkocXVpbGw6IGFueSwgZXZlbnQ6IGFueSkge1xuICAgIGlmIChxdWlsbCAmJiBxdWlsbC5pc0VuYWJsZWQoKSkge1xuXG4gICAgICBjb25zdCByYW5nZSA9IHF1aWxsLmdldFNlbGVjdGlvbih0cnVlKTtcblxuICAgICAgY29uc3QgZGVsdGEgPSBuZXcgRGVsdGEoKS5yZXRhaW4ocmFuZ2UuaW5kZXgpLmRlbGV0ZShyYW5nZS5sZW5ndGgpLmluc2VydCh7IGVtb2ppOiBldmVudC5lbW9qaSB9KTtcblxuICAgICAgLy8gVXNpbmcgc2lsZW50IHRvIG5vdCB0cmlnZ2VyIHRleHQtY2hhbmdlLCBidXQgY2hlY2tpbmcgaWYgdGhlIGVkaXRvciBpcyBlbmFibGVkXG4gICAgICBxdWlsbC51cGRhdGVDb250ZW50cyhkZWx0YSwgUXVpbGwuc291cmNlcy5TSUxFTlQpO1xuICAgICAgcXVpbGwuc2V0U2VsZWN0aW9uKCsrcmFuZ2UuaW5kZXgsIDAsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==