import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import { USER_TYPES } from "../../config/constants";
import type {
  DashboardCardKey,
  DashboardCardResponse,
  DashboardCardsPayload,
  DashboardMetricSnapshot,
  DashboardMetricsInput,
  DashboardRole,
  DateRangeInput,
} from "./dashboard.types";
import { DashboardRepository } from "./dashboard.repo";

const CARD_LABELS: Record<DashboardCardKey, string> = {
  activeMakers: "صُنّاع نشطون",
  activeProducts: "منتجات نشطة",
  pendingOrders: "طلبات معلقة",
  totalOrders: "إجمالي الطلبات",
  totalSales: "إجمالي المبيعات (ج.م)",
};

const PREVIOUS_PERIOD_LABEL = "مقارنة بالفترة السابقة";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PERCENTAGE_PRECISION = 10;

type AuthenticatedDashboardUser = {
  userType?: string;
};

const getRole = (user: AuthenticatedDashboardUser, vendorId?: number | null): DashboardRole => {
  if (vendorId || user.userType === USER_TYPES.VENDOR) {
    return "vendor";
  }

  return "admin";
};

const roundPercentage = (value: number): number => {
  return Math.round(value * PERCENTAGE_PRECISION) / PERCENTAGE_PRECISION;
};

const getTrend = (currentValue: number, previousValue: number): "down" | "flat" | "up" => {
  if (currentValue > previousValue) {
    return "up";
  }

  if (currentValue < previousValue) {
    return "down";
  }

  return "flat";
};

const getChangePercentage = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return roundPercentage(((currentValue - previousValue) / previousValue) * 100);
};

const buildCard = (
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

const getPreviousRange = ({ endDate, startDate }: DateRangeInput): DateRangeInput => {
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);
  const rangeDuration = currentEndDate.getTime() - currentStartDate.getTime();
  const previousEndDate = new Date(currentStartDate.getTime() - DAY_IN_MILLISECONDS);
  const previousStartDate = new Date(previousEndDate.getTime() - rangeDuration);

  return {
    endDate: previousEndDate.toISOString(),
    startDate: previousStartDate.toISOString(),
  };
};

export class DashboardService {
  public constructor(private readonly dashboardRepository: DashboardRepository) {}

  public async getCards(
    range: DateRangeInput,
    user: AuthenticatedDashboardUser,
    vendorId?: number | null,
  ): Promise<Result<DashboardCardsPayload>> {
    const role = getRole(user, vendorId);
    const currentInput = this.buildMetricsInput(range, role, vendorId);
    const previousInput = this.buildMetricsInput(getPreviousRange(range), role, vendorId);
    const [currentSnapshot, previousSnapshot] = await Promise.all([
      this.dashboardRepository.getSnapshot(currentInput),
      this.dashboardRepository.getSnapshot(previousInput),
    ]);

    return success({
      cards: this.buildCardsForRole(role, currentSnapshot, previousSnapshot),
      endDate: range.endDate,
      role,
      startDate: range.startDate,
    });
  }

  public async getSingleCard(
    key: DashboardCardKey,
    range: DateRangeInput,
    user: AuthenticatedDashboardUser,
    vendorId?: number | null,
  ): Promise<Result<DashboardCardResponse>> {
    const cardsResult = await this.getCards(range, user, vendorId);
    if (!cardsResult.ok) {
      return cardsResult;
    }

    const card = cardsResult.data.cards.find((item) => item.key === key);

    return success(card!);
  }

  private buildCardsForRole(
    role: DashboardRole,
    currentSnapshot: DashboardMetricSnapshot,
    previousSnapshot: DashboardMetricSnapshot,
  ): DashboardCardResponse[] {
    const baseCards = [
      buildCard("totalSales", currentSnapshot.totalSales, previousSnapshot.totalSales),
      buildCard("totalOrders", currentSnapshot.totalOrders, previousSnapshot.totalOrders),
      buildCard("pendingOrders", currentSnapshot.pendingOrders, previousSnapshot.pendingOrders),
    ];

    if (role === "vendor") {
      return [
        ...baseCards,
        buildCard(
          "activeProducts",
          currentSnapshot.activeProducts,
          previousSnapshot.activeProducts,
        ),
      ];
    }

    return [
      ...baseCards,
      buildCard("activeMakers", currentSnapshot.activeMakers, previousSnapshot.activeMakers),
    ];
  }

  private buildMetricsInput(
    range: DateRangeInput,
    role: DashboardRole,
    vendorId?: number | null,
  ): DashboardMetricsInput {
    return {
      endDate: new Date(range.endDate).toISOString(),
      role,
      startDate: new Date(range.startDate).toISOString(),
      vendorId: vendorId ?? undefined,
    };
  }
}
