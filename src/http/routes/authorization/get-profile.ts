import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../../middlewares/auth'
import { db } from '../../../utils/prisma'

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/api/v1/profile',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Get authenticated user profile',
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.object({
              user: z.object({
                id: z.string().cuid(),
                name: z.string().nullable(),
                email: z.string().email().nullable(),
                image: z.string().nullable(),
                emailVerified: z.date().nullable(),
              }),
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId()

        const user = await db.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            image: true,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found')
        }

        return res.send({
          user,
        })
      }
    )
}
