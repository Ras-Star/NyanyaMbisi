<script setup lang="ts">
const route = useRoute();
await navigateTo(`/orders/${route.params.id}`, { redirectCode: 301, replace: true });
</script>

<template>
  <div class="surface-card empty-state">
    <strong>Redirecting...</strong>
  </div>
</template>
