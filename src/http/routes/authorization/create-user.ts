import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../../utils/prisma'
import { hash } from 'bcryptjs'

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/api/v1/users',
    {
      schema: {
        tags: ['Auth'],
        description: 'Create a new user',
        body: z.object({
          email: z.string().email(),
          name: z.string(),
          password: z.string().min(8),
        }),
      },
    },
    async (req, res) => {
      const { email, name, password } = req.body

      const userHashPassword = await hash(password, 10)

      const user = await db.user.create({
        data: {
          email,
          name,
          password: userHashPassword,
        },
      })

      const newUser = {
        ...user,
        password: undefined,
      }

      return res.status(201).send(newUser)
    }
  )
}
