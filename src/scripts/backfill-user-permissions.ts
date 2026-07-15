import { connectToDb } from "../infrastructure/database";

import { getPermissionTemplateForUserType } from "../../app/modules/user/user.permissions";
import { normalizePermissions, toPlainRecord, toText } from "../../app/modules/user/user.helpers";

const User = require("../../app/modules/user/user.model") as {
  findAll: (input?: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
};

type UserRecord = {
  id: number;
  permissions?: Record<string, boolean>;
  roleName?: string;
  save: () => Promise<void>;
  userType?: string;
};

const shouldOverwrite = process.argv.includes("--overwrite");

const run = async (): Promise<void> => {
  await connectToDb();

  const users = await User.findAll();
  let updatedCount = 0;

  for (const userValue of users) {
    const user = userValue as UserRecord;
    const plainUser = toPlainRecord(user);
    const userType = toText(plainUser.userType);
    const roleName = toText(plainUser.roleName);
    const nextPermissions = shouldOverwrite
      ? normalizePermissions(getPermissionTemplateForUserType(userType, roleName), userType, roleName)
      : normalizePermissions(plainUser.permissions, userType, roleName);
    const currentPermissions = normalizePermissions(plainUser.permissions, "", "");

    if (JSON.stringify(currentPermissions) === JSON.stringify(nextPermissions)) {
      continue;
    }

    plainUser.permissions = nextPermissions;
    Object.assign(user as Record<string, unknown>, { permissions: nextPermissions });
    await user.save();
    updatedCount += 1;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        mode: shouldOverwrite ? "overwrite" : "merge",
        totalUsers: users.length,
        updatedUsers: updatedCount,
      },
      null,
      2,
    ),
  );
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
