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
import { getDataLinkedin } from './routes/linkedin/get-data-linkedin'
import { getAllProductsInShops } from './routes/compare-products/get-all-products-in-shops'
import { createUser } from './routes/authorization/create-user'
import { AuthenticateWithPassword } from './routes/authorization/authenticate-with-password'
import fastifyJwt from '@fastify/jwt'
import { env } from '../env'
import { AuthenticateCodeVerify } from './routes/authorization/authenticate-code-verify'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Saas Digital',
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

app.register(fastifyCors)

// Register routes LinkedIn
app.register(getDataLinkedin)
app.register(getAllProductsInShops)

// Register routes Authorization
app.register(createUser)
app.register(AuthenticateCodeVerify)
app.register(AuthenticateWithPassword)

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
