<script lang="ts">
  import type { PageData } from './$types'
  import { useComments } from '@/stores/comments'

  export let data: PageData

  const comments = useComments(data.postId, data.comments)
</script>

<h1>{data.post.content}</h1>
<p>@{data.post.user.username}</p>
<p>Criado em: {data.post.createdAt.toLocaleDateString()}</p>

<hr />

<h2>Comentários</h2>

<form method="POST">
  <div>
    <label for="content">Comentário: </label>
    <input type="text" id="content" name="content" />
  </div>
  <button>Postar</button>
</form>

<ul>
  {#each $comments as comment (comment.id)}
    <li>
      <p>{comment.content}</p>
      <p>Por: {comment.user.username}</p>
      <p>Criado em: {comment.createdAt.toLocaleDateString()}</p>
    </li>
  {/each}
</ul>
