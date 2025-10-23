import {
    Arc,
    AssignPolicy,
    CaseEvent,
    Component,
    DataFocusPolicy,
    DataGroup,
    DataLayout,
    DataRef,
    DataRefBehavior,
    Event,
    FinishPolicy,
    IconType,
    LayoutType,
    NodeElement,
    PetriNet,
    ProcessEvent,
    ProcessPermissionRef,
    TransitionEvent,
    TransitionLayout,
    TransitionPermissionRef,
    TriggerType,
} from '../model';
import {ExportUtils} from './export-utils';

export class ExportService {

    public static readonly PETRIFLOW_SCHEMA_URL = 'https://petriflow.com/petriflow.schema.xsd';

    protected xmlConstructor = document.implementation.createDocument(null, 'document', null);

    constructor(protected _exportUtils: ExportUtils = new ExportUtils()) {
    }

    public exportXml(model: PetriNet): string {
        const xmlText = this.generateXml(model);
        return new XMLSerializer().serializeToString(xmlText);
    }

    public generateXml(model: PetriNet): Element {
        const doc = this.xmlConstructor.createElement('document');
        doc.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        doc.setAttribute('xsi:noNamespaceSchemaLocation', ExportService.PETRIFLOW_SCHEMA_URL);
        this.exportModel(doc, model);
        this.exportProcessRefs(doc, model);
        this.exportProcessEvents(doc, model);
        this.exportTransactions(doc, model);
        this.exportRoles(doc, model);
        this.exportFunctions(doc, model);
        this.exportData(doc, model);
        // TODO mapping
        this.exportI18n(doc, model);
        this.exportTransitions(doc, model);
        this.exportPlaces(doc, model);
        this.exportArcs(doc, model);
        return doc;
    }

    public exportModel(doc: Element, model: PetriNet): void {
        this._exportUtils.exportTag(doc, 'id', model.id, true);
        this._exportUtils.exportTag(doc, 'version', model.version);
        this._exportUtils.exportTag(doc, 'initials', model.initials, true);
        this._exportUtils.exportI18nString(doc, 'title', model.title, true);
        this._exportUtils.exportTag(doc, 'icon', model.icon);
        this._exportUtils.exportTag(doc, 'defaultRole', model.defaultRole !== undefined ? (model.defaultRole.toString()) : '');
        this._exportUtils.exportTag(doc, 'anonymousRole', model.anonymousRole !== undefined ? (model.anonymousRole.toString()) : '');
        this._exportUtils.exportTag(doc, 'transitionRole', model.transitionRole !== undefined ? (model.transitionRole.toString()) : '');
        this._exportUtils.exportTags(doc, model.tags);
        this._exportUtils.exportI18nWithDynamic(doc, 'caseName', model.caseName);
    }

    public exportTransactions(doc: Element, model: PetriNet): void {
        model.getTransactions().forEach(item => {
            const trans = this.xmlConstructor.createElement('transaction');
            this._exportUtils.exportTag(trans, 'id', item.id, true);
            this._exportUtils.exportI18nString(trans, 'title', item.title, true);
            doc.appendChild(trans);
        });
    }

    public exportRoles(doc: Element, model: PetriNet): void {
        model.getRoles().sort((a, b) => a.compare(b)).forEach(item => {
            const role = this.xmlConstructor.createElement('role');
            if (item.global) {
                role.setAttribute('global', item.global ? 'true' : 'false');
            }
            this._exportUtils.exportTag(role, 'id', item.id, true);
            this._exportUtils.exportI18nString(role, 'title', item.title, true);
            item.getEvents().forEach(event => {
                this.exportEvent(role, event);
            });
            doc.appendChild(role);
        });
    }

    public exportFunctions(doc: Element, model: PetriNet): void {
        model.functions.sort((a, b) => a.name.localeCompare(b.name)).forEach(_function => {
            this._exportUtils.exportFunction(doc, _function);
        });
    }

    public exportEvent<T>(element: Element, event: Event<T>): void {
        if (event.isEmpty()) {
            return;
        }
        let exportProcessEvent;
        if (event instanceof ProcessEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('processEvents');
        } else if (event instanceof CaseEvent) {
            exportProcessEvent = this.xmlConstructor.createElement('caseEvents');
        }
        const exportEvent = this.xmlConstructor.createElement('event');
        this._exportUtils.exportTag(exportEvent, 'id', event.id);
        exportEvent.setAttribute('type', `${event.type}`);
        if (event instanceof TransitionEvent) {
            this._exportUtils.exportI18nString(exportEvent, 'title', (event as TransitionEvent).title);
            this._exportUtils.exportI18nString(exportEvent, 'message', (event as TransitionEvent).message);
        }
        if (event.preActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'pre');
        }
        if (event.postActions.length > 0) {
            this._exportUtils.exportActions(exportEvent, event, 'post');
        }
        if ((event instanceof ProcessEvent || event instanceof CaseEvent) && !!exportProcessEvent) {
            exportProcessEvent.appendChild(exportEvent);
            element.appendChild(exportProcessEvent);
        } else {
            element.appendChild(exportEvent);
        }
    }

    public exportProcessRefs(doc: Element, model: PetriNet): void {
        model.getRoleRefs().sort((a, b) => a.compare(b)).forEach(roleRef => {
            this.exportProcessRef(doc, roleRef, 'roleRef');
        });
        model.getUserRefs().sort((a, b) => a.id.localeCompare(b.id)).forEach(userRef => {
            this.exportProcessRef(doc, userRef, 'userRef');
        });
    }

    public exportProcessRef(element: Element, ref: ProcessPermissionRef, name: string): void {
        if (ref.logic.create !== undefined ||
            ref.logic.delete !== undefined ||
            ref.logic.view !== undefined) {
            const processRef = this.xmlConstructor.createElement(name);
            this._exportUtils.exportTag(processRef, 'id', ref.id, true);
            this._exportUtils.exportCaseLogic(processRef, ref.logic, 'caseLogic');
            element.appendChild(processRef);
        }
    }

    public exportTransitionRef(element: Element, ref: TransitionPermissionRef, name: string): void {
        if (ref.logic.perform !== undefined ||
            ref.logic.assign !== undefined ||
            ref.logic.cancel !== undefined ||
            ref.logic.delegate !== undefined ||
            ref.logic.view !== undefined) {
            const transRef = this.xmlConstructor.createElement(name);
            this._exportUtils.exportTag(transRef, 'id', ref.id, true);
            this._exportUtils.exportLogic(transRef, ref.logic, 'logic');
            element.appendChild(transRef);
        }
    }

    public exportProcessEvents(doc: Element, model: PetriNet): void {
        model.getProcessEvents().forEach(event => {
            this.exportEvent(doc, event);
        });
        model.getCaseEvents().forEach(event => {
            this.exportEvent(doc, event);
        });
    }

    public exportData(doc: Element, model: PetriNet): void {
        model.getDataSet().sort((a, b) => a.compare(b)).forEach(data => {
            const exportData = this.xmlConstructor.createElement('data');
            exportData.setAttribute('type', data.type);
            if (data.immediate) {
                exportData.setAttribute('immediate', data.immediate.toString());
            }
            this._exportUtils.exportTag(exportData, 'id', data.id, true);
            this._exportUtils.exportI18nString(exportData, 'title', data.title, true);
            this._exportUtils.exportI18nString(exportData, 'placeholder', data.placeholder);
            this._exportUtils.exportI18nString(exportData, 'desc', data.desc);
            if (data.options.length > 0) {
                const options = this.xmlConstructor.createElement('options');
                data.options.forEach(opt => this._exportUtils.exportOption(options, 'option', opt));
                this._exportUtils.exportExpression(options, 'init', data.optionsInit);
                exportData.appendChild(options);
            }
            if (!!data.validations && (data.validations?.length ?? 0) > 0) {
                const validations = this.xmlConstructor.createElement('validations');
                data.validations?.forEach(validation => {
                    const valid = this.xmlConstructor.createElement('validation');
                    this._exportUtils.exportExpression(valid, 'expression', validation.expression);
                    this._exportUtils.exportI18nString(valid, 'message', validation.message);
                    validations.appendChild(valid);
                });
                exportData.appendChild(validations);
            }
            this._exportUtils.exportI18nWithDynamic(exportData, 'init', data.init);
            if (data.inits.length > 0) {
                const inits = this.xmlConstructor.createElement('inits');
                data.inits.forEach(init => {
                    this._exportUtils.exportI18nWithDynamic(inits, 'init', init);
                });
                exportData.appendChild(inits);
            }
            if (data.component !== undefined) {
                this.exportComponent(exportData, data.component);
            }
            if (data.encryption !== undefined) {
                if (data.encryption === 'true') {
                    this._exportUtils.exportTag(exportData, 'encryption', 'true');
                } else {
                    this._exportUtils.exportTag(exportData, 'encryption', 'true', false, [{
                        key: 'algorithm',
                        value: data.encryption,
                    }]);
                }
            }
            data.getEvents().forEach(event => {
                this.exportEvent(exportData, event);
            });
            data.actionRef?.forEach(action => {
                const ref = this.xmlConstructor.createElement('actionRef');
                this._exportUtils.exportTag(ref, 'id', action);
                exportData.appendChild(ref);
            });
            // TODO: documentRef
            if (data.remote) {
                this._exportUtils.exportTag(exportData, 'remote', 'true');
            }
            if (data.length !== undefined) {
                this._exportUtils.exportTag(exportData, 'length', data.length?.toString());
            }
            if (data.allowedNets?.length > 0) {
                const nets = this.xmlConstructor.createElement('allowedNets');
                data.allowedNets?.forEach(item => this._exportUtils.exportTag(nets, 'allowedNet', item));
                exportData.appendChild(nets);
            }
            doc.appendChild(exportData);
        });
    }

    public exportI18n(doc: Element, model: PetriNet): void {
        model.getI18ns().forEach(translations => {
            const i18ns = this.xmlConstructor.createElement('i18n');
            i18ns.setAttribute('locale', translations.locale);
            translations.getI18ns().forEach(i18n => {
                this._exportUtils.exportTag(i18ns, 'i18nString', i18n.value, false, [{
                    key: 'name',
                    value: i18n.name ?? '',
                }], true);
            });
            doc.appendChild(i18ns);
        });
    }

    public exportTransitions(doc: Element, model: PetriNet): void {
        model.getTransitions().sort((a, b) => a.compare(b)).forEach(trans => {
            const exportTrans = this.xmlConstructor.createElement('transition');
            this._exportUtils.exportTag(exportTrans, 'id', trans.id, true);
            this._exportUtils.exportTag(exportTrans, 'x', trans.x?.toString(), true);
            this._exportUtils.exportTag(exportTrans, 'y', trans.y?.toString(), true);
            this._exportUtils.exportI18nString(exportTrans, 'label', trans.label, true);
            this._exportUtils.exportTags(exportTrans, trans.tags);
            if (trans.layout && !trans.layout.empty()) {
                this.exportTransitionLayout(exportTrans, trans.layout);
            }
            this._exportUtils.exportTag(exportTrans, 'icon', trans.icon ?? '');
            if (trans.priority) {
                this._exportUtils.exportTag(exportTrans, 'priority', `${trans.priority}`);
            }
            this._exportUtils.exportTag(exportTrans, 'assignPolicy', trans.assignPolicy === AssignPolicy.MANUAL ? '' : trans.assignPolicy);
            this._exportUtils.exportTag(exportTrans, 'dataFocusPolicy', trans.dataFocusPolicy === DataFocusPolicy.MANUAL ? '' : trans.dataFocusPolicy);
            this._exportUtils.exportTag(exportTrans, 'finishPolicy', trans.finishPolicy === FinishPolicy.MANUAL ? '' : trans.finishPolicy);
            trans.triggers.forEach(trigger => {
                if (trigger.type !== TriggerType.TIME) {
                    const exportTrigger = this.xmlConstructor.createElement('trigger');
                    exportTrigger.setAttribute('type', trigger.type);
                    exportTrans.appendChild(exportTrigger);
                } else {
                    if (trigger.delay !== undefined && trigger.delay !== '') {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this._exportUtils.exportTag(exportTrigger, 'delay', trigger.delay);
                        exportTrans.appendChild(exportTrigger);
                    } else if (trigger.exact !== undefined) {
                        const exportTrigger = this.xmlConstructor.createElement('trigger');
                        exportTrigger.setAttribute('type', trigger.type);
                        this._exportUtils.exportTag(exportTrigger, 'exact', trigger.exact.toISOString());
                        exportTrans.appendChild(exportTrigger);
                    }
                }
            });
            this._exportUtils.exportTag(exportTrans, 'transactionRef', trans.transactionRef ?? '');
            trans.roleRefs.sort((a, b) => a.compare(b)).forEach(roleRef => {
                this.exportTransitionRef(exportTrans, roleRef, 'roleRef');
            });
            trans.userRefs.sort((a, b) => a.compare(b)).forEach(userRef => {
                this.exportTransitionRef(exportTrans, userRef, 'userRef');
            });
            if (trans.assignedUser !== undefined) {
                const assignedUser = this.xmlConstructor.createElement('assignedUser');
                this._exportUtils.exportTag(assignedUser, 'cancel', trans.assignedUser.cancel?.toString() ?? '');
                this._exportUtils.exportTag(assignedUser, 'reassign', trans.assignedUser.reassign?.toString() ?? '');
                exportTrans.appendChild(assignedUser);
            }
            trans.dataGroups.forEach(dataGroup => {
                this.exportDataGroup(exportTrans, dataGroup);
            });
            trans.eventSource.getEvents().forEach(event => {
                this.exportEvent(exportTrans, event);
            });
            doc.appendChild(exportTrans);
        });
    }

    public exportDataRef(element: Element, dataRef: DataRef): void {
        const exportDataRef = this.xmlConstructor.createElement('dataRef');
        this._exportUtils.exportTag(exportDataRef, 'id', dataRef.id, true);
        if (dataRef.logic.behavior || dataRef.logic.actionRefs?.length > 0) {
            const logic = this.xmlConstructor.createElement('logic');
            if (dataRef.logic.behavior) {
                this._exportUtils.exportTag(logic, 'behavior', dataRef.logic.behavior);
            }
            if (dataRef.logic.required) {
                this._exportUtils.exportTag(logic, 'behavior', DataRefBehavior.REQUIRED);
            }
            if (dataRef.logic.immediate) {
                this._exportUtils.exportTag(logic, 'behavior', DataRefBehavior.IMMEDIATE);
            }
            dataRef.logic.actionRefs.forEach(ref => {
                const actionRef = this.xmlConstructor.createElement('actionRef');
                this._exportUtils.exportTag(actionRef, 'id', ref);
                logic.appendChild(actionRef);
            });
            exportDataRef.appendChild(logic);
        }
        this.exportDataRefLayout(exportDataRef, dataRef.layout);
        if (dataRef.component !== undefined) {
            this.exportComponent(exportDataRef, dataRef.component);
        }
        dataRef.getEvents().forEach(event => {
            this.exportEvent(exportDataRef, event);
        });
        element.appendChild(exportDataRef);
    }

    public exportComponent(element: Element, component: Component): void {
        const comp = this.xmlConstructor.createElement('component');
        this._exportUtils.exportTag(comp, 'name', component.name, true);
        if (component.icons.length > 0) {
            const props = this.xmlConstructor.createElement('properties');
            component.properties.forEach(prop => this._exportUtils.exportTag(props, 'property', prop.value, false, [{
                key: 'key',
                value: prop.key,
            }]));
            const icons = this.xmlConstructor.createElement('option_icons');
            component.icons.forEach(icon => {
                const attributes = [{key: 'key', value: icon.key}];
                if (icon.type && icon.type !== IconType.MATERIAL) {
                    attributes.push({key: 'type', value: icon.type});
                }
                this._exportUtils.exportTag(icons, 'icon', icon.icon, false, attributes);
            });
            props.appendChild(icons);
            comp.appendChild(props);
        } else {
            component.properties.forEach(prop => this._exportUtils.exportTag(comp, 'property', prop.value, false, [{
                key: 'key',
                value: prop.key,
            }]));
        }
        element.appendChild(comp);
    }

    public exportDataRefLayout(element: Element, layout: DataLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this._exportUtils.exportTag(exportLayout, 'x', layout.x?.toString());
            this._exportUtils.exportTag(exportLayout, 'y', layout.y?.toString());
            this._exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'template', layout.template);
            this._exportUtils.exportTag(exportLayout, 'appearance', layout.appearance);
            this._exportUtils.exportTag(exportLayout, 'alignment', layout.alignment?.toString() ?? '');
            element.appendChild(exportLayout);
        }
    }

    public exportTransitionLayout(element: Element, layout: TransitionLayout): void {
        if (layout !== undefined) {
            const exportLayout = this.xmlConstructor.createElement('layout');
            this._exportUtils.exportTag(exportLayout, 'cols', layout.cols?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'rows', layout.rows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'offset', layout.offset?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'fieldAlignment', layout.alignment?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'hideEmptyRows', layout.hideEmptyRows?.toString() ?? '');
            this._exportUtils.exportTag(exportLayout, 'compactDirection', layout.compactDirection?.toString() ?? '');
            if (layout.type && layout.type !== LayoutType.LEGACY) {
                exportLayout.setAttribute('type', layout.type);
            }
            element.appendChild(exportLayout);
        }
    }

    public exportDataGroup(element: Element, dataGroup: DataGroup): void {
        const exportGroup = this.xmlConstructor.createElement('dataGroup');
        this._exportUtils.exportTag(exportGroup, 'id', dataGroup.id, true);
        this._exportUtils.exportTag(exportGroup, 'cols', dataGroup.cols?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'rows', dataGroup.rows?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'layout', dataGroup.layout ?? '');
        this._exportUtils.exportI18nString(exportGroup, 'title', dataGroup.title);
        this._exportUtils.exportTag(exportGroup, 'alignment', dataGroup.alignment ?? '');
        this._exportUtils.exportTag(exportGroup, 'stretch', !dataGroup.stretch ? '' : dataGroup.stretch?.toString());
        this._exportUtils.exportTag(exportGroup, 'hideEmptyRows', dataGroup.hideEmptyRows?.toString() ?? '');
        this._exportUtils.exportTag(exportGroup, 'compactDirection', dataGroup.compactDirection?.toString() ?? '');
        dataGroup.getDataRefs().sort(this.dataRefOrder).forEach(dataRef => this.exportDataRef(exportGroup, dataRef));
        element.appendChild(exportGroup);
    }

    public exportPlaces(doc: Element, model: PetriNet): void {
        model.getPlaces().sort((a, b) => a.compare(b)).forEach(place => {
            const exportPlace = this.xmlConstructor.createElement('place');
            this._exportUtils.exportTag(exportPlace, 'id', place.id, true);
            this._exportUtils.exportTag(exportPlace, 'x', place.x?.toString(), true);
            this._exportUtils.exportTag(exportPlace, 'y', place.y?.toString(), true);
            this._exportUtils.exportI18nString(exportPlace, 'label', place.label);
            this._exportUtils.exportTag(exportPlace, 'tokens', place.marking?.toString());
            this._exportUtils.exportTag(exportPlace, 'static', place.static?.toString());
            doc.appendChild(exportPlace);
        });
    }

    public exportArcs(doc: Element, model: PetriNet): void {
        model.getArcs().sort((a, b) => a.compare(b)).forEach(arc => {
            const exportArc = this.xmlConstructor.createElement('arc');
            this._exportUtils.exportTag(exportArc, 'id', arc.id, true);
            this._exportUtils.exportTag(exportArc, 'type', this._exportUtils.exportArcType(arc.type));
            this._exportUtils.exportTag(exportArc, 'sourceId', arc.source.id);
            this._exportUtils.exportTag(exportArc, 'destinationId', arc.destination.id);
            this._exportUtils.exportTag(exportArc, 'multiplicity', arc.multiplicity?.toString());
            this._exportUtils.exportTag(exportArc, 'reference', arc.reference ?? '');
            if (arc.breakpoints !== undefined) {
                this.exportBreakpoints(exportArc, arc);
            }
            doc.appendChild(exportArc);
        });
    }

    public exportBreakpoints(exportArc: Element, arc: Arc<NodeElement, NodeElement>): void {
        arc.breakpoints.forEach((point) => {
            const breakPoint = this.xmlConstructor.createElement('breakpoint');
            this._exportUtils.exportTag(breakPoint, 'x', point.x?.toString());
            this._exportUtils.exportTag(breakPoint, 'y', point.y?.toString());
            exportArc.appendChild(breakPoint);
        });
    }

    public dataRefOrder(a: DataRef, b: DataRef): number {
        if (a?.layout?.y < b?.layout?.y) {
            return -1;
        }
        if (a?.layout?.y > b?.layout?.y) {
            return 1;
        }
        if (a?.layout?.x < b?.layout?.x) {
            return -1;
        }
        return 1;
    }

    public alphabetically(a: string, b: string): number {
        return a.localeCompare(b);
    }
}
