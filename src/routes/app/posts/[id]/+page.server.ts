import { db } from '@/services/prisma/client'
import type { Actions, PageServerLoad } from './$types'
import { z } from 'zod'
import { fail } from '@sveltejs/kit'
import { repl } from '@/services/messaging/client'

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { id: Number(params.id) },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  const comments = await db.comment.findMany({
    where: { postId: Number(params.id) },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    postId: Number(params.id),
    post,
    comments,
  }
}

const createCommentSchema = z.object({
  content: z.string().min(1).max(255),
})

export const actions: Actions = {
  async default({ request, params, locals }) {
    const form = Object.fromEntries(await request.formData())

    const validated = createCommentSchema.safeParse(form)

    if (!validated.success) {
      return fail(400, {
        issues: validated.error.flatten().fieldErrors,
      })
    }

    const { content } = validated.data

    const comment = await db.comment.create({
      data: {
        content,
        postId: Number(params.id),
        userId: locals.user!.id,
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
      .publish(`comments:${params.id}`, JSON.stringify(comment))
      .catch((err) => console.error('Failed to publish comment:', err))

    return { success: true }
  },
}
