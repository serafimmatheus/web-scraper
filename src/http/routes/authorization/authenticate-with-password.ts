import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { compare } from 'bcryptjs'
import { generateRandomNumbers } from '../../../utils/generate-ramdom-numbers'
import { transporter } from '../../../utils/mailer'

export async function AuthenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/api/v1/session',
    {
      schema: {
        tags: ['Auth'],
        description: 'Authenticate with email and password',
        body: z.object({
          email: z.string().email(),
          password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' }),
        }),
        response: {
          204: z.null(),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body

      const userFromEmail = await db.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFromEmail?.emailVerified) {
        return res.status(409).send({
          message: 'Email not verified',
        })
      }

      if (!userFromEmail) {
        return res.status(409).send({
          message: 'Invalid email or password',
        })
      }

      const isPasswordValid = await compare(password, userFromEmail.password!)

      if (!isPasswordValid) {
        return res.status(409).send({
          message: 'Invalid email or password',
        })
      }

      const code = generateRandomNumbers()

      await db.token.create({
        data: {
          userId: userFromEmail.id,
          code,
          type: 'AUTHENTICATE_WITH_PASSWORD',
        },
      })

      await transporter.sendMail({
        from: 'suporte@mail.com',
        to: email,
        subject: 'noreply - Authentication code',
        text: `Your authentication code is ${code}`,
      })

      return res.status(204).send()
    }
  )
}
