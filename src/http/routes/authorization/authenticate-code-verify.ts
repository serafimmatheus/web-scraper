import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { transporter } from '../../../utils/mailer'

export async function AuthenticateCodeVerify(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/api/v1/session/code-verify',
    {
      schema: {
        tags: ['Auth'],
        description: 'Authenticate With Code Verify',
        body: z.object({
          code: z.string().min(4).max(4),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { code } = req.body

      const codeExists = await db.token.findUnique({
        where: {
          type: 'AUTHENTICATE_WITH_PASSWORD',
          code,
        },
      })

      if (!codeExists) {
        return res.status(409).send({
          message: 'code is invalid',
        })
      }

      const userAuthenticated = await db.user.findUnique({
        where: {
          id: codeExists.userId,
        },
      })

      if (!userAuthenticated) {
        return res.status(409).send({
          message: 'User not found',
        })
      }

      await db.token.delete({
        where: {
          code,
        },
      })

      const token = await res.jwtSign(
        {
          sub: userAuthenticated.id,
        },
        {
          expiresIn: '7d',
        }
      )

      await transporter.sendMail({
        from: 'suporte@mail.com',
        to: userAuthenticated.email!,
        subject: 'Bem vindo.',
        text: `Olá ${userAuthenticated.name}, seu código foi verificado com sucesso.`,
      })

      return res.status(201).send({ token })
    }
  )
}
