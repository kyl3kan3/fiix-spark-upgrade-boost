-- Notify each participant that their conversation changed. Message content stays
-- in public.messages and is fetched through its existing participant RLS policies.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Limit direct message history to participants" ON public.messages
AS RESTRICTIVE FOR SELECT TO authenticated USING (
  (SELECT auth.uid()) IN (sender_id, recipient_id)
);

CREATE POLICY "Read own chat notifications" ON realtime.messages
FOR SELECT TO authenticated USING (
  -- Realtime joins probe read access with a row containing the topic and extension.
  extension = 'broadcast' AND topic = realtime.topic()
  AND realtime.topic() = ('user:' || (SELECT auth.uid())::text || ':messages')
);

CREATE FUNCTION public.notify_chat_participants() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  participant record;
BEGIN
  -- Marking a conversation read updates many rows at once.
  FOR participant IN
    SELECT sender_id AS user_id, recipient_id AS peer_id FROM changed_messages
    UNION
    SELECT recipient_id, sender_id FROM changed_messages
  LOOP
    PERFORM realtime.send(jsonb_build_object('peer_id', participant.peer_id), 'changed',
      'user:' || participant.user_id::text || ':messages', true);
  END LOOP;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_chat_participants() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_chat_insert AFTER INSERT ON public.messages
REFERENCING NEW TABLE AS changed_messages FOR EACH STATEMENT EXECUTE FUNCTION public.notify_chat_participants();
CREATE TRIGGER notify_chat_update AFTER UPDATE ON public.messages
REFERENCING NEW TABLE AS changed_messages FOR EACH STATEMENT EXECUTE FUNCTION public.notify_chat_participants();
