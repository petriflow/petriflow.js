import {Component} from '../data-variable/component';
import {DataEventSource} from '../data-variable/data-event-source';
import {DataLayout} from './data-layout';
import {DataRefLogic} from './data-ref-logic';

export class DataRef extends DataEventSource {
    private _id: string;
    private _logic: DataRefLogic;
    private _layout: DataLayout;
    private _component?: Component;
    private _comment?: string;

    constructor(id: string) {
        super();
        this._id = id;
        this._logic = new DataRefLogic();
        this._layout = new DataLayout();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get logic(): DataRefLogic {
        return this._logic;
    }

    set logic(value: DataRefLogic) {
        this._logic = value;
    }

    get layout(): DataLayout {
        return this._layout;
    }

    set layout(value: DataLayout) {
        this._layout = value;
    }

    get component(): Component | undefined {
        return this._component;
    }

    set component(value: Component | undefined) {
        this._component = value;
    }

    get comment(): string | undefined {
        return this._comment;
    }

    set comment(value: string | undefined) {
        this._comment = value;
    }

    public clone(): DataRef {
        const cloned = new DataRef(this._id);
        cloned._logic = this._logic?.clone();
        cloned._layout = this._layout?.clone();
        cloned._component = this._component?.clone();
        cloned._comment = this._comment;
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }
}
