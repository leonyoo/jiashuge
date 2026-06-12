# 家书鸽 · 美术方向与 Image2 Prompt 文档

> 这份文档是给"家书鸽"游戏的整体美术方案。提交给 Image2 时，把每一节 "Prompt" 区块直接复制过去即可。
> 所有画面以"温暖水彩 + 国风元素 + Q 版角色"为主调，目标是"让 8 岁的孩子和 70 岁的奶奶都觉得舒服"。

---

## 0. 总体美术方向

**关键词**：温暖水彩 / 国风手绘 / Q 版圆润 / 留白舒服 / 传统与现代融合

**情绪**：从容、慢、有仪式感、像翻开一本老相册。

**色板**（用于检查整体一致性）：
- 主色：墨青 `#7c9885`（鸽舍、按钮、链接）
- 辅色：陶土 `#c08566`（强调、CTA）
- 底色：宣纸 `#f7f1e1` / 米黄 `#f3ead2`（背景、卡片）
- 文字：墨色 `#3a342b`（正文）、灰墨 `#7a6f5c`（次要）
- 点缀：金黄 `#e7b75f`（高光、奖励、节日）
- 警示：朱红 `#c84a3a`（错误、丢失）

**字体建议**：
- 标题："Ma Shan Zheng" 或 "演示悠然小楷"（手写感）
- 正文：思源黑体 / 苹方 / 微软雅黑
- 数字：等宽字体（奖金额、距离）

**不要做**：
- 写实风格（容易让长辈觉得"严肃/不亲切"）
- 高饱和荧光色（视觉疲劳）
- 复杂多边形 UI（与"慢通信"调性冲突）
- 英文字符作为主要元素（国风为主）

---

## 1. Logo / 启动画面

### Prompt
```
A warm watercolor illustration, a chubby white pigeon holding a sealed letter
in its beak, perched on a wooden windowsill with a piece of old rice paper
unfurling behind it. Soft rice-paper texture background in cream color
(#f7f1e1), subtle ink wash mountains in the distance. The pigeon has
a small red ribbon around its neck. Logo text position reserved at
bottom-left corner. Style: Chinese ink-and-wash mixed with modern kawaii
illustration, rounded shapes, no harsh lines. Color palette: cream
background, moss green, clay orange, soft gold accents. Square format,
1024x1024, high detail, no people, suitable for app icon and splash
screen.
```

---

## 2. 鸽舍主场景（首页背景）

### Prompt — 早晨鸽舍
```
A cozy traditional Chinese courtyard pigeon loft at sunrise, watercolor
illustration. Stone floor, wooden lattice windows, several pigeons of
different colors (white, gray, brown, mottled) standing on the railing
and ground, a clay bowl of grain in the corner, a pair of old cloth
shoes by the door. Distant: faint ink mountains. Foreground: a long
wooden bench with a half-written letter and an ink brush. Lighting:
soft morning sun from the upper-left. Style: warm watercolor + ink
wash, rounded shapes, no harsh outlines, family-friendly. Aspect
9:16 (mobile vertical), high detail.
```

### Prompt — 夜晚鸽舍
```
Same courtyard at night, watercolor. A paper lantern glowing warm
orange hangs by the door, pigeons roosting on beams with eyes closed,
a crescent moon visible through the window lattice, stars softly
sprinkled. Quiet, peaceful mood. Same color palette, 9:16 vertical,
no people.
```

---

## 3. 10 种鸽子（Q 版头像，正面或 3/4 侧）

每只都是一个独立的 PNG/SVG 资产，需要时可以替换 SVG 实现。

### 通用风格 Prompt（替换 breed 名称）
```
A cute chubby kawaii pigeon in 3/4 front view, watercolor illustration.
Feather color: [FEATHER_COLOR]. Beak: small clay orange. Eyes: round
black with a tiny white highlight. Standing pose, looking slightly up
at the viewer with a curious expression. Body: round and soft, no
harsh outlines. Style matches the splash screen: Chinese ink-wash
influenced but rounded and friendly. Transparent background, 512x512,
centered.
```

| breed | 中文 | FEATHER_COLOR | 额外元素 |
|---|---|---|---|
| common | 普通鸽 | 灰绿 #b9c4a8 | 无 |
| racing | 赛鸽 | 雪白 #f5f0e1 | 颈上一圈浅蓝丝带 |
| homing | 归巢鸽 | 暖棕 #a87650 | 翅羽有横纹 |
| swift | 雨燕 | 墨黑 #3b3b3b | 体型略瘦，尾羽长而尖 |
| messenger | 传书鸽 | 雾蓝 #6c8aa6 | 颈挂小铜铃 |
| mottled | 花斑鸽 | 米黄底 + 棕斑 #dccab2 | 翅膀有豹纹斑点 |
| snow | 雪鸽 | 雪白 #fbfaf5 | 头顶一小撮金色羽冠 |
| lavender | 紫丁香鸽 | 淡紫 #c5b8d6 | 翅尖有银白色 |
| golden | 金羽鸽 | 金黄 #e7b75f | 全身有金色光泽 |
| phoenix | 凤凰鸽 | 朱红 #d65a3a | 尾羽长而华丽如火 |

---

## 4. 鸽粮（5 种）

### Prompt
```
A wooden feeding bowl viewed from slightly above, watercolor.
Inside: [FOOD_DESCRIPTION]. A few grains spilled on the wooden
surface. Soft warm lighting. 256x256, transparent background,
centered.
```

| id | 中文 | FOOD_DESCRIPTION |
|---|---|---|
| food-basic | 普通鸽粮 | small mixed grains (wheat, corn, millet), natural yellow-brown |
| food-nutri | 营养鸽粮 | colorful pellets with sunflower seeds, brighter palette |
| food-grain | 五谷杂粮 | a variety of whole grains: red beans, black rice, oats, barley |
| food-saffron | 藏红花粮 | golden saffron threads mixed with premium grains, luxury feel |
| food-cake | 生日蛋糕粮 | tiny decorated cake with cream and a single candle |

---

## 5. 信纸 + 邮票（6 + 5 种）

### Prompt — 信纸
```
A flat-laid stationery paper viewed from above, watercolor.
Background paper texture: aged [TEXTURE]. A thin [BORDER_COLOR]
border frame. Small [MOTIF] motif in the bottom-right corner. The
rest of the paper is empty (we will overlay text in the app). Aspect
3:4, 600x800, transparent background.
```

| id | 中文 | TEXTURE | BORDER_COLOR | MOTIF |
|---|---|---|---|---|
| paper-plain | 素白信纸 | rice paper, clean | #d6cdb4 | a tiny plum blossom |
| paper-bamboo | 竹纹信纸 | rice paper, faint green bamboo stripes | #9bb890 | small bamboo leaf |
| paper-river | 山水信纸 | aged paper, faint ink mountain watermark | #7a8470 | tiny mountain and boat |
| paper-classic | 复古信纸 | kraft brown paper, fiber texture | #8a6f4a | a small wax seal circle |
| paper-festive | 春节信纸 | red rice paper, gold-foil accents | #c84a3a | a small lantern |
| paper-moon | 中秋信纸 | midnight blue paper, gold moon | #3a5a7a | a small rabbit silhouette |

### Prompt — 邮票
```
A small rectangular stamp, watercolor, viewed flat. Center motif:
[CENTER_MOTIF]. Postage value placeholder in corner. Color
[STAMP_COLOR]. Perforated edges. Aspect 4:5, 240x300, transparent
background.
```

| id | 中文 | CENTER_MOTIF | STAMP_COLOR |
|---|---|---|---|
| stamp-common | 普通邮票 | a pigeon silhouette in flight | muted blue |
| stamp-flower | 花卉邮票 | a peony flower | soft pink |
| stamp-bird | 飞鸟邮票 | a homing pigeon with letter | moss green |
| stamp-paint | 名画邮票 | reproduction of "A Thousand Li of Rivers and Mountains" fragment | imperial gold and jade green |
| stamp-festive | 生肖邮票 | the current year's zodiac animal (placeholder: rabbit) | festive red |

---

## 6. 飞行小地图（中国轮廓）

### Prompt
```
A stylized illustrated map of China for a kids/family app, watercolor.
Land: warm cream #f3ead2 with subtle ink outlines of provincial
borders (very light, decorative). Surrounding sea: pale teal
#cfe1ea with a few simple wave patterns. City markers: small filled
circles in clay orange #c08566, each with a tiny landmark icon
above (we will overlay city names in app). A faint compass rose in
the top-right. Decorative elements: a few flying birds, a curved
trade-route dashed line from Beijing to Guangzhou. Aspect 9:16,
1080x1920, transparent background except land+sea. No text labels
in image (we add them in app).
```

---

## 7. 益智游戏图标（8 个，长辈端使用）

### Prompt — 通用
```
A simple icon in a rounded square (120x120), warm watercolor style,
cream background tile #f3ead2, soft 2px moss-green border. Center
motif: [MOTIF]. Use the project color palette only. Rounded
corners radius 24px. Suitable for older users: high contrast, big
shapes, no small text.
```

| game | MOTIF |
|---|---|
| memory-cards | two flipped-over cards with grape and plum icons |
| sequence | 4 numbered tiles 1-2-3-4 in a row |
| find-difference | two side-by-side circles, one with a small dot |
| daily-math | plus and equals signs with a small number |
| word-chain | two Chinese characters linked by a small chain |
| reminder-time | a simple analog clock at 10:10 |
| classic-poem | an unrolled scroll with a single character |
| family-photo | two overlapping polaroid photo frames |

---

## 8. UI 元素

### Tab Bar 图标（5 个，48x48 描边风）
- 鸽舍：小屋 + 鸽剪影
- 学习：书 + 笔
- 写信：信封 + 心
- 信箱：信箱标志（双层）
- 我：圆形头像占位

### 通用按钮
```
Three button states in a row: default (filled moss green #7c9885
with cream text), pressed (slightly darker), disabled (gray with
50% opacity). Rounded rectangle, 280x88, no harsh shadow, soft
inner highlight at top. Watercolor paper texture overlay (very
subtle, 10% opacity).
```

### 金币图标
```
A single round gold coin viewed from 3/4 angle, watercolor.
Front: embossed character "福" or a pigeon silhouette. Soft
shadow below. 64x64, transparent background.
```

---

## 9. 头像占位（10 个，用户可随机/自选）

### Prompt
```
A round avatar with cream background #f3ead2, watercolor
illustration, simple [SUBJECT]. Suitable for users aged 8 to 80:
warm, friendly, no scary or complex elements. 256x256 round crop.
```

可选 subject：白鸽、灰鸽、棕鸽、燕子、小猫、熊猫、小老虎、荷花、梅花、山水

---

## 10. 长辈端专属

### 大字模式示例
```
A flat screenshot of a phone screen in elder mode: a giant
centered "收件箱" button taking 60% of vertical space, very
large text (32pt+), high contrast. Color: cream background,
moss green button, dark ink text. Style: minimal, no decoration,
maximum readability.
```

### TTS 念信图标
```
A simple speaker icon inside a moss-green circle, watercolor.
Sound waves emanating, simple and clear. 128x128, transparent.
```

---

## 11. 制作注意事项

- 所有资产留出可叠加文字的空间（信纸、邮票、地图）
- 全部使用透明背景（PNG/SVG），便于在 Vue 组件里组合
- 同一只鸽子需要 3 个状态：站立 / 行走 / 飞行（飞行版翅膀展开）
- 信纸需要的尺寸是 3:4（可被信封套住）
- 颜色不要饱和度过高，符合"米黄宣纸"调
- 输出尺寸建议：图标 256+，插画 1024+，地图 1080x1920