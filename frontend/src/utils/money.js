/**
 * 金额换算（全场唯一口径）。
 *
 * - 接口里的钱永远是「分」，整数；
 * - 界面上永远是「元」，`¥xx.xx` 两位小数、带 ¥；
 * - 用户输入用「元」，提交前转成「分」。
 *
 * 全程整数运算：绝不出现 `19.9 * 100 = 1989.9999999999998` 这类浮点尾巴。
 */

/** 合法的「元」输入：123 / 12.5 / 12.50 / .5，最多两位小数，不接受负号、科学计数法 */
const YUAN_PATTERN = /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/

/**
 * 分 → 元字符串（不带 ¥）。非整数或非法值一律兜底成 `0.00`，保证界面不出现 NaN。
 * @param {number|string} fen 金额（分）
 * @returns {string} 例如 `12.50`
 */
export function fenToYuan(fen) {
  const value = Number(fen)
  if (!Number.isFinite(value)) return '0.00'
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

/**
 * 分 → `¥xx.xx`，列表/详情的唯一展示入口。
 * @param {number|string} fen 金额（分）
 * @returns {string} 例如 `¥12.50`
 */
export function formatPrice(fen) {
  return `¥${fenToYuan(fen)}`
}

/**
 * 元 → 分（整数）。输入不合法返回 `null`，由调用方给字段级错误提示。
 * 字符串按小数点切开、整数端 ×100、小数端左对齐补零，避免浮点乘法。
 * @param {string|number} input 用户输入的「元」
 * @returns {number|null} 整数分，例如 `19.9` → `1990`
 */
export function yuanToFen(input) {
  const text = String(input ?? '').trim()
  if (!YUAN_PATTERN.test(text)) return null
  const [yuanPart, centPart = ''] = text.split('.')
  const yuan = yuanPart === '' ? 0 : Number(yuanPart)
  const fen = yuan * 100 + Number(centPart.padEnd(2, '0'))
  return Number.isSafeInteger(fen) ? fen : null
}

/** 元 → 分，同时要求「必须是正数」，供发布表单校验用 */
export function yuanToPositiveFen(input) {
  const fen = yuanToFen(input)
  return fen !== null && fen > 0 ? fen : null
}
