import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  getMembers,
  getMyOrg,
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

export function useUpdateOrganization() {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrg) => updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
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
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
    },
  });
}
