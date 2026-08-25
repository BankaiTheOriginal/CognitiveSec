import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActivity,
  getMembers,
  getMyOrg,
  getMyOrgs,
  removeMember,
  updateOrganization,
} from "./organization.api";
import { UpdateOrg } from "../documents/documents.types";

export function useGetMyOrg() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: getMyOrg,
  });
}
export function useGetMyOrgs() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: getMyOrgs,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrg) => updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "activity"] });
    },
  });
}

export function useGetMembers() {
  return useQuery({
    queryKey: ["organization", "members"],
    queryFn: getMembers,
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "activity"] });
    },
  });
}

export function useGetOrganizationActivity() {
  return useQuery({
    queryKey: ["organization", "activity"],
    queryFn: getActivity,
  });
}
