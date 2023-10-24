import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import type { Actions } from './$types'
import { db } from '@/services/prisma/client'

const registerSchema = z.object({
  name: z.string().min(3).max(64),
  username: z
    .string()
    .min(4)
    .max(32)
    .regex(/^[a-z0-9_]+$/i),
  password: z.string().min(8).max(64),
})

export const actions: Actions = {
  async default({ request }) {
    const data = Object.fromEntries(await request.formData())

    const validated = registerSchema.safeParse(data)

    if (!validated.success) {
      return fail(400, {
        issues: validated.error.flatten().fieldErrors,
      })
    }

    await db.user.create({
      data: validated.data,
    })

    throw redirect(301, '/')
  },
}
