<script setup lang="ts">
import FileUpload from "/@/componts/file-upload.vue";
import {ref} from "vue";

const filePath = ref("")
</script>

<template>
  <file-upload v-model="filePath"/>
</template>

<style scoped>
</style>
