import { db } from '@/services/prisma/client'
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('token')

  if (!token) {
    throw redirect(301, '/')
  }

  await db.session.deleteMany({
    where: {
      token,
    },
  })

  throw redirect(301, '/')
}
