import nodemailer from 'nodemailer'
import { env } from '../env'

export const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.EMAIL_USER_NAME,
    pass: env.EMAIL_PASSWORD,
  },
})
