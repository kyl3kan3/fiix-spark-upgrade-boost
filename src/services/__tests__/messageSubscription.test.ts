import { expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({channel:vi.fn(),listener:null as any,options:null as any}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{channel:state.channel}}));
import { subscribeToConversationMessages } from '../messageService';
it('uses a private user topic and receives only the selected conversation',()=>{
 const channel={on:vi.fn((kind,options,listener)=>{state.options=options;state.listener=listener;return channel;}),subscribe:vi.fn(()=>channel)};
 state.channel.mockReturnValue(channel);
 const onChange=vi.fn();
 subscribeToConversationMessages('owner','peer',onChange);
 expect(state.channel).toHaveBeenCalledWith('user:owner:messages:peer',{config:{private:true}});
 expect(state.options.filter).toBeUndefined();
 state.listener({eventType:'INSERT',new:{sender_id:'owner',recipient_id:'other'}});
 expect(onChange).not.toHaveBeenCalled();
 state.listener({eventType:'INSERT',new:{sender_id:'owner',recipient_id:'peer'}});
 state.listener({eventType:'UPDATE',new:{sender_id:'peer',recipient_id:'owner'}});
 expect(onChange).toHaveBeenCalledTimes(2);
});
