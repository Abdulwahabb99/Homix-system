import moment from "moment";
import "shared/functions/momentLocale";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-dates";
import { OPEN_DOWN, OPEN_UP } from "react-dates/constants";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import styles from "./index.module.css";
import PropTypes from "prop-types";
import "./index.css";

const PICKER_VIEW_MARGIN = 12;

/** تقدير متحفظ لارتفاع اللوحة (شهرين + بريست + أزرار) حتى لا نختار OPEN_UP والمساحة فوق أقل من الواقع */
const PICKER_HEIGHT_EST_DESKTOP = 620 + 160;
const PICKER_HEIGHT_EST_MOBILE = 440 + 160;

/**
 * أسلاف قابلة للتمرير (overflow). مع appendToBody نحدّث اتجاه الفتح ونطلق resize اصطناعي
 * لأن react-dates لا يعيد حساب transform إلا على window.resize.
 */
function getVerticalScrollAncestors(el: HTMLElement | null): HTMLElement[] {
  if (el == null || typeof document === "undefined") return [];
  const out: HTMLElement[] = [];
  const root = (document.scrollingElement ?? document.documentElement) as HTMLElement;
  let node: HTMLElement | null = el.parentElement;
  while (node != null) {
    const { overflowY } = window.getComputedStyle(node);
    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight;
    if (canScrollY) out.push(node);
    if (node === root) break;
    node = node.parentElement;
  }
  if (root && !out.includes(root)) out.push(root);
  return out;
}

function getVisualViewportVerticalRange(): { top: number; bottom: number } {
  if (typeof window === "undefined") return { top: PICKER_VIEW_MARGIN, bottom: 800 };
  const vv = window.visualViewport;
  const top = (vv?.offsetTop ?? 0) + PICKER_VIEW_MARGIN;
  const bottom = (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight) - PICKER_VIEW_MARGIN;
  return { top, bottom };
}

function parseTranslateFromTransform(transform: string | undefined): { x: number; y: number } | null {
  if (!transform || transform === "none") return null;
  const t3 = /translate3d\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*(?:,\s*[-\d.]+px)?\s*\)/.exec(transform);
  if (t3) return { x: parseFloat(t3[1]), y: parseFloat(t3[2]) };
  const t2 = /translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/.exec(transform);
  if (t2) return { x: parseFloat(t2[1]), y: parseFloat(t2[2]) };
  return null;
}

function parseMatrix2dTranslate(transform: string): { x: number; y: number } | null {
  const m = /^matrix\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(
    transform.trim()
  );
  if (!m) return null;
  return { x: parseFloat(m[5]), y: parseFloat(m[6]) };
}

function readPickerTranslate(el: HTMLElement): { x: number; y: number } | null {
  return (
    parseTranslateFromTransform(el.style.transform) ??
    parseTranslateFromTransform(getComputedStyle(el).transform) ??
    parseMatrix2dTranslate(getComputedStyle(el).transform)
  );
}

/** يكمل بعد موضع react-dates: يحدّ translateY حتى لا يخرج المنبثق عن نافذة العرض (خصوصًا مع OPEN_UP). */
function applyPortaledPickerViewportClamp(): void {
  if (typeof document === "undefined") return;
  const { top: viewTop, bottom: viewBottom } = getVisualViewportVerticalRange();

  document.querySelectorAll(".DateRangePicker_picker.homix-drp").forEach((node) => {
    const el = node as HTMLElement;
    const parsed = readPickerTranslate(el);
    if (!parsed) return;
    let { x, y } = parsed;

    for (let i = 0; i < 8; i++) {
      const rect = el.getBoundingClientRect();
      let dy = 0;
      if (rect.top < viewTop) dy = viewTop - rect.top;
      else if (rect.bottom > viewBottom) dy = viewBottom - rect.bottom;
      if (dy === 0) break;
      y += dy;
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    }
  });
}

function scheduleRepositionAndClamp(): void {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(() => {
      applyPortaledPickerViewportClamp();
    });
  });
}

/* عرض عربي — مراجع ثابتة على مستوى الوحدة. تعريفها inline يغيّر هويّتها كل render،
   فيُعيد react-dates ضبط monthTitleHeight=null باستمرار وتظهر لوحة فارغة. */
const renderArabicDayContents = (day: any) => day.clone().locale("ar").format("D");
const renderArabicMonthText = (day: any) => day.clone().locale("ar").format("MMMM YYYY");

const DateRangePickerWrapper = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  handleDatesChange,
  maxDaysRange = 31,
  isDirectionRTL = true,
  allowFutureDays = false,
  isMeduim = false,
  allowPastDays: _allowPastDays = true,
  useDefaultPresets: _useDefaultPresets = true,
  onReset,
}: {
  startDate: any;
  endDate: any;
  handleDatesChange: (start: any, end: any) => void;
  maxDaysRange?: number;
  isDirectionRTL?: boolean;
  allowFutureDays?: boolean;
  isMeduim?: boolean;
  allowPastDays?: boolean;
  useDefaultPresets?: boolean;
  onReset?: () => void;
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [openDirection, setOpenDirection] = useState(OPEN_DOWN);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [startDate, setStartDate] = useState(
    initialStartDate ? moment(initialStartDate, "DD-MM-YYYY").locale("ar") : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? moment(initialEndDate, "DD-MM-YYYY").locale("ar") : null
  );
  const [prevStartDate, setPrevStartDate] = useState(startDate);
  const [prevEndDate, setPrevEndDate] = useState(endDate);

  const isDesktopTwoMonths = useMediaQuery("(min-width: 769px)", { defaultMatches: true });

  const computeOpenDirection = useCallback(() => {
    const el = containerRef.current;
    if (!el) return OPEN_DOWN;
    const rect = el.getBoundingClientRect();
    const { top: viewTop, bottom: viewBottom } = getVisualViewportVerticalRange();
    const spaceBelow = viewBottom - rect.bottom;
    const spaceAbove = rect.top - viewTop;
    const estimatedPicker = isDesktopTwoMonths ? PICKER_HEIGHT_EST_DESKTOP : PICKER_HEIGHT_EST_MOBILE;

    if (spaceBelow >= estimatedPicker) return OPEN_DOWN;
    if (spaceAbove >= estimatedPicker) return OPEN_UP;

    const MIN_EDGE = 96;
    if (spaceAbove < MIN_EDGE && spaceBelow > spaceAbove) return OPEN_DOWN;
    if (spaceBelow < MIN_EDGE && spaceAbove > spaceBelow) return OPEN_UP;
    return spaceBelow >= spaceAbove ? OPEN_DOWN : OPEN_UP;
  }, [isDesktopTwoMonths]);

  useEffect(() => {
    setStartDate(initialStartDate ? moment(initialStartDate, "DD-MM-YYYY").locale("ar") : null);
    setEndDate(initialEndDate ? moment(initialEndDate, "DD-MM-YYYY").locale("ar") : null);
  }, [initialStartDate, initialEndDate]);

  /* عند استخدام appendToBody تُعرض النافذة خارج الشجرة؛ نضيف homix-drp للعنصر المنبثق حتى تبقى ستايلات التقويم (:root + .homix-drp). */
  useLayoutEffect(() => {
    const syncHomixClassOnPortaledPicker = () => {
      document.querySelectorAll(".DateRangePicker_picker").forEach((node) => {
        const el = node as HTMLElement;
        const insideWrapper = el.closest(".custom-date-picker");
        if (focusedInput) {
          if (!insideWrapper) el.classList.add("homix-drp");
        } else if (!insideWrapper) {
          el.classList.remove("homix-drp");
        }
      });
    };
    syncHomixClassOnPortaledPicker();
    if (focusedInput) {
      const id = requestAnimationFrame(syncHomixClassOnPortaledPicker);
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [focusedInput]);

  useLayoutEffect(() => {
    if (!focusedInput) return;
    scheduleRepositionAndClamp();
  }, [focusedInput, openDirection]);

  useEffect(() => {
    if (!focusedInput) return;

    const updateOpenDirection = () => setOpenDirection(computeOpenDirection());

    let scrollRaf = 0;
    /** إعادة موضع المنبثق على body: المكتبة تستمع لـ window resize فقط */
    const nudgeReactDatesPositionAfterScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateOpenDirection();
        scheduleRepositionAndClamp();
      });
    };

    const scrollNodes = getVerticalScrollAncestors(containerRef.current);
    window.addEventListener("resize", updateOpenDirection, { passive: true });
    scrollNodes.forEach((n) => n.addEventListener("scroll", nudgeReactDatesPositionAfterScroll, { passive: true }));
    window.addEventListener("scroll", nudgeReactDatesPositionAfterScroll, { passive: true });
    const vv = window.visualViewport;
    vv?.addEventListener("resize", nudgeReactDatesPositionAfterScroll);
    vv?.addEventListener("scroll", nudgeReactDatesPositionAfterScroll);
    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("resize", updateOpenDirection);
      scrollNodes.forEach((n) => n.removeEventListener("scroll", nudgeReactDatesPositionAfterScroll));
      window.removeEventListener("scroll", nudgeReactDatesPositionAfterScroll);
      vv?.removeEventListener("resize", nudgeReactDatesPositionAfterScroll);
      vv?.removeEventListener("scroll", nudgeReactDatesPositionAfterScroll);
    };
  }, [focusedInput, computeOpenDirection]);

  const presets = [
    {
      text: "الشهر السابق",
      start: moment().locale("en").subtract(1, "months").startOf("month"),
      end: moment().locale("en").subtract(1, "months").endOf("month"),
      disabled: maxDaysRange < 31,
    },
    {
      text: "هذا الشهر",
      start: moment().locale("en").startOf("month"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 31,
    },
    {
      text: "آخر ٣٠ يوم",
      start: moment().locale("en").subtract(29, "days"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 30,
    },
    {
      text: "آخر ٧ أيام",
      start: moment().locale("en").subtract(6, "days"),
      end: moment().locale("en"),
      disabled: maxDaysRange < 7,
    },
    {
      text: "أمس",
      start: moment().locale("en").subtract(1, "day"),
      end: moment().locale("en").subtract(1, "day"),
      disabled: maxDaysRange < 1,
    },
    { text: "اليوم", start: moment().locale("en"), end: moment().locale("en"), disabled: maxDaysRange < 1 },
  ];

  const onDatesChange = ({ startDate, endDate }) => {
    // نعرض دائماً باللغة العربية (أرقام هندية + أسماء شهور عربية)؛ التحويل لصيغة الـ API يتم في confirm بـ locale("en")
    setStartDate(startDate ? startDate.clone().locale("ar") : null);
    setEndDate(endDate ? endDate.clone().locale("ar") : null);
  };

  const onFocusChange = (focused: string | null) => {
    if (focused) {
      setOpenDirection(computeOpenDirection());
      requestAnimationFrame(() => setOpenDirection(computeOpenDirection()));
    }
    setFocusedInput(focused);
  };

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

  const reset = () => {
    setStartDate(null);
    setEndDate(null);
    setPrevStartDate(null);
    setPrevEndDate(null);
    setFocusedInput(null);
    handleDatesChange("", "");
    onReset?.();
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
      <div className={styles.presetChips}>
        {presets.map(({ text, start, end, disabled }) => {
          const selected = isSameDay(start, startDate) && isSameDay(end, endDate);
          return !disabled ? (
            <button
              key={text}
              type="button"
              className={`
                ${styles.PresetDateRangePicker_button}
                ${selected ? styles.PresetDateRangePicker_button__selected : ""}
              `}
              onClick={() => onDatesChange({ startDate: start, endDate: end })}
            >
              {text}
            </button>
          ) : null;
        })}
      </div>
      <div className={styles.presetActions}>
        <button
          type="button"
          className={`${styles.PresetDateRangePicker_button} ${styles.confirmButton}`}
          onClick={confirm}
        >
          تأكيد
        </button>
        <button
          type="button"
          className={`${styles.PresetDateRangePicker_button} ${styles.cancelButton}`}
          onClick={cancel}
        >
          إلغاء
        </button>
        <button
          type="button"
          className={`${styles.PresetDateRangePicker_button} ${styles.resetButton}`}
          onClick={reset}
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      dir={isDirectionRTL ? "rtl" : "ltr"}
      className={`custom-date-picker homix-drp${isMeduim ? " homix-drp--medium" : ""}${focusedInput ? " homix-drp--open" : ""}`}
    >
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDatesChange={onDatesChange}
        focusedInput={focusedInput}
        onFocusChange={onFocusChange}
        startDateId="startDate"
        endDateId="endDate"
        /* isRTL=false: مع firstDayOfWeek=6 الـ true يفرض DateRangePicker_picker__rtl + تعارض مع عزل LTR ويكسر أعمدة الأيام */
        isRTL={false}
        anchorDirection={isDirectionRTL ? "right" : "left"}
        openDirection={openDirection}
        horizontalMargin={16}
        /* true: فوق كروت/طبقات الصفحة (تراص). إعادة الموضع عند تمرير الحاويات عبر resize اصطناعي في useEffect. */
        appendToBody
        showClearDates
        reopenPickerOnClearDates
        small
        hideKeyboardShortcutsPanel
        numberOfMonths={isDesktopTwoMonths ? 2 : 1}
        readOnly
        customCloseIcon={<span>&times;</span>}
        minimumNights={0}
        keepOpenOnDateSelect
        onClose={cancel}
        isDayHighlighted={(day) => isSameDay(day, moment().locale("en"))}
        isOutsideRange={isOutsideRange}
        /* moment: 0=الأحد … 5=الجمعة 6=السبت */
        firstDayOfWeek={6}
        renderCalendarInfo={renderPresets}
        /* عرض عربي: أرقام هندية داخل خلايا الأيام، واسم الشهر/السنة والتاريخ المختار بالعربية.
           لاحظ استخدام مراجع ثابتة (module-level) وإلا ظهرت اللوحة فارغة. */
        renderDayContents={renderArabicDayContents}
        renderMonthText={renderArabicMonthText}
        displayFormat="DD/MM/YYYY"
        startDatePlaceholderText="من "
        endDatePlaceholderText="إلى "
        /* locale("ar") على الشهر المرئي يجعل react-dates يعرض ترويسة أيام الأسبوع
           (السبت/الأحد…) وأرقام الأيام بالعربية، لأنها تُشتق من هذا الـ moment */
        initialVisibleMonth={() =>
          isDesktopTwoMonths
            ? moment().locale("ar").subtract(1, "month")
            : moment().locale("ar")
        }
        inputIconPosition="after"
        customInputIcon={
          <span className="homix-drp-input-calendar-icon" aria-hidden>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: "inherit" }} />
          </span>
        }
        block
      />
    </div>
  );
};

DateRangePickerWrapper.propTypes = {
  // Empty filters legitimately pass null; selected values may be strings or moments.
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  handleDatesChange: PropTypes.func.isRequired,
  maxDaysRange: PropTypes.number,
  isDirectionRTL: PropTypes.bool,
  allowFutureDays: PropTypes.bool,
  className: PropTypes.string,
  isMeduim: PropTypes.bool,
};

export default DateRangePickerWrapper;
