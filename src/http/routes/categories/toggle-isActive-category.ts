import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { auth } from '../../middlewares/auth'

export async function toggleIsActiveCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/api/v1/categories/:slug/update/is-active',
      {
        schema: {
          tags: ['Categories'],
          summary: 'Toggle isActive category by slug',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            404: z.object({
              message: z.string(),
            }),
            204: z.null(),
          },
        },
      },
      async (req, res) => {
        const { slug } = req.params
        const category = await db.category.findUnique({
          where: {
            slug,
          },
        })

        if (!category) {
          return res.status(404).send({ message: 'Category not found' })
        }

        await db.category.update({
          where: {
            slug,
          },
          data: {
            isActive: !category.isActive,
          },
        })

        return res.status(204).send()
      }
    )
}
