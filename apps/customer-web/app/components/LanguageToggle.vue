<script setup lang="ts">
const { locale, setLocale } = useI18n();

const options = [
  { code: "en", label: "EN" },
  { code: "lg", label: "LG" }
] as const;
</script>

<template>
  <div class="language-toggle">
    <button
      v-for="option in options"
      :key="option.code"
      type="button"
      class="language-toggle__button"
      :class="{ 'is-active': locale === option.code }"
      @click="setLocale(option.code)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: var(--shadow-sm);
}

.language-toggle__button {
  border: 0;
  background: transparent;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  font-weight: 800;
  color: var(--ink-muted);
  transition:
    transform 180ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
}

.language-toggle__button:hover {
  transform: translateY(-1px);
  color: var(--ink);
}

.language-toggle__button.is-active {
  background: linear-gradient(135deg, var(--brand-leaf), #28894b);
  color: white;
  box-shadow: 0 12px 24px rgba(20, 67, 36, 0.18);
}
</style>
