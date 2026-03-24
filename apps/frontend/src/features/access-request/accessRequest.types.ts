// apps/web/src/features/access-request/accessRequest.types.ts

export interface CreateAccessRequestDTO {
  appId: string;
  appName: string;
  reason: string;
  businessJustification: string;
  durationNeeded?: string;
}

export interface AccessRequestLocationState {
  appId: string;
  appName: string;
}
