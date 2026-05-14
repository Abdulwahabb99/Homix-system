import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useEffect, useState } from "react";
import axiosRequest from "shared/functions/axiosRequest";
import ReportComponent from "layouts/Financialreports/ReportComponent";
import Spinner from "components/Spinner/Spinner";
import { ToastContainer } from "react-toastify";

function Dashboard() {
  const [financialreportData, setFinancialreportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const getFinancialreport = () => {
    setIsLoading(true);
    const url = `/orders/financialReport/?endDate=${date}&startDate=${date}`;
    axiosRequest
      .get(url)
      .then(({ data }) => {
        setFinancialreportData({
          ordersCount: data.data.ordersCount,
          totalCost: data.data.totalCost,
          totalProfit: data.data.totalProfit,
          totalRevenue: data.data.totalRevenue,
          totalCommission: data.data.totalCommission,
          totalToBeCollected: data.data.totalToBeCollected,
          totalDownPayment: data.data.totalDownPayment,
          deliveredOrders: data.data.DeliveredOrders,
          halfCompletedOrders: data.data.halfCompletedOrders,
        });
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getFinancialreport();
  }, []);

  return (
    <DashboardLayout>
      <ToastContainer />
      {isLoading && <Spinner />}
      {financialreportData && <ReportComponent financialreportData={financialreportData} />}{" "}
    </DashboardLayout>
  );
}

export default Dashboard;
