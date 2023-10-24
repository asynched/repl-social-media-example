import { browser } from '$app/environment'
import { repl } from '@/services/messaging/client'
import { writable } from 'svelte/store'

type Comment = {
  id: number
  content: string
  userId: number
  postId: number
  createdAt: Date
  updatedAt: Date
  user: { username: string }
}

export function useComments(postId: number, initial: Comment[] = []) {
  return writable(initial, (_set, update) => {
    if (!browser) {
      return
    }

    const unsubscribe = repl.subscribe(`comments:${postId}`, (message) => {
      update((comments) => {
        const comment = JSON.parse(message)

        comment.createdAt = new Date(comment.createdAt)
        comment.updatedAt = new Date(comment.updatedAt)

        comments.unshift(comment)
        return comments
      })
    })

    return unsubscribe
  })
}
