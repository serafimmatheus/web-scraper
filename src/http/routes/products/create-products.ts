import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../utils/prisma'
import { z } from 'zod'
import { auth } from '../../middlewares/auth'

export async function createProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/api/v1/products',
      {
        schema: {
          tags: ['Products'],
          summary: 'Create a new product',
          body: z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().nullish(),
            price: z.string(),
            image: z.string().nullish(),
            isActive: z.boolean(),
            categories: z.array(z.string()),
          }),
          response: {
            201: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              description: z.string().nullish(),
              price: z.string(),
              image: z.string().nullish(),
              isActive: z.boolean(),
              categories: z.array(z.string()),
            }),
            204: z.null(),
            409: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (req, res) => {
        const { name, slug, description, price, image, isActive, categories } =
          req.body

        const productsAlredExists = await db.product.findUnique({
          where: {
            slug,
          },
        })

        if (productsAlredExists) {
          return res.status(409).send({ message: 'Product already exists' })
        }

        await db.product.create({
          data: {
            name,
            slug,
            description,
            price,
            image,
            isActive,
            categories: {
              connect: categories.map((slug) => ({
                slug,
              })),
            },
          },
        })

        return res.status(204).send()
      }
    )
}
