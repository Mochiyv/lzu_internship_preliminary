<script setup>
import { formatPrice } from '../utils/money.js'

defineProps({
  item: { type: Object, required: true },
  pending: { type: Boolean, default: false },
})
defineEmits(['toggle'])
</script>

<template>
  <tr :class="{ 'row-soldout': item.status === 'off', 'row-empty': item.stock === 0 }">
    <td class="col-id">{{ item.id }}</td>
    <td class="col-title">
      <!-- 必须用文本插值：种子数据里有一条 <script>alert('xss')</script>，v-html 会真弹窗 -->
      <div class="title" :title="item.title">{{ item.title }}</div>
      <div v-if="item.description" class="desc" :title="item.description">{{ item.description }}</div>
    </td>
    <td class="col-category">
      <span class="tag">{{ item.category }}</span>
    </td>
    <!-- 接口给的是「分」，展示一律 ¥xx.xx -->
    <td class="col-price">{{ formatPrice(item.price) }}</td>
    <td class="col-stock">
      <template v-if="item.stock === 0">
        <span class="badge badge-soldout">缺货</span>
      </template>
      <template v-else>{{ item.stock }}</template>
    </td>
    <td class="col-status">
      <span class="badge" :class="item.status === 'on' ? 'badge-on' : 'badge-off'">
        {{ item.status === 'on' ? '在售' : '已下架' }}
      </span>
    </td>
    <td class="col-action">
      <button
        type="button"
        class="btn btn-ghost"
        :disabled="pending"
        :data-testid="`toggle-${item.id}`"
        @click="$emit('toggle', item)"
      >
        {{ pending ? '处理中…' : item.status === 'on' ? '下架' : '上架' }}
      </button>
    </td>
  </tr>
</template>
