import {I18nString} from '../i18n/i18n-string';
import {Element} from './element';

export abstract class NodeElement extends Element {
    private _x: number;
    private _y: number;
    private _label: I18nString;
    private _comment?: string;

    protected constructor(id: string, x: number, y: number, label: I18nString) {
        super(id);
        this._x = x;
        this._y = y;
        this._label = label;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get label(): I18nString {
        return this._label;
    }

    set label(value: I18nString) {
        this._label = value;
    }

    get comment(): string | undefined {
        return this._comment;
    }

    set comment(value: string | undefined) {
        this._comment = value;
    }
}
