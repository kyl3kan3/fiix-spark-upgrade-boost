
-- 1) Messages: enforce same-company between sender and recipient
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND public.get_user_company(sender_id) IS NOT NULL
  AND public.get_user_company(sender_id) = public.get_user_company(recipient_id)
);

-- 2) Work order comments: verify the work order belongs to user's company
DROP POLICY IF EXISTS "Users can create comments" ON public.work_order_comments;
CREATE POLICY "Users can create comments"
ON public.work_order_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND work_order_id IN (
    SELECT wo.id FROM public.work_orders wo
    WHERE wo.created_by IN (
      SELECT p.id FROM public.profiles p
      WHERE p.company_id = public.get_user_company(auth.uid())
    )
  )
);

-- 3) Notification dispatch log: explicit admin-only read; no client write/update/delete
CREATE POLICY "Admins can view dispatch log in their company"
ON public.notification_dispatch_log
FOR SELECT
USING (
  public.has_role(auth.uid(), 'administrator'::app_role)
  AND recipient_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.company_id = public.get_user_company(auth.uid())
  )
);
