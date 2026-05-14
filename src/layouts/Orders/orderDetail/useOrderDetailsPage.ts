import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { normalizeOrderDetailPayload } from "./orderDetailNormalize";

export function useOrderDetailsPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [manufactureStatus, setManufactureStatus] = useState<number | null>(null);
  const [slectedOrderLine, setSelectedOrderLine] = useState<any>(null);
  const [orderTotalPrice, setOrderTotalPrice] = useState<number | null>(null);
  const [orderTotalShipping, setOrderTotalShipping] = useState<number | null>(null);
  const [orderTotalToBeCollected, setOrderTotalToBeCollected] = useState<number | null>(null);
  const [orderTotalCost, setOrderTotalCost] = useState<number | null>(null);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [orderlines, setOrderlines] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [administrator, setAdministrator] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; url: string }[]>([]);
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") ?? "{}");

  const changeManufactureStatus = useCallback(
    (status: number | null) => {
      if (status == null || orderDetails?.id == null) return;
      axiosRequest
        .put(`/orders/${orderDetails.id}`, {
          manufactureStatus: status,
        })
        .then(() => {
          NotificationMeassage("success", "تم التعديل بنجاح");
          setManufactureStatus(status);
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        });
    },
    [orderDetails?.id]
  );

  const onEdit = useCallback(
    (notes: string, cost: number, lineId: number, color: string, size: string, material: string, itemShipping: number, toBeCollected: number) => {
      axiosRequest
        .put(`/orderLines/${lineId}`, {
          notes: notes,
          color: color,
          size: size,
          material: material,
          itemShipping: itemShipping,
          cost: Number(cost),
          toBeCollected: Number(toBeCollected),
        })
        .then(() => {
          setOrderlines((prevDetails) =>
            prevDetails?.map((item) =>
              item.id === lineId
                ? {
                    ...item,
                    color: color,
                    size: size,
                    material: material,
                    notes: notes,
                    itemShipping: itemShipping,
                    unitCost: Number(cost),
                    toBeCollected: toBeCollected,
                  }
                : item
            )
          );
          NotificationMeassage("success", "تم التعديل بنجاح");
          setTimeout(() => {
            window.location.reload();
            setIsEditModalOpenned(false);
          }, 1000);
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        });
    },
    []
  );

  const updateComment = useCallback(
    (noteId: number | string) => {
      if (orderDetails?.id == null) return;
      axiosRequest
        .put(`/orders/${orderDetails.id}/notes/${noteId}`, {
          text: editedCommentText,
        })
        .then(() => {
          NotificationMeassage("success", "تم تعديل التعليق");
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        });
    },
    [orderDetails?.id, editedCommentText]
  );

  const deleteComment = useCallback(
    (noteId: number | string) => {
      if (orderDetails?.id == null) return;
      axiosRequest
        .delete(`/orders/${orderDetails.id}/notes/${noteId}`)
        .then(() => {
          setComments((prev) => prev.filter((comment) => comment.id !== noteId));
          setPendingDeleteNoteId(null);
          NotificationMeassage("success", "تم حذف التعليق");
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        });
    },
    [orderDetails?.id]
  );

  const handleAddComment = useCallback(async () => {
    if (orderDetails?.id == null) return;
    try {
      const { data } = await axiosRequest.post(`/orders/${orderDetails.id}/notes`, {
        text: commentText,
      });

      const newComment = {
        id: data.data.id,
        text: commentText,
        createdAt: new Date(),
        user: { firstName: user.firstName, lastName: user.lastName },
        attachments: selectedFiles,
        isEdited: true,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file.file);
        });
        await axiosRequest.post(`/orders/${orderDetails.id}/notes/${newComment.id}/upload`, formData);
        setSelectedFiles([]);
        NotificationMeassage("success", "تم إضافة التعليق والمرفقات بنجاح");
      } else {
        NotificationMeassage("success", "تم إضافة التعليق");
      }
    } catch {
      NotificationMeassage("error", "حدث خطأ أثناء إضافة التعليق أو رفع المرفقات");
    }
  }, [commentText, orderDetails?.id, selectedFiles, user.firstName, user.lastName]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    const previewFiles = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedFiles(previewFiles);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!orderDetails?.userId) return;
    axiosRequest.get(`/users`).then((res) => {
      const users = res.data.data;
      const found = users?.find((u: any) => u.id === orderDetails.userId);
      if (found) {
        setAdministrator(`${found.firstName} ${found.lastName}`);
      }
    });
  }, [orderDetails?.userId]);

  useEffect(() => {
    const getOrderDetails = async () => {
      if (id == null) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data: res } = await axiosRequest.get(`/orders/${id}`);
        const normalized = normalizeOrderDetailPayload(res);
        if (!normalized?.id) {
          setOrderDetails(null);
          setOrderlines([]);
          setComments([]);
          setAdministrator("");
          NotificationMeassage("error", "تعذر قراءة بيانات الطلب");
          return;
        }

        let orderPrice = 0;
        let ordercost = 0;
        let itemShipping = 0;
        let toBeCollected = 0;
        (normalized.orderLines ?? []).forEach((item: any) => {
          orderPrice += Number(item.price) * Number(item.quantity);
          ordercost += Number(item.unitCost) * Number(item.quantity);
          itemShipping += Number(item.itemShipping);
          toBeCollected += Number(item.toBeCollected);
        });

        setOrderTotalPrice(normalized.subTotalPrice ?? orderPrice);
        setOrderTotalCost(normalized.totalCost ?? ordercost);
        setOrderTotalShipping(normalized.shippingFees ?? itemShipping);
        setOrderTotalToBeCollected(normalized.toBeCollected ?? toBeCollected);
        setOrderDetails(normalized);
        setOrderlines(normalized.orderLines ?? []);
        setManufactureStatus(normalized.manufactureStatus ?? null);

        const adminFromApi =
          [normalized.assigneeName, normalized.userName].find((s: any) => typeof s === "string" && s.trim() !== "") ?? "";
        setAdministrator(typeof adminFromApi === "string" ? adminFromApi.trim() : "");

        const list = normalized.notesList ?? [];
        const orderedComments = list
          .slice()
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setComments(orderedComments);
      } catch (error) {
        console.error("Error fetching order:", error);
        NotificationMeassage("error", "حدث خطأ أثناء تحميل الطلب");
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, [id]);

  return {
    id,
    isLoading,
    orderDetails,
    manufactureStatus,
    slectedOrderLine,
    setSelectedOrderLine,
    orderTotalPrice,
    orderTotalShipping,
    orderTotalToBeCollected,
    orderTotalCost,
    isEditModalOpenned,
    setIsEditModalOpenned,
    orderlines,
    commentText,
    setCommentText,
    comments,
    setComments,
    pendingDeleteNoteId,
    setPendingDeleteNoteId,
    editingIndex,
    setEditingIndex,
    editedCommentText,
    setEditedCommentText,
    administrator,
    selectedFiles,
    invoicePdfLoading,
    setInvoicePdfLoading,
    user,
    isVendor: user.userType === "2",
    changeManufactureStatus,
    onEdit,
    updateComment,
    deleteComment,
    handleAddComment,
    handleFileChange,
    handleRemoveFile,
  };
}
