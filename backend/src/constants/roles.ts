export const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  AGENT: 'AGENT',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
