import { IEmoji } from './emoji.model';
declare const Parchment: any;
export declare class EmojiBlot extends Parchment.Embed {
    static create(value: string | IEmoji): HTMLElement;
    static value(node: HTMLElement): string;
}
export {};
