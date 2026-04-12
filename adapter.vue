<!-- components/AppDatePicker.vue — the adapter component -->
<template>
  <ThirdPartyDatePicker
    :value="internalValue"
    :config="pickerConfig"
    @datechange="onDateChange"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Date, default: null },
  minDate: { type: Date, default: null },
});

const emit = defineEmits(['update:modelValue']);

// third-party expects "YYYY/MM/DD" string, your app uses Date objects
const internalValue = computed(() => {
  if (!props.modelValue) return '';
  return formatForPicker(props.modelValue);  // Date → "2026/04/12"
});

const pickerConfig = computed(() => ({
  dateFormat: 'Y/m/d',                         // their format option
  minDate: props.minDate ? formatForPicker(props.minDate) : undefined,
}));

function onDateChange(dateString) {
  emit('update:modelValue', new Date(dateString));  // string → Date
}

function formatForPicker(date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}
</script>