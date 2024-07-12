import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../utils/prisma'
import { z } from 'zod'
import { auth } from '../../middlewares/auth'

export async function toggleIsActiveProductsBySlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/api/v1/products/:slug/update/is-active',
      {
        schema: {
          tags: ['Products'],
          summary: 'Toggle isActive product by slug',
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.object({
              message: z.string(),
            }),
            204: z.null(),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (req, res) => {
        const { slug } = req.params

        const productsAlredExists = await db.product.findUnique({
          where: {
            slug,
          },
        })

        if (!productsAlredExists) {
          return res.status(404).send({ message: 'Product not found!' })
        }

        await db.product.update({
          where: {
            slug,
          },
          data: {
            isActive: !productsAlredExists.isActive,
          },
        })

        return res.status(201).send({
          message: productsAlredExists.isActive
            ? 'Product is now inactive'
            : 'Product is now active',
        })
      }
    )
}
