const { USER_TYPES } = require("../../config/constants");

const requirePermission = (permissionKey) => (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
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

  /* 403, not 401 — the user IS authenticated, they just lack this permission.
     A 401 here would trip the frontend's global force-logout interceptor for
     what is simply a missing feature permission. Previously this returned 200
     with a JSON error body, so a blob-typed request (e.g. Excel export) would
     silently download that JSON as if it were the file. */
  return res.status(403).json({
    status: false,
    message: "Unauthorized",
  });
};

module.exports = requirePermission;
