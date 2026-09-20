<template>
  <h1>Directory</h1>
  <nav class="row">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/users">Users</RouterLink>
    <RouterLink to="/users/create">New user</RouterLink>
  </nav>

  <RouterView />
</template>
