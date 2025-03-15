export const USER_TYPES = {
  ADMIN: "1",
  VENDOR: "2",
  OPERATION: "3",
  LOGISTIC: "4",
};

export const getUserType = (type) => {
  switch (type) {
    case USER_TYPES.ADMIN:
      return "مدير";
    case USER_TYPES.VENDOR:
      return "مورد";
    case USER_TYPES.OPERATION:
      return "عمليات";
    case USER_TYPES.LOGISTIC:
      return "لوجستي";
    default:
      return "";
  }
};
export const USER_TYPES_VALUES = [
  { value: USER_TYPES.ADMIN, label: "مدير" },
  { value: USER_TYPES.VENDOR, label: "مورد" },
  { value: USER_TYPES.OPERATION, label: "عمليات" },
  { value: USER_TYPES.LOGISTIC, label: "لوجستي" },
];
