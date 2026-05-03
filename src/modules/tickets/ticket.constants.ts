export const DEFAULT_TICKET_PAGE = 1;
export const DEFAULT_TICKET_PAGE_SIZE = 20;
export const MAX_TICKET_PAGE_SIZE = 100;

export const TICKET_STATUS = {
  OPEN: 1,
  CLOSED: 2,
} as const;

export const TICKET_STATUS_ARABIC: Record<(typeof TICKET_STATUS)[keyof typeof TICKET_STATUS], string> = {
  [TICKET_STATUS.CLOSED]: "مغلقة",
  [TICKET_STATUS.OPEN]: "مفتوحة",
};

export const TICKET_TYPE = {
  DELIVERY_DELAY: 1,
  CANCEL: 2,
  MONEY_REFUND: 3,
  PRODUCT_RETURN: 4,
  DELIVERY_REJECTED: 5,
  DELIVERY_FAILURE: 6,
  MAINTENANCE: 7,
  REPLACEMENT: 8,
  VERIFICATION: 9,
} as const;

export const TICKET_TYPE_ARABIC: Record<(typeof TICKET_TYPE)[keyof typeof TICKET_TYPE], string> = {
  [TICKET_TYPE.CANCEL]: "إلغاء",
  [TICKET_TYPE.DELIVERY_DELAY]: "تأخير في التوصيل",
  [TICKET_TYPE.DELIVERY_FAILURE]: "فشل في التوصيل",
  [TICKET_TYPE.DELIVERY_REJECTED]: "رفض الاستلام",
  [TICKET_TYPE.MAINTENANCE]: "صيانة",
  [TICKET_TYPE.MONEY_REFUND]: "استرجاع الأموال",
  [TICKET_TYPE.PRODUCT_RETURN]: "استرجاع منتج",
  [TICKET_TYPE.REPLACEMENT]: "استبدال",
  [TICKET_TYPE.VERIFICATION]: "التحقق",
};

export const OVERDUE_DAYS_THRESHOLD = 7;
