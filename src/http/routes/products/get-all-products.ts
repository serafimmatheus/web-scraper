import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../utils/prisma'
import { z } from 'zod'
import { auth } from '../../middlewares/auth'

export async function getAllProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/api/v1/products',
      {
        schema: {
          tags: ['Products'],
          summary: 'Get all products',
          response: {},
        },
      },
      async (req, res) => {
        const products = await db.product.findMany({
          include: {
            categories: true,
          },
        })

        return res.status(200).send(products)
      }
    )
}
