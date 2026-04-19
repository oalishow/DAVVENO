export interface Member {
  id: string;
  name: string;
  ra?: string;
  email?: string;
  validityDate?: string;
  alphaCode?: string;
  photoUrl?: string | null;
  roles?: string[];
  course?: string;
  isActive?: boolean;
  isApproved?: boolean;
  createdAt?: string;
  deletedAt?: string | null;
  legacyId?: string;
  pendingChanges?: any;
}
