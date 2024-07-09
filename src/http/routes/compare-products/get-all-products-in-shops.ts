import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import puppeteer from 'puppeteer'
import { z } from 'zod'

export async function getAllProductsInShops(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/products',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get all products in shops, Kabum, Pichau e Terabyte.',
        body: z.object({
          name: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { name } = req.body
      //   const nameFormatedTera = name.replace(' ', '+')
      const nameFormatedKabum = name.replace(' ', '-')
      const nameFormatedPichau = name.replace(' ', '%20')
      const urlPichau = `https://www.pichau.com.br/catalogsearch/result/?q=${nameFormatedPichau}`
      //   const urlTerabyte = `https://www.terabyteshop.com.br/busca?str=${nameFormatedTera}`
      const urlKabum = `https://www.kabum.com.br/busca/${nameFormatedKabum}?page_number=1&page_size=100&facet_filters=&sort=most_searched&variant=catalog`

      const browser = await puppeteer.launch({
        headless: true,
      })
      const page = await browser.newPage()
      //   const pageTera = await browser.newPage()
      const pagePichau = await browser.newPage()

      await page.goto(urlKabum)

      const resultKabum = await page.evaluate(() => {
        const posts = Array.from(
          document.querySelectorAll('article.productCard')
        ).map((el) => {
          const title = el.querySelector('h3 span.nameCard')?.textContent
          const link = el.querySelector('a')?.getAttribute('href')
          const imageUrl = el.querySelector('a img')?.getAttribute('src')
          const price = el.querySelector(
            'div.availablePricesCard span.priceCard'
          )?.textContent

          const priceFormated = price?.split('R$')[1].trim()

          return {
            title,
            link,
            imageUrl,
            price: priceFormated,
          }
        })

        return posts
      })

      //   await pageTera.goto(urlTerabyte)

      //   const resultTera = await pageTera.evaluate(() => {
      //     const posts = Array.from(document.querySelectorAll('div.pbox')).map(
      //       (el) => {
      //         const title = el.querySelector(
      //           '.commerce_columns_item_caption h2'
      //         )?.textContent
      //         const link = el
      //           .querySelector('a.commerce_columns_item_image')
      //           ?.getAttribute('href')
      //         const imageUrl = el
      //           .querySelector('div.commerce_columns_item_image img')
      //           ?.getAttribute('src')
      //         const price = el.querySelector(
      //           'div.commerce_columns_item_info .prod-new-price span'
      //         )?.textContent

      //         const priceFormated = price?.split('R$')[1].trim()

      //         return {
      //           title,
      //           link,
      //           imageUrl,
      //           price: priceFormated,
      //         }
      //       }
      //     )

      //     return posts
      //   })

      //   await browser.close()

      await pagePichau.goto(urlPichau)

      const resultPichau = await pagePichau.evaluate(() => {
        const posts = Array.from(
          document.querySelectorAll('div.MuiGrid-root.MuiGrid-item')
        ).map((el) => {
          const title = el.querySelector(
            'a.jss190 .MuiCardContent-root.jss379 h2'
          )?.textContent
          const link = el.querySelector('a.jss190')?.getAttribute('href')
          const imageUrl = el
            .querySelector(
              'a.jss190 div.jss380 div.lazyload-wrapper img.jss378'
            )
            ?.getAttribute('src')
          const price = el.querySelector('a.jss190 .jss405')?.textContent

          const priceFormated = price?.split('R$')[1].trim()

          return {
            title,
            link,
            imageUrl,
            price: priceFormated,
          }
        })

        return posts
      })

      await browser.close()

      return res.status(200).send({
        total: resultKabum.length + resultPichau.length,
        kabum: resultKabum,
        // terabyte: resultTera,
        pichau: resultPichau,
      })
    }
  )
}
