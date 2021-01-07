/** payload parsed from jwt */
export interface JwtPayload {
  /** user id */
  _id: string;
  /** array of roles */
  roles: [string];
}
