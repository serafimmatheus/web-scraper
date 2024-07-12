import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { auth } from '../../middlewares/auth'

export async function updateCategoryBySlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/api/v1/categories/:slug/update',
      {
        schema: {
          tags: ['Categories'],
          summary: 'Update category by slug',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            slug: z.string(),
            isActive: z.boolean(),
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
        const { slug: slugParams } = req.params
        const category = await db.category.findUnique({
          where: {
            slug: slugParams,
          },
        })

        if (!category) {
          return res.status(404).send({ message: 'Category not found' })
        }

        const { name, slug, isActive } = req.body

        await db.category.update({
          where: {
            slug: slugParams,
          },
          data: {
            name,
            slug,
            isActive,
          },
        })

        return res.status(204).send()
      }
    )
}
