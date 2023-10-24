import { db } from '@/services/prisma/client.js'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const actions = {
  async default({ request, cookies }) {
    const data = Object.fromEntries(await request.formData())

    const validated = loginSchema.safeParse(data)

    if (!validated.success) {
      return fail(400, {
        issues: validated.error.flatten().fieldErrors,
      })
    }

    const user = await db.user.findUnique({
      where: {
        username: validated.data.username,
      },
    })

    if (!user) {
      return fail(404, {
        error: 'User not found',
      })
    }

    if (user.password !== validated.data.password) {
      return fail(400, {
        error: 'Invalid password',
      })
    }

    const session = await db.session.create({
      data: {
        userId: user.id,
      },
    })

    cookies.set('token', session.token, {
      httpOnly: true,
      secure: true,
      path: '/',
    })

    throw redirect(301, '/app')
  },
}
