import {
    Action,
    Arc,
    ArcType,
    CaseLogic,
    Event,
    Expression,
    I18nString,
    I18nWithDynamic,
    Logic, Option,
    PetriflowFunction,
    XmlArcType
} from '../model';

export class ExportUtils {

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    public exportTag(doc: Element, name: string, value: string | undefined, force = false, attributes?: Array<{
        key: string,
        value: string
    }>, cdata = false): void {
        if (value === undefined) {
            return;
        }
        if (value !== '') {
            const element = this.xmlConstructor.createElement(name);
            attributes?.forEach(item => {
                element.setAttribute(item.key, item.value);
            });
            if (cdata) {
                element.appendChild(this.createCDATA(value));
            } else {
                element.textContent = value;
            }
            doc.appendChild(element);
        } else if (force) {
            const tag = this.xmlConstructor.createElement(name);
            doc.appendChild(tag);
        }
    }

    public exportExpression(doc: Element, name: string, value: Expression | undefined): void {
        this.exportTag(doc, name, value?.expression, false, value?.dynamic ? [{
            key: 'dynamic',
            value: value.dynamic.toString()
        }] : undefined, value?.dynamic);
    }

    public exportOption(doc: Element, name: string, value : Option | undefined): void {
        const attributes = [];
        if (value?.key) {
            attributes.push({
                key: 'key',
                value: value?.key?.toString()
            });
        }
        if (value?.value?.name) {
            attributes.push({
                key: 'name',
                value: value.value.name.toString()
            });
        }
        this.exportTag(doc, name, value?.value?.value, false, attributes);
    }

    public exportI18nString(doc: Element, name: string, value: I18nString | undefined, force = false): void {
        this.exportTag(doc, name, value?.value, force, value?.name ? [{
            key: 'name',
            value: value.name.toString()
        }] : undefined);
    }

    public exportI18nWithDynamic(doc: Element, name: string, value: I18nWithDynamic | undefined): void {
        const attributes = [];
        if (value?.dynamic) {
            attributes.push({
                key: 'dynamic',
                value: value.dynamic.toString()
            });
        }
        if (value?.name) {
            attributes.push({
                key: 'name',
                value: value.name
            });
        }
        this.exportTag(doc, name, value?.value, false, attributes, value?.dynamic);
    }

    public exportComment(doc: Element, comment: string | undefined): void {
        if (comment === undefined || comment.trim().length === 0) {
            return;
        }
        const element = this.xmlConstructor.createElement('comment');
        // CDATA section cannot contain ']]>', split it into consecutive sections
        const parts = comment.split(']]>');
        parts.forEach((part, index) => {
            const prefix = index === 0 ? '\n' : '>';
            const suffix = index === parts.length - 1 ? '\n' : ']]';
            element.appendChild(this.xmlConstructor.createCDATASection(`${prefix}${part}${suffix}`));
        });
        doc.appendChild(element);
    }

    public exportActions<T>(element: Element, event: Event<T>, phase: string): void {
        const actions = this.xmlConstructor.createElement('actions');
        actions.setAttribute('phase', phase);
        if (phase === 'pre') {
            event.preActions.forEach(action => {
                this.exportAction(actions, action);
            });
        } else {
            event.postActions.forEach(action => {
                this.exportAction(actions, action);
            });
        }
        element.appendChild(actions);
    }

    public exportAction(element: Element, action: Action): void {
        if (action.definition === undefined || action.definition.trim().length === 0) {
            return;
        }
        const exportAction = this.xmlConstructor.createElement('action');
        if (action.id !== undefined && action.id != null) {
            exportAction.setAttribute('id', action.id);
        }
        exportAction.appendChild(this.createCDATA(action.definition));
        element.appendChild(exportAction);
    }

    public exportFunction(element: Element, _function: PetriflowFunction): void {
        const xmlFunction = this.xmlConstructor.createElement('function');
        xmlFunction.setAttribute('scope', _function.scope);
        xmlFunction.setAttribute('name', _function.name);
        xmlFunction.appendChild(this.createCDATA(_function.definition));
        element.appendChild(xmlFunction);
    }

    public exportLogic(element: Element, logic: Logic, type: string): void {
        const exportLogic = this.xmlConstructor.createElement(type);
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        if (logic.cancel !== undefined) {
            this.exportTag(exportLogic, 'cancel', logic.cancel.toString());
        }
        if (logic.assign !== undefined) {
            this.exportTag(exportLogic, 'assign', logic.assign.toString());
        }
        if (logic.delegate !== undefined) {
            this.exportTag(exportLogic, 'delegate', logic.delegate.toString());
        }
        if (logic.perform !== undefined) {
            this.exportTag(exportLogic, 'perform', logic.perform.toString());
        }
        element.appendChild(exportLogic);
    }

    public exportCaseLogic(element: Element, logic: CaseLogic, type: string): void {
        const exportLogic = this.xmlConstructor.createElement(type);
        if (logic.create !== undefined) {
            this.exportTag(exportLogic, 'create', logic.create.toString());
        }
        if (logic.delete !== undefined) {
            this.exportTag(exportLogic, 'delete', logic.delete.toString());
        }
        if (logic.view !== undefined) {
            this.exportTag(exportLogic, 'view', logic.view.toString());
        }
        element.appendChild(exportLogic);
    }

    public exportArcType(type: ArcType): XmlArcType {
        const xmlType = Arc.arcTypeMapping.get(type);
        if (!xmlType) {
            throw new Error(`Unknown export mapping for arc type ${type}`);
        }
        return xmlType;
    }

    public createCDATA(content: string): CDATASection {
        return this.xmlConstructor.createCDATASection(`\n${content}\n`);
    }

    public exportTags(doc: Element, tags: Map<string, string>): void {
        if (tags.size === 0) {
            return;
        }
        const tagsElement = this.xmlConstructor.createElement('tags');
        tags.forEach((value, key) => this.exportTag(tagsElement, 'tag', value, false, [{
            key: 'key',
            value: key
        }]));
        doc.appendChild(tagsElement);
    }
}
