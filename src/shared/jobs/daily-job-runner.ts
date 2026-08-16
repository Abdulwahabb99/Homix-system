/**
 * Restart-proof daily jobs.
 *
 * `node-cron` schedules live in memory, so a once-a-day job only fires if the
 * process happens to be running at that exact minute. A deploy, a crash or an
 * idle sleep before Cairo midnight meant the fines recompute never ran at all —
 * and unlike the 2-hourly import, a daily job gets no second chance.
 *
 * Every run is recorded, so the server can catch up on boot when the last run
 * was not today. The marker also makes a same-day restart cheap: the job is
 * skipped rather than repeated.
 */
import moment from "moment-timezone";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../infrastructure/database";
import { logger } from "../logger/logger";

const JOB_TIMEZONE = "Africa/Cairo";
const LOG_OPERATION = "dailyJobRunner";

/** The Cairo calendar day a timestamp belongs to. */
const toJobDay = (value: Date | string): string =>
  moment.tz(value, JOB_TIMEZONE).format("YYYY-MM-DD");

const readLastRunAt = async (jobName: string): Promise<Date | null> => {
  const rows = await sequelize.query<{ lastRunAt: Date }>(
    `select "lastRunAt" from "cronRuns" where "jobName" = :jobName limit 1`,
    { replacements: { jobName }, type: QueryTypes.SELECT },
  );

  return rows[0]?.lastRunAt ?? null;
};

const recordRun = async (jobName: string, ranAt: Date): Promise<void> => {
  await sequelize.query(
    `
      insert into "cronRuns" ("jobName", "lastRunAt", "createdAt", "updatedAt")
      values (:jobName, :ranAt, now(), now())
      on conflict ("jobName") do update set "lastRunAt" = excluded."lastRunAt", "updatedAt" = now()
    `,
    { replacements: { jobName, ranAt } },
  );
};

/**
 * Runs `handler` unless it already ran today (Cairo). Safe to call on boot and
 * from a schedule — the marker keeps it to once a day either way.
 *
 * A failing handler is logged and does NOT record a run, so the next boot or
 * tick retries it.
 */
export const runDailyJobIfDue = async (
  jobName: string,
  handler: () => Promise<unknown>,
): Promise<boolean> => {
  try {
    const lastRunAt = await readLastRunAt(jobName);
    const today = toJobDay(new Date());

    if (lastRunAt && toJobDay(lastRunAt) === today) {
      logger.info({ jobName, lastRunAt, operationName: LOG_OPERATION }, "Daily job already ran today, skipping");
      return false;
    }

    logger.info({ jobName, lastRunAt, operationName: LOG_OPERATION }, "Daily job started");
    await handler();
    await recordRun(jobName, new Date());
    logger.info({ jobName, operationName: LOG_OPERATION }, "Daily job completed");
    return true;
  } catch (error) {
    // Deliberately not recorded, so the job is retried on the next boot or tick.
    logger.error({ err: error, jobName, operationName: LOG_OPERATION }, "Daily job failed");
    return false;
  }
};
