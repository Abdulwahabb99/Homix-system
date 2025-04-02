import moment from "moment";
import "moment/dist/locale/ar";
import React, { useEffect, useState } from "react";
import { DateRangePicker } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import styles from "./index.module.css";
import PropTypes from "prop-types";
import "./index.css";

const DateRangePickerWrapper = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  handleDatesChange,
  maxDaysRange = 31,
  isDirectionRTL = true,
  allowFutureDays = false,
  className = "",
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [startDate, setStartDate] = useState(moment(initialStartDate, "DD-MM-YYYY"));
  const [endDate, setEndDate] = useState(moment(initialEndDate, "DD-MM-YYYY"));
  const [prevStartDate, setPrevStartDate] = useState(startDate);
  const [prevEndDate, setPrevEndDate] = useState(endDate);

  useEffect(() => {
    moment.defineLocale("ar-sa-mine", {
      parentLocale: "ar",
      preparse: (string) => string,
      postformat: (string) => string,
    });
  }, [isDirectionRTL]);

  useEffect(() => {
    setStartDate(moment(initialStartDate, "DD-MM-YYYY"));
    setEndDate(moment(initialEndDate, "DD-MM-YYYY"));
  }, [initialStartDate, initialEndDate]);

  const presets = [
    { text: "اليوم", start: moment(), end: moment(), disabled: maxDaysRange < 1 },
    {
      text: "أمس",
      start: moment().subtract(1, "day"),
      end: moment().subtract(1, "day"),
      disabled: maxDaysRange < 1,
    },
    {
      text: "آخر ٧ أيام",
      start: moment().subtract(6, "days"),
      end: moment(),
      disabled: maxDaysRange < 7,
    },
    {
      text: "آخر ٣٠ يوم",
      start: moment().subtract(29, "days"),
      end: moment(),
      disabled: maxDaysRange < 30,
    },
    {
      text: "هذا الشهر",
      start: moment().startOf("month"),
      end: moment(),
      disabled: maxDaysRange < 31,
    },
    {
      text: "الشهر السابق",
      start: moment().subtract(1, "months").startOf("month"),
      end: moment().subtract(1, "months").endOf("month"),
      disabled: maxDaysRange < 31,
    },
  ];

  const onDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const onFocusChange = (focused) => setFocusedInput(focused);

  const confirm = () => {
    if (startDate && endDate) {
      setPrevStartDate(startDate);
      setPrevEndDate(endDate);
      setFocusedInput(null);
      handleDatesChange(
        moment(startDate).format("DD-MM-YYYY"),
        moment(endDate).format("DD-MM-YYYY")
      );
    }
  };

  const cancel = () => {
    setStartDate(prevStartDate);
    setEndDate(prevEndDate);
    setFocusedInput(null);
  };

  const isSameDay = (a, b) =>
    a?.date() === b?.date() && a?.month() === b?.month() && a?.year() === b?.year();

  const isOutsideRange = (day) => {
    if (maxDaysRange === null) return false;
    if (!allowFutureDays) {
      return day.isAfter(moment(), "day");
    }

    return false;
  };

  const renderPresets = () => (
    <div className={styles.PresetDateRangePicker_panel}>
      <div className="d-flex flex-wrap">
        {presets.map(({ text, start, end, disabled }) => {
          const selected = isSameDay(start, startDate) && isSameDay(end, endDate);
          return !disabled ? (
            <button
              key={text}
              className={`
                ${styles.PresetDateRangePicker_button}
                ${selected ? styles.PresetDateRangePicker_button__selected : ""}
              `}
              type="button"
              onClick={() => onDatesChange({ startDate: start, endDate: end })}
            >
              {text}
            </button>
          ) : null;
        })}
      </div>
      <div className="text-left">
        <button
          className={`${styles.PresetDateRangePicker_button} ${styles.confirmButton}`}
          onClick={confirm}
        >
          تأكيد
        </button>
        <button
          className={`${styles.PresetDateRangePicker_button} ${styles.cancelButton}`}
          onClick={cancel}
        >
          إلغاء
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
        focusedInput={focusedInput}
        onFocusChange={onFocusChange}
        startDateId="startDate"
        endDateId="endDate"
        isRTL={isDirectionRTL}
        showClearDates
        reopenPickerOnClearDates
        small
        hideKeyboardShortcutsPanel
        numberOfMonths={window.innerWidth <= 768 ? 1 : 2}
        readOnly
        customCloseIcon={<span>&times;</span>}
        keepOpenOnDateSelect
        onClose={cancel}
        isDayHighlighted={(day) => isSameDay(day, moment())}
        isOutsideRange={isOutsideRange}
        renderCalendarInfo={renderPresets}
        startDatePlaceholderText="من "
        endDatePlaceholderText="إلى "
        initialVisibleMonth={() =>
          window.innerWidth > 768 ? moment().subtract(1, "month") : moment()
        }
      />
    </div>
  );
};
DateRangePickerWrapper.propTypes = {
  startDate: PropTypes.string.isRequired, // assuming DD-MM-YYYY string
  endDate: PropTypes.string.isRequired,
  handleDatesChange: PropTypes.func.isRequired,
  maxDaysRange: PropTypes.number,
  isDirectionRTL: PropTypes.bool,
  allowFutureDays: PropTypes.bool,
  className: PropTypes.string,
};

export default DateRangePickerWrapper;
