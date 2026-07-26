/**
 * بيانات ثابتة مؤقّتة لصفحة الصنّاع (بديل `GET /factories` حتى يجهز الربط).
 *
 * الأرقام والأسماء منقولة من التصميم homix_factories_v3.html. عند الربط:
 * تُستبدل `STATIC_FACTORIES` بنتيجة الاستعلام داخل `hooks/useFactoriesPage`
 * فقط — المكوّنات لا تعرف مصدر البيانات.
 */
import { Factory } from "../utils/types";

export const STATIC_FACTORIES: Factory[] = [
  {
    id: 1, name: "Light Square", addr: "حدائق أكتوبر", spec: "lighting",
    resp: "محمود خيري", phone: "01032288941", shipCairo: 150, shipOther: 300, status: 1,
    website: "homixhub.co/...7GH2wpRKeZAAHKR5-Y",
    bankName: "بنك مصر", bankHolder: "محمود خيري عبدالله",
    bankAccount: "1234 5678 9012 3456", bankWallet: "01032288941",
    bankIban: "EG12 0002 0001 2345 6789 0123 4567",
    orders: 42, sales: 84200,
  },
  {
    id: 2, name: "متانيج", addr: "البراجيل", spec: "Furniture",
    resp: "مصطفى العسال", phone: "01155559646", shipCairo: 300, shipOther: 300, status: 1,
    website: "homixhub.co/...gr_TfwntPuX58BswTsShv",
    bankName: "CIB", bankHolder: "مصطفى العسال",
    bankAccount: "9876 5432 1098 7654", bankWallet: "01155559646",
    bankIban: "EG34 0010 0001 9876 5432 1098 7654",
    orders: 87, sales: 196000,
  },
  {
    id: 3, name: "City Home", addr: "مؤسسة الزكاة", spec: "steel",
    resp: "عبدالحميد", phone: "01020339912", shipCairo: 250, shipOther: 250, status: 1,
    website: "homixhub.co/...WsTs7juJjQr-9x4mJAurB",
    bankName: "بنك القاهرة", bankHolder: "عبدالحميد محمد",
    bankAccount: "1111 2222 3333 4444", bankWallet: "01020339912",
    orders: 54, sales: 122000,
  },
  {
    id: 4, name: "CO Design", addr: "حلوان", spec: "MDF",
    resp: "Dina Fared", phone: "01010582201", shipCairo: 800, shipOther: 800, status: 1,
    website: "homixhub.co/...jPgaB8nQwm8El2V3L4EJ",
    bankName: "NBE", bankHolder: "Dina Fared",
    bankAccount: "5555 6666 7777 8888", bankWallet: "01010582201",
    bankIban: "EG56 0003 0005 5556 6667 7778 8888",
    orders: 31, sales: 74500,
  },
  {
    id: 5, name: "Sofa The Best", addr: "البساتين", spec: "upholstery",
    resp: "badwy", phone: "01011677300", shipCairo: 400, shipOther: 400, status: 1,
    website: "homixhub.co/...5ZPwK_c1om30UlvOELW",
    bankName: "بنك مصر", bankHolder: "بدوي حسن",
    bankAccount: "2222 3333 4444 5555", bankWallet: "01011677300",
    orders: 68, sales: 143000,
  },
  {
    id: 6, name: "Furnish Store", addr: "مؤسسة الزكاة", spec: "MDF",
    resp: "wael yousry", phone: "01126220687", shipCairo: 300, shipOther: 300, status: 1,
    website: "homixhub.co/...wK8ed-OCITw7_F8Ckgyl",
    bankName: "QNB", bankHolder: "Wael Yousry",
    bankAccount: "7777 8888 9999 0000", bankWallet: "01126220687",
    bankIban: "EG78 0011 0007 7778 8889 9990 0000",
    orders: 44, sales: 98700,
  },
  {
    id: 7, name: "Warehouse", addr: "العاشر من رمضان", spec: "mirrors",
    resp: "Mohamed Elsobky", phone: "01000841927", shipCairo: 150, shipOther: 150, status: 2,
    website: "homixhub.co/...kX_M_ty95pAJwu53P8X",
    bankName: "بنك الإسكندرية", bankHolder: "Mohamed Elsobky",
    bankAccount: "3333 4444 5555 6666", bankWallet: "01000841927",
    orders: 29, sales: 67000,
  },
  {
    id: 8, name: "Resin", addr: "شبرا", spec: "wood",
    resp: "Ghada Ali", phone: "01120018773", shipCairo: 150, shipOther: 150, status: 1,
    website: "homixhub.co/...bjnWepkRavHNrf1_OArk",
    bankName: "CIB", bankHolder: "Ghada Ali Hassan",
    bankAccount: "4444 5555 6666 7777", bankWallet: "01120018773",
    bankIban: "EG90 0010 0004 4445 5556 6667 7777",
    orders: 22, sales: 51200,
  },
  {
    id: 9, name: "Fekra", addr: "شبرا", spec: "upholstery",
    resp: "حاتم", phone: "01010002950", shipCairo: 500, shipOther: 500, status: 1,
    website: "homixhub.co/...gCGdqUto5LqSPf8qQP1",
    bankName: "بنك مصر", bankHolder: "حاتم عبدالرحيم",
    bankAccount: "6666 7777 8888 9999", bankWallet: "01010002950",
    orders: 38, sales: 88900,
  },
  {
    id: 10, name: "Home Innovation", addr: "", spec: "steel",
    resp: "eslam", phone: "01111344489", shipCairo: 300, shipOther: 300, status: 1,
    website: "homixhub.co/...zIBEalqMmiAzTxPxu4gP",
    bankName: "NBE", bankHolder: "Eslam Mohamed",
    bankAccount: "8888 9999 0000 1111", bankWallet: "01111344489",
    orders: 27, sales: 63400,
  },
  {
    id: 11, name: "ylights", addr: "التجمع الثالث", spec: "lighting",
    resp: "bedo", phone: "01127590011", shipCairo: 120, shipOther: 120, status: 1,
    website: "homixhub.co/...PANSCzO_UgjsoOvtr-gT",
    bankName: "بنك القاهرة", bankHolder: "بدر محمود",
    bankAccount: "0000 1111 2222 3333", bankWallet: "01127590011",
    orders: 18, sales: 42100,
  },
  {
    id: 12, name: "El Mouna", addr: "شارع رشدي محطة الكبرى", spec: "MDF",
    resp: "Ahmed Eid", phone: "01220603777", shipCairo: 250, shipOther: 250, status: 2,
    website: "homixhub.co/...6W6RKPZBRTvgYPA8dgt",
    bankName: "CIB", bankHolder: "Ahmed Eid Abdallah",
    bankAccount: "1010 2020 3030 4040", bankWallet: "01220603777",
    bankIban: "EG12 0010 0010 1020 2030 3040 4040",
    orders: 13, sales: 31600,
  },
];

/**
 * مؤشرات لا يوفّرها مصدر الصنّاع (عدد المنتجات / المصانع المحتاجة مراجعة).
 * TODO(BE): استبدالها بملخّص من الـ API عند توفّره.
 */
export const STATIC_KPI_EXTRAS = {
  totalProducts: 1240,
  needsReview: 3,
};

/** نصوص الشارات السفلية في بطاقات المؤشرات — نصوص تحريرية ثابتة في التصميم */
export const KPI_BADGES = {
  newThisMonth: "↑ 3 جدد هذا الشهر",
  newProducts: "↑ 48 منتج جديد",
  salesGrowth: "↑ 12.4% نمو شهري",
  lateOrders: "طلبات متأخرة",
};
