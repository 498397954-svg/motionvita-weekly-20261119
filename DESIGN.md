# 动力之巅周报：视觉与交互延续记录

## 必须保留

- 沿用用户认可的青蓝、暖橙、柔粉光影与全页鼠标柔光。
- 左上角复用上周周报的原版 `assets/brand-logo.png`：桌面显示框196×68，原图196×92居中，保持原始汉字、比例及文件字节。
- 首屏反光直接使用原图透明轮廓，不能改画山形、替换中文字体或把品牌形状液化。
- 经营数据、负责人原文、图表、原始配图完整保留。缺失数据留空。
- 本周与11月累计分开切换，原经营表仍按天猫字段。

## 本轮参考

用户提供的视频：

1. AI教练振轩：https://www.douyin.com/video/7667416314029411594
2. 发发华：https://www.douyin.com/video/7695385194093645090

已观察到的可用方向与本轮应用：

| 参考 | 吸收的方式 | 网页中的实际应用 |
| --- | --- | --- |
| Aceternity Animated Tabs / Floating Dock | 清晰选中态、平滑移动的选中底面、连续的内容切换 | 常驻渠道切换条、顶栏滑动玻璃底面、单渠道工作区 |
| React Bits / Uiverse | 轻量反馈、跟随光晕和可辨认的按钮状态 | 延续全页光影、保留阅读底色、按选择反馈控件 |
| Anime.js | 合理的缓动、渐入节奏、数值图形的连贯过渡 | 渠道头部轻量切换、经营柱形与对比条的过渡 |
| Liquid Glass JS | 玻璃边缘、背景透光与轻微色散的层次 | 渠道切换栏、图片查看工具栏、选中胶囊 |
| Shader Gradient | 连续色场与缓慢流动的空间感 | 保留已认可的整页渐变，维持正文稳定、清晰 |
| Liquid Logo | 材质反射的细腻变化 | 原版Logo轮廓内的缎面高光，文字与图形不变形 |
| React Three Fiber | 真实3D的交互方法 | 作为学习参考；本轮没有为经营汇报引入3D场景 |

官方参考入口：

- https://ui.aceternity.com/components/tabs
- https://ui.aceternity.com/components/floating-dock
- https://reactbits.dev/components/spotlight-card
- https://animejs.com/documentation/events/onscroll/
- https://uiverse.io/
- https://github.com/dashersw/liquid-glass-js
- https://github.com/ruucm/shadergradient
- https://github.com/collidingScopes/liquid-logo
- https://github.com/pmndrs/react-three-fiber

本轮以独立编写的原生CSS/JavaScript实现适合此周报的交互，没有声称安装或复制全部参考项目。

## 渠道工作区

- 按原稿顺序保留6组渠道内容。
- 默认单渠道查看，桌面固定切换条，手机下拉选择。
- 切换渠道保留阅读位置，再点当前渠道回到顶部。
- “全部展开”保留连续阅读；打印时始终输出全部渠道。
- 章节、搜索与数据详情中的原稿链接会先显示正确渠道。
- 渠道末尾保留上一渠道、下一渠道入口。
- URL可以直接定位渠道、章节或某张原稿图片。

## 配图查看

- 默认浏览本渠道配图，也可切换为全部配图。
- 提供缩略图、前后翻页、1—4倍放大、拖动和键盘操作。
- “回到原稿位置”定位到该图片本身及相邻文字。
- 原文件不裁切、不压缩、不改比例。
- 京东补充截图原有说明与图片关联相反，本轮仅交换两个图片引用，恢复为398元对应11.09—11.15，910元对应11.16—11.21；所有统计金额不变。

## 检查与发布

复用现有仓库 `498397954-svg/motionvita-weekly-20261119`。不上传源Word/Excel。发布前检查桌面、手机、图文完整性、渠道切换、深链接、图片查看与静态文件路径。等最新Pages任务成功，核对公开文件与本地文件一致后交付。
