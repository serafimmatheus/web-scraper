import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { networkInterfaces } from 'os'

const prismaClient = new PrismaClient()

interface Products {
  name: string
  slug: string
  categories: string[]
  description: string
  price: number
  image: string
}

interface Categories {
  name: string
  slug: string
}

async function createCategories(categories: Categories[]) {
  for (const category of categories) {
    await prismaClient.category.create({
      data: {
        name: category.name,
        slug: category.slug,
      },
    })
  }
}

async function createProducts(products: Products[]) {
  for (const product of products) {
    await prismaClient.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        categories: {
          connect: product.categories.map((category) => ({ slug: category })),
        },
      },
    })
  }
}

async function createUsers(data: any) {
  for (const user of data) {
    await prismaClient.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await hash(user.password, 10),
        image: await user.image,
      },
    })
  }
}

const categories = [
  { name: 'tradicional', slug: 'tradicional' },
  { name: 'gelado', slug: 'gelado' },
  { name: 'com leite', slug: 'com-leite' },
  { name: 'especial', slug: 'especial' },
  { name: 'alcoólico', slug: 'alcoolico' },
]

const products = [
  {
    name: 'Expresso Tradicional',
    slug: 'expresso-tradicional',
    categories: ['tradicional'],
    description: 'O tradicional café feito com água quente e grãos moídos',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Expresso Americano',
    slug: 'expresso-americano',
    categories: ['tradicional'],
    description: 'Expresso diluído, menos intenso que o tradicional',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Expresso Cremoso',
    slug: 'expresso-cremoso',
    categories: ['tradicional'],
    description: 'Café expresso tradicional com espuma cremosa',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Expresso Gelado',
    slug: 'expresso-gelado',
    categories: ['tradicional', 'gelado'],
    description: 'Bebida preparada com café expresso e cubos de gelo',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Café com Leite',
    slug: 'expresso-irlandes',
    categories: ['tradicional', 'com-leite'],
    description: 'Meio a meio de expresso tradicional com leite vaporizado',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Latte',
    slug: 'latte',
    categories: ['tradicional', 'com-leite'],
    description:
      'Uma dose de café expresso com o dobro de leite e espuma cremosa',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Capuccino',
    slug: 'capuccino',
    categories: ['tradicional', 'com-leite'],
    description:
      'Bebida com canela feita de doses iguais de café, leite e espuma',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Macchiato',
    slug: 'macchiato',
    categories: ['tradicional', 'com-leite'],
    description:
      'Café expresso misturado com um pouco de leite quente e espuma',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Mocaccino',
    slug: 'mocaccino',
    categories: ['tradicional', 'com-leite'],
    description: 'Café expresso com calda de chocolate, pouco leite e espuma',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Chocolate Quente',
    slug: 'chocolate-quente',
    categories: ['especial', 'com-leite'],
    description: 'Bebida feita com chocolate dissolvido no leite quente e café',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Cubano',
    slug: 'cubano',
    categories: ['especial', 'alcoolico', 'gelado'],
    description:
      'Drink gelado de café expresso com rum, creme de leite e hortelã',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Havaiano',
    slug: 'havaiano',
    categories: ['especial'],
    description: 'Bebida adocicada preparada com café e leite de coco',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Árabe',
    slug: 'arabe',
    categories: ['especial'],
    description: 'Bebida preparada com grãos de café árabe e especiarias',
    price: 9.9,
    image: '/coffee-product.svg',
  },
  {
    name: 'Irlandês',
    slug: 'irlandes',
    categories: ['especial', 'alcoolico'],
    description: 'Bebida a base de café, uísque irlandês, açúcar e chantilly',
    price: 9.9,
    image: '/coffee-product.svg',
  },
]

const user = [
  {
    name: 'Matheus Serafim',
    email: 'matheus18serafim@gmail.com',
    password: 'serafim123',
    image: 'https://github.com/serafimmatheus.png',
    emailVerified: new Date().toISOString,
  },
]

createCategories(categories)
createProducts(products)
createUsers(user)
