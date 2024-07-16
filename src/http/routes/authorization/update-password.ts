import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../../middlewares/auth'
import { db } from '../../../utils/prisma'
import { compare, hash } from 'bcryptjs'

export async function updatePassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/api/v1/profile/password/update',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Update authenticated user password',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            oldPassword: z.string(),
            newPassword: z.string(),
          }),
          response: {
            204: z.null(),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId()
        const { oldPassword, newPassword } = req.body

        const currentUser = await db.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!currentUser) {
          throw new BadRequestError('User not found')
        }

        const isPasswordValid = await compare(
          oldPassword,
          currentUser.password!
        )

        if (!isPasswordValid) {
          throw new BadRequestError('Ops, anything is wrong')
        }

        const hashedPassword = await hash(newPassword, 8)

        await db.user.update({
          where: {
            id: currentUser.id,
          },
          data: {
            password: hashedPassword,
          },
        })

        return res.send()
      }
    )
}
