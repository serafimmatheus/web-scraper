import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { createUser } from './routes/authorization/create-user'
import { AuthenticateWithPassword } from './routes/authorization/authenticate-with-password'
import fastifyJwt from '@fastify/jwt'
import { env } from '../env'
import { AuthenticateCodeVerify } from './routes/authorization/authenticate-code-verify'
import { getAllProducts } from './routes/products/get-all-products'
import { createCategory } from './routes/categories/create-category'
import { getAllCategories } from './routes/categories/get-categories'
import { getCategoryBySlug } from './routes/categories/get-category-by-slug'
import { updateCategoryBySlug } from './routes/categories/update-category-by-slug'
import { toggleIsActiveCategory } from './routes/categories/toggle-isActive-category'
import { deleteCategoryBySlug } from './routes/categories/delete-category-by-slug'
import { createProducts } from './routes/products/create-products'
import { updateProductsBySlug } from './routes/products/update-product-by-slug'
import { toggleIsActiveProductsBySlug } from './routes/products/toggle-isActive-Product-by-slug'
import { deleteProductsBySlug } from './routes/products/delete-product-by-slug'
import { getProfile } from './routes/authorization/get-profile'
import { updateProfile } from './routes/authorization/update-profile'
import { updatePassword } from './routes/authorization/update-password'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Cardapio Digital',
      description: 'API Documentation',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors, {
  origin: '*',
})

// Register routes Authorization
app.register(getProfile)
app.register(createUser)
app.register(AuthenticateCodeVerify)
app.register(AuthenticateWithPassword)
app.register(updateProfile)
app.register(updatePassword)

// Register routes Products
app.register(createProducts)
app.register(getAllProducts)
app.register(updateProductsBySlug)
app.register(toggleIsActiveProductsBySlug)
app.register(deleteProductsBySlug)

// Register routes Categories
app.register(createCategory)
app.register(getAllCategories)
app.register(getCategoryBySlug)
app.register(updateCategoryBySlug)
app.register(toggleIsActiveCategory)
app.register(deleteCategoryBySlug)

// Start the server
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`Server is running on http://localhost:${3333}`)
  })
  .catch((err) => {
    console.error(err)
  })
