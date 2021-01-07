export enum PosStatusEnum {
  PENDING = 'pending',
  INVITE_CANCELLED = 'invite cancelled',
  ACTIVE = 'active',
  REVOKED = 'revoked',
  DELETED = 'deleted',
}

export enum PosStatusMethodEnum {
  ACCEPT = 'ACCEPT',
  CANCEL = 'CANCEL',
  RE_INVITE = 'RE_INVITE',
  RESEND_INVITE = 'RESEND_INVITE',
  REVOKE = 'REVOKE',
  ACTIVATE = 'ACTIVATE',
  DELETE = 'DELETE',
}

export const PosOperationsMap = {
  [PosStatusMethodEnum.ACCEPT]: {
    status: [undefined],
    newStatus: [PosStatusEnum.PENDING],
  },
  [PosStatusMethodEnum.CANCEL]: {
    status: [PosStatusEnum.PENDING],
    newStatus: [PosStatusEnum.INVITE_CANCELLED],
  },
  [PosStatusMethodEnum.RE_INVITE]: {
    status: [PosStatusEnum.INVITE_CANCELLED],
    newStatus: [PosStatusEnum.PENDING],
  },
  [PosStatusMethodEnum.RESEND_INVITE]: {
    status: [PosStatusEnum.PENDING],
    newStatus: [PosStatusEnum.PENDING],
  },
  [PosStatusMethodEnum.REVOKE]: {
    status: [PosStatusEnum.ACTIVE],
    newStatus: [PosStatusEnum.REVOKED],
  },
  [PosStatusMethodEnum.ACTIVATE]: {
    status: [PosStatusEnum.REVOKED],
    newStatus: [PosStatusEnum.ACTIVE],
  },
  [PosStatusMethodEnum.DELETE]: {
    status: [PosStatusEnum.REVOKED, PosStatusEnum.INVITE_CANCELLED],
    newStatus: [PosStatusEnum.DELETED],
  },
};
