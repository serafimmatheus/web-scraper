import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../utils/prisma'
import { auth } from '../../middlewares/auth'

export async function getAllCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/api/v1/categories',
      {
        schema: {
          tags: ['Categories'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: 'Get all categories',
          response: {},
        },
      },
      async (req, res) => {
        const categories = await db.category.findMany()

        return res.status(200).send(categories)
      }
    )
}
