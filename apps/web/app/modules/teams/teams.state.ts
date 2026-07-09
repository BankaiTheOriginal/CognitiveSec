import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUserToTeam,
  createTeam,
  deleteTeam,
  getTeam,
  getTeams,
  removeUserFromTeam,
  renameTeam,
} from "./teams.api";
import { CreateTeam, UpdateTeam } from "./teams.types";

export function useGetTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });
}

export function useGetTeam(id: string) {
  return useQuery({
    queryKey: ["teams", id],
    queryFn: () => getTeam(id),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeam) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useRenameTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeam }) =>
      renameTeam(id, data),
    onSuccess: (returnedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useAddUserToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, uid }: { id: string; uid: string }) =>
      addUserToTeam(id, uid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
}
export function useRemoveUserFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, uid }: { id: string; uid: string }) =>
      removeUserFromTeam(id, uid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
}
