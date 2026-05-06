export type AuthenticatedStaff = {
  email: string;
  fullName: string;
  id: number;
  leaveCredit: number;
  role: string;
};

export type JwtPayload = {
  email: string;
  role: string;
  sub: number;
};
