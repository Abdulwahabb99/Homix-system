const { USER_TYPES } = require("../../config/constants");

const requirePermission = (permissionKey) => (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.json({
      status: false,
      message: "Unauthorized",
    });
  }

  if (user.userType === USER_TYPES.ADMIN) {
    return next();
  }

  const permissions = user.permissions && typeof user.permissions === "object"
    ? user.permissions
    : {};

  if (permissions[permissionKey]) {
    return next();
  }

  return res.json({
    status: false,
    message: "Unauthorized",
  });
};

module.exports = requirePermission;
