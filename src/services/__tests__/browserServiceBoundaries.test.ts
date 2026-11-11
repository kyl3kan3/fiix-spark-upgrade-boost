import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({from:vi.fn(), invoke:vi.fn(), company:vi.fn()}));
vi.mock('@/integrations/supabase/client', () => ({supabase:{from:mocks.from,functions:{invoke:mocks.invoke}}}));
vi.mock('@/services/supabaseHelpers',()=>({requireUserCompany:mocks.company}));
vi.mock('sonner',()=>({toast:{success:vi.fn(),error:vi.fn(),info:vi.fn()}}));
import { fetchOnboardingProfile } from '../onboardingPlanService';
import { recomputeRiskScores } from '../predictiveMaintenanceService';
beforeEach(()=>{vi.clearAllMocks();mocks.company.mockResolvedValue({companyId:'tenant'});});
it('reconstructs trusted plan actions instead of trusting writable stored hrefs',async()=>{
 mocks.from.mockReturnValue({select:()=>({maybeSingle:async()=>({data:{goals:['organize_assets'],industry:null,team_size:null,plan:{modules:[{href:'javascript:alert(1)'}],tasks:[{href:'//evil.example'}]},completed_at:null},error:null})})});
 const profile=await fetchOnboardingProfile();
 expect(profile?.plan.modules.length).toBeGreaterThan(0);
 expect(profile?.plan.modules.every(m=>m.href.startsWith('/')&&!m.href.startsWith('//'))).toBe(true);
 expect(profile?.plan.tasks.every(m=>m.href.startsWith('/')&&!m.href.startsWith('//'))).toBe(true);
});
it('uses authorized server recomputation and propagates partial server failures',async()=>{
 mocks.invoke.mockResolvedValue({data:{ok:true,results:[{companyId:'tenant',status:'error',error:'Denied'}]},error:null});
 await expect(recomputeRiskScores()).rejects.toThrow('Denied');
 expect(mocks.invoke).toHaveBeenCalledWith('recompute-risk-scores',{body:{company_id:'tenant',triggered_by:'manual'}});
 expect(mocks.from).not.toHaveBeenCalled();
});
it('refreshes saved scores after successful server recomputation',async()=>{
 mocks.invoke.mockResolvedValue({data:{ok:true,results:[{companyId:'tenant',status:'empty'}]},error:null});
 mocks.from.mockReturnValue({select:()=>({order:async()=>({data:[],error:null})})});
 expect(await recomputeRiskScores()).toEqual([]);
});
