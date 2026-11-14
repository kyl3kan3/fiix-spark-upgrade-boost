import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthState } from '../useAuthState';
const state = vi.hoisted(() => ({ listener: null as any, restore: null as any }));
vi.mock('@/integrations/supabase/client', () => ({ supabase:{ auth:{
 onAuthStateChange: (listener:any) => { state.listener=listener; return {data:{subscription:{unsubscribe:vi.fn()}}}; },
 getSession: () => new Promise(resolve => { state.restore=resolve; }),
 signOut: vi.fn(),
}}}));
afterEach(cleanup);
describe('session query boundary', () => {
 it('cancels old requests and removes cached tenant data before publishing another account', async () => {
   const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
   const wrapper = ({children}:any) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
   const { result } = renderHook(() => useAuthState(), {wrapper});
   act(() => state.listener('SIGNED_IN',{user:{id:'alice'}}));
   client.setQueryData(['assets'],[{name:'Alice private asset'}]);
   let finish:any;
   const pending = client.fetchQuery({queryKey:['vendors'],queryFn:() => new Promise(resolve => {finish=resolve;})}).catch(()=>{});
   act(() => state.listener('SIGNED_IN',{user:{id:'bob'}}));
   expect(result.current.user?.id).toBe('bob');
   expect(client.getQueryData(['assets'])).toBeUndefined();
   await act(async () => { finish(['Alice private vendor']); await pending; });
   expect(client.getQueryData(['vendors'])).toBeUndefined();
   await act(async () => state.restore({data:{session:{user:{id:'alice'}}},error:null}));
   expect(result.current.user?.id).toBe('bob');
   client.setQueryData(['assets'],['Bob asset']);
   act(() => state.listener('TOKEN_REFRESHED',{user:{id:'bob'}}));
   expect(client.getQueryData(['assets'])).toEqual(['Bob asset']);
   act(() => state.listener('SIGNED_OUT',null));
   expect(client.getQueryData(['assets'])).toBeUndefined();
 });
});
