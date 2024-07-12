import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../../utils/prisma'
import { auth } from '../../middlewares/auth'

export async function createCategory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/api/v1/categories',
      {
        schema: {
          tags: ['Categories'],
          summary: 'Create category',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            name: z.string(),
            slug: z.string(),
            isActive: z.boolean(),
          }),
          response: {
            409: z.object({
              message: z.string(),
            }),
            201: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              isActive: z.boolean(),
            }),
          },
        },
      },
      async (req, res) => {
        const { name, slug, isActive } = req.body

        const category = await db.category.findUnique({
          where: {
            slug,
          },
        })

        if (category) {
          return res.status(409).send({ message: 'Category already exists' })
        }

        const categoryCreate = await db.category.create({
          data: {
            name,
            slug,
            isActive,
          },
        })

        return res.status(201).send(categoryCreate)
      }
    )
}
