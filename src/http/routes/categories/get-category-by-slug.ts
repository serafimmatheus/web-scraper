import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { auth } from '../../middlewares/auth'

export async function getCategoryBySlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/api/v1/categories/:slug',
      {
        schema: {
          tags: ['Categories'],
          summary: 'Get category by slug',
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
            200: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
            }),
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

        return res.status(200).send(category)
      }
    )
}
