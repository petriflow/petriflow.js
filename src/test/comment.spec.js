const {
    DataRef,
    DataVariable,
    DataType,
    ExportService,
    ImportService,
    PetriNet,
    Place,
    RegularPlaceTransitionArc,
    Role,
    Transition,
} = require('../../dist/petriflow');
const fs = require('fs');

const TEST_FILE_PATH = 'src/test/resources/comment_test.xml';
const PROCESS_COMMENT = '# Process comment\n\nExplains **why** the process looks like this.\n\n    indented code block';

describe('Petriflow comment tests', () => {
    let importService;
    let exportService;

    beforeEach(() => {
        importService = new ImportService();
        exportService = new ExportService();
    });

    function importModel(xml) {
        const result = importService.parseFromXml(xml);
        expect(result.errors.length).toEqual(0);
        return result.model;
    }

    function assertComments(model) {
        expect(model.comment).toEqual(PROCESS_COMMENT);
        expect(model.getRole('manager').comment).toEqual('Role comment with <b>html</b> & entities');
        expect(model.getRole('clerk').comment).toBeUndefined();
        expect(model.getData('amount').comment).toEqual('Data comment');
        expect(model.getData('note').comment).toBeUndefined();
        expect(model.getTransition('approve').comment).toEqual('Transition comment');
        expect(model.getTransition('reject').comment).toEqual('Plain <i>html</i> without cdata');
        expect(model.getPlace('start').comment).toEqual('Place comment');
        expect(model.getPlace('end').comment).toBeUndefined();
        const dataRefs = model.getTransition('approve').dataGroups[0].getDataRefs();
        expect(dataRefs.find(ref => ref.id === 'amount').comment).toEqual('Data ref comment');
        expect(dataRefs.find(ref => ref.id === 'note').comment).toBeUndefined();
        expect(model.getArc('a1').comment).toEqual('Arc comment');
        expect(model.getArc('a2').comment).toBeUndefined();
    }

    test('should import comments', () => {
        assertComments(importModel(fs.readFileSync(TEST_FILE_PATH).toString()));
    });

    test('should export comments as CDATA and import them back', () => {
        const model = importModel(fs.readFileSync(TEST_FILE_PATH).toString());
        const xml = exportService.exportXml(model);
        expect(xml).toContain(`<comment><![CDATA[\n${PROCESS_COMMENT}\n]]></comment>`);
        expect(xml).toContain('<comment><![CDATA[\nRole comment with <b>html</b> & entities\n]]></comment>');
        expect(xml.match(/<comment>/g).length).toEqual(8);
        assertComments(importModel(xml));
    });

    test('should export comments in schema order', () => {
        const xml = exportService.exportXml(importModel(fs.readFileSync(TEST_FILE_PATH).toString()));
        expect(xml).toMatch(/<\/title><comment>[\s\S]*?<\/comment><defaultRole>/);
        expect(xml).toMatch(/<id>manager<\/id><title>Manager<\/title><comment>/);
        expect(xml).toMatch(/<desc>Description<\/desc><comment>/);
        expect(xml).toMatch(/<label>Approve<\/label><comment>/);
        expect(xml).toMatch(/<label>Start<\/label><comment>[\s\S]*?<\/comment><tokens>/);
        expect(xml).toMatch(/<dataRef><id>amount<\/id><comment>[\s\S]*?<\/comment><logic>/);
        expect(xml).toMatch(/<arc><id>a1<\/id><comment>[\s\S]*?<\/comment><type>/);
    });

    test('should handle CDATA end sequence in comment', () => {
        const model = new PetriNet();
        model.comment = 'a ]]> b ]]> c';
        model.addTransition(new Transition(0, 0, 't1'));
        const xml = exportService.exportXml(model);
        expect(xml).toContain('<comment><![CDATA[\na ]]]]><![CDATA[> b ]]]]><![CDATA[> c\n]]></comment>');
        expect(importModel(xml).comment).toEqual('a ]]> b ]]> c');
    });

    test('should not export empty comments', () => {
        const model = new PetriNet();
        model.comment = '   ';
        const transition = new Transition(0, 0, 't1');
        transition.comment = '';
        model.addTransition(transition);
        const xml = exportService.exportXml(model);
        expect(xml).not.toContain('<comment>');
        const imported = importModel(xml);
        expect(imported.comment).toBeUndefined();
        expect(imported.getTransition('t1').comment).toBeUndefined();
    });

    test('should clone comments', () => {
        const model = new PetriNet();
        model.comment = 'model';
        const transition = new Transition(0, 0, 't1');
        transition.comment = 'transition';
        model.addTransition(transition);
        const place = new Place(0, 0, false, 'p1');
        place.comment = 'place';
        model.addPlace(place);
        const role = new Role('r1');
        role.comment = 'role';
        model.addRole(role);
        const data = new DataVariable('d1', DataType.TEXT);
        data.comment = 'data';
        model.addData(data);
        const dataRef = new DataRef('d1');
        dataRef.comment = 'dataRef';
        const arc = new RegularPlaceTransitionArc(place, transition, 'a1');
        arc.comment = 'arc';
        model.addArc(arc);

        const cloned = model.clone();
        expect(cloned.comment).toEqual('model');
        expect(cloned.getTransition('t1').comment).toEqual('transition');
        expect(cloned.getPlace('p1').comment).toEqual('place');
        expect(cloned.getRole('r1').comment).toEqual('role');
        expect(cloned.getData('d1').comment).toEqual('data');
        expect(dataRef.clone().comment).toEqual('dataRef');
        expect(cloned.getArc('a1').comment).toEqual('arc');
    });
});
