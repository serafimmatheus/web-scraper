import { z } from 'zod'
import puppeteer from 'puppeteer'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getDataLinkedin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/globo',
    {
      schema: {
        tags: ['Globo'],
        summary: 'Get data from Globo',
        response: {
          201: z.object({
            total: z.number(),
            result: z.array(
              z.object({
                title: z.string().nullish(),
                link: z.string().nullish(),
                imageUrl: z.string().nullish(),
              })
            ),
          }),
        },
      },
    },
    async (req, res) => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto('https://www.globo.com/')

      // await page
      //   .locator('.authwall-join-form__form-toggle--bottom.form-toggle')
      //   .click()

      // await page.locator('input#session_key').fill('serafim@mentores.com.br')
      // await page.locator('input#session_password').fill('@@Mentores00')

      // await page
      //   .locator(
      //     '.btn-md.btn-primary.flex-shrink-0.cursor-pointer.sign-in-form__submit-btn--full-width'
      //   )
      //   .click()

      // await page.goto('https://www.linkedin.com/in/matheus-serafim-b27613317/')

      const result = await page.evaluate(() => {
        const posts = Array.from(
          document.querySelectorAll('.wrapper .container .post')
        ).map((el) => {
          const title = el.querySelector('.post__title')?.textContent
          const link = el.querySelector('.post__link')?.getAttribute('href')
          const imageUrl = el
            .querySelector('.post__image img')
            ?.getAttribute('src')

          return {
            title,
            link,
            imageUrl,
          }
        })

        return posts
      })

      await browser.close()

      return res.status(201).send({ total: result.length, result })
    }
  )
}
