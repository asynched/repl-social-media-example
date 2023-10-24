import { db } from '@/services/prisma/client'
import type { PageServerLoad } from '../$types'
import type { Actions } from './$types'
import { z } from 'zod'
import { fail } from '@sveltejs/kit'
import { repl } from '@/services/messaging/client'

export const load: PageServerLoad = ({ locals }) => {
  const user = locals.user!

  return {
    user,
    posts: db.post.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    }),
  }
}

const createPostSchema = z.object({
  content: z.string().min(1).max(255),
})

export const actions: Actions = {
  async default({ request, locals }) {
    const user = locals.user!

    const form = Object.fromEntries(await request.formData())

    const validated = createPostSchema.safeParse(form)

    if (!validated.success) {
      return fail(400, {
        issues: validated.error.flatten().fieldErrors,
      })
    }

    const post = await db.post.create({
      data: {
        content: validated.data.content,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    })

    repl
      .publish('posts', JSON.stringify(post))
      .catch((err) => console.error('Error publishing:', err))

    return { success: true }
  },
}
