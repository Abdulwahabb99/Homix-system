import { ORDER_STATUS_ARABIC, USER_TYPES } from "../../config/constants";
import type {
  DashboardCardKey,
  DashboardCardResponse,
  DashboardGoalProgressItem,
  DashboardLeaderboardEntry,
  DashboardRole,
  DashboardSalesDistributionItem,
  DateRangeInput,
} from "./dashboard.types";

const PREVIOUS_PERIOD_LABEL = "مقارنة بالفترة السابقة";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PERCENTAGE_PRECISION = 10;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const CARD_LABELS: Record<DashboardCardKey, string> = {
  activeMakers: "صُنّاع نشطون",
  activeProducts: "منتجات نشطة",
  pendingOrders: "طلبات معلقة",
  totalOrders: "إجمالي الطلبات",
  totalSales: "إجمالي المبيعات (ج.م)",
};

type AuthenticatedDashboardUser = {
  userType?: string;
};

export const getRole = (
  user: AuthenticatedDashboardUser,
  vendorId?: number | null,
): DashboardRole => {
  if (vendorId || user.userType === USER_TYPES.VENDOR) {
    return "vendor";
  }

  return "admin";
};

const roundPercentage = (value: number): number => {
  return Math.round(value * PERCENTAGE_PRECISION) / PERCENTAGE_PRECISION;
};

export const getTrend = (
  currentValue: number,
  previousValue: number,
): "down" | "flat" | "up" => {
  if (currentValue > previousValue) {
    return "up";
  }

  if (currentValue < previousValue) {
    return "down";
  }

  return "flat";
};

export const getChangePercentage = (
  currentValue: number,
  previousValue: number,
): number => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return roundPercentage(((currentValue - previousValue) / previousValue) * 100);
};

export const buildCard = (
  key: DashboardCardKey,
  currentValue: number,
  previousValue: number,
): DashboardCardResponse => ({
  changePercentage: getChangePercentage(currentValue, previousValue),
  comparisonLabel: PREVIOUS_PERIOD_LABEL,
  currentValue,
  key,
  label: CARD_LABELS[key],
  previousValue,
  trend: getTrend(currentValue, previousValue),
});

export const getPreviousRange = ({ endDate, startDate }: DateRangeInput): DateRangeInput => {
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const rangeDuration = currentEndDate.getTime() - currentStartDate.getTime();
  const previousEndDate = new Date(currentStartDate.getTime() - 1);
  const previousStartDate = new Date(previousEndDate.getTime() - rangeDuration);

  return {
    endDate: previousEndDate.toISOString(),
    startDate: previousStartDate.toISOString(),
  };
};

const toUtcDate = (value: string, endOfDay: boolean): Date => {
  const [year = 0, month = 1, day = 1] = value
    .split("-")
    .map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0));
};

export const normalizeDateRange = ({ endDate, startDate }: DateRangeInput): DateRangeInput => {
  const normalizedStartDate = DATE_ONLY_PATTERN.test(startDate)
    ? toUtcDate(startDate, false)
    : new Date(startDate);
  const normalizedEndDate = DATE_ONLY_PATTERN.test(endDate)
    ? toUtcDate(endDate, true)
    : new Date(endDate);

  return {
    endDate: normalizedEndDate.toISOString(),
    startDate: normalizedStartDate.toISOString(),
  };
};

export const toStatusLabel = (status: number | null): string => {
  if (status === null) {
    return "غير محدد";
  }

  const keyedStatus = String(status) as unknown as keyof typeof ORDER_STATUS_ARABIC;
  return ORDER_STATUS_ARABIC[keyedStatus] ?? String(status);
};

export const toProgressPercentage = (currentValue: number, targetValue: number): number => {
  if (targetValue <= 0) {
    return 0;
  }

  return Math.min(100, roundPercentage((currentValue / targetValue) * 100));
};

export const withRanks = (
  entries: Omit<DashboardLeaderboardEntry, "rank">[],
): DashboardLeaderboardEntry[] => {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

export const collapseDistribution = (
  items: DashboardSalesDistributionItem[],
  createOther: (value: number, percentage: number) => DashboardSalesDistributionItem,
): DashboardSalesDistributionItem[] => {
  if (items.length <= 4) {
    return items;
  }

  const visibleItems = items.slice(0, 3);
  const remainingItems = items.slice(3);
  const otherValue = remainingItems.reduce((sum, item) => sum + item.value, 0);
  const otherPercentage = remainingItems.reduce((sum, item) => sum + item.percentage, 0);
  return [...visibleItems, createOther(otherValue, roundPercentage(otherPercentage))];
};

export const mergeGoalConfig = (
  item: Omit<DashboardGoalProgressItem, "currentValue" | "progressPercentage">,
  currentValue: number,
): DashboardGoalProgressItem => ({
  ...item,
  currentValue,
  progressPercentage: toProgressPercentage(currentValue, item.targetValue),
});
