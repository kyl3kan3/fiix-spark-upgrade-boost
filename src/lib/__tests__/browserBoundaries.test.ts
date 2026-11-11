import { describe, it, expect } from 'vitest';
import { safeAppPath, safeWebUrl, csvCell } from '../browserTrust';
import { canReparent, locationPath } from '../locationHierarchy';
import { parseRiskFactors } from '../riskFactorValidation';

describe('browser trust boundaries', () => {
 it.each(['/a/..//evil.example', '//evil.example', '/\\evil.example', '/\t/evil.example', '/\n/evil.example', 'javascript:alert(1)', 'https://evil.example', null])('rejects unsafe app destination %j', value => expect(safeAppPath(value)).toBeNull());
 it.each(['/dashboard', '/assets/new?name=One%20Two#form', '/learn/a-b'])('preserves internal destination %s', value => expect(safeAppPath(value)).toBe(value));
 it.each(['javascript:alert(1)', 'data:text/html,test', '//evil.example', 'https://user:secret@example.com', 'java\nscript:alert(1)', {}])('rejects unsafe clickable URL %j', value => expect(safeWebUrl(value)).toBeUndefined());
 it('keeps legitimate web links', () => expect(safeWebUrl('https://vendor.example/catalog?a=1')).toBe('https://vendor.example/catalog?a=1'));
 it.each(['=HYPERLINK("https://evil.example")', '\t=1+1', '  +SUM(1,2)', '@SUM(1,2)', '-1+2', '\r=1'])('neutralizes formula %j', value => expect(csvCell(value)).toBe('"\'' + value.replace(/"/g,'""') + '"'));
 it('quotes separators, multiline text, and embedded quotes', () => expect(csvCell('Room "A", east\nwing')).toBe('"Room ""A"", east\nwing"'));
});

describe('location ancestry', () => {
 const locations = [{ id: 'a', name: 'A', parent_id: null }, { id: 'b', name: 'B', parent_id: 'a' }, { id: 'c', name: 'C', parent_id: 'b' }, { id: 'd', name: 'D', parent_id: null }];
 it('rejects self and descendant parents, including bulk targets', () => { for (const parent of ['a','b','c']) expect(canReparent(locations,'a',parent)).toBe(false); });
 it('permits root and unrelated parents', () => { expect(canReparent(locations,'b',null)).toBe(true); expect(canReparent(locations,'b','d')).toBe(true); expect(locationPath(locations,'c')).toBe('A > B > C'); });
 it('terminates on existing corruption', () => { const cyclic = [{ id:'a', name:'A', parent_id:'b' }, { id:'b', name:'B', parent_id:'a' }]; expect(canReparent(cyclic,'other','b')).toBe(false); expect(() => locationPath(cyclic,'a')).toThrow('cycle'); });
});

describe('stored risk JSON', () => {
 const factor = { key:'age', label:'Age', detail:'Ten years', score:45, weight:0.2 };
 it.each(['not-an-array', {}, null, [null, 'bad', {}]])('rejects malformed factors %j', value => expect(parseRiskFactors(value)).toEqual([]));
 it('preserves valid factors and excludes unsafe members', () => expect(parseRiskFactors([factor, {...factor,label:{}}, {...factor,score:Infinity}])).toEqual([factor]));
});
