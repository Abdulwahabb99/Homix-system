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
  isMeduim = false,
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [startDate, setStartDate] = useState(
    initialStartDate ? moment(initialStartDate, "DD-MM-YYYY").locale("en") : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? moment(initialEndDate, "DD-MM-YYYY").locale("en") : null
  );
  const [prevStartDate, setPrevStartDate] = useState(startDate);
  const [prevEndDate, setPrevEndDate] = useState(endDate);

  // useEffect(() => {
  //   moment.defineLocale("ar-sa-mine", {
  //     parentLocale: "ar",
  //     preparse: (string) => string,
  //     postformat: (string) => string,
  //   });
  // }, [isDirectionRTL]);

  useEffect(() => {
    setStartDate(initialStartDate ? moment(initialStartDate, "DD-MM-YYYY").locale("en") : null);
    setEndDate(initialEndDate ? moment(initialEndDate, "DD-MM-YYYY").locale("en") : null);
  }, [initialStartDate, initialEndDate]);

  const presets = [
    {
      text: "اليوم",
      start: moment().locale("en"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 1,
    },
    {
      text: "أمس",
      start: moment().locale("en").subtract(1, "day"),
      end: moment().locale("en").subtract(1, "day"),
      disabled: maxDaysRange < 1,
    },
    {
      text: "آخر ٧ أيام",
      start: moment().locale("en").subtract(6, "days"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 7,
    },
    {
      text: "آخر ٣٠ يوم",
      start: moment().locale("en").subtract(29, "days"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 30,
    },
    {
      text: "هذا الشهر",
      start: moment().locale("en").startOf("month"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 31,
    },
    {
      text: "الشهر السابق",
      start: moment().locale("en").subtract(1, "months").startOf("month"),
      end: moment().locale("en").subtract(1, "months").endOf("month"),
      disabled: maxDaysRange < 31,
    },
  ];

  const onDatesChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const onFocusChange = (focused) => setFocusedInput(focused);

  const confirm = () => {
    if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
      setPrevStartDate(startDate);
      setPrevEndDate(endDate);
      setFocusedInput(null);
      handleDatesChange(
        moment(startDate).locale("en").format("DD-MM-YYYY"),
        moment(endDate).locale("en").format("DD-MM-YYYY")
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
      return day.isAfter(moment().locale("en"), "day");
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
      meduim={isMeduim ?? true}
      small={!isMeduim ?? true}
      hideKeyboardShortcutsPanel
      numberOfMonths={window.innerWidth <= 768 ? 1 : 2}
      readOnly
      customCloseIcon={<span>&times;</span>}
      keepOpenOnDateSelect
      onClose={cancel}
      isDayHighlighted={(day) => isSameDay(day, moment().locale("en"))}
      isOutsideRange={isOutsideRange}
      renderCalendarInfo={renderPresets}
      startDatePlaceholderText="من "
      endDatePlaceholderText="إلى "
      initialVisibleMonth={() =>
        window.innerWidth > 768 ? moment().locale("en").subtract(1, "month") : moment().locale("en")
      }
      inputIconPosition="after"
      customInputIcon={null}
      // block
    />
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
  isMeduim: PropTypes.bool,
};

export default DateRangePickerWrapper;
