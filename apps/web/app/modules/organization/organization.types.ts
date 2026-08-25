export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationActivityEvent {
  id: string;
  organizationId: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface IMembershipWithOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: string;
  organization: IOrganization;
}

export type MyOrganizationsResponse = IMembershipWithOrganization[];
