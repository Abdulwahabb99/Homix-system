import { Op } from "sequelize";

const { sequelize } = require("../../../src/infrastructure/database") as typeof import("../../../src/infrastructure/database");
const Attachment = require("../attachments/attachment.model") as typeof import("../attachments/attachment.model");
const Factory = require("./factory.model") as typeof import("./factory.model");

type FactoryRecord = {
  destroy: () => Promise<void>;
  update: (payload: Record<string, unknown>) => Promise<FactoryRecord>;
};

type AttachmentRecord = {
  destroy: () => Promise<void>;
};

type FactoryFilters = {
  factoryCategory?: string;
  status?: string;
};

type FactoryResponse = {
  message?: string;
  status: boolean;
  statusCode: number;
  data?: string;
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

    const attachment = (await Attachment.findByPk(attachmentId)) as AttachmentRecord | null;
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
  ): Promise<FactoryResponse> {
    const factory = await Factory.findByPk(factoryId);
    if (!factory) {
      return {
        message: "Factory not found",
        status: false,
        statusCode: 404,
      };
    }

    for (let index = 0; index < filePaths.length; index += 1) {
      await Attachment.create({
        description: descriptions[index] ?? "",
        modelId: factoryId,
        modelType: "Factory",
        name: fileNames[index],
        url: filePaths[index],
      });
    }

    return {
      message: "Files uploaded!",
      status: true,
      statusCode: 200,
    };
  }

  public static async create(data: Record<string, unknown>) {
    return Factory.create(data);
  }

  public static async getAll({ status, factoryCategory }: FactoryFilters) {
    const andConditions: unknown[] = [];

    if (status) {
      andConditions.push(
        sequelize.where(sequelize.col("status"), {
          [Op.eq]: status,
        }),
      );
    }

    if (factoryCategory) {
      andConditions.push(
        sequelize.where(sequelize.col("factoryCategory"), {
          [Op.like]: `%${factoryCategory}%`,
        }),
      );
    }

    return Factory.findAll({
      include: [
        {
          as: "attachments",
          model: Attachment,
        },
      ],
      where: {
        [Op.and]: andConditions,
      },
    });
  }

  public static async getOne(id: string) {
    return Factory.findByPk(id, {
      include: [
        {
          as: "attachments",
          model: Attachment,
        },
      ],
    });
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

    await factory.update(data);
    return {
      data: "Factory updated successfully",
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
