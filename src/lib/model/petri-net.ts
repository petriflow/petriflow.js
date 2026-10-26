import {Arc} from './arc/arc';
import {DataType} from './data-variable/data-type.enum';
import {DataVariable} from './data-variable/data-variable';
import {I18nString} from './i18n/i18n-string';
import {I18nTranslations} from './i18n/i18n-translations';
import {I18nWithDynamic} from './i18n/i18n-with-dynamic';
import {CaseEvent} from './petrinet/case-event';
import {CaseEventType} from './petrinet/case-event-type.enum';
import {Mapping} from './petrinet/mapping';
import {NodeElement} from './petrinet/node-element';
import {PetriflowFunction} from './petrinet/petriflow-function';
import {Place} from './petrinet/place';
import {ProcessEvent} from './petrinet/process-event';
import {ProcessEventType} from './petrinet/process-event-type.enum';
import {ProcessPermissionRef} from './petrinet/process-permission-ref';
import {Transaction} from './petrinet/transaction';
import {Role} from './role/role';
import {Transition} from './transition/transition';

export class PetriNet {
    private _id: string;
    private _version: string;
    private _lastChanged: number;
    private _initials: string;
    private _title: I18nString;
    private _comment?: string;
    private _icon: string;
    private _defaultRole: boolean;
    private _anonymousRole: boolean;
    private _transitionRole: boolean;
    private _caseName: I18nWithDynamic;
    private _roleRefs: Map<string, ProcessPermissionRef>;
    private _userRefs: Map<string, ProcessPermissionRef>;
    private _processEvents: Map<ProcessEventType, ProcessEvent>;
    private _caseEvents: Map<CaseEventType, CaseEvent>;
    private _transactions: Map<string, Transaction>;
    private _roles: Map<string, Role>;
    private _functions: Array<PetriflowFunction>;
    private _data: Map<string, DataVariable>;
    private _mappings: Map<string, Mapping>;
    private _i18ns: Map<string, I18nTranslations>;
    private _transitions: Map<string, Transition>;
    private _places: Map<string, Place>;
    private _arcs: Map<string, Arc<NodeElement, NodeElement>>;
    private _tags: Map<string, string>;

    constructor() {
        this._id = 'new_model';
        this._version = '';
        this._lastChanged = Date.now();
        this._initials = 'NEW';
        this._title = new I18nString('New Model');
        this._icon = 'device_hub';
        this._defaultRole = true;
        this._anonymousRole = true;
        this._transitionRole = false;
        this._caseName = new I18nWithDynamic('');
        this._transitions = new Map<string, Transition>();
        this._places = new Map<string, Place>();
        this._arcs = new Map<string, Arc<NodeElement, NodeElement>>();
        this._data = new Map<string, DataVariable>();
        this._transactions = new Map<string, Transaction>();
        this._roles = new Map<string, Role>();
        this._functions = new Array<PetriflowFunction>();
        this._roleRefs = new Map<string, ProcessPermissionRef>();
        this._userRefs = new Map<string, ProcessPermissionRef>();
        this._i18ns = new Map<string, I18nTranslations>();
        this._processEvents = new Map<ProcessEventType, ProcessEvent>();
        this._caseEvents = new Map<CaseEventType, CaseEvent>();
        this._mappings = new Map<string, Mapping>();
        this._tags = new Map<string, string>();
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get version(): string {
        return this._version;
    }

    set version(value: string) {
        this._version = value;
    }

    get lastChanged(): number {
        return this._lastChanged;
    }

    set lastChanged(value: number) {
        this._lastChanged = value;
    }

    get initials(): string {
        return this._initials;
    }

    set initials(value: string) {
        this._initials = value;
    }

    get title(): I18nString {
        return this._title;
    }

    set title(value: I18nString) {
        this._title = value;
    }

    get comment(): string | undefined {
        return this._comment;
    }

    set comment(value: string | undefined) {
        this._comment = value;
    }

    get icon(): string {
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
    }

    get defaultRole(): boolean {
        return this._defaultRole;
    }

    set defaultRole(value: boolean) {
        this._defaultRole = value;
    }

    get anonymousRole(): boolean {
        return this._anonymousRole;
    }

    set anonymousRole(value: boolean) {
        this._anonymousRole = value;
    }

    get transitionRole(): boolean {
        return this._transitionRole;
    }

    set transitionRole(value: boolean) {
        this._transitionRole = value;
    }

    get caseName(): I18nWithDynamic {
        return this._caseName;
    }

    set caseName(value: I18nWithDynamic) {
        this._caseName = value;
    }

    getRoleRefs(): Array<ProcessPermissionRef> {
        return Array.from(this._roleRefs.values());
    }

    getRoleRef(id: string): ProcessPermissionRef | undefined {
        return this._roleRefs.get(id);
    }

    addRoleRef(roleRef: ProcessPermissionRef) {
        if (!this._roles.has(roleRef.id) && roleRef.id !== Role.DEFAULT && roleRef.id !== Role.ANONYMOUS) {
            throw new Error(`Referenced role with id ${roleRef.id} does not exist`);
        }
        if (this._roleRefs.has(roleRef.id)) {
            throw new Error(`Duplicate role ref with id ${roleRef.id}`);
        }
        this._roleRefs.set(roleRef.id, roleRef);
    }

    removeRoleRef(id: string) {
        this._roleRefs.delete(id);
    }

    getUserRefs(): Array<ProcessPermissionRef> {
        return Array.from(this._userRefs.values());
    }

    getUserRef(id: string): ProcessPermissionRef | undefined {
        return this._userRefs.get(id);
    }

    addUserRef(userRef: ProcessPermissionRef) {
        if (!this._data.has(userRef.id)) {
            throw new Error(`Referenced user field with id ${userRef.id} does not exist`);
        }
        if (this._data.get(userRef.id)?.type !== DataType.USER_LIST) {
            throw new Error(`Referenced field with id ${userRef.id} is not user field`);
        }
        if (this._userRefs.has(userRef.id)) {
            throw new Error(`Duplicate user ref with id ${userRef.id}`);
        }
        this._userRefs.set(userRef.id, userRef);
    }

    removeUserRef(id: string) {
        this._userRefs.delete(id);
    }

    getProcessEvents(): Array<ProcessEvent> {
        return Array.from(this._processEvents.values());
    }

    getProcessEvent(type: ProcessEventType): ProcessEvent | undefined {
        return this._processEvents.get(type);
    }

    addProcessEvent(event: ProcessEvent) {
        if (this._processEvents.has(event.type)) {
            throw new Error(`Duplicate process event of type ${event.type}`);
        }
        this._processEvents.set(event.type, event);
    }

    removeProcessEvent(type: ProcessEventType) {
        this._processEvents.delete(type);
    }

    getCaseEvents(): Array<CaseEvent> {
        return Array.from(this._caseEvents.values());
    }

    getCaseEvent(type: CaseEventType): CaseEvent | undefined {
        return this._caseEvents.get(type);
    }

    addCaseEvent(event: CaseEvent) {
        if (this._caseEvents.has(event.type)) {
            throw new Error(`Duplicate case event of type ${event.type}`);
        }
        this._caseEvents.set(event.type, event);
    }

    removeCaseEvent(type: CaseEventType) {
        this._caseEvents.delete(type);
    }

    getTransactions(): Array<Transaction> {
        return Array.from(this._transactions.values());
    }

    getTransaction(id: string): Transaction | undefined {
        return this._transactions.get(id);
    }

    addTransaction(transaction: Transaction) {
        if (this._transactions.has(transaction.id)) {
            throw new Error(`Duplicate transaction with id ${transaction.id}`);
        }
        this._transactions.set(transaction.id, transaction);
    }

    removeTransaction(id: string) {
        this._transactions.delete(id);
    }

    getRoles(): Array<Role> {
        return Array.from(this._roles.values());
    }

    getRole(id: string): Role | undefined {
        return this._roles.get(id);
    }

    addRole(role: Role) {
        if (this._roles.has(role.id)) {
            throw new Error(`Duplicate role with id ${role.id}`);
        }
        this._roles.set(role.id, role);
    }

    removeRole(id: string) {
        this._roles.delete(id);
    }

    get functions(): Array<PetriflowFunction> {
        return this._functions;
    }

    set functions(value: Array<PetriflowFunction>) {
        this._functions = value;
    }

    addFunction(value: PetriflowFunction) {
        this._functions.push(value);
    }

    getDataSet(): Array<DataVariable> {
        return Array.from(this._data.values());
    }

    getData(id: string): DataVariable | undefined {
        return this._data.get(id);
    }

    addData(dataVariable: DataVariable) {
        if (this._data.has(dataVariable.id)) {
            throw new Error(`Duplicate data variable with id ${dataVariable.id}`);
        }
        this._data.set(dataVariable.id, dataVariable);
    }

    removeData(id: string) {
        this._data.delete(id);
    }

    getMappings(): Array<Mapping> {
        return Array.from(this._mappings.values());
    }

    getMapping(id: string): Mapping | undefined {
        return this._mappings.get(id);
    }

    addMapping(mapping: Mapping) {
        if (this._mappings.has(mapping.id)) {
            throw new Error(`Duplicate mapping with id ${mapping.id}`);
        }
        this._mappings.set(mapping.id, mapping);
    }

    removeMapping(id: string) {
        this._mappings.delete(id);
    }

    getI18ns(): Array<I18nTranslations> {
        return Array.from(this._i18ns.values());
    }

    getI18n(locale: string): I18nTranslations | undefined {
        return this._i18ns.get(locale);
    }

    addI18n(i18n: I18nTranslations) {
        if (this._i18ns.has(i18n.locale)) {
            throw new Error(`Duplicate i18n with locale ${i18n.locale}`);
        }
        this._i18ns.set(i18n.locale, i18n);
    }

    removeI18n(locale: string) {
        this._i18ns.delete(locale);
    }

    getTransitions(): Array<Transition> {
        return Array.from(this._transitions.values());
    }

    getTransition(id: string): Transition | undefined {
        return this._transitions.get(id);
    }

    addTransition(transition: Transition) {
        if (this._transitions.has(transition.id)) {
            throw new Error(`Duplicate transition with id ${transition.id}`);
        }
        this._transitions.set(transition.id, transition);
    }

    removeTransition(id: string) {
        this._transitions.delete(id);
    }

    getPlaces(): Array<Place> {
        return Array.from(this._places.values());
    }

    getPlace(id: string): Place | undefined {
        return this._places.get(id);
    }

    addPlace(place: Place) {
        if (this._places.has(place.id)) {
            throw new Error(`Duplicate place with id ${place.id}`);
        }
        this._places.set(place.id, place);
    }

    removePlace(id: string) {
        this._places.delete(id);
    }

    getArcs(): Array<Arc<NodeElement, NodeElement>> {
        return Array.from(this._arcs.values());
    }

    getArc(id: string): Arc<NodeElement, NodeElement> | undefined {
        return this._arcs.get(id);
    }

    addArc(arc: Arc<NodeElement, NodeElement>) {
        if (this._arcs.has(arc.id)) {
            throw new Error(`Duplicate arc with id ${arc.id}`);
        }
        this._arcs.set(arc.id, arc);
    }

    removeArc(id: string) {
        this._arcs.delete(id);
    }

    get tags(): Map<string, string> {
        return this._tags;
    }

    set tags(value: Map<string, string>) {
        this._tags = value;
    }

    public clone(): PetriNet {
        const cloned = new PetriNet();
        cloned._id = this._id;
        cloned._version = this._version;
        cloned._lastChanged = this._lastChanged;
        cloned._initials = this._initials;
        cloned._title = this._title?.clone();
        cloned._comment = this._comment;
        cloned._icon = this._icon;
        cloned._defaultRole = this._defaultRole;
        cloned._anonymousRole = this._anonymousRole;
        cloned._transitionRole = this._transitionRole;
        cloned._caseName = this._caseName?.clone();
        this._processEvents.forEach(e => cloned.addProcessEvent(e.clone()));
        this._caseEvents.forEach(e => cloned.addCaseEvent(e.clone()));
        this._transactions.forEach(t => cloned.addTransaction(t.clone()));
        this._roles.forEach(r => cloned.addRole(r.clone()));
        this._functions.forEach(f => cloned.addFunction(f.clone()));
        this._data.forEach(d => cloned.addData(d.clone()));
        this._mappings.forEach(m => cloned.addMapping(m.clone()));
        this._i18ns.forEach(i => cloned.addI18n(i.clone()));
        this._transitions.forEach(t => cloned.addTransition(t.clone()));
        this._places.forEach(p => cloned.addPlace(p.clone()));
        this._arcs.forEach(a => {
            const clonedArc = a.clone();
            if (clonedArc.source instanceof Place) {
                clonedArc.source = cloned.getPlace(clonedArc.source.id) as Place;
                clonedArc.destination = cloned.getTransition(clonedArc.destination.id) as Transition;
            } else {
                clonedArc.source = cloned.getTransition(clonedArc.source.id) as Transition;
                clonedArc.destination = cloned.getPlace(clonedArc.destination.id) as Place;
            }
            cloned.addArc(clonedArc);
        });
        this._roleRefs.forEach(ref => cloned.addRoleRef(ref.clone()));
        this._userRefs.forEach(ref => cloned.addUserRef(ref.clone()));
        this._tags.forEach((value, key) => cloned.tags.set(key, value));
        return cloned;
    }
}
