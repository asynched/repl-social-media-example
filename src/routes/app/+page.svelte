<script lang="ts">
  import type { PageData } from './$types'
  import { usePosts } from '@/stores/posts'

  export let data: PageData

  const posts = usePosts(data.posts)
</script>

<h1>Olá, {data.user.name}!</h1>
<p>Como vai?</p>

<a href="/app/sign-out">Sair</a>

<hr />

<div>
  <h2>Criar post</h2>
  <form method="POST">
    <div>
      <label for="content">O que você está pensando?</label>
      <input type="text" id="content" name="content" />
    </div>
    <button>Postar</button>
  </form>
</div>

<hr />

{#if data.posts.length > 0}
  <h2>Posts</h2>

  <ul>
    {#each $posts as post (post.id)}
      <li>
        <a href={`/app/posts/${post.id}`}>{post.content}</a>
        <p>Por: {post.user.username}</p>
        <p>Criado em: {new Date(post.createdAt).toLocaleDateString()}</p>
      </li>
    {/each}
  </ul>
{:else}
  <h2>Nenhum post ainda</h2>
  <p>Verifique em outro momento ou crie um novo post</p>
{/if}
