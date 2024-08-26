import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axios from "axios";
import { useEffect, useState } from "react";
import ReportComponent from "layouts/Financialreports/ReportComponent";
import Spinner from "components/Spinner/Spinner";
import { ToastContainer } from "react-toastify";

function Dashboard() {
  const [financialreportData, setFinancialreportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getFinancialreport = () => {
    setIsLoading(true);
    const url = `https://homix.onrender.com/orders/financialReport/?endDate=${date}&startDate=${date}`;

    axios
      .get(url)
      .then(({ data: { data } }) => {
        setFinancialreportData({
          ordersCount: data.ordersCount,
          totalCost: data.totalCost,
          totalProfit: data.totalProfit,
          totalRevenue: data.totalRevenue,
          totalCommission: data.totalCommission,
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
      <DashboardNavbar />
      <ToastContainer />
      {isLoading && <Spinner />}
      {financialreportData && <ReportComponent financialreportData={financialreportData} />}{" "}
    </DashboardLayout>
  );
}

export default Dashboard;
