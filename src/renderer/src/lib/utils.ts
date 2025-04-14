import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并并处理 Tailwind CSS 类名的工具函数
 *
 * 使用 clsx 处理条件类名，然后用 tailwind-merge 智能合并 Tailwind 类名，
 * 避免类名冲突并优化最终输出。
 *
 * @param inputs - 类名参数，支持多种格式:
 *   - 字符串: "bg-red-500 p-4"
 *   - 对象: { "bg-red-500": true, "p-4": false }
 *   - 数组: ["bg-red-500", { "p-4": true }]
 *
 * @returns 合并后的类名字符串
 *
 * @example
 * // 基础用法
 * cn("p-4", "bg-red-500")
 * // => "p-4 bg-red-500"
 *
 * // 条件类名
 * cn("p-4", { "bg-red-500": isError })
 *
 * // 合并相同属性
 * cn("p-2", "p-4")
 * // => "p-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
