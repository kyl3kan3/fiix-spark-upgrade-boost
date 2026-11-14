import { beforeEach, describe, expect, it } from 'vitest';
import { supabaseAuthStorage, setSupabaseRememberMe } from '../../integrations/supabase/authStorage';
import { brokeredPreviewStorage } from '../../integrations/supabase/previewAuthStorage';
beforeEach(()=>{ localStorage.clear();sessionStorage.clear(); });
it('defaults actual client storage to session-only',()=>{ const adapter=brokeredPreviewStorage()!;adapter.setItem('token','secret');expect(sessionStorage.getItem('token')).toBe('secret');expect(localStorage.getItem('token')).toBeNull(); });
it('honors explicit remember-me and removes alternate copies',()=>{setSupabaseRememberMe(true);supabaseAuthStorage.setItem('token','persistent');expect(localStorage.getItem('token')).toBe('persistent');setSupabaseRememberMe(false);supabaseAuthStorage.setItem('token','session');expect(sessionStorage.getItem('token')).toBe('session');expect(localStorage.getItem('token')).toBeNull();});
it('preserves existing sessions on storage migration',()=>{localStorage.setItem('token','old-session');expect(supabaseAuthStorage.getItem('token')).toBe('old-session');supabaseAuthStorage.removeItem('token');expect(supabaseAuthStorage.getItem('token')).toBeNull();});
