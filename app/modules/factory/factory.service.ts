import { Op, Sequelize } from "sequelize";

const {
  FACTORY_DOCUMENT_STATUS,
  FACTORY_DOCUMENT_STATUS_ARABIC,
  FACTORY_DOCUMENT_TYPE,
  FACTORY_DOCUMENT_TYPE_ARABIC,
  FACTORY_STATUS,
  FACTORY_STATUS_ARABIC,
} = require("../../../config/constants") as typeof import("../../../config/constants");
const { sequelize } = require("../../../src/infrastructure/database") as typeof import("../../../src/infrastructure/database");
const Attachment = require("../attachments/attachment.model") as typeof import("../attachments/attachment.model");
const Factory = require("./factory.model") as typeof import("./factory.model");

type FactoryRecord = {
  createdAt?: Date | string | null;
  destroy: () => Promise<void>;
  id?: number | string | null;
  update: (payload: Record<string, unknown>) => Promise<FactoryRecord>;
};

type AttachmentRecord = {
  destroy: () => Promise<void>;
};

type FactoryFilters = {
  factoryCategory?: string;
  page?: number | string;
  search?: string;
  size?: number | string;
  sort?: Record<string, number>;
  status?: number | string;
};

type FactoryResponse = {
  data?: unknown;
  message?: string;
  status: boolean;
  statusCode: number;
};

type PlainRecord = Record<string, unknown>;

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

const normalizeText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const normalizeNullableText = (value: unknown): string | null => {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
};

const normalizeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDate = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const toPlain = (value: unknown): PlainRecord => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const candidate = value as { dataValues?: unknown; toJSON?: () => unknown };
  if (typeof candidate.toJSON === "function") {
    return toPlain(candidate.toJSON());
  }

  if (candidate.dataValues && typeof candidate.dataValues === "object") {
    return candidate.dataValues as PlainRecord;
  }

  return value as PlainRecord;
};

const normalizeFactoryStatus = (value: unknown): number | null => {
  const numeric = normalizeNumber(value);
  if (numeric === FACTORY_STATUS.ONLINE || numeric === FACTORY_STATUS.OFFLINE) {
    return numeric;
  }

  const text = normalizeText(value).toLowerCase();
  if (["1", "online", "active", "on"].includes(text)) {
    return FACTORY_STATUS.ONLINE;
  }

  if (["2", "offline", "inactive", "off"].includes(text)) {
    return FACTORY_STATUS.OFFLINE;
  }

  return null;
};

const getFactoryStatusLabel = (value: unknown): string => {
  const statusId = normalizeFactoryStatus(value);
  if (!statusId) {
    return "غير محدد";
  }

  return FACTORY_STATUS_ARABIC[statusId] ?? "غير محدد";
};

const getDocumentTypeLabel = (value: unknown): string => {
  const typeId = normalizeNumber(value);
  if (!typeId) {
    return FACTORY_DOCUMENT_TYPE_ARABIC[FACTORY_DOCUMENT_TYPE.OTHER];
  }

  return FACTORY_DOCUMENT_TYPE_ARABIC[typeId] ?? FACTORY_DOCUMENT_TYPE_ARABIC[FACTORY_DOCUMENT_TYPE.OTHER];
};

const getDocumentStatusLabel = (value: unknown): string => {
  const statusId = normalizeNumber(value);
  if (!statusId) {
    return FACTORY_DOCUMENT_STATUS_ARABIC[FACTORY_DOCUMENT_STATUS.PENDING_REVIEW];
  }

  return FACTORY_DOCUMENT_STATUS_ARABIC[statusId] ?? FACTORY_DOCUMENT_STATUS_ARABIC[FACTORY_DOCUMENT_STATUS.PENDING_REVIEW];
};

const parseArrayInput = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item));
  }

  const text = normalizeText(value);
  if (!text) {
    return [];
  }

  return [text];
};

const resolveFactoryOrder = (sort?: Record<string, number>): [string, "ASC" | "DESC"][] => {
  if (!sort || typeof sort !== "object" || Array.isArray(sort)) {
    return [["createdAt", "DESC"]];
  }

  const supportedFields = new Set(["createdAt", "joinDate", "name", "status"]);
  for (const [field, rawDirection] of Object.entries(sort)) {
    if (!supportedFields.has(field)) {
      continue;
    }

    return [[field, Number(rawDirection) === 1 ? "ASC" : "DESC"]];
  }

  return [["createdAt", "DESC"]];
};

const mapAttachment = (attachment: unknown) => {
  const record = toPlain(attachment);

  return {
    createdAt: record.createdAt ? new Date(String(record.createdAt)).toISOString() : null,
    description: normalizeText(record.description),
    expiresAt: normalizeDate(record.expiresAt),
    id: normalizeNumber(record.id),
    issuedAt: normalizeDate(record.issuedAt),
    name: normalizeText(record.name),
    type: normalizeNumber(record.attachmentType) ?? FACTORY_DOCUMENT_TYPE.OTHER,
    typeLabel: getDocumentTypeLabel(record.attachmentType),
    url: normalizeText(record.url),
    verificationStatus: normalizeNumber(record.verificationStatus) ?? FACTORY_DOCUMENT_STATUS.PENDING_REVIEW,
    verificationStatusLabel: getDocumentStatusLabel(record.verificationStatus),
  };
};

const buildFactoryCode = (id: unknown): string => {
  const numericId = normalizeNumber(id);
  if (!numericId) {
    return "FAC-0000";
  }

  return `FAC-${String(numericId).padStart(4, "0")}`;
};

const mapFactorySummary = (factory: unknown) => {
  const record = toPlain(factory);
  const attachments = Array.isArray(record.attachments) ? record.attachments.map(mapAttachment) : [];
  const statusId = normalizeFactoryStatus(record.status);

  return {
    address: normalizeText(record.address),
    cairoGizaShipping: normalizeNumber(record.cairoGizaShipping) ?? 0,
    code: buildFactoryCode(record.id),
    documentsCount: attachments.length,
    id: normalizeNumber(record.id),
    joinDate: normalizeDate(record.joinDate),
    name: normalizeText(record.name),
    otherCitiesShipping: normalizeNumber(record.otherCitiesShipping) ?? 0,
    responsibleName: normalizeText(record.contactPersonName),
    responsiblePhone: normalizeText(record.contactPersonPhoneNumber),
    specialty: normalizeText(record.factoryCategory),
    status: statusId,
    statusLabel: getFactoryStatusLabel(record.status),
    website: normalizeText(record.website),
  };
};

const mapFactoryDetails = (factory: unknown) => {
  const record = toPlain(factory);
  const attachments = Array.isArray(record.attachments) ? record.attachments.map(mapAttachment) : [];
  const statusId = normalizeFactoryStatus(record.status);

  return {
    address: normalizeText(record.address),
    bankDetails: {
      accountHolderName: normalizeText(record.bankAccountHolderName),
      accountNumber: normalizeText(record.bankAccountNumber),
      accountType: normalizeText(record.bankAccountType),
      bankName: normalizeText(record.bankName),
      instapayNumber: normalizeText(record.instapayNumber),
      walletNumber: normalizeText(record.walletNumber),
      walletProvider: normalizeText(record.walletProvider),
    },
    city: normalizeText(record.city),
    code: buildFactoryCode(record.id),
    coordinates: {
      latitude: normalizeNullableText(record.latitude),
      longitude: normalizeNullableText(record.longitude),
    },
    country: normalizeText(record.country),
    createdAt: record.createdAt ? new Date(String(record.createdAt)).toISOString() : null,
    description: normalizeText(record.description),
    documents: attachments,
    email: normalizeText(record.email),
    id: normalizeNumber(record.id),
    joinDate: normalizeDate(record.joinDate) ?? normalizeDate(record.createdAt),
    name: normalizeText(record.name),
    phoneNumber: normalizeText(record.phoneNumber),
    postalCode: normalizeText(record.postalCode),
    responsible: {
      email: normalizeText(record.contactPersonEmail),
      name: normalizeText(record.contactPersonName),
      phone: normalizeText(record.contactPersonPhoneNumber),
      role: normalizeText(record.contactPersonRole),
    },
    shippingRates: {
      cairoGiza: normalizeNumber(record.cairoGizaShipping) ?? 0,
      otherGovernorates: normalizeNumber(record.otherCitiesShipping) ?? 0,
    },
    specialty: normalizeText(record.factoryCategory),
    status: statusId,
    statusLabel: getFactoryStatusLabel(record.status),
    website: normalizeText(record.website),
  };
};

const buildFactoryPayload = (data: Record<string, unknown>): Record<string, unknown> => {
  const status = normalizeFactoryStatus(data.status);

  return {
    address: normalizeNullableText(data.address),
    bankAccountHolderName: normalizeNullableText(data.bankAccountHolderName),
    bankAccountNumber: normalizeNullableText(data.bankAccountNumber),
    bankAccountType: normalizeNullableText(data.bankAccountType),
    bankName: normalizeNullableText(data.bankName),
    cairoGizaShipping: normalizeNumber(data.cairoGizaShipping),
    city: normalizeNullableText(data.city),
    contactPersonEmail: normalizeNullableText(data.responsibleEmail ?? data.contactPersonEmail),
    contactPersonName: normalizeNullableText(data.responsibleName ?? data.contactPersonName),
    contactPersonPhoneNumber: normalizeNullableText(data.responsiblePhone ?? data.contactPersonPhoneNumber),
    contactPersonRole: normalizeNullableText(data.responsibleRole ?? data.contactPersonRole),
    country: normalizeNullableText(data.country),
    description: normalizeNullableText(data.description),
    email: normalizeNullableText(data.email),
    factoryCategory: normalizeNullableText(data.factoryCategory ?? data.specialty),
    instapayNumber: normalizeNullableText(data.instapayNumber),
    joinDate: normalizeDate(data.joinDate),
    latitude: normalizeNullableText(data.latitude),
    longitude: normalizeNullableText(data.longitude),
    name: normalizeText(data.name),
    otherCitiesShipping: normalizeNumber(data.otherCitiesShipping),
    phoneNumber: normalizeNullableText(data.phoneNumber),
    postalCode: normalizeNullableText(data.postalCode),
    status: status ? String(status) : null,
    walletNumber: normalizeNullableText(data.walletNumber),
    walletProvider: normalizeNullableText(data.walletProvider),
    website: normalizeNullableText(data.website),
  };
};

const buildWhereClause = (filters: FactoryFilters) => {
  const andConditions: unknown[] = [];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    andConditions.push({
      [Op.or]: [
        sequelize.where(sequelize.fn("lower", sequelize.col("Factory.name")), { [Op.like]: `%${term}%` }),
        sequelize.where(sequelize.fn("lower", sequelize.col("Factory.address")), { [Op.like]: `%${term}%` }),
        sequelize.where(sequelize.fn("lower", sequelize.col("Factory.contactPersonName")), { [Op.like]: `%${term}%` }),
        sequelize.where(sequelize.fn("lower", sequelize.col("Factory.contactPersonPhoneNumber")), { [Op.like]: `%${term}%` }),
      ],
    });
  }

  const statusId = normalizeFactoryStatus(filters.status);
  if (statusId) {
    andConditions.push(
      sequelize.where(
        sequelize.cast(sequelize.col("Factory.status"), "integer"),
        { [Op.eq]: statusId },
      ),
    );
  }

  if (filters.factoryCategory) {
    andConditions.push(
      sequelize.where(
        sequelize.fn("lower", sequelize.col("Factory.factoryCategory")),
        { [Op.like]: `%${filters.factoryCategory.toLowerCase()}%` },
      ),
    );
  }

  return andConditions.length > 0 ? { [Op.and]: andConditions } : {};
};

class FactoryService {
  public static async deleteAttachment(factoryId: string, attachmentId: string): Promise<FactoryResponse> {
    const factory = await Factory.findByPk(factoryId);
    if (!factory) {
      return {
        message: "Factory not found",
        status: false,
        statusCode: 404,
      };
    }

    const attachment = (await Attachment.findOne({
      where: {
        id: attachmentId,
        modelId: factoryId,
        modelType: "Factory",
      },
    })) as AttachmentRecord | null;

    if (!attachment) {
      return {
        message: "Attachment not found",
        status: false,
        statusCode: 404,
      };
    }

    await attachment.destroy();
    return {
      message: "Attachment deleted successfully",
      status: true,
      statusCode: 200,
    };
  }

  public static async uploadFiles(
    factoryId: string,
    filePaths: string[] = [],
    fileNames: string[] = [],
    descriptions: string[] = [],
    metadata: Record<string, unknown> = {},
  ): Promise<FactoryResponse> {
    const factory = await Factory.findByPk(factoryId);
    if (!factory) {
      return {
        message: "Factory not found",
        status: false,
        statusCode: 404,
      };
    }

    const attachmentTypes = parseArrayInput(metadata.attachmentTypes);
    const verificationStatuses = parseArrayInput(metadata.verificationStatuses);
    const issuedAt = parseArrayInput(metadata.issuedAt);
    const expiresAt = parseArrayInput(metadata.expiresAt);

    for (let index = 0; index < filePaths.length; index += 1) {
      await Attachment.create({
        attachmentType: normalizeNumber(attachmentTypes[index]) ?? FACTORY_DOCUMENT_TYPE.OTHER,
        description: descriptions[index] ?? "",
        expiresAt: normalizeDate(expiresAt[index]),
        issuedAt: normalizeDate(issuedAt[index]),
        modelId: factoryId,
        modelType: "Factory",
        name: fileNames[index],
        url: filePaths[index],
        verificationStatus: normalizeNumber(verificationStatuses[index]) ?? FACTORY_DOCUMENT_STATUS.PENDING_REVIEW,
      });
    }

    return {
      data: await this.getOne(factoryId),
      message: "Files uploaded!",
      status: true,
      statusCode: 200,
    };
  }

  public static async create(data: Record<string, unknown>): Promise<FactoryResponse> {
    const created = await Factory.create(buildFactoryPayload(data));
    const record = await this.getOne(String(toPlain(created).id ?? ""));

    return {
      data: record,
      message: "Factory created successfully",
      status: true,
      statusCode: 201,
    };
  }

  public static async getAll(filters: FactoryFilters) {
    const page = Math.max(Number(filters.page ?? DEFAULT_PAGE), DEFAULT_PAGE);
    const size = Math.max(Number(filters.size ?? DEFAULT_SIZE), 1);
    const whereClause = buildWhereClause(filters);
    const order = resolveFactoryOrder(filters.sort);

    const result = await Factory.findAndCountAll({
      distinct: true,
      include: [
        {
          as: "attachments",
          model: Attachment,
          required: false,
          where: { modelType: "Factory" },
        },
      ],
      limit: size,
      offset: (page - 1) * size,
      order,
      where: whereClause,
    });

    const onlineFactories = await Factory.count({
      where: {
        ...whereClause,
        [Op.and]: [
          ...((whereClause as PlainRecord)[Op.and] as unknown[] ?? []),
          sequelize.where(sequelize.cast(sequelize.col("status"), "integer"), { [Op.eq]: FACTORY_STATUS.ONLINE }),
        ],
      },
    });

    const offlineFactories = await Factory.count({
      where: {
        ...whereClause,
        [Op.and]: [
          ...((whereClause as PlainRecord)[Op.and] as unknown[] ?? []),
          sequelize.where(sequelize.cast(sequelize.col("status"), "integer"), { [Op.eq]: FACTORY_STATUS.OFFLINE }),
        ],
      },
    });

    const items = Array.isArray(result.rows) ? result.rows.map(mapFactorySummary) : [];
    const specialties = new Set(items.map((item) => item.specialty).filter(Boolean));

    return {
      items,
      pagination: {
        page,
        size,
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size) || 1,
      },
      summary: {
        offlineFactories,
        onlineFactories,
        specialtiesCount: specialties.size,
        totalFactories: result.count,
      },
    };
  }

  public static async getMeta() {
    const distinctCategoriesResult = await Factory.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("factoryCategory")), "factoryCategory"]],
      raw: true,
      where: {
        factoryCategory: {
          [Op.not]: null,
        },
      },
    });

    const categories = Array.isArray(distinctCategoriesResult)
      ? distinctCategoriesResult
        .map((item) => normalizeText(toPlain(item).factoryCategory))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "ar"))
      : [];

    return {
      documentStatuses: Object.entries(FACTORY_DOCUMENT_STATUS_ARABIC).map(([id, label]) => ({
        id: Number(id),
        label,
      })),
      documentTypes: Object.entries(FACTORY_DOCUMENT_TYPE_ARABIC).map(([id, label]) => ({
        id: Number(id),
        label,
      })),
      specialties: categories.map((label) => ({ id: label, label })),
      statuses: Object.entries(FACTORY_STATUS_ARABIC).map(([id, label]) => ({
        id: Number(id),
        label,
      })),
    };
  }

  public static async getOne(id: string) {
    const factory = await Factory.findByPk(id, {
      include: [
        {
          as: "attachments",
          model: Attachment,
          required: false,
          where: { modelType: "Factory" },
        },
      ],
    });

    if (!factory) {
      return null;
    }

    return mapFactoryDetails(factory);
  }

  public static async update(id: string, data: Record<string, unknown>): Promise<FactoryResponse> {
    const factory = (await Factory.findByPk(id)) as FactoryRecord | null;
    if (!factory) {
      return {
        message: "Factory not found",
        status: false,
        statusCode: 404,
      };
    }

    await factory.update(buildFactoryPayload(data));
    return {
      data: await this.getOne(id),
      message: "Factory updated successfully",
      status: true,
      statusCode: 200,
    };
  }

  public static async delete(id: string): Promise<FactoryResponse> {
    const factory = (await Factory.findByPk(id)) as FactoryRecord | null;
    if (!factory) {
      return {
        message: "Factory not found",
        status: false,
        statusCode: 404,
      };
    }

    await factory.destroy();
    return {
      message: "Factory deleted successfully",
      status: true,
      statusCode: 200,
    };
  }
}

export = FactoryService;
