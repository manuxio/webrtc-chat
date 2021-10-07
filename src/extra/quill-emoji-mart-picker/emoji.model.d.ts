import { EmojiModuleOptions, EmojiSet } from './emoji.quill-module';
export declare type ICustomEmoji = ICustomImageEmojiView | ICustomSpriteEmojiView;
export declare type IEmoji = IEmojiView | ICustomEmoji;
export interface CompressedEmojiData {
    name: string;
    unified: string;
    shortName: string;
    shortNames?: string[];
    sheet: [number, number];
    keywords?: string[];
    hidden?: string[];
    emoticons?: string[];
    text?: string;
    skinVariations?: EmojiVariation[];
    obsoletedBy?: string;
    obsoletes?: string;
}
export interface IEmojiReplacer {
    regex: RegExp;
    fn: (str: string) => IEmoji;
    matchIndex: number;
    replacementIndex: number;
    match?: RegExpExecArray;
}
export declare type IEmojiReplacement = IEmojiReplacer[];
interface IEmojiView {
    unified: string;
    id: string;
    sheet: [number, number];
    emoticons?: string[];
}
interface ICustomImageEmojiView {
    id: string;
    imageUrl: string;
    shortNames?: string[];
}
interface ICustomSpriteEmojiView {
    id: string;
    spriteUrl: string;
    sheet_x: number;
    sheet_y: number;
    size: 16 | 20 | 32 | 64;
    sheetColumns: number;
    sheetRows?: number;
    shortNames?: string[];
}
interface EmojiVariation {
    unified: string;
    sheet: [number, number];
    hidden?: string[];
}
export declare class Emoji {
    static unified: {
        [key: string]: IEmoji;
    };
    static emoticons: {
        [key: string]: IEmoji;
    };
    static shortNames: {
        [key: string]: IEmoji;
    };
    static emojiPrefix: string;
    static emoticonRe: string;
    static shortNameRe: string;
    static toCodePoint(unicodeSurrogates: string, sep?: string): string;
    static unicodeToEmoji(unicode: string): IEmoji;
    static emoticonToEmoji(emoticon: string): IEmoji;
    static shortNameToEmoji(shortName: string): IEmoji;
    static getEmojiDataFromUnified(unified: string): IEmoji;
    static getEmojiDataFromEmoticon(emoticon: string): IEmoji;
    static getEmojiDataFromShortName(shortName: string): IEmoji;
    static uncompress(list: CompressedEmojiData[], options: EmojiModuleOptions): void;
    static unifiedToNative(unified: string): string;
    static emojiSpriteStyles(sheet: IEmojiView['sheet'], set: EmojiSet | '', backgroundImageFn: (set: string, sheetSize: number) => string, size?: number, sheetSize?: 16 | 20 | 32 | 64, sheetColumns?: number): {
        width: string;
        height: string;
        display: string;
        'background-image': string;
        'background-size': string;
        'background-position': string;
    };
    static getSpritePosition(sheet: IEmojiView['sheet'], sheetColumns: number): string;
    static toHex(str: string): string;
    static buildImage(emoji: string | IEmoji, node: HTMLElement, set: EmojiSet, options: EmojiModuleOptions): HTMLElement;
    static convertInput(delta: any, replacements: IEmojiReplacement): any;
    static convertPaste(delta: any, replacements: IEmojiReplacement): any;
    static insertEmoji(quill: any, event: any): void;
}
export {};
