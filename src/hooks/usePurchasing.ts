import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrder,
  createPurchaseRequest,
  fetchPurchaseOrders,
  fetchPurchaseRequests,
  receivePurchaseOrderLine,
  updatePurchaseOrderTaxRate,
} from "@/services/purchasingService";
import type { CreatePurchaseOrderInput, CreatePurchaseRequestInput } from "@/types/purchasing";

const KEY = ["purchasing"] as const;

export function usePurchasing() {
  const queryClient = useQueryClient();
  const requests = useQuery({ queryKey: [...KEY, "requests"], queryFn: fetchPurchaseRequests });
  const orders = useQuery({ queryKey: [...KEY, "orders"], queryFn: fetchPurchaseOrders });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY });
    queryClient.invalidateQueries({ queryKey: ["parts"] });
  };

  const createRequest = useMutation({
    mutationFn: (input: CreatePurchaseRequestInput) => createPurchaseRequest(input),
    onSuccess: invalidate,
  });
  const createOrder = useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => createPurchaseOrder(input),
    onSuccess: invalidate,
  });
  const receiveLine = useMutation({
    mutationFn: ({ lineId, qty }: { lineId: string; qty: number }) =>
      receivePurchaseOrderLine(lineId, qty),
    onSuccess: invalidate,
  });
  const setTaxRate = useMutation({
    mutationFn: ({ poId, rate }: { poId: string; rate: number }) =>
      updatePurchaseOrderTaxRate(poId, rate),
    onSuccess: invalidate,
  });

  return {
    requests: requests.data ?? [],
    orders: orders.data ?? [],
    isLoading: requests.isLoading || orders.isLoading,
    error: requests.error ?? orders.error,
    refetch: () => {
      requests.refetch();
      orders.refetch();
    },
    createRequest,
    createOrder,
    receiveLine,
    setTaxRate,
  };
}
