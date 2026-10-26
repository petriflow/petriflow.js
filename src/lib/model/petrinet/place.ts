import {I18nString} from '../i18n/i18n-string';
import {NodeElement} from './node-element';

export class Place extends NodeElement {
    private _static: boolean;
    private _marking: number;

    constructor(x: number, y: number, isStatic: boolean, id: string) {
        super(id, x, y, new I18nString(''));
        this._static = isStatic;
        this._marking = 0;
    }

    get static(): boolean {
        return this._static;
    }

    set static(value: boolean) {
        this._static = value;
    }

    get marking(): number {
        return this._marking;
    }

    set marking(value: number) {
        this._marking = value;
    }

    public clone(): Place {
        const cloned = new Place(this.x, this.y, this.static, this.id);
        cloned.label = this.label?.clone();
        cloned._marking = this._marking;
        cloned.comment = this.comment;
        return cloned;
    }
}
