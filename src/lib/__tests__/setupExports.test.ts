import { Blob as NodeBlob } from 'node:buffer';
import { expect, it, vi } from 'vitest';
import { getAssetBarcodeValue } from '../../utils/setupSheetPdf';
import { downloadWordTemplate } from '../../pages/checklist-import/fileTemplates';
vi.mock('sonner',()=>({toast:{success:vi.fn(),error:vi.fn()}}));
vi.mock('@/lib/logger',()=>({logger:{warn:vi.fn()}}));
it('bounds hostile stored serials before canvas generation while retaining ordinary serials',()=>{
 expect(getAssetBarcodeValue({id:'abc12345',name:'Asset',serial_number:' serial-123 '})).toBe('SERIAL-123');
 expect(getAssetBarcodeValue({id:'abc12345',name:'Asset',serial_number:'x'.repeat(1_000_000)})).toBe('AST-ABC123');
 expect(getAssetBarcodeValue({id:'abc12345',name:'Asset',serial_number:'\u202eunsafe'})).toBe('AST-ABC123');
});
it('exports a genuine DOCX with only round-trippable checklist items',async()=>{
 vi.stubGlobal('Blob',NodeBlob);
 let captured:any;
 URL.createObjectURL=vi.fn((blob:any)=>{captured=blob;return 'blob:template';});
 URL.revokeObjectURL=vi.fn();
 const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 await downloadWordTemplate();
 const {default:mammoth}=await import('mammoth');
 const result=await mammoth.extractRawText({buffer:Buffer.from(await captured.arrayBuffer())});
 expect(result.value.trim().split(/\n+/)).toEqual(['Check oil level','Inspect belts','Verify safety guards in place','Test emergency stop button','Record temperature readings']);
 click.mockRestore();vi.unstubAllGlobals();
});
