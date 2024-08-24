import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const NotificationMeassage = (type, message) => {
  if (type === "success") {
    toast.success(message);
  } else {
    toast.error(message);
  }
};
