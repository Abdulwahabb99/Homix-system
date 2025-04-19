import { useCallback, useState } from "react";
import moment from "moment";

export const useDateRange = ({
  defaultDays = 6,
  queryParams = true,
  format = "DD-MM-YYYY",
  useStartOfDay = false,
  useEndOfDay = false,
  maxNoOfDays = null,
  maxNoOfDaysCallback = null,
  onChange,
  useEndDate = true,
} = {}) => {
  const [{ startDate, endDate }, setDateRange] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);

    let start = urlParams.get("startDate")?.replaceAll("%2F", "/");
    let end = urlParams.get("endDate")?.replaceAll("%2F", "/");

    if (queryParams && start) {
      start = useStartOfDay ? moment.utc(start, format).startOf("day") : moment.utc(start, format);
    }

    if (useEndDate && queryParams && end) {
      end = useEndOfDay ? moment.utc(end, format).endOf("day") : moment.utc(end, format);
    }

    const fallbackStart = useStartOfDay
      ? moment().utc().subtract(defaultDays, "days").startOf("day")
      : moment().subtract(defaultDays, "days");

    const fallbackEnd = useEndOfDay ? moment().utc().endOf("day") : moment();

    return useEndDate
      ? {
          startDate: start || fallbackStart,
          endDate: end || fallbackEnd,
        }
      : {
          startDate: start || fallbackStart,
        };
  });

  const handleDatesChange = useCallback(
    (start, end) => {
      const newStart = useStartOfDay
        ? moment.utc(start, format).startOf("day")
        : moment.utc(start, format);

      let newEnd;
      let newDateRange;

      if (!useEndDate) {
        newDateRange = { startDate: newStart };
      } else {
        newEnd = useEndOfDay ? moment.utc(end, format).endOf("day") : moment.utc(end, format);

        // max days limit
        if (maxNoOfDays && newEnd.diff(newStart, "days") >= maxNoOfDays && maxNoOfDaysCallback) {
          maxNoOfDaysCallback();
          return;
        }

        newDateRange = {
          startDate: newStart,
          endDate: newEnd,
        };
      }

      setDateRange(newDateRange);
      if (onChange) onChange(newDateRange);

      // Update URL
      if (queryParams) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("startDate", newStart.locale("en").format(format));
        if (useEndDate && newEnd) {
          urlParams.set("endDate", newEnd.locale("en").format(format));
        }

        const url = new URL(window.location.href);
        url.search = urlParams.toString().replaceAll("%2C", ",");
        window.history.pushState(null, "", url.toString());
      }
    },
    [
      format,
      onChange,
      queryParams,
      useStartOfDay,
      useEndOfDay,
      useEndDate,
      maxNoOfDays,
      maxNoOfDaysCallback,
    ]
  );

  return { startDate, endDate, handleDatesChange };
};
