import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { db } from '../../../utils/prisma'
import { z } from 'zod'
import { auth } from '../../middlewares/auth'

export async function updateProductsBySlug(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/api/v1/products/:slug/update',
      {
        schema: {
          tags: ['Products'],
          summary: 'Update a product by slug',
          body: z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().nullish(),
            price: z.string(),
            image: z.string().nullish(),
            isActive: z.boolean(),
            categories: z.array(z.string()),
          }),
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
        const { slug: slugParams } = req.params
        const { name, slug, description, price, image, isActive, categories } =
          req.body

        const productAlreadyExists = await db.product.findUnique({
          where: {
            slug: slugParams,
          },
          include: {
            categories: true,
          },
        })

        if (!productAlreadyExists) {
          return res.status(404).send({ message: 'Product not found' })
        }

        if (slug !== slugParams) {
          const productWithSlugAlreadyExists = await db.product.findUnique({
            where: {
              slug: slug,
            },
          })

          if (productWithSlugAlreadyExists) {
            return res.status(409).send({ message: 'Slug of product in use' })
          }

          await db.product.update({
            where: {
              slug: slugParams,
            },
            data: {
              name,
              description,
              price,
              image,
              isActive,
              categories: {
                disconnect: productAlreadyExists.categories.map((category) => ({
                  slug: category.slug,
                })),
                connect: categories.map((slug) => ({
                  slug,
                })),
              },
            },
          })
        }

        await db.product.update({
          where: {
            slug: slugParams,
          },
          data: {
            name,
            description,
            price,
            image,
            isActive,
            categories: {
              disconnect: productAlreadyExists.categories.map((category) => ({
                slug: category.slug,
              })),
              connect: categories.map((slug) => ({
                slug,
              })),
            },
          },
        })

        return res.status(201).send({ message: 'Product updated successfully' })
      }
    )
}
