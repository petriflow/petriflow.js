import {Element} from '../petrinet/element';
import {NodeElement} from '../petrinet/node-element';
import {ArcType, XmlArcType} from './arc-type.enum';
import {Breakpoint} from './breakpoint';

export abstract class Arc<S extends NodeElement, D extends NodeElement> extends Element {
    private _source: S;
    private _destination: D;
    private _multiplicity: number;
    private _reference?: string;
    private _breakpoints: Array<Breakpoint>;
    private _comment?: string;

    constructor(source: S, target: D, id: string) {
        super(id);
        this._source = source;
        this._destination = target;
        this._multiplicity = 1;
        this._breakpoints = [];
    }

    public static arcTypeMapping: Map<ArcType, XmlArcType> = new Map([
        [ArcType.REGULAR_TP, XmlArcType.REGULAR],
        [ArcType.REGULAR_PT, XmlArcType.REGULAR],
        [ArcType.READ, XmlArcType.READ],
        [ArcType.RESET, XmlArcType.RESET],
        [ArcType.INHIBITOR, XmlArcType.INHIBITOR],
    ]);

    abstract get type(): ArcType;

    get source(): S {
        return this._source;
    }

    set source(value: S) {
        this._source = value;
    }

    get destination(): D {
        return this._destination;
    }

    set destination(value: D) {
        this._destination = value;
    }

    get multiplicity(): number {
        return this._multiplicity;
    }

    set multiplicity(value: number) {
        this._multiplicity = value;
    }

    get reference(): string | undefined {
        return this._reference;
    }

    set reference(value: string | undefined) {
        this._reference = value;
    }

    get breakpoints(): Array<Breakpoint> {
        return this._breakpoints;
    }

    set breakpoints(value: Array<Breakpoint>) {
        this._breakpoints = value;
    }

    get comment(): string | undefined {
        return this._comment;
    }

    set comment(value: string | undefined) {
        this._comment = value;
    }

    cloneAttributes(cloned: Arc<S, D>): void {
        cloned._multiplicity = this._multiplicity;
        cloned._reference = this._reference;
        cloned._breakpoints = this._breakpoints?.map(bp => bp.clone());
        cloned._comment = this._comment;
    }

    abstract clone(): Arc<S, D>;
}
