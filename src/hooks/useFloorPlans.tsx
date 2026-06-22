import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchFloorPlans,
  fetchFloorPlanAssets,
  uploadFloorPlan,
  deleteFloorPlan,
  fetchMarkers,
  createMarker,
  deleteMarker,
  type FloorPlan,
} from "@/services/floorPlanService";

const PLANS_KEY = ["floor-plans", "list"] as const;
const ASSETS_KEY = ["floor-plans", "assets"] as const;
const markersKey = (id: string) => ["floor-plans", "markers", id] as const;

export function useFloorPlans() {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error, refetch } = useQuery({
    queryKey: PLANS_KEY,
    queryFn: fetchFloorPlans,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ASSETS_KEY,
    queryFn: fetchFloorPlanAssets,
    staleTime: 1000 * 60 * 5,
  });

  const upload = useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) => uploadFloorPlan(file, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const remove = useMutation({
    mutationFn: (plan: FloorPlan) => deleteFloorPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  });

  return { plans, assets, isLoading, error: (error as Error) ?? null, refetch, upload, remove };
}

export function useFloorPlanMarkers(floorPlanId: string | null) {
  const queryClient = useQueryClient();
  const key = markersKey(floorPlanId ?? "none");

  const { data: markers = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchMarkers(floorPlanId as string),
    enabled: !!floorPlanId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({ mutationFn: createMarker, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteMarker, onSuccess: invalidate });

  return { markers, isLoading, add, remove };
}
