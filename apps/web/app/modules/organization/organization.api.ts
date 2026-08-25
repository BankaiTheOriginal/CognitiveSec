import { api } from "@/app/common/api";
import { UpdateOrg } from "../documents/documents.types";
import {
  IOrganization,
  MyOrganizationsResponse,
  OrganizationActivityEvent,
} from "./organization.types";

const base_url = `${process.env.NEXT_PUBLIC_API_URL}/organizations`;

export async function getMyOrg(): Promise<IOrganization> {
  const response = await api.get(`${base_url}/me`);
  return response.data;
}
export async function getMyOrgs(): Promise<MyOrganizationsResponse> {
  const response = await api.get<MyOrganizationsResponse>(
    `${base_url}/me/organizations`,
  );
  return response.data;
}

export async function updateOrganization(data: UpdateOrg) {
  const response = await api.patch(`${base_url}/me`, { ...data });
  return response.data;
}

export async function getMembers() {
  const response = await api.get(`${base_url}/me/members`);
  return response.data;
}

export async function getActivity(): Promise<OrganizationActivityEvent[]> {
  const response = await api.get(`${base_url}/me/activity`);
  return response.data;
}

export async function removeMember(id: string) {
  const response = await api.delete(`${base_url}/me/members/${id}`);
  return response.data;
}
