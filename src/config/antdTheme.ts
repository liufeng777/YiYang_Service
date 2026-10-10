import type { ThemeConfig } from 'antd'

/**
 * antd v5 主题配置
 * 与 src/styles/variables.less 中的设计变量保持一致
 * 修改设计规范时，此处与 variables.less 需同步更新
 */
const brandPrimary = '#27866B'
const brandPrimaryDark = '#185D4C'

const antdTheme: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: brandPrimary,
    colorPrimaryHover: brandPrimaryDark,
    colorPrimaryActive: brandPrimaryDark,
    colorLink: '#27866B',
    colorLinkHover: '#185D4C',
    colorLinkActive: '#185D4C',
    colorInfo: '#3478F6',
    colorSuccess: brandPrimary,
    colorWarning: '#F3B56A',
    colorError: '#F45B4F',
    // 表面与背景
    colorBgLayout: '#F5F7F5',
    colorBgContainer: '#FFFFFF',
    colorBorderSecondary: '#EBEDEA',
    // 文字
    colorText: '#1F2D2A',
    colorTextSecondary: '#66736F',
    colorTextTertiary: '#66736F',
    // 字体
    fontFamily:
      "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    // 圆角
    borderRadius: 6,
    // 组件尺寸
    controlHeight: 34,
    // 页面主标题
    fontSizeHeading1: 28,
    // 模块标题
    fontSizeHeading2: 20,
    // 卡片标题
    fontSizeHeading3: 16,
    // 正文
    fontSize: 14,
    // 标签与字段名
    fontSizeSM: 13,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      siderBg: '#075544',
      bodyBg: '#F5F7F5',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#075544',
      darkItemColor: '#C0DCD3',
      darkItemSelectedBg: '#097D63',
      darkItemSelectedColor: '#FFFFFF',
      darkItemHoverBg: 'rgba(9, 125, 99, 0.5)',
      darkItemHoverColor: '#FFFFFF',
      itemBorderRadius: 6,
      itemMarginInline: 8,
      itemHeight: 42,
    },
    Card: {
      headerBg: '#FFFFFF',
    },
    Table: {
      headerBg: '#F7F8F6',
      headerColor: '#66736F',
      headerSplitColor: 'transparent',
    },
  },
}

export default antdTheme
