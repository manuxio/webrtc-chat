import unicodeRe from 'emoji-regex';
import Quill from 'quill';
import { Emoji } from './emoji.model';
const Module = Quill.import('core/module');
export class EmojiModuleOptions {
    constructor() {
        this.disableOnPaste = false;
        this.showTitle = true;
        this.preventDrag = true;
        this.indicator = ':';
        this.convertEmoticons = true;
        this.convertShortNames = true;
        this.set = () => 'apple';
        this.backgroundImageFn = (set, sheetSize) => {
            return `https://unpkg.com/emoji-datasource-${set}@4.0.4/img/${set}/sheets-256/${sheetSize}.png`;
        };
    }
}
export class EmojiModule extends Module {
    // tslint:disable-next-line: no-shadowed-variable
    constructor(quill, options) {
        super(quill, options);
        this.quill = quill;
        this.isEdgeBrowser = false;
        this.pasted = false;
        this.options = options;
        if (navigator.userAgent.indexOf('Edge') > -1) {
            this.isEdgeBrowser = true;
        }
        Emoji.uncompress(options.emojiData, options);
        if (options.preventDrag) {
            // Prevent emojis from dragging
            quill.container.addEventListener('dragstart', (event) => {
                event.preventDefault();
                return false;
            });
        }
        // Convert pasted unicode / emoticons / shortNames
        if (!options.disableOnPaste) {
            this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
                return Emoji.convertPaste(delta, this.replacements);
            });
        }
        // Listen for text change to convert typed in emojis or pasted emojis using Windows 10 Emojis / mobile
        quill.on('text-change', (delta, oldDelta, source) => {
            // text-change also triggers on a paste event, this is a hack to prevent one more check
            if (!this.pasted && source === Quill.sources.USER) {
                const changes = Emoji.convertInput(quill.getContents(), this.replacements);
                if (changes.ops.length > 0) {
                    quill.updateContents(changes, Quill.sources.SILENT);
                }
            }
            this.pasted = false;
        });
        // Changing cut to copy and delete
        // There seems to be a bug with Quill + Chrome with cut. The performance is much worse
        if (navigator.userAgent.indexOf('Chrome') > -1) {
            quill.container.addEventListener('cut', (event) => {
                const selection = document.getSelection();
                document.execCommand('copy');
                selection.deleteFromDocument();
                event.preventDefault();
            });
        }
        // Edge Bug #1: Image alt tags are not copied.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13921866/
        // Edge Bug #2: the url() functions in inline styles are getting escaped when pasted
        quill.container.addEventListener('paste', (event) => {
            this.pasted = true;
            if (this.isEdgeBrowser) {
                event.clipboardData.setData('text/html', event.clipboardData.getData('text/html').replace(/&amp;quot;/g, '"'));
            }
        });
    }
    get replacements() {
        const replacements = [
            // Unicode to Emoji
            {
                regex: unicodeRe(),
                matchIndex: 0,
                replacementIndex: 0,
                fn: (str) => Emoji.unicodeToEmoji(str)
            }
        ];
        if (this.options.convertEmoticons) {
            // Emoticons to Emoji
            replacements.push({
                regex: new RegExp(Emoji.emoticonRe, 'g'),
                matchIndex: 1,
                replacementIndex: 1,
                fn: (str) => Emoji.emoticonToEmoji(str)
            });
        }
        if (this.options.convertShortNames) {
            // ShortNames to Emoji
            replacements.push({
                regex: new RegExp(Emoji.shortNameRe, 'g'),
                matchIndex: 2,
                replacementIndex: 1,
                fn: (str) => Emoji.shortNameToEmoji(str)
            });
        }
        return replacements;
    }
    get options() {
        return EmojiModule.options;
    }
    set options(options) {
        EmojiModule.options = Object.assign(Object.assign({}, (new EmojiModuleOptions())), options);
    }
}
EmojiModule.options = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBQXVCLEtBQUssRUFBbUMsTUFBTSxlQUFlLENBQUM7QUFFNUYsTUFBTSxNQUFNLEdBQVEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUloRCxNQUFNLE9BQU8sa0JBQWtCO0lBQS9CO1FBQ0UsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFHdkIsY0FBUyxHQUFHLElBQUksQ0FBQztRQUNqQixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUNuQixjQUFTLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLHFCQUFnQixHQUFHLElBQUksQ0FBQztRQUN4QixzQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDekIsUUFBRyxHQUFvQixHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDckMsc0JBQWlCLEdBQStDLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ2pGLE9BQU8sc0NBQXNDLEdBQUcsY0FBYyxHQUFHLGVBQWUsU0FBUyxNQUFNLENBQUM7UUFDbEcsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUFBO0FBRUQsTUFBTSxPQUFPLFdBQVksU0FBUSxNQUFNO0lBa0RyQyxpREFBaUQ7SUFDakQsWUFBbUIsS0FBVSxFQUFFLE9BQTJCO1FBQ3hELEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFETCxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBL0NyQixrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUN0QixXQUFNLEdBQUcsS0FBSyxDQUFDO1FBaURyQixJQUFJLENBQUMsT0FBTyxHQUFH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QUUsQ0FBQyxHQUFLLE9BQU8sQ0FBRSxDQUFDO0lBQ3RFLENBQUM7O0FBOUNNLG1CQUFPLEdBQXVCLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmljb2RlUmUgZnJvbSAnZW1vamktcmVnZXgnO1xuaW1wb3J0IFF1aWxsIGZyb20gJ3F1aWxsJztcblxuaW1wb3J0IHsgQ29tcHJlc3NlZEVtb2ppRGF0YSwgRW1vamksIElDdXN0b21FbW9qaSwgSUVtb2ppUmVwbGFjZW1lbnQgfSBmcm9tICcuL2Vtb2ppLm1vZGVsJztcblxuY29uc3QgTW9kdWxlOiBhbnkgPSBRdWlsbC5pbXBvcnQoJ2NvcmUvbW9kdWxlJyk7XG5cbmV4cG9ydCB0eXBlIEVtb2ppU2V0ID0gJ2FwcGxlJyB8ICdnb29nbGUnIHwgJ3R3aXR0ZXInIHwgJ2Vtb2ppb25lJyB8ICdtZXNzZW5nZXInIHwgJ2ZhY2Vib29rJyB8ICcnO1xuXG5leHBvcnQgY2xhc3MgRW1vamlNb2R1bGVPcHRpb25zIHtcbiAgZGlzYWJsZU9uUGFzdGUgPSBmYWxzZTtcbiAgZW1vamlEYXRhOiBDb21wcmVzc2VkRW1vamlEYXRhW107XG4gIGN1c3RvbUVtb2ppRGF0YT86IElDdXN0b21FbW9qaVtdO1xuICBzaG93VGl0bGUgPSB0cnVlO1xuICBwcmV2ZW50RHJhZyA9IHRydWU7XG4gIGluZGljYXRvciA9ICc6JztcbiAgY29udmVydEVtb3RpY29ucyA9IHRydWU7XG4gIGNvbnZlcnRTaG9ydE5hbWVzID0gdHJ1ZTtcbiAgc2V0PzogKCkgPT4gRW1vamlTZXQgPSAoKSA9PiAnYXBwbGUnO1xuICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nID0gKHNldCwgc2hlZXRTaXplKSA9PiB7XG4gICAgcmV0dXJuIGBodHRwczovL3VucGtnLmNvbS9lbW9qaS1kYXRhc291cmNlLSR7c2V0fUA0LjAuNC9pbWcvJHtzZXR9L3NoZWV0cy0yNTYvJHtzaGVldFNpemV9LnBuZ2A7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtb2ppTW9kdWxlIGV4dGVuZHMgTW9kdWxlIHtcblxuICBzdGF0aWMgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zID0gbnVsbDtcblxuICBwcml2YXRlIGlzRWRnZUJyb3dzZXIgPSBmYWxzZTtcbiAgcHJpdmF0ZSBwYXN0ZWQgPSBmYWxzZTtcblxuICBnZXQgcmVwbGFjZW1lbnRzKCk6IElFbW9qaVJlcGxhY2VtZW50IHtcblxuICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IFtcbiAgICAgIC8vIFVuaWNvZGUgdG8gRW1vamlcbiAgICAgIHtcbiAgICAgICAgcmVnZXg6IHVuaWNvZGVSZSgpLFxuICAgICAgICBtYXRjaEluZGV4OiAwLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAwLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS51bmljb2RlVG9FbW9qaShzdHIpXG4gICAgICB9XG4gICAgXTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udmVydEVtb3RpY29ucykge1xuICAgICAgLy8gRW1vdGljb25zIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKEVtb2ppLmVtb3RpY29uUmUsICdnJyksXG4gICAgICAgIG1hdGNoSW5kZXg6IDEsXG4gICAgICAgIHJlcGxhY2VtZW50SW5kZXg6IDEsXG4gICAgICAgIGZuOiAoc3RyOiBzdHJpbmcpID0+IEVtb2ppLmVtb3RpY29uVG9FbW9qaShzdHIpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnZlcnRTaG9ydE5hbWVzKSB7XG4gICAgICAvLyBTaG9ydE5hbWVzIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKEVtb2ppLnNob3J0TmFtZVJlLCAnZycpLFxuICAgICAgICBtYXRjaEluZGV4OiAyLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAxLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS5zaG9ydE5hbWVUb0Vtb2ppKHN0cilcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXBsYWNlbWVudHM7XG4gIH1cblxuICBnZXQgb3B0aW9ucygpOiBFbW9qaU1vZHVsZU9wdGlvbnMge1xuICAgIHJldHVybiBFbW9qaU1vZHVsZS5vcHRpb25zO1xuICB9XG5cbiAgc2V0IG9wdGlvbnMob3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zKSB7XG4gICAgRW1vamlNb2R1bGUub3B0aW9ucyA9IHsgLi4uKG5ldyBFbW9qaU1vZHVsZU9wdGlvbnMoKSksIC4uLm9wdGlvbnMgfTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tc2hhZG93ZWQtdmFyaWFibGVcbiAgY29uc3RydWN0b3IocHVibGljIHF1aWxsOiBhbnksIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIHN1cGVyKHF1aWxsLCBvcHRpb25zKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdFZGdlJykgPiAtMSkge1xuICAgICAgdGhpcy5pc0VkZ2VCcm93c2VyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBFbW9qaS51bmNvbXByZXNzKG9wdGlvbnMuZW1vamlEYXRhLCBvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLnByZXZlbnREcmFnKSB7XG4gICAgICAvLyBQcmV2ZW50IGVtb2ppcyBmcm9tIGRyYWdnaW5nXG4gICAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgKGV2ZW50OiBEcmFnRXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBwYXN0ZWQgdW5pY29kZSAvIGVtb3RpY29ucyAvIHNob3J0TmFtZXNcbiAgICBpZiAoIW9wdGlvbnMuZGlzYWJsZU9uUGFzdGUpIHtcbiAgICAgIHRoaXMucXVpbGwuY2xpcGJvYXJkLmFkZE1hdGNoZXIoTm9kZS5URVhUX05PREUsIChub2RlOiBIVE1MRWxlbWVudCwgZGVsdGE6IGFueSkgPT4ge1xuXG4gICAgICAgIHJldHVybiBFbW9qaS5jb252ZXJ0UGFzdGUoZGVsdGEsIHRoaXMucmVwbGFjZW1lbnRzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgdGV4dCBjaGFuZ2UgdG8gY29udmVydCB0eXBlZCBpbiBlbW9qaXMgb3IgcGFzdGVkIGVtb2ppcyB1c2luZyBXaW5kb3dzIDEwIEVtb2ppcyAvIG1vYmlsZVxuICAgIHF1aWxsLm9uKCd0ZXh0LWNoYW5nZScsIChkZWx0YTogYW55LCBvbGREZWx0YTogYW55LCBzb3VyY2U6IHN0cmluZykgPT4ge1xuXG4gICAgICAvLyB0ZXh0LWNoYW5nZSBhbHNvIHRyaWdnZXJzIG9uIGEgcGFzdGUgZXZlbnQsIHRoaXMgaXMgYSBoYWNrIHRvIHByZXZlbnQgb25lIG1vcmUgY2hlY2tcbiAgICAgIGlmICghdGhpcy5wYXN0ZWQgJiYgc291cmNlID09PSBRdWlsbC5zb3VyY2VzLlVTRVIpIHtcblxuICAgICAgICBjb25zdCBjaGFuZ2VzID0gRW1vamkuY29udmVydElucHV0KHF1aWxsLmdldENvbnRlbnRzKCksIHRoaXMucmVwbGFjZW1lbnRzKTtcblxuICAgICAgICBpZiAoY2hhbmdlcy5vcHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHF1aWxsLnVwZGF0ZUNvbnRlbnRzKGNoYW5nZXMsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnBhc3RlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdpbmcgY3V0IHRvIGNvcHkgYW5kIGRlbGV0ZVxuICAgIC8vIFRoZXJlIHNlZW1zIHRvIGJlIGEgYnVnIHdpdGggUXVpbGwgKyBDaHJvbWUgd2l0aCBjdXQuIFRoZSBwZXJmb3JtYW5jZSBpcyBtdWNoIHdvcnNlXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2N1dCcsIChldmVudDogQ2xpcGJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgIHNlbGVjdGlvbi5kZWxldGVGcm9tRG9jdW1lbnQoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVkZ2UgQnVnICMxOiBJbWFnZSBhbHQgdGFncyBhcmUgbm90IGNvcGllZC5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5taWNyb3NvZnQuY29tL2VuLXVzL21pY3Jvc29mdC1lZGdlL3BsYXRmb3JtL2lzc3Vlcy8xMzkyMTg2Ni9cbiAgICAvLyBFZGdlIEJ1ZyAjMjogdGhlIHVybCgpIGZ1bmN0aW9ucyBpbiBpbmxpbmUgc3R5bGVzIGFyZSBnZXR0aW5nIGVzY2FwZWQgd2hlbiBwYXN0ZWRcbiAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnBhc3RlZCA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLmlzRWRnZUJyb3dzZXIpIHtcbiAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCd0ZXh0L2h0bWwnLCBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvaHRtbCcpLnJlcGxhY2UoLyZhbXA7cXVvdDsvZywgJ1wiJykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=