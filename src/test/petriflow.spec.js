const {
    Alignment,
    Appearance,
    ArcType,
    AssignPolicy,
    Breakpoint,
    CaseEventType,
    CompactDirection,
    DataEventType,
    DataRefBehavior,
    DataType,
    FinishPolicy,
    FunctionScope,
    HideEmptyRows,
    IconType,
    ImportService,
    ExportService,
    LayoutType,
    ProcessEventType,
    RoleEventType,
    Template,
    TransitionEventType,
    TriggerType, PetriNet, DataVariable, Place, Transition,
    RegularPlaceTransitionArc, DataEvent, Action,
    I18nTranslations, Mapping
} = require('../../dist/petriflow');
const fs = require('fs');

let debug = false;

const ACTION_DEFINITION_CDATA_CONTENT = 'some cdata';
const MODEL_ID = 'petriflow_test';
const MODEL_INITIALS = 'PTS';
const MODEL_TITLE_VALUE = 'Petriflow Test Model';
const MODEL_TITLE_NAME = 'title';
const MODEL_ICON = 'home';
const MODEL_DEFAULT_CASE_NAME_VALUE = '${new Date() as String}';
const MODEL_TRANSITION_ROLE = false;
const MODEL_DEFAULT_ROLE = true;
const MODEL_ANONYMOUS_ROLE = true;
const MODEL_TAGS_LENGTH = 2;
const MODEL_TAGS_FIRST = 'First';
const MODEL_TAGS_SECOND = 'Second';
const PROCESS_EVENTS_LENGTH = 1;
const PROCESS_EVENTS_UPLOAD_ID = 'process_upload';
const PROCESS_EVENTS_UPLOAD_PRE_LENGTH = 1;
const PROCESS_EVENTS_UPLOAD_POST_LENGTH = 1;
const ACTION_DEFINITION_JAVA_COMMENT = '// some java comment';
const ACTION_DEFINITION_XML_COMMENT = '<!-- some xml comment                    -->';
const CASE_EVENTS_CREATE_PRE_LENGTH = 1;
const CASE_EVENTS_CREATE_ID = 'case_create';
const CASE_EVENTS_CREATE_POST_LENGTH = 1;
const CASE_EVENTS_DELETE_ID = 'case_delete';
const CASE_EVENTS_DELETE_PRE_LENGTH = 1;
const CASE_EVENTS_DELETE_POST_LENGTH = 1;
const ROLE_TITLE_VALUE = 'title';
const MODEL_ROLES_LENGTH = 4;
const MODEL_TRANSITIONS_LENGTH = 13;
const MODEL_PLACES_LENGTH = 12;
const MODEL_ARCS_LENGTH = 17;
const MODEL_DATA_LENGTH = 25;
const MODEL_USERREFS_LENGTH = 2;
const ROLE_1_ID = 'newRole_1';
const ROLE_2_ID = 'newRole_2';
const DATA_USERLIST_ID = 'newVariable_15';
const DATA_USERLIST_2_ID = 'newVariable_18';
const ROLE_3_ID = 'newRole_3';
const ROLE_4_ID = 'newRole_4';
const ACTION_DEFINITION_ESCAPED = 'if (a < b && c) d >> e';
const ROLE_1_TITLE_NAME = 'role_1_title';
const TIME_TRIGGER_EXACT = '2021-07-14T08:00:00.000Z';
const TIME_TRIGGER_DELAY = 'PT5D';
const TEST_FILE_PATH = 'src/test/resources/petriflow_test.xml';
const TEST_HTML= 'test_html_i18n';

describe('Petriflow integration tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    function assertPlace(place, id, x, y, label, marking, isStatic, i18nName) {
        expect(place.id).toEqual(id);
        expect(place.x).toEqual(x);
        expect(place.y).toEqual(y);
        if (label && label !== '') {
            expect(place.label).not.toBeUndefined();
            expect(place.label.value).toEqual(label);
            if (i18nName && i18nName !== '') {
                expect(place.label.name).toEqual(i18nName);
            }
        }
        expect(place.marking).toEqual(marking);
        expect(place.static).toEqual(isStatic);
    }

    function assertArc(arc, id, type, source, destination, multiplicity, reference, breakpoints) {
        expect(arc.id).toEqual(id);
        expect(arc.type).toEqual(type);
        expect(arc.reference).toEqual(reference);
        expect(arc.destination.id).toEqual(destination);
        expect(arc.source.id).toEqual(source);
        expect(arc.multiplicity).toEqual(multiplicity);
        if (breakpoints && breakpoints.length > 0) {
            expect(arc.breakpoints.length).toEqual(breakpoints.length);
            for (let i = 0; i < breakpoints.length; i++) {
                expect(arc.breakpoints[i].x).toEqual(breakpoints[i].x);
                expect(arc.breakpoints[i].y).toEqual(breakpoints[i].y);
            }
        }
    }

    function assertI18n(locale, i18ns_equal, i18ns_contain, model) {
        const i18nLocale = model.getI18n(locale);
        expect(i18nLocale.getI18ns().length).toEqual(i18ns_equal.length + i18ns_contain.length);
        i18ns_equal.forEach(i => {
            expect(i18nLocale.getI18n(i)).not.toBeUndefined();
            expect(i18nLocale.getI18n(i).value).toEqual(`${locale.toUpperCase()}_${i}`);
        });
        i18ns_contain.forEach(i => {
            expect(i18nLocale.getI18n(i)).not.toBeUndefined();
            expect(i18nLocale.getI18n(i).value).toContain(`${locale.toUpperCase()}_${i}`);
        });
    }

    function assertRoleRefLogic(roleRef, perform, delegate, cancel, assign, view) {
        expect(roleRef.logic.perform).toEqual(perform);
        expect(roleRef.logic.delegate).toEqual(delegate);
        expect(roleRef.logic.cancel).toEqual(cancel);
        expect(roleRef.logic.assign).toEqual(assign);
        expect(roleRef.logic.view).toEqual(view);
    }

    function assertCorrectImport(model) {
        expect(model.id).toEqual(MODEL_ID);
        expect(model.initials).toEqual(MODEL_INITIALS);
        expect(model.title).not.toBeUndefined();
        expect(model.title.value).toEqual(MODEL_TITLE_VALUE);
        expect(model.title.name).toEqual(MODEL_TITLE_NAME);
        expect(model.icon).toEqual(MODEL_ICON);
        expect(model.defaultRole).toEqual(MODEL_DEFAULT_ROLE);
        expect(model.anonymousRole).toEqual(MODEL_ANONYMOUS_ROLE);
        expect(model.transitionRole).toEqual(MODEL_TRANSITION_ROLE);
        expect(model.caseName).not.toBeUndefined();
        expect(model.caseName.value).toEqual(MODEL_DEFAULT_CASE_NAME_VALUE);
        expect(model.caseName.dynamic).toEqual(true);
        expect(model.tags.size).toEqual(MODEL_TAGS_LENGTH);
        expect(model.tags.get(MODEL_TAGS_FIRST)).toEqual(MODEL_TAGS_FIRST);
        expect(model.tags.get(MODEL_TAGS_SECOND)).toEqual(MODEL_TAGS_SECOND);
        log('Model metadata OK');

        expect(model.getProcessEvents().length).toEqual(PROCESS_EVENTS_LENGTH);
        const processUploadEvent = model.getProcessEvent(ProcessEventType.UPLOAD);
        expect(processUploadEvent.id).toEqual(PROCESS_EVENTS_UPLOAD_ID);
        expect(processUploadEvent.preActions.length).toEqual(PROCESS_EVENTS_UPLOAD_PRE_LENGTH);
        expect(processUploadEvent.preActions[0].definition).toContain('test("process_upload_pre")');
        expect(processUploadEvent.postActions.length).toEqual(PROCESS_EVENTS_UPLOAD_POST_LENGTH);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_XML_COMMENT);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_JAVA_COMMENT);
        expect(processUploadEvent.postActions[0].definition).toContain('test("process_upload_post")');
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_CDATA_CONTENT);
        expect(processUploadEvent.postActions[0].definition).toContain(ACTION_DEFINITION_ESCAPED);
        log('Model process events correct');

        expect(model.getCaseEvents().length).toEqual(2);
        const caseCreateEvent = model.getCaseEvent(CaseEventType.CREATE);
        expect(caseCreateEvent.id).toEqual(CASE_EVENTS_CREATE_ID);
        expect(caseCreateEvent.preActions.length).toEqual(CASE_EVENTS_CREATE_PRE_LENGTH);
        expect(caseCreateEvent.preActions[0].definition).toContain('test("case_create_pre")');
        expect(caseCreateEvent.postActions.length).toEqual(CASE_EVENTS_CREATE_POST_LENGTH);
        expect(caseCreateEvent.postActions[0].definition).toContain('test("case_create_post")');
        const caseDeleteEvent = model.getCaseEvent(CaseEventType.DELETE);
        expect(caseDeleteEvent.id).toEqual(CASE_EVENTS_DELETE_ID);
        expect(caseDeleteEvent.preActions.length).toEqual(CASE_EVENTS_DELETE_PRE_LENGTH);
        expect(caseDeleteEvent.preActions[0].definition).toContain('test("case_delete_pre")');
        expect(caseDeleteEvent.postActions.length).toEqual(CASE_EVENTS_DELETE_POST_LENGTH);
        expect(caseDeleteEvent.postActions[0].definition).toContain('test("case_delete_post")');
        log('Model case events correct');

        expect(model.getRoles().length).toEqual(MODEL_ROLES_LENGTH);
        const role1 = model.getRole(ROLE_1_ID);
        const role2 = model.getRole(ROLE_2_ID);
        const role3 = model.getRole(ROLE_3_ID);
        const role4 = model.getRole(ROLE_4_ID);
        expect(role1.title).not.toBeUndefined();
        expect(role1.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role1.title.name).toEqual(ROLE_1_TITLE_NAME);
        expect(role1.global).toEqual(false);
        expect(role1.getEvents().length).toEqual(2);
        const roleAssignEvent = role1.getEvent(RoleEventType.ASSIGN);
        expect(roleAssignEvent.id).toEqual('assign_role');
        expect(roleAssignEvent.preActions.length).toEqual(1);
        expect(roleAssignEvent.preActions[0].definition).toContain('test("assign_role_pre")');
        expect(roleAssignEvent.postActions.length).toEqual(1);
        expect(roleAssignEvent.postActions[0].definition).toContain('test("assign_role_post")');
        const roleCancelEvent = role1.getEvent(RoleEventType.CANCEL);
        expect(roleCancelEvent.id).toEqual('cancel_role');
        expect(roleCancelEvent.preActions.length).toEqual(1);
        expect(roleCancelEvent.preActions[0].definition).toContain('test("cancel_role_pre")');
        expect(roleCancelEvent.postActions.length).toEqual(1);
        expect(roleCancelEvent.postActions[0].definition).toContain('test("cancel_role_post")');
        expect(role2.title).not.toBeUndefined();
        expect(role2.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role2.title.name).toEqual('role_2_title');
        expect(role2.global).toEqual(true);
        expect(role3.title).not.toBeUndefined();
        expect(role3.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role3.title.name).toEqual('role_3_title');
        expect(role3.global).toEqual(false);
        expect(role4.title).not.toBeUndefined();
        expect(role4.title.value).toEqual(ROLE_TITLE_VALUE);
        expect(role4.title.name).toEqual('role_4_title');
        expect(role4.global).toEqual(false);
        log('Model roles correct');

        expect(model.functions).toBeDefined();
        expect(model.functions.length).toEqual(2);
        const processFunction = model.functions.find(f => f.name === 'calc');
        expect(processFunction).toBeDefined();
        expect(processFunction.scope).toEqual(FunctionScope.PROCESS);
        expect(processFunction.definition).toContain('{ monthly, loan, period ->');
        expect(processFunction.definition).toContain('change monthly value { (loan + loan * 0.02 * period) / (period * 12) }');
        expect(processFunction.definition).toContain('}');
        const namespaceFunction = model.functions.find(f => f.name === 'sum');
        expect(namespaceFunction).toBeDefined();
        expect(namespaceFunction.scope).toEqual(FunctionScope.NAMESPACE);
        expect(namespaceFunction.definition).toContain('{ Double x, Double y ->');
        expect(namespaceFunction.definition).toContain('return x + y');
        expect(namespaceFunction.definition).toContain('}');
        log('Model functions correct');

        expect(model.getRoleRefs().length).toEqual(5);
        const roleRef1 = model.getRoleRef(ROLE_1_ID);
        expect(roleRef1.logic.delete).toEqual(true);
        expect(roleRef1.logic.create).toEqual(false);
        expect(roleRef1.logic.view).toBeUndefined();
        const roleRef2 = model.getRoleRef(ROLE_2_ID);
        expect(roleRef2.logic.delete).toEqual(false);
        expect(roleRef2.logic.create).toBeUndefined();
        expect(roleRef2.logic.view).toEqual(false);
        const roleRef3 = model.getRoleRef(ROLE_3_ID);
        expect(roleRef3.logic.delete).toBeUndefined();
        expect(roleRef3.logic.create).toEqual(false);
        expect(roleRef3.logic.view).toEqual(true);
        const roleRefAnonymous = model.getRoleRef('anonymous');
        expect(roleRefAnonymous.logic.create).toEqual(true);
        expect(roleRefAnonymous.logic.view).toEqual(false);
        expect(roleRefAnonymous.logic.delete).toEqual(undefined);
        const roleRefDefault = model.getRoleRef('default');
        expect(roleRefDefault.logic.create).toEqual(undefined);
        expect(roleRefDefault.logic.view).toEqual(true);
        expect(roleRefDefault.logic.delete).toEqual(false);
        log('Model rol refs correct');

        expect(model.getUserRefs().length).toEqual(MODEL_USERREFS_LENGTH);
        const userRef1 = model.getUserRef(DATA_USERLIST_ID);
        expect(userRef1.logic.delete).toEqual(true);
        expect(userRef1.logic.create).toEqual(false);
        expect(userRef1.logic.view).toBeUndefined();
        const userRef2 = model.getUserRef(DATA_USERLIST_2_ID);
        expect(userRef2.logic.delete).toEqual(true);
        expect(userRef2.logic.create).toEqual(false);
        expect(userRef2.logic.view).toBeUndefined();
        log('Model user refs correct');

        expect(model.getDataSet().length).toEqual(MODEL_DATA_LENGTH);
        const cdataField = model.getData('cdata_escape');
        expect(cdataField.title.value).toEqual('CDATA &<>');
        expect(cdataField.init.value).toContain('<p>CDATA &amp;&lt;&gt;</p>');
        expect(cdataField.getEvent(DataEventType.SET).postActions.length).toEqual(2);
        const numberField = model.getData('newVariable_1');
        expect(numberField.type).toEqual(DataType.NUMBER);
        expect(numberField.title.value).toEqual('title');
        expect(numberField.init.value).toEqual('5');
        expect(numberField.init.dynamic).toEqual(false);
        expect(numberField.validations.length).toEqual(1);
        const numberFieldValidation = numberField.validations[0];
        expect(numberFieldValidation.expression.expression).toEqual('inrange 1,10');
        expect(numberFieldValidation.expression.dynamic).toEqual(false);
        const numberFieldGetEvent = numberField.getEvent(DataEventType.GET);
        expect(numberFieldGetEvent.preActions.length).toEqual(1);
        expect(numberFieldGetEvent.postActions.length).toEqual(1);
        const numberFieldSetEvent = numberField.getEvent(DataEventType.SET);
        expect(numberFieldSetEvent.preActions.length).toEqual(1);
        expect(numberFieldSetEvent.postActions.length).toEqual(1);
        expect(numberField.component).not.toBeUndefined();
        expect(numberField.component.name).toEqual('currency');
        expect(numberField.component.properties.find(o => o.key === 'code')).not.toBeUndefined();
        expect(numberField.component.properties.find(o => o.key === 'code').value).toEqual('SK');
        expect(numberField.component.properties.find(o => o.key === 'fractionSize')).not.toBeUndefined();
        expect(numberField.component.properties.find(o => o.key === 'fractionSize').value).toEqual('2');
        expect(numberField.component.properties.find(o => o.key === 'locale')).not.toBeUndefined();
        expect(numberField.component.properties.find(o => o.key === 'locale').value).toEqual('SK');
        const textField = model.getData('newVariable_2');
        expect(textField.type).toEqual(DataType.TEXT);
        expect(textField.title.name).toEqual('newVariable_2_title');
        expect(textField.title.value).toEqual('newVariable_2_title_value');
        expect(textField.placeholder.name).toEqual('newVariable_2_placeholder');
        expect(textField.placeholder.value).toEqual('newVariable_2_placeholder_value');
        expect(textField.desc.name).toEqual('newVariable_2_desc');
        expect(textField.desc.value).toEqual('newVariable_2_desc_value');
        expect(textField.encryption).toEqual('SHA2');
        expect(textField.validations.length).toEqual(2);
        expect(textField.validations[0].expression.expression).toEqual('inrange 1,2000');
        expect(textField.validations[0].message.value).toEqual('invalid text');
        expect(textField.validations[0].message.name).toBeUndefined();
        expect(textField.validations[1].expression.expression).toEqual('email');
        expect(textField.validations[1].message.value).toEqual('invalid email');
        expect(textField.validations[1].message.name).toEqual('newVariable_2_valid_email');
        const textFieldComponent = textField.component;
        expect(textFieldComponent).not.toBeUndefined();
        expect(textFieldComponent.name).toEqual('area');
        const htmlField = model.getData('newVariable_22');
        expect(htmlField.type).toEqual(DataType.TEXT);
        expect(htmlField.title.value).toEqual('HTMLTextArea init translation with HTML');
        expect(htmlField.init).not.toBeUndefined();
        expect(htmlField.init.name).toEqual(TEST_HTML);
        expect(htmlField.component.name).toEqual('htmltextarea');

        const enumerationField = model.getData('newVariable_3');
        expect(enumerationField).not.toBeUndefined();
        expect(enumerationField.options.length).toEqual(3);
        expect(enumerationField.options.find(o => o.key === 'option1')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option1').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option1').value.value).toEqual('option1');
        expect(enumerationField.options.find(o => o.key === 'option1').value.name).toEqual('newVariable_3_value1');
        expect(enumerationField.options.find(o => o.key === 'option2')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option2').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option2').value.value).toEqual('option2');
        expect(enumerationField.options.find(o => o.key === 'option2').value.name).toEqual('newVariable_3_value2');
        expect(enumerationField.options.find(o => o.key === 'option3')).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option3').value).not.toBeUndefined();
        expect(enumerationField.options.find(o => o.key === 'option3').value.value).toEqual('option3');
        expect(enumerationField.options.find(o => o.key === 'option3').value.name).toEqual('newVariable_3_value3');
        expect(enumerationField.component).not.toBeUndefined();
        expect(enumerationField.component.name).toEqual('autocomplete');
        const enumerationAutocompleteField = model.getData('newVariable_3_view_autocomplete');
        expect(enumerationAutocompleteField).not.toBeUndefined();
        expect(enumerationAutocompleteField.component).not.toBeUndefined();
        expect(enumerationAutocompleteField.component.name).toEqual('autocomplete');
        const enumerationListField = model.getData('newVariable_3_view_list');
        expect(enumerationListField).not.toBeUndefined();
        expect(enumerationListField.component).not.toBeUndefined();
        expect(enumerationListField.component.name).toEqual('list');
        // TODO: check view
        const enumerationMapField = model.getData('newVariable_4');
        expect(enumerationMapField).not.toBeUndefined();
        expect(enumerationMapField.options.length).toEqual(3);
        expect(enumerationMapField.options.find(o => o.key === 'key1')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key1').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key1').value.value).toEqual('value1');
        expect(enumerationMapField.options.find(o => o.key === 'key1').value.name).toEqual('newVariable_4_option_1');
        expect(enumerationMapField.options.find(o => o.key === 'key2')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key2').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key2').value.value).toEqual('value2');
        expect(enumerationMapField.options.find(o => o.key === 'key2').value.name).toEqual('newVariable_4_option_2');
        expect(enumerationMapField.options.find(o => o.key === 'key3')).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key3').value).not.toBeUndefined();
        expect(enumerationMapField.options.find(o => o.key === 'key3').value.value).toEqual('value3');
        expect(enumerationMapField.options.find(o => o.key === 'key3').value.name).toEqual('newVariable_4_option_3');
        expect(enumerationMapField.component).not.toBeUndefined();
        expect(enumerationMapField.component.name).toEqual('icon');
        expect(enumerationMapField.component.properties.length).toEqual(2);
        expect(enumerationMapField.component.properties.find(o => o.key === 'arrow')).not.toBeUndefined();
        expect(enumerationMapField.component.properties.find(o => o.key === 'arrow').value).toEqual('true');
        expect(enumerationMapField.component.properties.find(o => o.key === 'divider')).not.toBeUndefined();
        expect(enumerationMapField.component.properties.find(o => o.key === 'divider').value).toEqual('true');
        expect(enumerationMapField.component.icons.length).toEqual(3);
        expect(enumerationMapField.component.icons.find(o => o.key === 'key1')).not.toBeUndefined();
        expect(enumerationMapField.component.icons.find(o => o.key === 'key1').type).toEqual(IconType.MATERIAL);
        expect(enumerationMapField.component.icons.find(o => o.key === 'key1').icon).toEqual('home');
        expect(enumerationMapField.component.icons.find(o => o.key === 'key2')).not.toBeUndefined();
        expect(enumerationMapField.component.icons.find(o => o.key === 'key2').type).toEqual(IconType.SVG);
        expect(enumerationMapField.component.icons.find(o => o.key === 'key2').icon).toEqual('nature');
        expect(enumerationMapField.component.icons.find(o => o.key === 'key3')).not.toBeUndefined();
        expect(enumerationMapField.component.icons.find(o => o.key === 'key3').type).toEqual(IconType.MATERIAL);
        expect(enumerationMapField.component.icons.find(o => o.key === 'key3').icon).toEqual('search');
        const multichoiceField = model.getData('newVariable_5');
        expect(multichoiceField).not.toBeUndefined();
        expect(multichoiceField.options.length).toEqual(2);
        expect(multichoiceField.options.find(o => o.key === 'option4')).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option4').value).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option4').value.value).toEqual('option4');
        expect(multichoiceField.options.find(o => o.key === 'option5')).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option5').value).not.toBeUndefined();
        expect(multichoiceField.options.find(o => o.key === 'option5').value.value).toEqual('option5');
        const multichoiceMapField = model.getData('newVariable_6');
        expect(multichoiceMapField).not.toBeUndefined();
        expect(multichoiceMapField.options.length).toEqual(3);
        expect(multichoiceMapField.options.find(o => o.key === 'key4')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key4').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key4').value.value).toEqual('value4');
        expect(multichoiceMapField.options.find(o => o.key === 'key5')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key5').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key5').value.value).toEqual('value5');
        expect(multichoiceMapField.options.find(o => o.key === 'key6')).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key6').value).not.toBeUndefined();
        expect(multichoiceMapField.options.find(o => o.key === 'key6').value.value).toEqual('value6');
        expect(multichoiceMapField.inits.length).toEqual(2);
        expect(multichoiceMapField.inits[0].dynamic).toEqual(false);
        expect(multichoiceMapField.inits[0].value).toEqual('key4');
        expect(multichoiceMapField.inits[1].dynamic).toEqual(false);
        expect(multichoiceMapField.inits[1].value).toEqual('key5');
        const fileField = model.getData('newVariable_7');
        expect(fileField).not.toBeUndefined();
        expect(fileField.remote).toEqual(true);
        expect(fileField.length).toEqual(10);
        const fileListField = model.getData('newVariable_8');
        expect(fileListField).not.toBeUndefined();
        const booleanField = model.getData('newVariable_9');
        expect(booleanField).not.toBeUndefined();
        const dateField = model.getData('newVariable_10');
        expect(dateField).not.toBeUndefined();
        expect(dateField.init).not.toBeUndefined();
        expect(dateField.init.dynamic).toEqual(true);
        expect(dateField.init.value).toEqual('new Date()');
        const dateTimeField = model.getData('newVariable_11');
        expect(dateTimeField).not.toBeUndefined();
        const userField = model.getData('newVariable_12');
        expect(userField).not.toBeUndefined();
        const taskRefField = model.getData('newVariable_13');
        expect(taskRefField).not.toBeUndefined();
        const caseRefField = model.getData('newVariable_14');
        expect(caseRefField).not.toBeUndefined();
        expect(caseRefField.allowedNets.length).toEqual(3);
        expect(caseRefField.allowedNets).toContain('net_1');
        expect(caseRefField.allowedNets).toContain('net_2');
        expect(caseRefField.allowedNets).toContain('net_3');
        const userListField = model.getData('newVariable_15');
        expect(userListField).not.toBeUndefined();
        const i18nField1 = model.getData('newVariable_19');
        expect(i18nField1).not.toBeUndefined();
        expect(i18nField1.init).not.toBeUndefined();
        expect(i18nField1.init.name).toEqual('newVariable_19_name');
        expect(i18nField1.init.value).toEqual('newVariable_19 name value');
        expect(i18nField1.init.dynamic).toEqual(false);
        const i18nField2 = model.getData('newVariable_20');
        expect(i18nField2).not.toBeUndefined();
        expect(i18nField2.init).not.toBeUndefined();
        expect(i18nField2.init.value).toEqual('newVariable_20 name value');
        expect(i18nField2.init.dynamic).toEqual(true);
        const i18nField3 = model.getData('newVariable_21');
        expect(i18nField3).not.toBeUndefined();
        expect(i18nField3.init).not.toBeUndefined();
        expect(i18nField3.init.name).toEqual('newVariable_21_name');
        log('Model data correct');

        expect(model.getI18ns().length).toEqual(3);
        const i18ns = [
            MODEL_TITLE_NAME,
            'role_1_title',
            'role_2_title',
            'role_3_title',
            'role_4_title',
            'newVariable_2_title',
            'newVariable_2_placeholder',
            'newVariable_2_desc',
            'newVariable_2_valid_email',
            'p1_label',
            't1_label',
            't1_assign_message',
            't1_assign_title',
            't5_datagroup',
            'newVariable_3_value1',
            'newVariable_3_value2',
            'newVariable_3_value3',
            'newVariable_4_option_1',
            'newVariable_4_option_2',
            'newVariable_4_option_3',
            'newVariable_19_name',
            'case_create_message'
        ];
        const i18ns_contain = [
            TEST_HTML
        ];
        assertI18n('uk', i18ns, i18ns_contain, model);
        assertI18n('de', i18ns, i18ns_contain, model);
        log('Model i18n correct');

        // TODO: mapping?

        expect(model.getTransitions().length).toEqual(MODEL_TRANSITIONS_LENGTH);
        const transitionT1 = model.getTransition('t1');
        expect(transitionT1.label.name).toEqual('t1_label');
        expect(transitionT1.label.value).toEqual('Task escape:&<>');
        expect(transitionT1.icon).toEqual(MODEL_ICON);
        expect(transitionT1.priority).toEqual(1);
        expect(transitionT1.assignPolicy).toEqual(AssignPolicy.AUTO);
        expect(transitionT1.finishPolicy).toEqual(FinishPolicy.AUTO_NO_DATA);
        expect(transitionT1.layout.rows).toEqual(4);
        expect(transitionT1.layout.cols).toEqual(5);
        expect(transitionT1.layout.offset).toEqual(0);
        expect(transitionT1.layout.alignment).toEqual(Alignment.CENTER);
        expect(transitionT1.tags.size).toEqual(MODEL_TAGS_LENGTH);
        expect(transitionT1.tags.get(MODEL_TAGS_FIRST)).toEqual(MODEL_TAGS_FIRST);
        expect(transitionT1.tags.get(MODEL_TAGS_SECOND)).toEqual(MODEL_TAGS_SECOND);
        const t1AssignEvent = transitionT1.eventSource.getEvent(TransitionEventType.ASSIGN);
        expect(t1AssignEvent.id).toEqual('assign');
        expect(t1AssignEvent.title.value).toEqual('t1_assign_title_value');
        expect(t1AssignEvent.title.name).toEqual('t1_assign_title');
        expect(t1AssignEvent.message.value).toEqual('t1_assign_message_value');
        expect(t1AssignEvent.message.name).toEqual('t1_assign_message');
        expect(t1AssignEvent.preActions.length).toEqual(1);
        expect(t1AssignEvent.preActions[0].definition).toContain('test("t1_assign_pre")');
        expect(t1AssignEvent.postActions.length).toEqual(1);
        expect(t1AssignEvent.postActions[0].definition).toContain('test("t1_assign_post")');
        const t1FinishEvent = transitionT1.eventSource.getEvent(TransitionEventType.FINISH);
        expect(t1FinishEvent.id).toEqual('finish');
        expect(t1FinishEvent.preActions.length).toEqual(1);
        expect(t1FinishEvent.preActions[0].definition).toContain('test("t1_finish_pre")');
        expect(t1FinishEvent.postActions.length).toEqual(1);
        expect(t1FinishEvent.postActions[0].definition).toContain('test("t1_finish_post")');
        const t1CancelEvent = transitionT1.eventSource.getEvent(TransitionEventType.CANCEL);
        expect(t1CancelEvent.id).toEqual('cancel');
        expect(t1CancelEvent.preActions.length).toEqual(1);
        expect(t1CancelEvent.preActions[0].definition).toContain('test("t1_cancel_pre")');
        expect(t1CancelEvent.postActions.length).toEqual(1);
        expect(t1CancelEvent.postActions[0].definition).toContain('test("t1_cancel_post")');
        const t1DelegateEvent = transitionT1.eventSource.getEvent(TransitionEventType.DELEGATE);
        expect(t1DelegateEvent.id).toEqual('delegate');
        expect(t1DelegateEvent.preActions.length).toEqual(1);
        expect(t1DelegateEvent.preActions[0].definition).toContain('test("t1_delegate_pre")');
        expect(t1DelegateEvent.postActions.length).toEqual(1);
        expect(t1DelegateEvent.postActions[0].definition).toContain('test("t1_delegate_post")');
        const transitionT2 = model.getTransition('t2');
        expect(transitionT2.layout.type).toEqual(LayoutType.FLOW);
        expect(transitionT2.layout.cols).toEqual(3);
        expect(transitionT2.layout.alignment).toEqual(Alignment.BOTTOM);
        const transitionT3 = model.getTransition('t3');
        expect(transitionT3.layout.type).toEqual(LayoutType.LEGACY);
        expect(transitionT3.layout.alignment).toEqual(Alignment.TOP);
        expect(transitionT3.layout.rows).toBeUndefined();
        expect(transitionT3.layout.cols).toBeUndefined();
        const transitionT4 = model.getTransition('t4');
        expect(transitionT4.layout.type).toEqual(LayoutType.LEGACY);
        expect(transitionT4.layout.alignment).toEqual(Alignment.BOTTOM);
        const transitionT5 = model.getTransition('t5');
        expect(transitionT5.layout.type).toEqual(LayoutType.LEGACY);
        expect(transitionT5.layout.alignment).toEqual(Alignment.CENTER);
        expect(transitionT5.dataGroups.length).toEqual(1);
        const t5DataGroup = transitionT5.dataGroups[0];
        expect(t5DataGroup.id).toEqual('test_group');
        expect(t5DataGroup.title).not.toBeUndefined();
        expect(t5DataGroup.title.name).toEqual('t5_datagroup');
        expect(t5DataGroup.title.value).toEqual('t5_datagroup_value');
        expect(t5DataGroup.layout).toEqual(LayoutType.GRID);
        expect(t5DataGroup.getDataRefs().length).toEqual(15);
        expect(t5DataGroup.getDataRef('newVariable_1')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_1').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_1').logic.immediate).toEqual(true);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.x).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.y).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_1').layout.appearance).toEqual(Appearance.LEGACY);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvents().length).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.SET).preActions.length).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.SET).preActions[0].definition).toContain('test("t5_newVariable_1_set_pre")');
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.SET).postActions.length).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.SET).postActions[0].definition).toContain('test("t5_newVariable_1_set_post")');
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.SET).postActions[1].definition).toContain('test("t5_newVariable_1_set")');
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.GET).preActions.length).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.GET).preActions[0].definition).toContain('test("t5_newVariable_1_get_pre")');
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.GET).preActions[1].definition).toContain('test("t5_newVariable_1_get")');
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.GET).postActions.length).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_1').getEvent(DataEventType.GET).postActions[0].definition).toContain('test("t5_newVariable_1_get_post")');
        expect(t5DataGroup.getDataRef('newVariable_4')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_4').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.x).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.y).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.template).toEqual(Template.NETGRIF);
        expect(t5DataGroup.getDataRef('newVariable_4').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_6')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_6').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.x).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.y).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_6').layout.appearance).toEqual(Appearance.STANDARD);
        expect(t5DataGroup.getDataRef('newVariable_8')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_8').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.x).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.y).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_8').layout.appearance).toEqual(Appearance.FILL);
        expect(t5DataGroup.getDataRef('newVariable_3')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_3').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.x).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.y).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_3').layout.appearance).toEqual(Appearance.FILL);
        expect(t5DataGroup.getDataRef('newVariable_5')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_5').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_5').logic.required).toBeFalsy();
        expect(t5DataGroup.getDataRef('newVariable_5').layout.x).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_5').layout.y).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_5').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_5').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_5').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_5').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_11')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_11').logic.behavior).toEqual(DataRefBehavior.HIDDEN);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.x).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.y).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_11').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_7')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_7').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_7').layout.x).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_7').layout.y).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_7').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_7').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_7').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_2')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_2').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.x).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.y).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_2').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_12')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_12').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.x).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.y).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_12').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_13')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_13').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.x).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.y).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_13').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_9')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_9').logic.behavior).toEqual(DataRefBehavior.VISIBLE);
        expect(t5DataGroup.getDataRef('newVariable_9').logic.required).toBeTruthy();
        expect(t5DataGroup.getDataRef('newVariable_9').layout.x).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_9').layout.y).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_9').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_9').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_9').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_10')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_10').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_10').logic.required).toBeTruthy();
        expect(t5DataGroup.getDataRef('newVariable_10').layout.x).toEqual(0);
        expect(t5DataGroup.getDataRef('newVariable_10').layout.y).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_10').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_10').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_10').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_10').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_14')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_14').logic.behavior).toEqual(DataRefBehavior.VISIBLE);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.x).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.y).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_14').layout.appearance).toEqual(Appearance.OUTLINE);
        expect(t5DataGroup.getDataRef('newVariable_15')).not.toBeUndefined();
        expect(t5DataGroup.getDataRef('newVariable_15').logic.behavior).toEqual(DataRefBehavior.EDITABLE);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.x).toEqual(2);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.y).toEqual(3);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.rows).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.cols).toEqual(1);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.template).toEqual(Template.MATERIAL);
        expect(t5DataGroup.getDataRef('newVariable_15').layout.appearance).toEqual(Appearance.OUTLINE);
        const transitionT6 = model.getTransition('t6');
        expect(transitionT6.triggers.length === 1);
        const transitionT6AutoTrigger = transitionT6.triggers[0];
        expect(transitionT6AutoTrigger.type).toEqual(TriggerType.AUTO);
        const transitionT7 = model.getTransition('t7');
        expect(transitionT7.triggers.length === 1);
        const transitionT7AutoTrigger = transitionT7.triggers[0];
        expect(transitionT7AutoTrigger.type).toEqual(TriggerType.TIME);
        expect(transitionT7AutoTrigger.exact).toEqual(new Date(TIME_TRIGGER_EXACT));
        expect(transitionT7.userRefs.length === 1);
        const transitionT7UserRef = transitionT7.userRefs.find(ref => ref.id === DATA_USERLIST_ID);
        expect(transitionT7UserRef).toBeDefined();
        expect(transitionT7UserRef.logic.cancel).toEqual(true);
        expect(transitionT7UserRef.logic.delegate).toEqual(false);
        expect(transitionT7UserRef.logic.perform).toBeUndefined();
        expect(transitionT7UserRef.logic.view).toEqual(true);
        const transitionT7UserRef2 = transitionT7.userRefs.find(ref => ref.id === DATA_USERLIST_2_ID);
        expect(transitionT7UserRef2).toBeDefined();
        expect(transitionT7UserRef2.logic.cancel).toEqual(true);
        expect(transitionT7UserRef2.logic.delegate).toEqual(false);
        expect(transitionT7UserRef2.logic.perform).toBeUndefined();
        expect(transitionT7UserRef2.logic.view).toEqual(true);
        const transitionT7AssignedUser = transitionT7.assignedUser;
        expect(transitionT7AssignedUser.cancel).toEqual(false);
        expect(transitionT7AssignedUser.reassign).toBeUndefined();
        const transitionT8 = model.getTransition('t8');
        // TODO: check references after import
        // expect(transitionWithoutDataGroup.roleRefs.length).toEqual(0);
        expect(transitionT8.triggers.length === 1);
        const transitionT8AutoTrigger = transitionT8.triggers[0];
        expect(transitionT8AutoTrigger.type).toEqual(TriggerType.TIME);
        expect(transitionT8AutoTrigger.delay).toEqual(TIME_TRIGGER_DELAY);
        const transitionT8AssignedUser = transitionT8.assignedUser;
        expect(transitionT8AssignedUser.cancel).toEqual(true);
        expect(transitionT8AssignedUser.reassign).toEqual(false);
        const transitionWithoutDataGroup = model.getTransition('t9_datarefs_without_group');
        expect(transitionWithoutDataGroup.dataGroups.length).toEqual(1);
        expect(transitionWithoutDataGroup.dataGroups[0].getDataRefs().length).toEqual(3);
        expect(transitionWithoutDataGroup.roleRefs.length).toEqual(2);
        const transitionT9RoleRef1 = transitionWithoutDataGroup.roleRefs.find(r => r.id === ROLE_1_ID);
        assertRoleRefLogic(transitionT9RoleRef1, false, false, true, true, true);
        const transitionT9RoleRef2 = transitionWithoutDataGroup.roleRefs.find(r => r.id === ROLE_2_ID);
        assertRoleRefLogic(transitionT9RoleRef2, undefined, undefined, false, true, undefined);
        const transitionT10 = model.getTransition('t10');
        expect(transitionT10).toBeDefined();
        const transitionT10Layout = transitionT10.layout;
        expect(transitionT10Layout.hideEmptyRows).toEqual(HideEmptyRows.COMPACTED);
        expect(transitionT10Layout.compactDirection).toEqual(CompactDirection.UP);
        const transitionT10DataGroup = transitionT10.dataGroups[0];
        expect(transitionT10DataGroup).toBeDefined();
        expect(transitionT10DataGroup.hideEmptyRows).toEqual(HideEmptyRows.COMPACTED);
        expect(transitionT10DataGroup.compactDirection).toEqual(CompactDirection.UP);
        const transitionT11 = model.getTransition('t11');
        expect(transitionT11).toBeDefined();
        const transitionT11Layout = transitionT11.layout;
        expect(transitionT11Layout.hideEmptyRows).toEqual(HideEmptyRows.ALL);
        expect(transitionT11Layout.compactDirection).toEqual(CompactDirection.NONE);
        const transitionT11DataGroup = transitionT11.dataGroups[0];
        expect(transitionT11DataGroup).toBeDefined();
        expect(transitionT11DataGroup.hideEmptyRows).toEqual(HideEmptyRows.ALL);
        expect(transitionT11DataGroup.compactDirection).toEqual(CompactDirection.NONE);
        const transitionT12 = model.getTransition('t12');
        expect(transitionT12).toBeDefined();
        const transitionT12Layout = transitionT12.layout;
        expect(transitionT12Layout.hideEmptyRows).toEqual(HideEmptyRows.NONE);
        expect(transitionT12Layout.compactDirection).toEqual(CompactDirection.NONE);
        const transitionT12DataGroup = transitionT12.dataGroups[0];
        expect(transitionT12DataGroup).toBeDefined();
        expect(transitionT12DataGroup.hideEmptyRows).toEqual(HideEmptyRows.NONE);
        expect(transitionT12DataGroup.compactDirection).toEqual(CompactDirection.UP);
        const transitionPredefinedRoles = model.getTransition('predefined_roles');
        const transitionPredefinedRolesDefault = transitionPredefinedRoles.roleRefs.find(r => r.id === 'default');
        assertRoleRefLogic(transitionPredefinedRolesDefault, false, false, true, true, undefined);
        const transitionPredefinedRolesAnonymous = transitionPredefinedRoles.roleRefs.find(r => r.id === 'anonymous');
        assertRoleRefLogic(transitionPredefinedRolesAnonymous, true, undefined, false, false, false);
        log('Model transitions correct');

        expect(model.getPlaces().length).toEqual(MODEL_PLACES_LENGTH);
        assertPlace(model.getPlace('p1'), 'p1', 300, 180, 'place 1', 0, false, 'p1_label');
        assertPlace(model.getPlace('p2'), 'p2', 380, 100, '', 3, false);
        assertPlace(model.getPlace('p3'), 'p3', 620, 180, '', 0, false);
        assertPlace(model.getPlace('p4'), 'p4', 300, 260, '', 2, false);
        assertPlace(model.getPlace('p5'), 'p5', 300, 340, '', 0, false);
        assertPlace(model.getPlace('p6'), 'p6', 300, 420, '', 0, false);
        assertPlace(model.getPlace('p7'), 'p7', 620, 260, '', 0, false);
        assertPlace(model.getPlace('p8'), 'p8', 620, 340, '', 0, false);
        assertPlace(model.getPlace('p9'), 'p9', 620, 420, '', 0, false);
        assertPlace(model.getPlace('p10'), 'p10', 540, 100, '', 0, false);
        log('Model places correct');

        expect(model.getArcs().length).toEqual(MODEL_ARCS_LENGTH);
        assertArc(model.getArc('a1'), 'a1', ArcType.REGULAR_PT, 'p1', 't1', 3, 'p2');
        assertArc(model.getArc('a2'), 'a2', ArcType.REGULAR_TP, 't1', 'p3', 5, 'newVariable_1');
        assertArc(model.getArc('a3'), 'a3', ArcType.RESET, 'p4', 't2', 1);
        assertArc(model.getArc('a4'), 'a4', ArcType.INHIBITOR, 'p5', 't3', 1);
        assertArc(model.getArc('a5'), 'a5', ArcType.READ, 'p6', 't4', 1);
        assertArc(model.getArc('a6'), 'a6', ArcType.REGULAR_TP, 't2', 'p7', 20);
        assertArc(model.getArc('a7'), 'a7', ArcType.REGULAR_TP, 't3', 'p8', 1);
        assertArc(model.getArc('a8'), 'a8', ArcType.REGULAR_TP, 't4', 'p9', 1);
        assertArc(model.getArc('a9'), 'a9', ArcType.REGULAR_PT, 'p1', 't2', 1);
        assertArc(model.getArc('a10'), 'a10', ArcType.REGULAR_PT, 'p4', 't3', 1);
        assertArc(model.getArc('a11'), 'a11', ArcType.REGULAR_PT, 'p5', 't4', 1);
        assertArc(model.getArc('a12'), 'a12', ArcType.REGULAR_PT, 'p6', 't3', 1);
        assertArc(model.getArc('a13'), 'a13', ArcType.REGULAR_PT, 'p5', 't2', 1);
        assertArc(model.getArc('a14'), 'a14', ArcType.REGULAR_TP, 't2', 'p8', 1);
        assertArc(model.getArc('a15'), 'a15', ArcType.REGULAR_TP, 't2', 'p3', 1);
        assertArc(model.getArc('a16'), 'a16', ArcType.REGULAR_TP, 't2', 'p3', 5, 'newVariable_1', [new Breakpoint(10, 10), new Breakpoint(20, 20)]);
        log('Model arcs correct');
    }

    function assertCorrectExport(xml) {
        expect(xml).not.toContain('t2_finish');
        expect(xml).not.toContain('t2_assign');
        expect(xml).not.toContain('t2_cancel');
        expect(xml).not.toContain('t2_delegate');
        log('Empty events not exported correctly');
    }

    function importAndExport(xml, errors = 0, warnings = 0, info = 0) {
        const modelResult = importService.parseFromXml(xml);
        expect(modelResult.errors.length).toEqual(errors);
        expect(modelResult.warnings.length).toEqual(warnings);
        expect(modelResult.info.length).toEqual(info);
        const model = modelResult.model;
        assertCorrectImport(model);
        const cloned = model.clone();
        assertCorrectImport(cloned);
        log('Import successful');
        const exported = exportService.exportXml(model);
        log(exported);
        assertCorrectExport(exported);
        log('Export successful');
        return exported;
    }

    function log(message) {
        if (debug) {
            console.log(message);
        }
    }

    test('should import & export', () => {
        let file = fs.readFileSync(TEST_FILE_PATH).toString();
        debug = false;
        const model1 = importAndExport(file, 18, 22, 9);
        expect(model1).toBeDefined();
        const model2 = importAndExport(model1, 0, 20, 0);
        expect(model2).toBeDefined();
        expect(model1).toEqual(model2);
    });

    test('should export manually created model', () => {
        const model = new PetriNet();
        const p1 = new Place(10, 10, false, 'p1');
        const t1 = new Transition(50, 10, 't1');
        const a1 = new RegularPlaceTransitionArc(p1, t1, 'a_old');
        const a1_breakpoint = new Breakpoint(0, 0);
        a1_breakpoint.x = 30;
        a1_breakpoint.y = 30;
        a1.breakpoints = [a1_breakpoint];
        a1.id = 'a1';
        model.addPlace(p1);
        model.addTransition(t1);
        model.addArc(a1);
        const xml = exportService.exportXml(model);
    });

    test('event-source', () => {
        const source = new DataVariable('data', DataType.TEXT);
        source.addEvent(new DataEvent(DataEventType.SET, 'set'));
        expect(() => {
            source.addEvent(new DataEvent(DataEventType.SET, 'set2'));
        }).toThrow();
        source.removeEvent(DataEventType.SET);

        const event = new DataEvent(DataEventType.SET, 'set')
        source.addEvent(event);
        expect(() => {
            event.addAction(undefined, undefined);
        }).toThrow();
        expect(() => {
            event.addAction(new Action('', ''), undefined);
        }).toThrow();
    });

    test('invalid xml import', () => {
        const file = fs.readFileSync('src/test/resources/invalid_xml_test.xml').toString();
        const result = importService.parseFromXml(file);
        expect(result.errors.length).toEqual(1);
    });

    test('petri-net code test', () => {
        const net = new PetriNet();
        const p1 = new Place(10, 10, false, 'p1');
        const t1 = new Transition(50, 10, 't1');
        const a1 = new RegularPlaceTransitionArc(p1, t1, 'a1');
        const i18nSk = new I18nTranslations('sk');
        const d1 = new DataVariable('d1', DataType.TEXT);
        const m1 = new Mapping('m1', 't1');
        net.addPlace(p1);
        net.addTransition(t1);
        net.addArc(a1);
        net.addI18n(i18nSk);
        net.addData(d1);
        net.addMapping(m1);

        const a2 = new RegularPlaceTransitionArc(p1, t1, 'a1');
        expect(net.getArcs().length).toEqual(1);
        expect(() => {
            net.addArc(a2);
        }).toThrow();
        expect(net.getArcs().length).toEqual(1);
        net.removeArc('a1');
        expect(net.getArcs().length).toEqual(0);

        const p2 = new Place(10, 10, false, 'p1');
        expect(net.getPlaces().length).toEqual(1);
        expect(() => {
            net.addPlace(p2);
        }).toThrow();
        expect(net.getPlaces().length).toEqual(1);
        net.removePlace('p1');
        expect(net.getPlaces().length).toEqual(0);

        const t2 = new Transition(10, 10, 't1');
        expect(net.getTransitions().length).toEqual(1);
        expect(() => {
            net.addTransition(t2);
        }).toThrow();
        expect(net.getTransitions().length).toEqual(1);
        net.removeTransition('t1');
        expect(net.getTransitions().length).toEqual(0);

        const i18nSk2 = new I18nTranslations('sk');
        expect(net.getI18ns().length).toEqual(1);
        expect(() => {
            net.addI18n(i18nSk2);
        }).toThrow();
        expect(net.getI18ns().length).toEqual(1);
        net.removeI18n('sk');
        expect(net.getI18ns().length).toEqual(0);

        const d2 = new DataVariable('d1', DataType.TEXT);
        expect(net.getDataSet().length).toEqual(1);
        expect(() => {
            net.addData(d2);
        }).toThrow();
        expect(net.getDataSet().length).toEqual(1);
        net.removeData('d1');
        expect(net.getDataSet().length).toEqual(0);

        const m2 = new Mapping('m1', 't1');
        expect(net.getMappings().length).toEqual(1);
        expect(() => {
            net.addMapping(m2);
        }).toThrow();
        expect(net.getMappings().length).toEqual(1);
        net.removeMapping('m1');
        expect(net.getMappings().length).toEqual(0);

        net.defaultRole = undefined;
        net.anonymousRole = undefined;
        net.transitionRole = undefined;
        exportService.exportXml(net);
    });
});
