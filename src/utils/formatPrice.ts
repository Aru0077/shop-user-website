// src/utils/formatPrice.ts
/**
 * 格式化价格，专门用于蒙古图格里克货币
 * - 不显示小数位
 * - 使用千分位分隔符
 * - 添加货币符号
 * 
 * @param price 价格数值
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 */
export function formatPrice(
      price: number | string | undefined | null,
      options: {
            showSymbol?: boolean;    // 是否显示货币符号
            symbol?: string;         // 货币符号，默认为 ₮
            fallback?: string;       // 当价格无效时的默认值
      } = {}
): string {
      // 设置默认选项
      const {
            showSymbol = true,
            symbol = '₮',
            fallback = '0'
      } = options;

      // 验证价格值
      if (price === undefined || price === null || isNaN(Number(price))) {
            return showSymbol ? `${fallback} ${symbol}` : fallback;
      }

      try {
            // 转换为数字并取整数部分
            const numericPrice = Math.floor(Number(price));

            // 格式化为千分位
            const formattedPrice = numericPrice.toLocaleString('mn-MN');

            // 根据选项添加货币符号
            return showSymbol ? `${formattedPrice} ${symbol}` : formattedPrice;
      } catch (error) {
            console.error('价格格式化错误:', error);
            return showSymbol ? `${fallback} ${symbol}` : fallback;
      }
}

/**
 * 解析格式化后的价格字符串为数字
 * 
 * @param formattedPrice 格式化后的价格字符串
 * @returns 价格数值
 */
export function parsePrice(formattedPrice: string): number {
      if (!formattedPrice) return 0;

      // 移除货币符号和分隔符
      const numericString = formattedPrice.replace(/[₮\s,]/g, '');

      // 转换为数字
      const price = Number(numericString);

      return isNaN(price) ? 0 : price;
}

export default formatPrice;