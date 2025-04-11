const isPC = isDesktopBrowser();
const isPwaMode = getIsPwaMode();
const canvas = document.getElementById('canvas');      
const safeArea = document.getElementById('safe-area');
const mockSafeArea = document.getElementById('mock-safe-area');
const mockDevice = document.getElementById('mock-device');
const mockMaximizeButton = document.getElementById('mock-maximize-button');

let isMockMaximized = false;
if (isPC && !isPwaMode) {
  // 按下 mockMaximizeButton 时，设置 mockDevice 的 zoom，让它左右或上下顶到页面边缘
  mockMaximizeButton.addEventListener('click', () => {
    isMockMaximized = !isMockMaximized;
    mockMaximizeButton.classList.toggle('active');
    scheculeResizeCanvas();
  });
} else {
  mockDevice.style.display = 'none';
  mockMaximizeButton.style.display = 'none';
}

// 创建 ResizeObserver 实例监听 safeArea 尺寸变化
const safeAreaObserver = new ResizeObserver(scheculeResizeCanvas);

// 开始监听 safeArea
safeAreaObserver.observe(safeArea);
safeAreaObserver.observe(mockSafeArea);

// 监听方向变化事件
window.addEventListener('orientationchange', scheculeResizeCanvas);

// 同时监听 resize 事件作为补充
window.addEventListener('resize', scheculeResizeCanvas);

let orientationChangeTimeout;

function scheculeResizeCanvas() {
  // 清除之前的定时器
  clearTimeout(orientationChangeTimeout);
  
  // 设置新的定时器，延迟执行以确保方向已经稳定
  orientationChangeTimeout = setTimeout(resizeCanvasToDiv, 10);
}

function resizeCanvasToDiv() {
  if (isMockMaximized) {
    const modeDeviceWidth = pxToNumber(getComputedStyle(mockDevice).width);
    const modeDeviceHeight = pxToNumber(getComputedStyle(mockDevice).height);

    const scaleX = window.innerWidth / modeDeviceWidth;
    const scaleY = window.innerHeight / modeDeviceHeight;
    const scale = Math.min(scaleX, scaleY);

    mockDevice.style.transform = `scale(${scale}, ${scale})`;
    mockDevice.style.left = `${(window.innerWidth - modeDeviceWidth) / 2}px`;
    mockDevice.style.top = `${(window.innerHeight - modeDeviceHeight) / 2}px`;
    
  } else {
    mockDevice.style.top = '';
    mockDevice.style.left = '';
    mockDevice.style.transform = '';
  }

  const orientation = getOrientation();
  let rectCanvas = new DOMRect();
  let rectSafeArea = safeArea.getBoundingClientRect();
  if (isPC) {
    if (isPwaMode) {
      rectCanvas.width = window.innerWidth;
      rectCanvas.height = window.innerHeight;
    } else {
      // PC 浏览器模式，使用 mock-device
      rectCanvas = integerizeDOMRect(mockDevice.getBoundingClientRect());
      rectSafeArea = integerizeDOMRect(mockSafeArea.getBoundingClientRect());
      rectSafeArea.x -= rectCanvas.x;
      rectSafeArea.y -= rectCanvas.y;
    }
  } else {
    if (isPwaMode) {
      if (orientation === 'portrait') {
        rectCanvas.width = window.screen.width;
        rectCanvas.height = window.screen.height;
      } else if (orientation === 'landscape') {
        rectCanvas.width = window.screen.height;
        rectCanvas.height = window.screen.width;
      } else {
        rectCanvas.width = window.innerWidth;
        rectCanvas.height = window.innerHeight;
      }
    } else {
      rectCanvas.width = window.innerWidth;
      rectCanvas.height = window.innerHeight;
    }
  }

  const dpr = window.devicePixelRatio || 1;
  
  updateDebugInfo(rectCanvas, rectSafeArea, dpr, orientation);

  // 设置 canvas 绘图表面的实际宽度和高度，考虑设备像素比
  canvas.width = rectCanvas.width * dpr;
  canvas.height = rectCanvas.height * dpr;

  // 调整 canvas 的 CSS 尺寸以匹配显示尺寸
  canvas.style.marginLeft = `${rectCanvas.x}px`;
  canvas.style.marginTop = `${rectCanvas.y}px`;
  canvas.style.width = `${rectCanvas.width}px`;
  canvas.style.height = `${rectCanvas.height}px`;

  drawContent(rectSafeArea, dpr);
}

function drawContent(safeAreaRect, dpr) {
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  
  // 绘制半透明蓝色方块
  ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
  ctx.fillRect(
    safeAreaRect.left * dpr,
    safeAreaRect.top * dpr,
    safeAreaRect.width * dpr,
    safeAreaRect.height * dpr
  );

  // 左下角绘制文字 test
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.imageSmoothingEnabled = false;  // 关闭抗锯齿
  ctx.fillText('test', 10, canvas.height / 2);

  // 屏幕中间 10px * 10px 区域绘制纱窗状的白色像素点
  const centerX = Math.floor(canvas.width / 2);
  const centerY = Math.floor(canvas.height / 2);
  ctx.fillStyle = 'white';
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillRect(centerX - 5 + i, centerY - 5 + j, 1, 1);
      }
    }
  }
}

function updateDebugInfo(rectCanvas, rectSafeArea, dpr, orientation) {
  const pcMockMobileModeLine = isPC ? 'Desktop Emulation Mode: true' : 'Desktop Emulation Mode: false';
  const pwaModeLine = (isPwaMode ? 'PWA mode: true' : 'PWA mode: false');
  const canvasLine = `Canvas: X: ${rectCanvas.x}, Y: ${rectCanvas.y}, W: ${rectCanvas.width}, H: ${rectCanvas.height}`;
  const safeAreaLine = `Safe Area: X: ${rectSafeArea.left}, Y: ${rectSafeArea.top}, W: ${rectSafeArea.width}, H: ${rectSafeArea.height}`;
  const dprLine = `dpr: ${dpr}`;
  const orientationLine = `orientation: ${orientation}`;
  document.getElementById('debug-text').textContent = [pcMockMobileModeLine, pwaModeLine, canvasLine, safeAreaLine, dprLine, orientationLine].join('\n');
}

function getIsPwaMode() {
  // 检查是否在独立窗口中运行（PWA 模式）
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://')) {
    return true;
  }
  return false;
}

function isDesktopBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();
  // 检查是否为桌面浏览器
  const isDesktop = !/android|webos|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile|mobile/i.test(userAgent);
  // 检查是否为平板设备
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  return isDesktop && !isTablet;
}

function pxToNumber(px) {
  return parseInt(px.replace('px', ''));
}

function integerizeDOMRect(rect) {
  return new DOMRect(
    Math.round(rect.x),
    Math.round(rect.y),
    Math.round(rect.width),
    Math.round(rect.height)
  );
}

function getOrientation() {
  if (window.orientation !== undefined) {
    // iOS 设备
    return Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
  } else if (screen.orientation) {
    // 支持 ScreenOrientation API 的设备
    switch (screen.orientation.type) {
      case 'portrait-primary':
      case 'portrait-secondary':
        return 'portrait';
      case 'landscape-primary':
      case 'landscape-secondary':
        return 'landscape';
      default:
        return 'unknown';
    }
  } else {
    // 其他设备，通过宽高比判断
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
} 