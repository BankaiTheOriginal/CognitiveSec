export enum Role {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
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
