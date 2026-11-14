import { expect, it, vi, beforeEach } from 'vitest';
const { rpc }=vi.hoisted(()=>({rpc:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc}}));
import { fetchCompanyPeople, attachWorkOrderPeople } from '../companyDirectoryService';
beforeEach(()=>rpc.mockReset());
it('retains peer names without exposing directory contact fields',async()=>{
 rpc.mockResolvedValue({data:[{id:'peer',first_name:'Alex',last_name:'Jones',email:'secret@example.com',company_id:'tenant'}],error:null});
 expect(await fetchCompanyPeople()).toEqual([{id:'peer',first_name:'Alex',last_name:'Jones'}]);
 const [order]=await attachWorkOrderPeople([{id:'job',assigned_to:'peer',created_by:'missing',title:'Repair'}]);
 expect(order.assignee).toEqual({id:'peer',first_name:'Alex',last_name:'Jones'});
 expect(order.creator).toBeNull();
 expect(order.title).toBe('Repair');
 expect(rpc).toHaveBeenCalledWith('get_company_directory');
});
it('preserves errors instead of misrepresenting an inaccessible directory',async()=>{rpc.mockResolvedValue({data:null,error:new Error('Directory unavailable')});await expect(fetchCompanyPeople()).rejects.toThrow('Directory unavailable');});
it('does not query directory for an empty work-order result',async()=>{expect(await attachWorkOrderPeople([])).toEqual([]);expect(rpc).not.toHaveBeenCalled();});
