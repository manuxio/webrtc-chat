import { CompressedEmojiData, ICustomEmoji, IEmojiReplacement } from './emoji.model';
declare const Module: any;
export declare type EmojiSet = 'apple' | 'google' | 'twitter' | 'emojione' | 'messenger' | 'facebook' | '';
export declare class EmojiModuleOptions {
    disableOnPaste: boolean;
    emojiData: CompressedEmojiData[];
    customEmojiData?: ICustomEmoji[];
    showTitle: boolean;
    preventDrag: boolean;
    indicator: string;
    convertEmoticons: boolean;
    convertShortNames: boolean;
    set?: () => EmojiSet;
    backgroundImageFn: (set: string, sheetSize: number) => string;
}
export declare class EmojiModule extends Module {
    quill: any;
    static options: EmojiModuleOptions;
    private isEdgeBrowser;
    private pasted;
    get replacements(): IEmojiReplacement;
    get options(): EmojiModuleOptions;
    set options(options: EmojiModuleOptions);
    constructor(quill: any, options: EmojiModuleOptions);
}
export {};
