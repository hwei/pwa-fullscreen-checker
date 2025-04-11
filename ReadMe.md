# PWA Fullscreen Checker

这是一个用于测试和验证 PWA（渐进式网页应用）全屏显示效果的测试工具。它可以帮助开发者检查 PWA 在不同设备和屏幕方向下的显示效果，特别是全屏模式下的安全区域和屏幕尺寸。

## 功能特点

- 演示了如何在异形屏幕设备（包括刘海屏、挖孔屏等）中，使用 PWA 创建覆盖全屏的 Canvas，并绘制出安全区域
- 在桌面版浏览器中，模拟手机设备的显示效果
- 禁止页面上下滚动
- 通过检测屏幕像素比（DPR），让 Canvas 的像素与真实设备像素对应
- 支持横竖屏切换检测
- 适配不同设备（iOS、Android 等）

## 使用方法

1. 将项目部署到支持 HTTPS 的服务器上。比如[这个](https://pwa-fullscreen-checker.vercel.app/)
2. 在移动设备上访问网站
3. 将网站添加到主屏幕（Add to Home Screen）
4. 从主屏幕启动应用，即可进入 PWA 全屏模式

# 屏幕内容说明
- 黄色的框：Canvas 中绘制的边缘
- 淡蓝色的区域：Canvas 中绘制的安全区域
- 屏幕正中心的半透明白色方块区域：验证Canvas 像素与设备真实像素一一对应的图形。
  - 对于高分辨率的手机，需要截图放大观察，验证这个区域的绘制是像素对齐的。
- 左上角文字：debug 信息。非 Canvas 绘制。

# Mock Device
- `#mock-device` 的 width, height 以及 `#bezel` 的 width, height, left, top 数据，来源于 Figma。
  - 新建一个文件，Assets 搜索 iPhone 15 Pro。然后 Insert instance。
  - 从 `iPhone 15 Pro` 节点，获取 `#mock-device` 的 width, height。
  - 从 `iPhone 16 Pro - Black Titanium - Portrait` 获取 `#bezel` 的 width, height, left, top 数据。
- `#bezel` 的图片，来源于 [mockuphone.com](https://mockuphone.com/model/iphone-15/)。
- `#mock-safe-area` 的数据，来源于 [iPhone 15 Screen Sizes](https://useyourloaf.com/blog/iphone-15-screen-sizes/)。