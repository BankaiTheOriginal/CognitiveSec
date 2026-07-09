import { api } from "@/app/common/api";
import { CreateTeam, UpdateTeam } from "./teams.types";

const base_url = `${process.env.API_URL}/teams`;
export async function getTeams() {
  const response = await api.get(`${base_url}`);
  return response.data;
}

export async function getTeam(id: string) {
  const response = await api.get(`${base_url}/${id}`);
  return response.data;
}

export async function createTeam(data: CreateTeam) {
  const response = await api.post(`${base_url}`, { data });
  return response.data;
}

export async function renameTeam(id: string, data: UpdateTeam) {
  const response = await api.patch(`${base_url}/${id}`, { data });
  return response.data;
}

export async function deleteTeam(id: string, uid: string) {
  const response = await api.delete(`${base_url}/${id}`);
  return response.data;
}

export async function addUserToTeam(id: string, uid: string) {
  const response = await api.post(`${base_url}/${id}/members/${uid}`);
  return response.data;
}

export async function removeUserFromTeam(id: string, uid: string) {
  const response = api.delete(`${base_url}/${id}/members/${uid}`);
}
