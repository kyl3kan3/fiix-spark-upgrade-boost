-- Run against a disposable Supabase database with the chat migration applied.
BEGIN;
SET LOCAL plpgsql.check_asserts = on;
DO $$
DECLARE
  _user uuid := gen_random_uuid();
  _own_topic text := 'user:' || _user || ':messages';
  _other_topic text := 'user:' || gen_random_uuid() || ':messages';
BEGIN
  -- Match the read probe used by realtime.authorize, which omits private.
  INSERT INTO realtime.messages (topic, extension) VALUES (_own_topic, 'broadcast'), (_other_topic, 'broadcast');
  PERFORM set_config('request.jwt.claim.sub', _user::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _user, 'role', 'authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  PERFORM set_config('realtime.topic', _own_topic, true);
  ASSERT EXISTS (SELECT FROM realtime.messages WHERE topic = _own_topic AND extension = 'broadcast');
  ASSERT NOT EXISTS (SELECT FROM realtime.messages WHERE topic = _other_topic AND extension = 'broadcast');
  PERFORM set_config('realtime.topic', _other_topic, true);
  ASSERT NOT EXISTS (SELECT FROM realtime.messages WHERE topic = _other_topic AND extension = 'broadcast');
END;
$$;
ROLLBACK;
