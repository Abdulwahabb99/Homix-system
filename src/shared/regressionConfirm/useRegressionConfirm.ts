import { useCallback, useRef, useState } from "react";
import {
  parseRegressionConflict,
  RegressionCancelledError,
  type RegressionConflict,
} from "./regressionConfirm";
import type { RegressionConfirmDialogProps } from "./RegressionConfirmDialog";

type Pending = {
  conflict: RegressionConflict;
  retry: () => Promise<unknown>;
  resolve: (v: any) => void;
  reject: (e: unknown) => void;
};

/**
 * `confirmable(send)` ينفّذ `send(false)`؛ عند 409 REGRESSION_NEEDS_CONFIRMATION يفتح
 * نافذة التأكيد ويعيد وعداً: «تأكيد» يعيد `send(true)` ويحلّ بنتيجته، و«إلغاء» يرفضه
 * بـ RegressionCancelledError. أي خطأ آخر يمرّ كما هو (بدون toast من هنا).
 * اعرض `<RegressionConfirmDialog {...dialogProps} />` في الصفحة.
 */
export function useRegressionConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<Pending | null>(null);
  pendingRef.current = pending;

  const confirmable = useCallback(async <T,>(send: (confirm: boolean) => Promise<T>): Promise<T> => {
    try {
      return await send(false);
    } catch (error) {
      const conflict = parseRegressionConflict(error);
      if (!conflict) throw error;
      return new Promise<T>((resolve, reject) => {
        setPending({ conflict, retry: () => send(true), resolve, reject });
      });
    }
  }, []);

  const onConfirm = useCallback(() => {
    const p = pendingRef.current;
    if (!p) return;
    setBusy(true);
    p.retry()
      .then(p.resolve, p.reject)
      .finally(() => {
        setBusy(false);
        setPending(null);
      });
  }, []);

  const onCancel = useCallback(() => {
    const p = pendingRef.current;
    setPending(null);
    p?.reject(new RegressionCancelledError());
  }, []);

  const dialogProps: RegressionConfirmDialogProps = {
    conflict: pending?.conflict ?? null,
    busy,
    onConfirm,
    onCancel,
  };

  return { confirmable, dialogProps };
}
