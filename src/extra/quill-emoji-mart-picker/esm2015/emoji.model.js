import unicodeRe from 'emoji-regex';
import Quill from 'quill';
const Delta = Quill.import('delta');
export class Emoji {
    static toCodePoint(unicodeSurrogates, sep) {
        const r = [];
        let c = 0;
        let p = 0;
        let i = 0;
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
    }
    static unicodeToEmoji(unicode) {
        return Emoji.getEmojiDataFromUnified(Emoji.toCodePoint(unicode));
    }
    static emoticonToEmoji(emoticon) {
        return Emoji.getEmojiDataFromEmoticon(emoticon);
    }
    static shortNameToEmoji(shortName) {
        return Emoji.getEmojiDataFromShortName(shortName);
    }
    static getEmojiDataFromUnified(unified) {
        const emoji = Emoji.unified[unified.toUpperCase()];
        return emoji ? emoji : null;
    }
    static getEmojiDataFromEmoticon(emoticon) {
        const emoji = Emoji.emoticons[emoticon];
        return emoji ? emoji : null;
    }
    static getEmojiDataFromShortName(shortName) {
        const emoji = Emoji.shortNames[shortName.toLowerCase()];
        return emoji ? emoji : null;
    }
    static uncompress(list, options) {
        list.map(emoji => {
            const emojiRef = Emoji.unified[emoji.unified] = {
                unified: emoji.unified,
                id: emoji.shortName,
                sheet: emoji.sheet,
                emoticons: emoji.emoticons
            };
            Emoji.shortNames[emoji.shortName] = emojiRef;
            // Additional shortNames
            if (emoji.shortNames) {
                for (const d of emoji.shortNames) {
                    Emoji.shortNames[d] = emojiRef;
                }
            }
            if (options.convertEmoticons && emoji.emoticons) {
                for (const d of emoji.emoticons) {
                    Emoji.emoticons[d] = emojiRef;
                }
            }
            if (emoji.skinVariations) {
                for (const d of emoji.skinVariations) {
                    Emoji.unified[d.unified] = {
                        unified: d.unified,
                        id: emojiRef.id,
                        sheet: d.sheet,
                        emoticons: emojiRef.emoticons
                    };
                }
            }
        });
        if (options.customEmojiData) {
            for (let customEmoji of options.customEmojiData) {
                if (customEmoji.shortNames) {
                    customEmoji = Object.assign(Object.assign({}, customEmoji), { id: customEmoji.shortNames[0] });
                    Emoji.shortNames[customEmoji.id] = customEmoji;
                }
            }
        }
    }
    static unifiedToNative(unified) {
        const codePoints = unified.split('-').map(u => parseInt(`0x${u}`, 16));
        return String.fromCodePoint(...codePoints);
    }
    static emojiSpriteStyles(sheet, set, backgroundImageFn, size = 24, sheetSize = 64, sheetColumns = 52) {
        return {
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-block',
            'background-image': `url(${backgroundImageFn(set, sheetSize)})`,
            'background-size': `${100 * sheetColumns}%`,
            'background-position': Emoji.getSpritePosition(sheet, sheetColumns),
        };
    }
    static getSpritePosition(sheet, sheetColumns) {
        const [sheetX, sheetY] = sheet;
        const multiply = 100 / (sheetColumns - 1);
        return `${multiply * sheetX}% ${multiply * sheetY}%`;
    }
    static toHex(str) {
        let hex;
        let result = '';
        for (let i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ('000' + hex).slice(-4);
        }
        return result;
    }
    static buildImage(emoji, node, set, options) {
        if (typeof emoji === 'string') {
            const unicodeRegex = unicodeRe();
            if (unicodeRegex.test(emoji)) {
                emoji = Emoji.unicodeToEmoji(emoji);
            }
            else {
                const shortNameRegex = new RegExp(Emoji.shortNameRe);
                const match = shortNameRegex.exec(emoji);
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
                node.style.backgroundImage = `url("${emoji.imageUrl}")`;
                node.style.backgroundSize = 'contain';
            }
            else {
                // Using a sprite
                let style = null;
                // Default emoji using a set
                if (emoji.sheet) {
                    style = Emoji.emojiSpriteStyles(emoji.sheet, set, options.backgroundImageFn);
                }
                else if (emoji.spriteUrl) { // Emoji using a sprite URL
                    node.classList.add(Emoji.emojiPrefix + 'custom');
                    style = Emoji.emojiSpriteStyles([emoji.sheet_x, emoji.sheet_y], '', () => emoji.spriteUrl, 24, emoji.size, emoji.sheetColumns);
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
                const native = Emoji.unifiedToNative(emoji.unified);
                node.setAttribute('alt', native);
            }
            else {
                node.setAttribute('alt', options.indicator + emoji.id + options.indicator);
            }
            if (options.showTitle) {
                const emoticons = emoji.emoticons;
                let title = '';
                if (options.convertEmoticons && emoticons && emoticons.length > 0) {
                    title = emoticons[0] + '\u2002,\u2002';
                }
                title += options.indicator + emoji.id + options.indicator;
                node.setAttribute('title', title);
            }
        }
        return node;
    }
    static convertInput(delta, replacements) {
        const changes = new Delta();
        let position = 0;
        delta.ops.forEach((op) => {
            if (op.insert) {
                if (typeof op.insert === 'object') {
                    position++;
                }
                else if (typeof op.insert === 'string') {
                    const text = op.insert;
                    let emojiText = '';
                    let index;
                    for (const replacement of replacements) {
                        // tslint:disable-next-line: no-conditional-assignment
                        while ((replacement.match = replacement.regex.exec(text))) {
                            // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                            index = replacement.match.index + (replacement.match[0].length - replacement.match[replacement.replacementIndex].length);
                            emojiText = replacement.match[replacement.matchIndex];
                            const emoji = replacement.fn(emojiText);
                            const changeIndex = position + index;
                            if (changeIndex > 0) {
                                changes.retain(changeIndex);
                            }
                            changes.delete(replacement.match[replacement.replacementIndex].length);
                            if (emoji) {
                                changes.insert({ emoji });
                            }
                        }
                    }
                    position += op.insert.length;
                }
            }
        });
        return changes;
    }
    static convertPaste(delta, replacements) {
        const changes = new Delta();
        let op = null;
        // Matchers are called recursively, so iterating is not necessary
        if (delta) {
            op = delta.ops[0];
        }
        if (op && op.insert && typeof op.insert === 'string') {
            const text = op.insert;
            let emojiText = '';
            let currentReplacement = null;
            let index = 0;
            let i = 0;
            do {
                // Getting our first match
                let tempReplacement = null;
                for (const replacement of replacements) {
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
                currentReplacement = tempReplacement;
                if (currentReplacement && currentReplacement.match) {
                    // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                    index = currentReplacement.match.index +
                        (currentReplacement.match[0].length - currentReplacement.match[currentReplacement.replacementIndex].length);
                    if (index !== i) {
                        changes.insert(text.slice(i, index));
                    }
                    emojiText = currentReplacement.match[currentReplacement.matchIndex];
                    const emoji = currentReplacement.fn(emojiText);
                    if (emoji) {
                        changes.insert({ emoji });
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
    }
    static insertEmoji(quill, event) {
        if (quill && quill.isEnabled()) {
            const range = quill.getSelection(true);
            const delta = new Delta().retain(range.index).delete(range.length).insert({ emoji: event.emoji });
            // Using silent to not trigger text-change, but checking if the editor is enabled
            quill.updateContents(delta, Quill.sources.SILENT);
            quill.setSelection(++range.index, 0, Quill.sources.SILENT);
        }
    }
}
Emoji.unified = {};
Emoji.emoticons = {};
Emoji.shortNames = {};
Emoji.emojiPrefix = 'qle-';
// tslint:disable-next-line: max-line-length
Emoji.emoticonRe = `(?:\\s|^)((?:8\\))|(?:\\(:)|(?:\\):)|(?::'\\()|(?::\\()|(?::\\))|(?::\\*)|(?::-\\()|(?::-\\))|(?::-\\*)|(?::-/)|(?::->)|(?::-D)|(?::-O)|(?::-P)|(?::-\\\\)|(?::-b)|(?::-o)|(?::-p)|(?::-\\|)|(?::/)|(?::>)|(?::D)|(?::O)|(?::P)|(?::\\\\)|(?::b)|(?::o)|(?::p)|(?::\\|)|(?:;\\))|(?:;-\\))|(?:;-P)|(?:;-b)|(?:;-p)|(?:;P)|(?:;b)|(?:;p)|(?:<3)|(?:</3)|(?:=\\))|(?:=-\\))|(?:>:\\()|(?:>:-\\()|(?:C:)|(?:D:)|(?:c:))(?=\\s|$)`;
Emoji.shortNameRe = '(?:[^\\*]|^)(\\*([a-z0-9_\\-\\+]+)\\*)(?!\\*)';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkubW9kZWwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AbnV0cmlmeS9xdWlsbC1lbW9qaS1tYXJ0LXBpY2tlci8iLCJzb3VyY2VzIjpbImVtb2ppLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFJMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQTZEcEMsTUFBTSxPQUFPLEtBQUs7SUFZaEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxpQkFBeUIsRUFBRSxHQUFZO1FBRXhELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNuQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsc0NBQXNDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNQO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxD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QUM7WUFFdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRWxHLGlGQUFpRjtZQUNqRixLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQzs7QUF2WU0sYUFBTyxHQUE4QixFQUFFLENBQUM7QUFDeEMsZUFBUyxHQUE4QixFQUFFLENBQUM7QUFDMUMsZ0JBQVUsR0FBOEIsRUFBRSxDQUFDO0FBRTNDLGlCQUFXLEdBQUcsTUFBTSxDQUFDO0FBRTVCLDRDQUE0QztBQUNyQyxnQkFBVSxHQUFHLCtaQUErWixDQUFDO0FBQzdhLGlCQUFXLEdBQUcsK0NBQStDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdW5pY29kZVJlIGZyb20gJ2Vtb2ppLXJlZ2V4JztcbmltcG9ydCBRdWlsbCBmcm9tICdxdWlsbCc7XG5cbmltcG9ydCB7IEVtb2ppTW9kdWxlT3B0aW9ucywgRW1vamlTZXQgfSBmcm9tICcuL2Vtb2ppLnF1aWxsLW1vZHVsZSc7XG5cbmNvbnN0IERlbHRhID0gUXVpbGwuaW1wb3J0KCdkZWx0YScpO1xuXG5leHBvcnQgdHlwZSBJQ3VzdG9tRW1vamkgPSBJQ3VzdG9tSW1hZ2VFbW9qaVZpZXcgfCBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3O1xuZXhwb3J0IHR5cGUgSUVtb2ppID0gSUVtb2ppVmlldyB8IElDdXN0b21FbW9qaTtcblxuZXhwb3J0IGludGVyZmFjZSBDb21wcmVzc2VkRW1vamlEYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1bmlmaWVkOiBzdHJpbmc7XG4gIHNob3J0TmFtZTogc3RyaW5nO1xuICBzaG9ydE5hbWVzPzogc3RyaW5nW107XG4gIHNoZWV0OiBbbnVtYmVyLCBudW1iZXJdO1xuICBrZXl3b3Jkcz86IHN0cmluZ1tdO1xuICBoaWRkZW4/OiBzdHJpbmdbXTtcbiAgZW1vdGljb25zPzogc3RyaW5nW107XG4gIHRleHQ/OiBzdHJpbmc7XG4gIHNraW5WYXJpYXRpb25zPzogRW1vamlWYXJpYXRpb25bXTtcbiAgb2Jzb2xldGVkQnk/OiBzdHJpbmc7XG4gIG9ic29sZXRlcz86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRW1vamlSZXBsYWNlciB7XG4gIHJlZ2V4OiBSZWdFeHA7XG4gIGZuOiAoc3RyOiBzdHJpbmcpID0+IElFbW9qaTtcbiAgbWF0Y2hJbmRleDogbnVtYmVyO1xuICByZXBsYWNlbWVudEluZGV4OiBudW1iZXI7IC8vIFdvcmthcm91bmQgdG8gc3VwcG9ydCByZWdleCBsb29rYWhlYWQgb24gYWxsIGJyb3dzZXJzXG4gIG1hdGNoPzogUmVnRXhwRXhlY0FycmF5O1xufVxuXG5leHBvcnQgdHlwZSBJRW1vamlSZXBsYWNlbWVudCA9IElFbW9qaVJlcGxhY2VyW107XG5cblxuaW50ZXJmYWNlIElFbW9qaVZpZXcge1xuICB1bmlmaWVkOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIHNoZWV0OiBbbnVtYmVyLCBudW1iZXJdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21JbWFnZUVtb2ppVmlldyB7XG4gIGlkOiBzdHJpbmc7XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21TcHJpdGVFbW9qaVZpZXcge1xuICBpZDogc3RyaW5nO1xuICBzcHJpdGVVcmw6IHN0cmluZztcbiAgc2hlZXRfeDogbnVtYmVyO1xuICBzaGVldF95OiBudW1iZXI7XG4gIHNpemU6IDE2IHwgMjAgfCAzMiB8IDY0O1xuICBzaGVldENvbHVtbnM6IG51bWJlcjtcbiAgc2hlZXRSb3dzPzogbnVtYmVyOyAvLyBOb3QgcmVhbGx5IG5lY2Vzc2FyeVxuICBzaG9ydE5hbWVzPzogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBFbW9qaVZhcmlhdGlvbiB7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgRW1vamkge1xuXG4gIHN0YXRpYyB1bmlmaWVkOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG4gIHN0YXRpYyBlbW90aWNvbnM6IHsgW2tleTogc3RyaW5nXTogSUVtb2ppIH0gPSB7fTtcbiAgc3RhdGljIHNob3J0TmFtZXM6IHsgW2tleTogc3RyaW5nXTogSUVtb2ppIH0gPSB7fTtcblxuICBzdGF0aWMgZW1vamlQcmVmaXggPSAncWxlLSc7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBtYXgtbGluZS1sZW5ndGhcbiAgc3RhdGljIGVtb3RpY29uUmUgPSBgKD86XFxcXHN8XikoKD86OFxcXFwpKXwoPzpcXFxcKDopfCg/OlxcXFwpOil8KD86OidcXFxcKCl8KD86OlxcXFwoKXwoPzo6XFxcXCkpfCg/OjpcXFxcKil8KD86Oi1cXFxcKCl8KD86Oi1cXFxcKSl8KD86Oi1cXFxcKil8KD86Oi0vKXwoPzo6LT4pfCg/OjotRCl8KD86Oi1PKXwoPzo6LVApfCg/OjotXFxcXFxcXFwpfCg/OjotYil8KD86Oi1vKXwoPzo6LXApfCg/OjotXFxcXHwpfCg/OjovKXwoPzo6Pil8KD86OkQpfCg/OjpPKXwoPzo6UCl8KD86OlxcXFxcXFxcKXwoPzo6Yil8KD86Om8pfCg/OjpwKXwoPzo6XFxcXHwpfCg/OjtcXFxcKSl8KD86Oy1cXFxcKSl8KD86Oy1QKXwoPzo7LWIpfCg/OjstcCl8KD86O1ApfCg/OjtiKXwoPzo7cCl8KD86PDMpfCg/OjwvMyl8KD86PVxcXFwpKXwoPzo9LVxcXFwpKXwoPzo+OlxcXFwoKXwoPzo+Oi1cXFxcKCl8KD86QzopfCg/OkQ6KXwoPzpjOikpKD89XFxcXHN8JClgO1xuICBzdGF0aWMgc2hvcnROYW1lUmUgPSAnKD86W15cXFxcKl18XikoXFxcXCooW2EtejAtOV9cXFxcLVxcXFwrXSspXFxcXCopKD8hXFxcXCopJztcblxuICBzdGF0aWMgdG9Db2RlUG9pbnQodW5pY29kZVN1cnJvZ2F0ZXM6IHN0cmluZywgc2VwPzogc3RyaW5nKSB7XG5cbiAgICBjb25zdCByID0gW107XG4gICAgbGV0IGMgPSAwO1xuICAgIGxldCBwID0gMDtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHVuaWNvZGVTdXJyb2dhdGVzLmxlbmd0aCkge1xuICAgICAgYyA9IHVuaWNvZGVTdXJyb2dhdGVzLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGlmIChwKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1iaXR3aXNlXG4gICAgICAgIHIucHVzaCgoMHgxMDAwMCArICgocCAtIDB4RDgwMCkgPDwgMTApICsgKGMgLSAweERDMDApKS50b1N0cmluZygxNikpO1xuICAgICAgICBwID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoMHhEODAwIDw9IGMgJiYgYyA8PSAweERCRkYpIHtcbiAgICAgICAgcCA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByLnB1c2goYy50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByLmpvaW4oc2VwIHx8ICctJyk7XG4gIH1cblxuICBzdGF0aWMgdW5pY29kZVRvRW1vamkodW5pY29kZTogc3RyaW5nKTogSUVtb2ppIHtcbiAgICByZXR1cm4gRW1vamkuZ2V0RW1vamlEYXRhRnJvbVVuaWZpZWQoRW1vamkudG9Db2RlUG9pbnQodW5pY29kZSkpO1xuICB9XG5cbiAgc3RhdGljIGVtb3RpY29uVG9FbW9qaShlbW90aWNvbjogc3RyaW5nKTogSUVtb2ppIHtcbiAgICByZXR1cm4gRW1vamkuZ2V0RW1vamlEYXRhRnJvbUVtb3RpY29uKGVtb3RpY29uKTtcbiAgfVxuXG4gIHN0YXRpYyBzaG9ydE5hbWVUb0Vtb2ppKHNob3J0TmFtZTogc3RyaW5nKTogSUVtb2ppIHtcbiAgICByZXR1cm4gRW1vamkuZ2V0RW1vamlEYXRhRnJvbVNob3J0TmFtZShzaG9ydE5hbWUpO1xuICB9XG5cbiAgc3RhdGljIGdldEVtb2ppRGF0YUZyb21VbmlmaWVkKHVuaWZpZWQ6IHN0cmluZyk6IElFbW9qaSB7XG5cbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLnVuaWZpZWRbdW5pZmllZC50b1VwcGVyQ2FzZSgpXTtcblxuICAgIHJldHVybiBlbW9qaSA/IGVtb2ppIDogbnVsbDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb246IHN0cmluZyk6IElFbW9qaSB7XG5cbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLmVtb3RpY29uc1tlbW90aWNvbl07XG5cbiAgICByZXR1cm4gZW1vamkgPyBlbW9qaSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW1vamlEYXRhRnJvbVNob3J0TmFtZShzaG9ydE5hbWU6IHN0cmluZyk6IElFbW9qaSB7XG5cbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLnNob3J0TmFtZXNbc2hvcnROYW1lLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIHVuY29tcHJlc3MobGlzdDogQ29tcHJlc3NlZEVtb2ppRGF0YVtdLCBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBsaXN0Lm1hcChlbW9qaSA9PiB7XG5cbiAgICAgIGNvbnN0IGVtb2ppUmVmID0gRW1vamkudW5pZmllZFtlbW9qaS51bmlmaWVkXSA9IHtcbiAgICAgICAgdW5pZmllZDogZW1vamkudW5pZmllZCxcbiAgICAgICAgaWQ6IGVtb2ppLnNob3J0TmFtZSxcbiAgICAgICAgc2hlZXQ6IGVtb2ppLnNoZWV0LFxuICAgICAgICBlbW90aWNvbnM6IGVtb2ppLmVtb3RpY29uc1xuICAgICAgfTtcblxuICAgICAgRW1vamkuc2hvcnROYW1lc1tlbW9qaS5zaG9ydE5hbWVdID0gZW1vamlSZWY7XG5cbiAgICAgIC8vIEFkZGl0aW9uYWwgc2hvcnROYW1lc1xuICAgICAgaWYgKGVtb2ppLnNob3J0TmFtZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGVtb2ppLnNob3J0TmFtZXMpIHtcbiAgICAgICAgICBFbW9qaS5zaG9ydE5hbWVzW2RdID0gZW1vamlSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29udmVydEVtb3RpY29ucyAmJiBlbW9qaS5lbW90aWNvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGVtb2ppLmVtb3RpY29ucykge1xuICAgICAgICAgIEVtb2ppLmVtb3RpY29uc1tkXSA9IGVtb2ppUmVmO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbW9qaS5za2luVmFyaWF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuc2tpblZhcmlhdGlvbnMpIHtcbiAgICAgICAgICBFbW9qaS51bmlmaWVkW2QudW5pZmllZF0gPSB7XG4gICAgICAgICAgICB1bmlmaWVkOiBkLnVuaWZpZWQsXG4gICAgICAgICAgICBpZDogZW1vamlSZWYuaWQsXG4gICAgICAgICAgICBzaGVldDogZC5zaGVldCxcbiAgICAgICAgICAgIGVtb3RpY29uczogZW1vamlSZWYuZW1vdGljb25zXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRW1vamlEYXRhKSB7XG4gICAgICBmb3IgKGxldCBjdXN0b21FbW9qaSBvZiBvcHRpb25zLmN1c3RvbUVtb2ppRGF0YSkge1xuICAgICAgICBpZiAoY3VzdG9tRW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIGN1c3RvbUVtb2ppID0geyAuLi5jdXN0b21FbW9qaSwgaWQ6IGN1c3RvbUVtb2ppLnNob3J0TmFtZXNbMF0gfTtcbiAgICAgICAgICBFbW9qaS5zaG9ydE5hbWVzW2N1c3RvbUVtb2ppLmlkXSA9IGN1c3RvbUVtb2ppO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHVuaWZpZWRUb05hdGl2ZSh1bmlmaWVkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb2RlUG9pbnRzID0gdW5pZmllZC5zcGxpdCgnLScpLm1hcCh1ID0+IHBhcnNlSW50KGAweCR7dX1gLCAxNikpO1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzKTtcbiAgfVxuXG4gIHN0YXRpYyBlbW9qaVNwcml0ZVN0eWxlcyhcbiAgICBzaGVldDogSUVtb2ppVmlld1snc2hlZXQnXSxcbiAgICBzZXQ6IEVtb2ppU2V0IHwgJycsXG4gICAgYmFja2dyb3VuZEltYWdlRm46IChzZXQ6IHN0cmluZywgc2hlZXRTaXplOiBudW1iZXIpID0+IHN0cmluZyxcbiAgICBzaXplOiBudW1iZXIgPSAyNCxcbiAgICBzaGVldFNpemU6IDE2IHwgMjAgfCAzMiB8IDY0ID0gNjQsXG4gICAgc2hlZXRDb2x1bW5zID0gNTJcbiAgICApIHtcblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogYCR7c2l6ZX1weGAsXG4gICAgICBoZWlnaHQ6IGAke3NpemV9cHhgLFxuICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IGB1cmwoJHtiYWNrZ3JvdW5kSW1hZ2VGbihzZXQsIHNoZWV0U2l6ZSl9KWAsXG4gICAgICAnYmFja2dyb3VuZC1zaXplJzogYCR7MTAwICogc2hlZXRDb2x1bW5zfSVgLFxuICAgICAgJ2JhY2tncm91bmQtcG9zaXRpb24nOiBFbW9qaS5nZXRTcHJpdGVQb3NpdGlvbihzaGVldCwgc2hlZXRDb2x1bW5zKSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldFNwcml0ZVBvc2l0aW9uKHNoZWV0OiBJRW1vamlWaWV3WydzaGVldCddLCBzaGVldENvbHVtbnM6IG51bWJlcikge1xuICAgIGNvbnN0IFtzaGVldFgsIHNoZWV0WV0gPSBzaGVldDtcbiAgICBjb25zdCBtdWx0aXBseSA9IDEwMCAvIChzaGVldENvbHVtbnMgLSAxKTtcbiAgICByZXR1cm4gYCR7bXVsdGlwbHkgKiBzaGVldFh9JSAke211bHRpcGx5ICogc2hlZXRZfSVgO1xuICB9XG5cbiAgc3RhdGljIHRvSGV4KHN0cjogc3RyaW5nKSB7XG4gICAgbGV0IGhleDogc3RyaW5nO1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleCA9IHN0ci5jaGFyQ29kZUF0KGkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgcmVzdWx0ICs9ICgnMDAwJyArIGhleCkuc2xpY2UoLTQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgYnVpbGRJbWFnZShcbiAgICBlbW9qaTogc3RyaW5nIHwgSUVtb2ppLFxuICAgIG5vZGU6IEhUTUxFbGVtZW50LFxuICAgIHNldDogRW1vamlTZXQsXG4gICAgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zXG4gICAgKSB7XG5cbiAgICBpZiAodHlwZW9mIGVtb2ppID09PSAnc3RyaW5nJykge1xuXG4gICAgICBjb25zdCB1bmljb2RlUmVnZXggPSB1bmljb2RlUmUoKTtcblxuICAgICAgaWYgKHVuaWNvZGVSZWdleC50ZXN0KGVtb2ppKSkge1xuXG4gICAgICAgIGVtb2ppID0gRW1vamkudW5pY29kZVRvRW1vamkoZW1vamkpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGNvbnN0IHNob3J0TmFtZVJlZ2V4ID0gbmV3IFJlZ0V4cChFbW9qaS5zaG9ydE5hbWVSZSk7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc2hvcnROYW1lUmVnZXguZXhlYyhlbW9qaSk7XG4gICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgZW1vamkgPSBFbW9qaS5zaG9ydE5hbWVUb0Vtb2ppKG1hdGNoWzFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbW9qaSAmJiB0eXBlb2YgZW1vamkgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArIGVtb2ppLmlkKTtcblxuICAgICAgLy8gQ3VzdG9tIGltYWdlXG4gICAgICBpZiAoKGVtb2ppIGFzIElDdXN0b21JbWFnZUVtb2ppVmlldykuaW1hZ2VVcmwpIHtcblxuICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyAnY3VzdG9tJyk7XG5cbiAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKFwiJHsoZW1vamkgYXMgSUN1c3RvbUltYWdlRW1vamlWaWV3KS5pbWFnZVVybH1cIilgO1xuICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2NvbnRhaW4nO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBVc2luZyBhIHNwcml0ZVxuICAgICAgICBsZXQgc3R5bGUgPSBudWxsO1xuXG4gICAgICAgIC8vIERlZmF1bHQgZW1vamkgdXNpbmcgYSBzZXRcbiAgICAgICAgaWYgKChlbW9qaSBhcyBJRW1vamlWaWV3KS5zaGVldCkge1xuXG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcygoZW1vamkgYXMgSUVtb2ppVmlldykuc2hlZXQsIHNldCwgb3B0aW9ucy5iYWNrZ3JvdW5kSW1hZ2VGbik7XG5cbiAgICAgICAgfSBlbHNlIGlmICgoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc3ByaXRlVXJsKSB7IC8vIEVtb2ppIHVzaW5nIGEgc3ByaXRlIFVSTFxuXG4gICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKEVtb2ppLmVtb2ppUHJlZml4ICsgJ2N1c3RvbScpO1xuXG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICAgIFsoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2hlZXRfeCwgKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNoZWV0X3ldLFxuICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAoKSA9PiAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc3ByaXRlVXJsLFxuICAgICAgICAgICAgMjQsXG4gICAgICAgICAgICAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2l6ZSxcbiAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldENvbHVtbnNcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgbm9kZS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBzdHlsZVsnYmFja2dyb3VuZC1pbWFnZSddO1xuICAgICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZFNpemUgPSBzdHlsZVsnYmFja2dyb3VuZC1zaXplJ107XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVsnYmFja2dyb3VuZC1wb3NpdGlvbiddO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgbm9kZS5zdHlsZS5mb250U2l6ZSA9ICdpbmhlcml0JztcblxuICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3lINUJBRUFBQUFBTEFBQUFBQUJBQUVBQUFJQlJBQTcnKTtcbiAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCAnZmFsc2UnKTtcblxuICAgICAgaWYgKChlbW9qaSBhcyBJRW1vamlWaWV3KS51bmlmaWVkKSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZSA9IEVtb2ppLnVuaWZpZWRUb05hdGl2ZSgoZW1vamkgYXMgSUVtb2ppVmlldykudW5pZmllZCk7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdhbHQnLCBuYXRpdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2FsdCcsIG9wdGlvbnMuaW5kaWNhdG9yICsgZW1vamkuaWQgKyBvcHRpb25zLmluZGljYXRvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnNob3dUaXRsZSkge1xuICAgICAgICBjb25zdCBlbW90aWNvbnMgPSAoZW1vamkgYXMgSUVtb2ppVmlldykuZW1vdGljb25zO1xuXG4gICAgICAgIGxldCB0aXRsZSA9ICcnO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNvbnZlcnRFbW90aWNvbnMgJiYgZW1vdGljb25zICYmIGVtb3RpY29ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGl0bGUgPSBlbW90aWNvbnNbMF0gKyAnXFx1MjAwMixcXHUyMDAyJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRpdGxlICs9IG9wdGlvbnMuaW5kaWNhdG9yICsgZW1vamkuaWQgKyBvcHRpb25zLmluZGljYXRvcjtcblxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgndGl0bGUnLCB0aXRsZSk7XG4gICAgICB9XG5cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzdGF0aWMgY29udmVydElucHV0KGRlbHRhOiBhbnksIHJlcGxhY2VtZW50czogSUVtb2ppUmVwbGFjZW1lbnQpOiBhbnkge1xuXG4gICAgY29uc3QgY2hhbmdlcyA9IG5ldyBEZWx0YSgpO1xuXG4gICAgbGV0IHBvc2l0aW9uID0gMDtcblxuICAgIGRlbHRhLm9wcy5mb3JFYWNoKChvcDogYW55KSA9PiB7XG5cbiAgICAgIGlmIChvcC5pbnNlcnQpIHtcblxuICAgICAgICBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBwb3NpdGlvbisrO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcC5pbnNlcnQgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgICBjb25zdCB0ZXh0ID0gb3AuaW5zZXJ0O1xuXG4gICAgICAgICAgbGV0IGVtb2ppVGV4dCA9ICcnO1xuICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyO1xuXG4gICAgICAgICAgZm9yIChjb25zdCByZXBsYWNlbWVudCBvZiByZXBsYWNlbWVudHMpIHtcblxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XG4gICAgICAgICAgICB3aGlsZSAoKHJlcGxhY2VtZW50Lm1hdGNoID0gcmVwbGFjZW1lbnQucmVnZXguZXhlYyh0ZXh0KSkpIHtcblxuICAgICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbmRleCBhbmQgdXNpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWF0Y2hlcyBhcyBhIHdvcmthcm91bmQgZm9yIGEgbG9va2FoZWFkIHJlZ2V4XG4gICAgICAgICAgICAgIGluZGV4ID0gcmVwbGFjZW1lbnQubWF0Y2guaW5kZXggKyAocmVwbGFjZW1lbnQubWF0Y2hbMF0ubGVuZ3RoIC0gcmVwbGFjZW1lbnQubWF0Y2hbcmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF0ubGVuZ3RoKTtcblxuICAgICAgICAgICAgICBlbW9qaVRleHQgPSByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5tYXRjaEluZGV4XTtcblxuICAgICAgICAgICAgICBjb25zdCBlbW9qaSA9IHJlcGxhY2VtZW50LmZuKGVtb2ppVGV4dCk7XG5cbiAgICAgICAgICAgICAgY29uc3QgY2hhbmdlSW5kZXggPSBwb3NpdGlvbiArIGluZGV4O1xuXG4gICAgICAgICAgICAgIGlmIChjaGFuZ2VJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgY2hhbmdlcy5yZXRhaW4oY2hhbmdlSW5kZXgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2hhbmdlcy5kZWxldGUocmVwbGFjZW1lbnQubWF0Y2hbcmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF0ubGVuZ3RoKTtcblxuICAgICAgICAgICAgICBpZiAoZW1vamkpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLmluc2VydCh7IGVtb2ppIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcG9zaXRpb24gKz0gb3AuaW5zZXJ0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH1cblxuICBzdGF0aWMgY29udmVydFBhc3RlKGRlbHRhOiBhbnksIHJlcGxhY2VtZW50czogSUVtb2ppUmVwbGFjZW1lbnQpOiBhbnkge1xuXG4gICAgY29uc3QgY2hhbmdlcyA9IG5ldyBEZWx0YSgpO1xuICAgIGxldCBvcCA9IG51bGw7XG5cbiAgICAvLyBNYXRjaGVycyBhcmUgY2FsbGVkIHJlY3Vyc2l2ZWx5LCBzbyBpdGVyYXRpbmcgaXMgbm90IG5lY2Vzc2FyeVxuICAgIGlmIChkZWx0YSkge1xuICAgICAgb3AgPSBkZWx0YS5vcHNbMF07XG4gICAgfVxuXG4gICAgaWYgKG9wICYmIG9wLmluc2VydCAmJiB0eXBlb2Ygb3AuaW5zZXJ0ID09PSAnc3RyaW5nJykge1xuXG4gICAgICBjb25zdCB0ZXh0ID0gb3AuaW5zZXJ0O1xuXG4gICAgICBsZXQgZW1vamlUZXh0ID0gJyc7XG4gICAgICBsZXQgY3VycmVudFJlcGxhY2VtZW50OiBJRW1vamlSZXBsYWNlciA9IG51bGw7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgICBsZXQgaSA9IDA7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgLy8gR2V0dGluZyBvdXIgZmlyc3QgbWF0Y2hcbiAgICAgICAgbGV0IHRlbXBSZXBsYWNlbWVudDogSUVtb2ppUmVwbGFjZXIgPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50IG9mIHJlcGxhY2VtZW50cykge1xuXG4gICAgICAgICAgLy8gU2VsZWN0IHRoZSBmaXJzdCBtYXRjaCBpbiB0aGUgcmVwbGFjZW1lbnRzIGFycmF5XG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm1hdGNoID09PSB1bmRlZmluZWQgfHwgY3VycmVudFJlcGxhY2VtZW50ID09PSByZXBsYWNlbWVudCkge1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2ggPSByZXBsYWNlbWVudC5yZWdleC5leGVjKHRleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyZXBsYWNlbWVudC5tYXRjaCkge1xuXG4gICAgICAgICAgICBpZiAoIXRlbXBSZXBsYWNlbWVudCB8fCAhdGVtcFJlcGxhY2VtZW50Lm1hdGNoIHx8XG4gICAgICAgICAgICAgICAgKHJlcGxhY2VtZW50Lm1hdGNoLmluZGV4IDwgdGVtcFJlcGxhY2VtZW50Lm1hdGNoLmluZGV4KVxuICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGVtcFJlcGxhY2VtZW50ID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFJlcGxhY2VtZW50ID0gdGVtcFJlcGxhY2VtZW50O1xuXG4gICAgICAgIGlmIChjdXJyZW50UmVwbGFjZW1lbnQgJiYgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoKSB7XG5cbiAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbmRleCBhbmQgdXNpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWF0Y2hlcyBhcyBhIHdvcmthcm91bmQgZm9yIGEgbG9va2FoZWFkIHJlZ2V4XG4gICAgICAgICAgaW5kZXggPSBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2guaW5kZXggK1xuICAgICAgICAgIChcbiAgICAgICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFswXS5sZW5ndGggLSBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdLmxlbmd0aFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoaW5kZXggIT09IGkpIHtcbiAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHRleHQuc2xpY2UoaSwgaW5kZXgpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbW9qaVRleHQgPSBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoSW5kZXhdO1xuICAgICAgICAgIGNvbnN0IGVtb2ppID0gY3VycmVudFJlcGxhY2VtZW50LmZuKGVtb2ppVGV4dCk7XG5cbiAgICAgICAgICBpZiAoZW1vamkpIHtcbiAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHsgZW1vamkgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaSA9IGluZGV4ICsgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoW2N1cnJlbnRSZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKGN1cnJlbnRSZXBsYWNlbWVudCAmJiBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2gpO1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyB0ZXh0IGxlZnRcbiAgICAgIGlmIChpIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgY2hhbmdlcy5pbnNlcnQodGV4dC5zbGljZShpKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9XG5cbiAgc3RhdGljIGluc2VydEVtb2ppKHF1aWxsOiBhbnksIGV2ZW50OiBhbnkpIHtcbiAgICBpZiAocXVpbGwgJiYgcXVpbGwuaXNFbmFibGVkKCkpIHtcblxuICAgICAgY29uc3QgcmFuZ2UgPSBxdWlsbC5nZXRTZWxlY3Rpb24odHJ1ZSk7XG5cbiAgICAgIGNvbnN0IGRlbHRhID0gbmV3IERlbHRhKCkucmV0YWluKHJhbmdlLmluZGV4KS5kZWxldGUocmFuZ2UubGVuZ3RoKS5pbnNlcnQoeyBlbW9qaTogZXZlbnQuZW1vamkgfSk7XG5cbiAgICAgIC8vIFVzaW5nIHNpbGVudCB0byBub3QgdHJpZ2dlciB0ZXh0LWNoYW5nZSwgYnV0IGNoZWNraW5nIGlmIHRoZSBlZGl0b3IgaXMgZW5hYmxlZFxuICAgICAgcXVpbGwudXBkYXRlQ29udGVudHMoZGVsdGEsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICAgIHF1aWxsLnNldFNlbGVjdGlvbigrK3JhbmdlLmluZGV4LCAwLCBRdWlsbC5zb3VyY2VzLlNJTEVOVCk7XG4gICAgfVxuICB9XG59XG4iXX0=