import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '../../middlewares/auth'
import { db } from '../../../utils/prisma'

export async function updateProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/api/v1/profile/update',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Update authenticated user profile',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            name: z.string().optional(),
            image: z.string().optional(),
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
        const { name, image } = req.body

        const currentUser = await db.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!currentUser) {
          throw new BadRequestError('User not found')
        }

        await db.user.update({
          where: {
            id: currentUser.id,
          },
          data: {
            name,
            image,
          },
        })

        return res.send()
      }
    )
}
