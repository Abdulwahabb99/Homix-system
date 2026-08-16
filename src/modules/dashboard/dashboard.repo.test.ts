import { sequelize } from "../../infrastructure/database";
import { DashboardRepository } from "./dashboard.repo";

/* These assert on generated SQL rather than on rows: the bug they guard against was
   Sequelize emitting SQL Postgres refuses to parse, so it never reached row mapping.
   A limited vendor query must not build a LIMIT subquery — Sequelize hoists the
   required nested `product` include into it while leaving `orderLines` out of its
   FROM clause, which fails with "missing FROM-clause entry for table orderLines". */
describe("DashboardRepository.getLatestOrders", () => {
  const dateRange = {
    endDate: "2026-08-16T23:59:59.000Z",
    startDate: "2026-08-16T00:00:00.000Z",
  };

  const asRow = (orderId: number): unknown => ({
    get: (key?: string) => (key ? ({ orderId } as Record<string, unknown>)[key] : { orderId }),
    orderId,
    toJSON: () => ({ orderId }),
  });

  const captureSql = (idRows: unknown[]): string[] => {
    const statements: string[] = [];
    jest.spyOn(sequelize, "query").mockImplementation((async (sql: unknown) => {
      const text = typeof sql === "string" ? sql : String((sql as { query?: string })?.query ?? sql);
      statements.push(text);
      return text.includes("GROUP BY") ? idRows : [];
    }) as never);

    return statements;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("resolves vendor orders without a limit subquery", async () => {
    const statements = captureSql([asRow(11), asRow(12)]);

    await new DashboardRepository().getLatestOrders({
      ...dateRange,
      role: "vendor",
      vendorId: 217568,
    } as never);

    expect(statements).toHaveLength(2);
    for (const statement of statements) {
      expect(statement).not.toContain("FROM (SELECT");
    }
  });

  it("keeps vendor scoping on both vendor queries", async () => {
    const statements = captureSql([asRow(11)]);

    await new DashboardRepository().getLatestOrders({
      ...dateRange,
      role: "vendor",
      vendorId: 217568,
    } as never);

    /* Guards against "fixes" that drop the vendor filter from the driving query and
       so leak other vendors' orders into the dashboard. */
    for (const statement of statements) {
      expect(statement).toContain('"vendorId" = 217568');
    }
    expect(statements[1]).toContain('"Order"."id" IN (11)');
  });

  it("skips the hydrating query when the vendor has no orders in range", async () => {
    const statements = captureSql([]);

    const result = await new DashboardRepository().getLatestOrders({
      ...dateRange,
      role: "vendor",
      vendorId: 217568,
    } as never);

    expect(result).toEqual([]);
    expect(statements).toHaveLength(1);
  });

  it("leaves the admin query as a single statement", async () => {
    const statements = captureSql([]);

    await new DashboardRepository().getLatestOrders({
      ...dateRange,
      role: "admin",
    } as never);

    expect(statements).toHaveLength(1);
  });
});
