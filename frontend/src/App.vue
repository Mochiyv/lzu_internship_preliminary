<script setup>
import { onMounted, ref } from 'vue'
import ProductForm from './components/ProductForm.vue'
import ProductList from './components/ProductList.vue'
import { updateProductStatus } from './api/products.js'
import { useProducts } from './composables/useProducts.js'
import { useToasts } from './composables/useToasts.js'

const { items, total, loading, error, filters, reload, clearFilters, patchItemStatus } = useProducts()
const { toasts, dismiss, toast } = useToasts()

// 正在调 PATCH 的商品 id：按钮 disabled，快速连点也不会发出第二个请求
const pendingIds = ref([])
const listEl = ref(null)

onMounted(reload)

function onUpdateFilters(next) {
  const statusChanged = next.status !== filters.status
  const categoryChanged = next.category !== filters.category
  Object.assign(filters, next)
  // 下拉框是即时筛选；关键词等用户按回车或点「查询」，避免每敲一个字都发请求
  if (statusChanged || categoryChanged) reload()
}

function onClear() {
  clearFilters()
}

async function onToggle(item) {
  if (pendingIds.value.includes(item.id)) return
  const nextStatus = item.status === 'on' ? 'off' : 'on'
  pendingIds.value = [...pendingIds.value, item.id]
  try {
    const result = await updateProductStatus(item.id, nextStatus)
    // 以服务端返回的 status 为准回写这一行，不做整表刷新
    patchItemStatus(item.id, result?.status ?? nextStatus)
    toast.success(`《${item.title}》已${nextStatus === 'on' ? '上架' : '下架'}`)
  } catch (err) {
    toast.error(err?.message || '操作失败，请重试')
  } finally {
    pendingIds.value = pendingIds.value.filter((id) => id !== item.id)
  }
}

async function onCreated(created) {
  await reload()
  // 新发布的商品按 id 升序排在最后，滚动过去让用户直接看到
  requestAnimationFrame(() => {
    const rows = listEl.value?.querySelectorAll('tbody tr')
    rows?.[rows.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>校园好物市集</h1>
        <p class="page-sub">L0：商品列表 · 发布 · 上下架 · 加载 / 空态</p>
      </div>
      <p class="page-api">数据来自 <code>GET /api/products</code></p>
    </header>

    <main class="layout">
      <ProductForm @created="onCreated" @notify="toast[$event.type]($event.message)" />
      <div ref="listEl">
        <ProductList
          :items="items"
          :total="total"
          :loading="loading"
          :error="error"
          :filters="filters"
          :pending-ids="pendingIds"
          @update:filters="onUpdateFilters"
          @search="reload"
          @clear="onClear"
          @retry="reload"
          @toggle="onToggle"
        />
      </div>
    </main>

    <!-- toast 区：成功/失败都从这里露出来，业务错误不会被吞掉 -->
    <div class="toasts" aria-live="polite">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast"
        :class="`toast-${item.type}`"
        data-testid="toast"
        @click="dismiss(item.id)"
      >
        {{ item.message }}
      </div>
    </div>
  </div>
</template>
