import { reactive, ref } from 'vue'

/**
 * 极简 toast：页面上的成功 / 失败提示。业务错误也走这里，
 * 保证「错误 message 显示给用户」而不只是打 Console（README §4.3）。
 */
export function useToasts() {
  const toasts = ref([])
  let seq = 0

  function push(message, type = 'info') {
    const id = ++seq
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000)
    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const reactiveApi = reactive({
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
  })

  return { toasts, push, dismiss, toast: reactiveApi }
}
