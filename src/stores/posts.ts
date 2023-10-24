import { browser } from '$app/environment'
import { repl } from '@/services/messaging/client'
import { writable } from 'svelte/store'

type Post = {
  id: number
  content: string
  updatedAt: Date
  createdAt: Date
  user: {
    username: string
  }
}

export function usePosts(initial: Post[] = []) {
  return writable(initial, (_set, update) => {
    if (!browser) {
      return
    }

    const unsubscribe = repl.subscribe('posts', (message) => {
      update((posts) => {
        const post: Post = JSON.parse(message)
        post.createdAt = new Date(post.createdAt)
        post.updatedAt = new Date(post.updatedAt)

        posts.unshift(post)

        return posts
      })
    })

    return unsubscribe
  })
}
