import nodemailer from "nodemailer";
import db from "../models/index.js";
const { ConfigSMTP } = db;
import { decrypt} from "../helpers/crypto.js";

export async function sendDynamicEmail(to, subject, text, html, attachments) {
  try {
    const vaConfigSMTP = await ConfigSMTP.findOne({where: {is_active: true}});
    if(!vaConfigSMTP){
      throw new Error("SMTP not found");
    }

    const dataTransporter = {
      host: vaConfigSMTP.host,
      port: vaConfigSMTP.port,
      secure: vaConfigSMTP.secure,
      auth: {
        user: vaConfigSMTP.username,
        pass: decrypt(vaConfigSMTP.password),
      },
    }

    // console.log(dataTransporter)

    const transporter = nodemailer.createTransport(dataTransporter);

    const mailOptions = {
      from: vaConfigSMTP.from_email,
      to,
      subject,
      text,
      html,
      attachments,
    };

    return await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error(":: Error at Helper sendDynamicEmail :: \n", error);
    throw error; 
  }
}