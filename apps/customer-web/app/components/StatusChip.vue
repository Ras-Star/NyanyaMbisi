<script setup lang="ts">
defineProps<{
  label: string;
  tone?: "leaf" | "sun" | "danger";
}>();
</script>

<template>
  <span class="chip" :class="`chip--${tone ?? 'leaf'}`">{{ label }}</span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.78rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.chip--leaf {
  background: rgba(29, 111, 59, 0.12);
  color: var(--brand-leaf);
}

.chip--sun {
  background: rgba(244, 196, 48, 0.22);
  color: #6a4a00;
}

.chip--danger {
  background: rgba(191, 47, 49, 0.12);
  color: #87282a;
}
</style>

