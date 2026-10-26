import {I18nString} from '../i18n/i18n-string';
import {EventSource} from '../petrinet/event-source';
import {RoleEvent} from './role-event';
import {RoleEventType} from './role-event-type.enum';

export class Role extends EventSource<RoleEvent, RoleEventType> {
    public static readonly ANONYMOUS = 'anonymous';
    public static readonly DEFAULT = 'default';

    private _id: string;
    private _title: I18nString;
    private _global: boolean;
    private _comment?: string;

    constructor(id: string) {
        super();
        this._id = id;
        this._title = new I18nString('');
        this._global = false;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get global(): boolean {
        return this._global;
    }

    set global(value: boolean) {
        this._global = value;
    }

    get comment(): string | undefined {
        return this._comment;
    }

    set comment(value: string | undefined) {
        this._comment = value;
    }

    public clone(): Role {
        const cloned = new Role(this._id);
        cloned._title = this._title?.clone();
        cloned._global = this._global;
        cloned._comment = this._comment;
        this.getEvents().forEach(event => cloned.addEvent(event.clone()));
        return cloned;
    }

    public compare(other: Role): number {
        return this.id.localeCompare(other.id);
    }
}
