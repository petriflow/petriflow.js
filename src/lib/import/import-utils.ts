import {
    Action,
    Alignment,
    Appearance,
    Arc,
    CompactDirection,
    Component,
    DataEvent,
    DataEventType,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    DataVariable,
    Event,
    EventPhase,
    Expression,
    FunctionScope,
    HideEmptyRows,
    I18nString,
    I18nWithDynamic,
    Icon,
    IconType,
    LayoutType,
    NodeElement,
    PetriflowFunction,
    PetriNet,
    Place,
    ProcessPermissionRef,
    Property,
    Template,
    TransitionPermissionRef,
    Trigger,
    TriggerType,
    XmlArcType,
} from '../model';

export class ImportUtils {

    private eventIdCounter = 0;
    private actionIdCounter = 0;

    public tagValue(xmlTag: Element | Document | null, child: string): string {
        if (!xmlTag || xmlTag.getElementsByTagName(child).length === 0 || xmlTag.getElementsByTagName(child)[0].childNodes.length === 0) {
            return '';
        }
        const parentNodeName = xmlTag.nodeName === '#document' ? 'document' : xmlTag.nodeName;
        const tags: Element[] = Array.from(xmlTag.getElementsByTagName(child)).filter(tag => tag?.parentNode?.nodeName === parentNodeName);
        if (tags === undefined || tags.length === 0 || tags[0]?.childNodes.length === 0) {
            return '';
        }
        return tags[0]?.childNodes[0]?.nodeValue ?? '';
    }

    public parseI18n(xmlTag: Element | Document, child: string): I18nString {
        const i18n = new I18nString(this.tagValue(xmlTag, child));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child)[0].getAttribute('name');
            i18n.name = name === null ? undefined : name;
        }
        return i18n;
    }

    public parseI18nWithDynamic(xmlTag: Element | Document, child: string): I18nWithDynamic {
        const i18n = new I18nWithDynamic(this.removeExcessiveIndents(this.tagValue(xmlTag, child)));
        if (i18n.value !== '') {
            const name = xmlTag.getElementsByTagName(child)[0].getAttribute('name');
            i18n.name = name === null ? undefined : name;
            i18n.dynamic = xmlTag.getElementsByTagName(child)[0].getAttribute('dynamic') === 'true';
        }
        return i18n;
    }

    public tagAttribute(xmlTag: Element | null, attribute: string): string {
        if (!xmlTag) {
            return '';
        }
        let attr;
        for (let i = 0; i < xmlTag.attributes.length; i++) {
            if (xmlTag.attributes.item(i)?.name === attribute) {
                attr = xmlTag.attributes.item(i);
                break;
            }
        }
        if (!attr) {
            return '';
        }
        return attr.value;
    }

    public parseAction(actionTag: Element): Action {
        const actionId = actionTag.getAttribute('id') ?? 'action_' + this.getNextActionId();
        const definition = this.parseDefinition(actionTag);
        return new Action(actionId, definition.trim());
    }

    parseFunction(xmlFunction: Element) {
        const name = this.tagAttribute(xmlFunction, 'name');
        const scope = this.tagAttribute(xmlFunction, 'scope') as FunctionScope;
        const definition = this.parseDefinition(xmlFunction);
        return new PetriflowFunction(name, scope, definition);
    }

    public parseDefinition(tag: Element) {
        let definition = '';
        for (const node of Array.from(tag.childNodes)) {
            if (node.nodeName === '#comment') {
                if (!node.nodeValue || node.nodeValue.includes('@formatter')) {
                    continue;
                }
                definition += '<!--' + node.nodeValue + '-->';
            } else {
                definition += node.nodeValue;
            }
        }
        return this.removeExcessiveIndents(definition);
    }

    public removeExcessiveIndents(action: string): string {
        const lines = action.split('\n')
            .filter(line => line.trim().length !== 0);
        let commonIndent = Math.min(...(lines.map(l => l.length - l.trimStart().length)));
        if (isNaN(commonIndent) || !isFinite(commonIndent)) {
            commonIndent = 0;
        }
        return lines.map(line => line.substring(commonIndent)).join('\n');
    }

    public parseComment(xmlTag: Element | Document): string | undefined {
        const parent = xmlTag.nodeName === '#document' ? (xmlTag as Document).documentElement : xmlTag as Element;
        const xmlComment = Array.from(parent?.children ?? []).find(child => child.nodeName === 'comment');
        if (!xmlComment) {
            return undefined;
        }
        let content = '';
        for (const node of Array.from(xmlComment.childNodes)) {
            if (node.nodeName === '#text' || node.nodeName === '#cdata-section') {
                content += node.nodeValue ?? '';
            } else if (node.nodeName !== '#comment') {
                // HTML written without CDATA is parsed as elements, keep it as markup
                content += new XMLSerializer().serializeToString(node);
            }
        }
        const comment = this.removeCommentIndents(content);
        return comment === '' ? undefined : comment;
    }

    public removeCommentIndents(comment: string): string {
        const lines = comment.split(/\r?\n/);
        while (lines.length > 0 && lines[0].trim().length === 0) {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
            lines.pop();
        }
        const indents = lines.filter(line => line.trim().length !== 0).map(line => line.length - line.trimStart().length);
        const commonIndent = indents.length > 0 ? Math.min(...indents) : 0;
        return lines.map(line => line.substring(commonIndent)).join('\n');
    }

    public parseEncryption(xmlTag: Element): string | undefined {
        const encryption = this.tagValue(xmlTag, 'encryption');
        if (!encryption || encryption !== 'true') {
            return undefined;
        }
        const algorithm = xmlTag.getElementsByTagName('encryption')[0].getAttribute('algorithm');
        if (typeof algorithm === 'string' && algorithm !== '') {
            return algorithm;
        }
        return encryption;
    }

    public parseViewAndComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            const xmlViewTag = xmlTag.getElementsByTagName('view')[0];
            if (!xmlViewTag?.children || xmlViewTag.children.length === 0) {
                return undefined;
            }
            // TODO: <view><list>5</list></view>
            return new Component(xmlViewTag.children[0].nodeName);
        }
        return this.parseComponent(xmlTag);
    }

    public parseComponent(xmlTag: Element): Component | undefined {
        const xmlComponent = xmlTag.getElementsByTagName('component')[0];
        if (!xmlComponent?.children || xmlComponent.children.length === 0) {
            return undefined;
        }
        const comp = new Component(this.tagValue(xmlComponent, 'name'));
        const properties = xmlComponent.getElementsByTagName('properties')[0];
        if (properties?.children && properties.children.length > 0) {
            for (const prop of Array.from(properties.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
            const icons = properties.getElementsByTagName('option_icons').item(0);
            if (icons?.children && icons.children.length > 0) {
                for (const iconXml of Array.from(icons.getElementsByTagName('icon'))) {
                    const key = this.tagAttribute(iconXml, 'key');
                    let type = this.tagAttribute(iconXml, 'type') as IconType;
                    if (type as string === '') {
                        type = IconType.MATERIAL;
                    }
                    const icon = iconXml.innerHTML;
                    comp.icons.push(new Icon(key, icon, type));
                }
            }
        } else {
            for (const prop of Array.from(xmlComponent.getElementsByTagName('property'))) {
                comp.properties.push(this.parseProperty(prop));
            }
        }
        return comp;
    }

    public parseProperty(property: Element): Property {
        const key = this.tagAttribute(property, 'key');
        const value = property.innerHTML;
        return new Property(key, value);
    }

    public resolveLogic(xmlRoleRefLogic: Element, roleRef: TransitionPermissionRef): void {
        roleRef.logic.delegate = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delegate'));
        roleRef.logic.perform = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'perform'));
        /* @deprecated - 'this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'))' is deprecated and it and following line will be removed in future versions. */
        const assigned = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assigned'));
        if (assigned !== undefined) {
            roleRef.logic.assign = assigned;
        } else {
            roleRef.logic.assign = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'assign'));
        }
        roleRef.logic.cancel = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'cancel'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public resolveLogicValue(logicValue: string): boolean | undefined {
        return (logicValue !== undefined && logicValue !== '') ? logicValue === 'true' : undefined;
    }

    public resolveCaseLogic(xmlRoleRefLogic: Element, roleRef: ProcessPermissionRef): void {
        roleRef.logic.create = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'create'));
        roleRef.logic.delete = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'delete'));
        roleRef.logic.view = this.resolveLogicValue(this.tagValue(xmlRoleRefLogic, 'view'));
    }

    public checkVariability(model: PetriNet, arc: Arc<NodeElement, NodeElement>, reference: string | undefined): void {
        if (!reference) {
            return;
        }
        let ref: Place | DataVariable | undefined = model.getPlace(reference);
        if (ref) {
            this.attachReference(arc, ref);
        } else {
            ref = model.getData(reference);
            if (ref) {
                this.attachReference(arc, ref);
            }
        }
    }

    public attachReference(arc: Arc<NodeElement, NodeElement>, reference: Place | DataVariable): void {
        let weight: number;
        if (reference instanceof Place) {
            weight = reference.marking;
        } else {
            if (reference.init?.value && ImportUtils.isInitValueNumber(reference.init)) {
                weight = parseInt(reference.init.value.trim());
            } else {
                weight = 0;
            }
        }
        if (isNaN(weight)) {
            throw new Error('Not a number. Cannot change the value of arc weight.');
        }
        if (weight < 0) {
            throw new Error('A negative number. Cannot change the value of arc weight.');
        }

        if (!isNaN(weight) && weight >= 0) {
            arc.multiplicity = weight;
            arc.reference = reference.id;
        }
    }

    /**
     * Determines whether the given value is an initial numeric value.
     * This method checks if the provided `value` is defined, has a `value` property,
     * and passes the `initValueNumberTest` logic.
     *
     * @param {I18nWithDynamic} [value] - The value to be checked.
     * @return {boolean} Returns `true` if the value is an initial numeric value, otherwise `false`.
     */
    public static isInitValueNumber(value?: I18nWithDynamic): boolean {
        return !!value && !!value.value && this.initValueNumberTest(value);
    }

    /**
     * Validates whether the provided value in an I18nWithDynamic object is a valid positive number string.
     *
     * @param {I18nWithDynamic} [value] - The object containing the value to be tested.
     * @return {boolean} Returns true if the value exists, is non-empty, and matches the regex pattern for a positive number; otherwise, returns false.
     */
    public static initValueNumberTest(value?: I18nWithDynamic): boolean {
        if (!value || !value.value) return false;
        return /^[1-9]\d*(\.0+)?$/.test(value.value.trim());
    }

    public parseTrigger(xmlTrigger: Element): Trigger {
        const trigger = new Trigger();
        trigger.type = this.tagAttribute(xmlTrigger, 'type') as TriggerType;
        if (trigger.type === TriggerType.TIME) {
            trigger.delay = this.tagValue(xmlTrigger, 'delay') === '' ? undefined : this.tagValue(xmlTrigger, 'delay');
            trigger.exact = this.tagValue(xmlTrigger, 'exact') === '' ? undefined : new Date(this.tagValue(xmlTrigger, 'exact'));
        }
        return trigger;
    }

    public parseRoleRef(xmlRoleRef: Element): TransitionPermissionRef {
        const xmlRoleRefLogic = xmlRoleRef.getElementsByTagName('logic')[0];
        const roleRef = new TransitionPermissionRef(this.tagValue(xmlRoleRef, 'id'));
        this.resolveLogic(xmlRoleRefLogic, roleRef);
        return roleRef;
    }

    public parseDataRef(xmlDataRef: Element, index: number): DataRef {
        const dataRef = new DataRef(this.tagValue(xmlDataRef, 'id'));
        dataRef.comment = this.parseComment(xmlDataRef);
        for (const xmlEvent of Array.from(xmlDataRef.getElementsByTagName('event'))) {
            const event = new DataEvent(this.tagAttribute(xmlEvent, 'type') as DataEventType, '');
            this.parseEvent(xmlEvent, event);
            dataRef.mergeEvent(event);
        }
        const xmlDataRefLogic = xmlDataRef.getElementsByTagName('logic')[0];
        if (xmlDataRefLogic) {
            const actionTags = Array.from(xmlDataRefLogic.getElementsByTagName('action'));
            if (actionTags.length > 0) {
                for (const actionTag of actionTags) {
                    const action = this.parseAction(actionTag);
                    const actionTrigger = actionTag.getAttribute('trigger') as DataEventType;
                    dataRef.addAction(action, actionTrigger);
                }
            }
            for (const logic of Array.from(xmlDataRefLogic.getElementsByTagName('behavior'))) {
                if (logic.childNodes[0].nodeValue as DataRefBehavior === DataRefBehavior.REQUIRED) {
                    dataRef.logic.required = true;
                } else if (logic.childNodes[0].nodeValue as DataRefBehavior === DataRefBehavior.IMMEDIATE) {
                    dataRef.logic.immediate = true;
                } else if (logic.childNodes[0].nodeValue as DataRefBehavior !== DataRefBehavior.OPTIONAL) {
                    dataRef.logic.behavior = logic.childNodes[0].nodeValue as DataRefBehavior;
                }
            }
        }
        dataRef.component = this.parseComponent(xmlDataRef);
        const xmlLayout = xmlDataRef.getElementsByTagName('layout');
        if (xmlLayout.length !== 0) {
            dataRef.layout = this.parseDataLayout(xmlLayout.item(0));
        } else {
            dataRef.layout = new DataLayout();
            dataRef.layout.x = 0;
            dataRef.layout.y = index;
            dataRef.layout.rows = 1;
            dataRef.layout.cols = 2;
        }
        return dataRef;
    }

    public parseDataLayout(xmlLayout: Element | null): DataLayout {
        const layout = new DataLayout();
        if (!xmlLayout) {
            return layout;
        }
        layout.x = this.parseNumberValue(xmlLayout, 'x') ?? 0;
        layout.y = this.parseNumberValue(xmlLayout, 'y') ?? 0;
        layout.rows = this.parseNumberValue(xmlLayout, 'rows') ?? 0;
        layout.cols = this.parseNumberValue(xmlLayout, 'cols') ?? 0;
        layout.template = this.tagValue(xmlLayout, 'template') as Template;
        layout.appearance = this.tagValue(xmlLayout, 'appearance') as Appearance;
        layout.offset = this.parseNumberValue(xmlLayout, 'offset');
        layout.alignment = this.tagValue(xmlLayout, 'alignment') as Alignment;
        return layout;
    }

    public parseDataGroup(xmlDataGroup: Element): DataGroup {
        const dataGroup = new DataGroup(this.tagValue(xmlDataGroup, 'id'));
        dataGroup.alignment = this.tagValue(xmlDataGroup, 'alignment') as Alignment;
        dataGroup.layout = this.tagValue(xmlDataGroup, 'layout') as LayoutType;
        if (dataGroup.layout && dataGroup.layout !== LayoutType.LEGACY) {
            const cols = this.parseNumberValue(xmlDataGroup, 'cols');
            if (cols && cols > 0) {
                dataGroup.cols = cols;
            }
            const rows = this.parseNumberValue(xmlDataGroup, 'rows');
            if (rows && rows > 0 || rows === 0) {
                dataGroup.rows = rows;
            }
        }
        dataGroup.stretch = this.tagValue(xmlDataGroup, 'stretch') === 'true';
        dataGroup.hideEmptyRows = this.tagValue(xmlDataGroup, 'hideEmptyRows') as HideEmptyRows;
        dataGroup.compactDirection = this.tagValue(xmlDataGroup, 'compactDirection') as CompactDirection;
        dataGroup.title = this.parseI18n(xmlDataGroup, 'title');
        const xmlDataRefs = Array.from(xmlDataGroup.getElementsByTagName('dataRef'));
        for (let i = 0; i < xmlDataRefs.length; i++) {
            const xmlDataRef = xmlDataRefs[i];
            dataGroup.addDataRef(this.parseDataRef(xmlDataRef, i));
        }
        return dataGroup;
    }

    public parsePlaceStatic(xmlPlace: Element): boolean {
        let isStatic = false;
        if (this.checkLengthAndNodes(xmlPlace, 'isStatic')) {
            isStatic = (xmlPlace.getElementsByTagName('isStatic')[0].childNodes[0].nodeValue === 'true');
        }
        if (this.checkLengthAndNodes(xmlPlace, 'static')) {
            isStatic = (xmlPlace.getElementsByTagName('static')[0].childNodes[0].nodeValue === 'true');
        }
        return isStatic;
    }

    public parseArcType(xmlArc: Element): XmlArcType {
        let parsedArcType = XmlArcType.REGULAR;
        if (this.checkLengthAndNodes(xmlArc, 'type')) {
            parsedArcType = xmlArc.getElementsByTagName('type')[0].childNodes[0].nodeValue as XmlArcType;
        }
        return parsedArcType;
    }

    public parseEvent<T>(xmlEvent: Element, event: Event<T>): void {
        event.id = this.tagValue(xmlEvent, 'id');
        if (event.id === '') {
            event.id = event.type + '_event_' + this.getNextEventId();
        }
        for (const actionsElement of Array.from(xmlEvent.getElementsByTagName('actions'))) {
            const actionsPhase = this.tagAttribute(actionsElement, 'phase') as EventPhase;
            const actionTags = Array.from(actionsElement.getElementsByTagName('action'));
            if (actionTags.length > 0) {
                for (const actionTag of actionTags) {
                    const action = this.parseAction(actionTag);
                    event.addAction(action, actionsPhase);
                }
            }
        }
    }

    public resolveInits(xmlData: Element): Array<I18nWithDynamic> {
        const inits: Array<I18nWithDynamic> = [];
        if (this.checkLengthAndNodes(xmlData, 'inits')) {
            for (const value of Array.from(xmlData.getElementsByTagName('inits')[0]?.getElementsByTagName('init'))) {
                const init = this.resolveInitValue(value);
                if (!init) {
                    continue;
                }
                inits.push(init);
            }
        }
        return inits;
    }

    public resolveInit(xmlData: Element): I18nWithDynamic | undefined {
        let elementValue;
        for (const value of Array.from(xmlData.getElementsByTagName('init'))) {
            if (!value.parentElement?.tagName || value.parentElement.tagName !== 'data') {
                continue;
            }
            elementValue = value;
        }
        return this.resolveInitValue(elementValue);
    }

    public resolveInitValue(elementValue: Element | undefined): I18nWithDynamic | undefined {
        if (!elementValue) {
            return undefined;
        }
        const dynamic = this.tagAttribute(elementValue, 'dynamic');
        const name = this.tagAttribute(elementValue, 'name');
        const value = this.removeExcessiveIndents(elementValue.textContent ?? '');
        return new I18nWithDynamic(value, name, dynamic === '' ? undefined : dynamic === 'true');
    }

    public checkLengthAndNodes(element: Element, name: string) {
        return element.getElementsByTagName(name).length > 0 &&
            element.getElementsByTagName(name)[0].childNodes.length !== 0;
    }

    public resolveFormat(xmlData: Element, data: DataVariable): void {
        if (this.checkLengthAndNodes(xmlData, 'format')) {
            if (data.component === undefined) {
                data.component = new Component('currency');
            }
            const xmlCur = xmlData.getElementsByTagName('format')?.item(0)?.getElementsByTagName('currency').item(0);
            if (!xmlCur) {
                return;
            }
            data.component.properties.push(new Property('locale', this.tagValue(xmlCur, 'locale')));
            data.component.properties.push(new Property('code', this.tagValue(xmlCur, 'code') !== '' ? this.tagValue(xmlCur, 'code') : 'EUR'));
            data.component.properties.push(new Property('fractionSize', (this.parseNumberValue(xmlCur, 'fractionSize') !== undefined ? this.parseNumberValue(xmlCur, 'fractionSize') : 2)?.toString() ?? ''));
        }
    }

    public parseNumberValue(element: Element | null, name: string): number | undefined {
        if (!element) {
            return undefined;
        }
        const value = parseInt(this.tagValue(element, name), 10);
        return isNaN(value) ? undefined : value;
    }

    public parseExpression(xmlTag: Element, name: string): Expression | undefined {
        const val = this.removeExcessiveIndents(this.tagValue(xmlTag, name));
        let dynamic;
        if (xmlTag.getElementsByTagName(name).length > 0) {
            dynamic = this.tagAttribute(xmlTag.getElementsByTagName(name).item(0), 'dynamic');
        }
        if (val === '' && dynamic !== 'true') {
            return undefined;
        }
        return new Expression(val, dynamic === '' ? undefined : dynamic === 'true');
    }

    private getNextEventId(): number {
        return this.eventIdCounter++;
    }

    private getNextActionId(): number {
        return this.actionIdCounter++;
    }

    public resetEventId(): void {
        this.eventIdCounter = 0;
    }

    public resetActionId(): void {
        this.actionIdCounter = 0;
    }

    public resetIds(): void {
        this.resetEventId();
        this.resetActionId();
    }

    parseTags(xmlDoc: Element | Document): Map<string, string> {
        const tags = new Map<string, string>();
        const tagsElement = xmlDoc.getElementsByTagName('tags')[0];
        if (tagsElement?.children && tagsElement.children.length > 0) {
            for (const tagElement of Array.from(xmlDoc.getElementsByTagName('tag'))) {
                this.parseTag(tags, tagElement);
            }
        }
        return tags;
    }

    parseTag(tags: Map<string, string>, tagElement: Element): void {
        const key = this.tagAttribute(tagElement, 'key');
        const value = tagElement.innerHTML;
        tags.set(key, value);
    }
}
