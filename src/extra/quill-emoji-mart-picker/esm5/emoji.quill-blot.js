import { __extends } from "tslib";
import Quill from 'quill';
import { Emoji } from './emoji.model';
import { EmojiModule } from './emoji.quill-module';
var Parchment = Quill.import('parchment');
var EmojiBlot = /** @class */ (function (_super) {
    __extends(EmojiBlot, _super);
    function EmojiBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmojiBlot.create = function (value) {
        var node = _super.create.call(this);
        var options = EmojiModule.options;
        if (value) {
            Emoji.buildImage(value, node, options.set(), options);
        }
        return node;
    };
    EmojiBlot.value = function (node) {
        return node.getAttribute('alt');
    };
    return EmojiBlot;
}(Parchment.Embed));
export { EmojiBlot };
// tslint:disable: no-string-literal
EmojiBlot['blotName'] = 'emoji';
EmojiBlot['className'] = 'ql-emoji';
EmojiBlot['tagName'] = 'img';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtYmxvdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BudXRyaWZ5L3F1aWxsLWVtb2ppLW1hcnQtcGlja2VyLyIsInNvdXJjZXMiOlsiZW1vamkucXVpbGwtYmxvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRTFCLE9BQU8sRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRW5ELElBQU0sU0FBUyxHQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFakQ7SUFBK0IsNkJBQWU7SUFBOUM7O0lBa0JBLENBQUM7SUFoQlEsZ0JBQU0sR0FBYixVQUFjLEtBQXNCO1FBRWxDLElBQU0sSUFBSSxHQUFnQixPQUFNLE1BQU0sV0FBaUIsQ0FBQztRQUV4RCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBRXBDLElBQUksS0FBSyxFQUFFO1lBQ1QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN2RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVNLGVBQUssR0FBWixVQUFhLElBQWlCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBbEJELENBQStCLFNBQVMsQ0FBQyxLQUFLLEdBa0I3Qzs7QUFFRCxvQ0FBb0M7QUFDcEMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUNoQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsVUFBVSxDQUFDO0FBQ3BDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUXVpbGwgZnJvbSAncXVpbGwnO1xuXG5pbXBvcnQgeyBFbW9qaSwgSUVtb2ppIH0gZnJvbSAnLi9lbW9qaS5tb2RlbCc7XG5pbXBvcnQgeyBFbW9qaU1vZHVsZSB9IGZyb20gJy4vZW1vamkucXVpbGwtbW9kdWxlJztcblxuY29uc3QgUGFyY2htZW50OiBhbnkgPSBRdWlsbC5pbXBvcnQoJ3BhcmNobWVudCcpO1xuXG5leHBvcnQgY2xhc3MgRW1vamlCbG90IGV4dGVuZHMgUGFyY2htZW50LkVtYmVkIHtcblxuICBzdGF0aWMgY3JlYXRlKHZhbHVlOiBzdHJpbmcgfCBJRW1vamkpIHtcblxuICAgIGNvbnN0IG5vZGU6IEhUTUxFbGVtZW50ID0gc3VwZXIuY3JlYXRlKCkgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdCBvcHRpb25zID0gRW1vamlNb2R1bGUub3B0aW9ucztcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgRW1vamkuYnVpbGRJbWFnZSh2YWx1ZSwgbm9kZSwgb3B0aW9ucy5zZXQoKSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzdGF0aWMgdmFsdWUobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoJ2FsdCcpO1xuICB9XG59XG5cbi8vIHRzbGludDpkaXNhYmxlOiBuby1zdHJpbmctbGl0ZXJhbFxuRW1vamlCbG90WydibG90TmFtZSddID0gJ2Vtb2ppJztcbkVtb2ppQmxvdFsnY2xhc3NOYW1lJ10gPSAncWwtZW1vamknO1xuRW1vamlCbG90Wyd0YWdOYW1lJ10gPSAnaW1nJztcbiJdfQ==