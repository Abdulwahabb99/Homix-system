import React from "react";
import "index.css";
import "react-toastify/dist/ReactToastify.css";
import "components/NotificationMeassage/ToastifyOverrides.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "App";
import { MaterialUIControllerProvider } from "context";
import { Provider } from "react-redux";
import { queryClient } from "query/queryClient";
import store from "store";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MaterialUIControllerProvider>
          <App />
        </MaterialUIControllerProvider>
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
