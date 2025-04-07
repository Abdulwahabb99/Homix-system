export const customerDetailsReducer = (state, action) => {
  return {
    ...state,
    [action.field]: action.value,
  };
};
