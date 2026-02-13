import db from "../models/index.js";
import validator from "validator";
import { Parser } from "@json2csv/plainjs";
import { Op } from "sequelize";
const { Subscribers, SubscriptionStatus } = db;

export default {
  async test_get() {
    try {
      const db = await Subscribers.findAll();
    } catch (error) {
      console.error(error);
      // throw error;
    }
  },

  async test_post(req) {
    try {
      const vaBody = req.body;
      // const db = await Subscribers.create(vaBody);
      /**
       * email
       * ip_address
       * user_agent
       * subscribed_at
       * source
       */
      return [];
    } catch (error) {
      console.error(error);
      // throw error;
    }
  },

  async subscribe(req) {
    try {
      const vaBody = req.body;
      const cEmail = vaBody.email;
      const cSource = vaBody.source;

      if (!cEmail) {
        const cErrMessage = "Email is required";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      const sanitizedEmail = validator.trim(cEmail);
      if (!validator.isEmail(sanitizedEmail)) {
        const cErrMessage = "Email is invalid";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      const cIPAddress = req.ip;
      const cUserAgent = req.headers["user-agent"];

      const [vaSubscriber, subscribe] = await Subscribers.findOrCreate({
        where: { email: cEmail },
        defaults: {
          email: cEmail,
          ip_address: cIPAddress,
          user_agent: cUserAgent,
          subscribed_at: new Date(),
          source: cSource || "website",
        },
      });

      if (!subscribe) {
        const registeredEmail = vaSubscriber.email;
        const cErrMessage = registeredEmail + " already subscribed";
        const error = new Error(cErrMessage);
        error.status = 409;
        throw error;
      }

      const vaRetval = {
        email: vaSubscriber.email,
        subscribed_at: vaSubscriber.subscribed_at,
      };

      return vaRetval;
    } catch (error) {
      console.error("Subscription Service => subscribe", error);
      throw error;
    }
  },

  async unsubscribe(req) {
    try {
      const vaBody = req.body;
      const cEmail = vaBody.email;

      if (!cEmail) {
        const cErrMessage = "Email is required";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      const sanitizedEmail = validator.trim(cEmail);
      if (!validator.isEmail(sanitizedEmail)) {
        const cErrMessage = "Email is invalid";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      const dbData = await Subscribers.findOne({ where: { email: cEmail } });
      if (!dbData) {
        const cErrMessage = "Email not found";
        const error = new Error(cErrMessage);
        error.status = 404;
        throw error;
      }

      await Subscribers.update(
        { status: 2, unsubscribed_at: new Date() },
        { where: { email: cEmail } }
      );

      return { success: true, message: "Successfully unsubscribed" };
      // return ;
    } catch (error) {
      console.error("Subscription Service => unsubscribe", error);
      throw error;
    }
  },

  async getAllsubscriber(req) {
    try {
      const vaQuery = req.query;

      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 5;
      const nOffset = (parseInt(nPage) - 1) * parseInt(nLimit);

      const { count: nDataLen, rows: vaData } =
        await Subscribers.findAndCountAll({
          attributes: [
            "id",
            "email",
            "ip_address",
            "user_agent",
            "subscribed_at",
            "unsubscribed_at",
            "source",
          ],
          limit: nLimit,
          offset: nOffset,
          include: [
            {
              model: SubscriptionStatus,
              as: "status_subscription",
              attributes: [["code", "status"], "description"],
            },
          ],
        });

      const totalPages = Math.ceil(nDataLen / parseInt(nLimit));

      const vaRetval = {
        pagination: {
          page: nPage,
          limit: nLimit,
          total: nDataLen,
          totalPages: totalPages,
        },
        subscribers: vaData,
      };

      return vaRetval;
    } catch (error) {
      console.error("Subscription Service => getAllsubscriber", error);
      throw error;
    }
  },

  async exportSubscriber(req, res) {
    try {
      const dbData = await Subscribers.findAll({
        attributes: [
          "id",
          "email",
          "ip_address",
          "user_agent",
          "subscribed_at",
          "unsubscribed_at",
          "source",
        ],
        include: [
          {
            model: SubscriptionStatus,
            as: "status_subscription",
            attributes: [["code", "status"], "description"],
          },
        ],
        where: {
          status: 1,
        },
      });

      const csvReady = dbData.map((item) => {
        return {
          id: item.id,
          email: item.email,
          ip_address: item.ip_address,
          user_agent: item.user_agent,
          subscribed_at: item.subscribed_at,
          unsubscribed_at: item.unsubscribed_at,
          source: item.source,
          status: item.status_subscription.code,
          description: item.status_subscription.description,
        };
      });

      const fields = [
        { id: "id", title: "ID" },
        { id: "email", title: "Email" },
        { id: "ip_address", title: "IP Address" },
        { id: "user_agent", title: "User Agent" },
        { id: "subscribed_at", title: "Subscribed At" },
        { id: "unsubscribed_at", title: "Unsubscribed At" },
        { id: "source", title: "Source" },
        { id: "status", title: "Status" },
        { id: "description", title: "Description" },
      ];

      const parser = new Parser({});
      const csv = parser.parse(csvReady, { fields });

      // Set headers for file download
      const filename = `subscribers_${Date.now()}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      return res.status(200).send(csv);
    } catch (error) {
      console.error("Subscription Service => exportSubscriber", error);
      throw error;
    }
  },

  async countSubscribers(req, res) {
    try {
      const dataActive = Subscribers.count({
        where : {
          status : 1
        }
      })

      const dataNonActive = Subscribers.count({
        where: {
          status : {
            [Op.ne] : 1
          }
        }
      })

      const datasProm = await Promise.all([dataActive , dataNonActive])
      const vaRetval = {
        "active" : datasProm[0],
        "non_active" : datasProm[1]
      }

      return vaRetval ;

    } catch (error) {
      console.error(error) ;
      throw error ;
    }
  }
};
