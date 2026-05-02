import { connectToDb } from "../infrastructure/database/sequelize";
import { logger } from "../shared/logger";
import { DashboardAggregateService } from "../modules/dashboard/dashboard-aggregate.service";
import { DashboardRepository } from "../modules/dashboard/dashboard.repo";

const START_ARGUMENT_PREFIX = "--start=";
const END_ARGUMENT_PREFIX = "--end=";

const getArgumentValue = (prefix: string): string | undefined => {
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
};

const run = async (): Promise<void> => {
  await connectToDb();
  const dashboardRepository = new DashboardRepository();
  const dashboardAggregateService = new DashboardAggregateService(dashboardRepository);
  const startDate = getArgumentValue(START_ARGUMENT_PREFIX);
  const endDate = getArgumentValue(END_ARGUMENT_PREFIX);

  logger.info(
    {
      endDate,
      operationName: "dashboard-aggregate-backfill",
      startDate,
    },
    "Starting dashboard aggregate backfill",
  );

  await dashboardAggregateService.backfill(startDate, endDate);
  logger.info({ operationName: "dashboard-aggregate-backfill" }, "Dashboard aggregate backfill completed");
};

void run().catch((error: unknown) => {
  logger.error({ err: error, operationName: "dashboard-aggregate-backfill" }, "Dashboard aggregate backfill failed");
  process.exitCode = 1;
});
