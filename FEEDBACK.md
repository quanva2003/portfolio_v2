# Feedback — vòng 1 (2026-09-08)

Sáu điểm feedback, đã kiểm chứng từng cái trực tiếp trên code + trên browser
(Playwright, dev server ở `localhost:3000`, viewport 1440 và 390). Không có
điểm nào bị bác bỏ — **cả 6 đều đúng**, và điểm số 6 nghiêm trọng hơn mô tả ban
đầu.

Mỗi mục có: **Kết luận kiểm chứng** (bằng chứng), **Prompt** (dán thẳng cho
agent để làm), và **Cần mày cung cấp** khi có thông tin agent không được phép
đoán.

Prompt viết bằng tiếng Anh vì toàn bộ code, comment và content trong repo là
tiếng Anh — output phải khớp giọng văn sẵn có.

**Đã chốt với mày (2026-09-08):**

- F3 → nhãn đổi thành **"Projects"**
- F1 → icon là **chỉ chữ Q**, không phải monogram VAQ
- F2 → ảnh mặt đặt ở **Hero, cạnh tên**
- F4 → **không được public screenshot** 3 sản phẩm của Dan Solutions → dựng
  **mockup gốc** có gắn nhãn; riêng Comzone dùng ảnh thật

**Chốt thêm vòng 2:**

- C1 → CV **cho tải công khai**, giữ trong `public/` và gắn link download
- F2 → ảnh mặt **tách nền**, không đen trắng, không duotone
- F4 → **được dùng** 4 ảnh Panda từ panda.vn
- F7 → **giữ Skyline**, **không** thêm Panda CMS (chưa release)

**Cập nhật vòng 2 (cùng ngày):** mày đã gửi asset. Xem
[Vòng 2](#vòng-2--asset-đã-nhận-và-những-gì-thay-đổi) ở cuối — có **1 cảnh báo
bảo mật cần xử lý trước mọi thứ khác**, và một phát hiện lớn: **CV của mày giàu
hơn site rất nhiều**.

**Không còn câu hỏi nào chặn.**

**TRẠNG THÁI: cả 8 mục ĐÃ LÀM XONG** (C1, F1, F2, F3, F4, F5, F6, F7).

Còn duy nhất một việc tuỳ chọn: ảnh Comzone hiện là bản 531×767, hơi mềm ở hero
trang case study. Có export Figma 2x thì thả vào `design/source/comzone/` rồi
chạy `node scripts/prepare-project-media.mjs`.

**Thứ tự đề xuất:** C1 → F6 → F3 → F7 → F1 → F2 → F4 (F5 đã gộp vào F7).

---

## C1 — CẢNH BÁO: `TamdaLogistic.png` chứa dữ liệu khách hàng thật

**Đây là việc cần làm trước tiên. Không phải feedback của mày — tao phát hiện
khi mở file.**

`public/assets/TamdaLogistic.png` là ảnh chụp màn hình **console dispatch
production đang đăng nhập**. Nội dung nhìn thấy được:

| Loại dữ liệu   | Ví dụ trong ảnh                                                                   |
| -------------- | --------------------------------------------------------------------------------- |
| Họ tên khách   | Nguyen Van Tuan, Pham Thi Lua, Phạm Anh Hùng, Michal Slanař, Jana Nguyenová       |
| Địa chỉ đầy đủ | Revoluční 365, Mrštíkova 1122, Hartigova 863/57 Praha 3, Dejvická 188             |
| Số điện thoại  | 775436017, 777792288, 720030979, 723456859, 606816995, 721860144                  |
| Số tiền đơn    | 15.070,7 Kč · 9.462,9 Kč · 3.500,6 Kč · 7.135,2 Kč                                |
| URL nội bộ     | `logi.tamdaexpress.eu/db34ff6c-3f8b-4a08-a8f3-3b192561c4cc/order-dispatch-center` |
| Của chính mày  | Toàn bộ tab và bookmark trình duyệt                                               |

Đây là PII của người thật ở EU, tức là phạm vi **GDPR**. Không phải chuyện
"che vài chỗ" — gần như mọi ô trong bảng đều là PII; che hết thì còn lại một
tấm ảnh trắng.

**Rủi ro cụ thể:** Next.js serve toàn bộ `public/` ra web tĩnh. Commit + deploy
là file live ngay tại `https://<domain>/assets/TamdaLogistic.png`, ai cũng tải
được, và Google index được. Hiện **chưa commit** (`public/assets/` còn untracked
— tao đã kiểm tra), nên chưa lộ. Nhưng đây là thứ chỉ cần một lần `git add .`
là xong.

### Việc cần làm

```
public/assets/ currently holds source material that must never be served.
Next.js publishes everything under public/ as static files, so committing this
directory would expose it at https://<domain>/assets/<filename>.

1. Move the source images out of public/ into a directory that is NOT served —
   `design/source/` at the repo root is fine — and add it to .gitignore. Only
   processed, cleared, web-ready derivatives belong in public/. This applies to
   TamdaLogistic.png and to F2.jpg (the raw portrait); the CV PDF stays, see 3.
2. TamdaLogistic.png must never be committed, published, or used as portfolio
   imagery in any form, redacted or otherwise. It shows a logged-in production
   dispatch console containing named EU customers, full street addresses, phone
   numbers, per-order amounts, and an internal tenant URL. Keep it strictly as a
   local layout reference for drawing an original mockup.
3. DECIDED: VanAnhQuan_FrontendDeveloper.pdf stays in public/ and IS meant to be
   publicly downloadable. Right now nothing links to it, so it is an
   unadvertised file rather than a feature. Wire it up properly:
   - Add the path to content/contact.ts (or a `resume` field on SiteMeta) with a
     human label, so no copy is inlined in JSX — the convention this repo
     already follows everywhere.
   - Surface a download link in components/ContactFooter.tsx alongside the
     GitHub / LinkedIn / phone pills. Fix F6 FIRST — those pills are currently
     broken, and adding a fourth to a broken row just widens the bug.
   - Give the anchor a `download` attribute and an accessible name that says it
     is a PDF and how big it is, so nobody clicks blind.
   - Consider a stable public filename (e.g. /assets/van-anh-quan-cv.pdf): the
     current name is fine, but once a recruiter has the link it should not move.
   - Add the file to the Person structured data in components/StructuredData.tsx
     if a suitable property applies, and confirm app/sitemap.ts and
     app/robots.ts treat it the way you want (indexed or not).
4. Add a guard so this cannot recur: a check that fails the build (or a
   pre-commit hook) if public/ gains a file over a size threshold that has not
   been explicitly allowlisted. Reference: app/sitemap.ts and app/robots.ts
   already treat the public surface as something with rules.
```

**Mày đã chốt:** CV **cho tải công khai** → giữ trong `public/`, gắn nút download
ở phần Contact (làm sau F6). `TamdaLogistic.png` và `F2.jpg` chuyển ra
`design/source/` và gitignore.

---

## F6 — 3 nút Contact bị lệch CSS

**Kết luận: ĐÚNG, và là bug thật, nặng hơn "lệch".** Không phải lệch — 3 nút bị
ép sai chiều rộng, chữ tràn ra ngoài viền, và nút số điện thoại vỡ thành 4 dòng.

Đo thực tế tại 1440px (`#contact ul li a`):

| Nút             | Rộng hiện tại | Rộng đúng | Cao hiện tại | Cao đúng |
| --------------- | ------------- | --------- | ------------ | -------- |
| GitHub          | 75.19px       | 93.80px   | 43px         | 43px     |
| LinkedIn        | 75.19px       | 104.30px  | 43px         | 43px     |
| +84 941 697 009 | 75.19px       | 176.00px  | **106px**    | 43px     |

Cả ba đều đúng 75.1875px — vì đó không phải chiều rộng nội dung, mà là một giá
trị bị áp từ bên ngoài.

### Nguyên nhân gốc

`styles/globals.css:89` khai báo:

```css
--spacing-block: clamp(2.5rem, 2rem + 3vw, 5rem);
```

Tailwind v4.3 (repo đang ở `tailwindcss@4.3.2`) có nhóm utility logical-size
`inline-*` → `inline-size`, đọc giá trị từ namespace `--spacing` và
`--container`. Vì `--spacing-block` tạo ra key `block` trong namespace
`--spacing`, Tailwind sinh thêm một utility **`inline-block`** nghĩa là
`inline-size: var(--spacing-block)` — **trùng tên với utility `display:
inline-block`**.

CSS build ra chứa cả hai rule, và rule width nằm sau nên thắng:

```css
/* dòng 991 */
.inline-block {
  display: inline-block;
}
/* dòng 2099 — cái này thắng */
.inline-block {
  width: var(--spacing-block);
}
```

Kiểm chứng số học: tại viewport 1440px, `2rem + 3vw` = `32 + 43.2` =
**75.2px** — khớp chính xác 75.1875px đo được. Tại 390px, clamp về min `2.5rem`
= 40px, border-box nở lên 50px vì padding `px-6` = 48px.

Đã xác nhận không liên quan JS: tắt JavaScript hoàn toàn, số đo y hệt. Thêm
override `.inline-block { inline-size: auto }` thì cả 3 nút về đúng ngay.

### Bán kính ảnh hưởng — KHÔNG chỉ ở Contact

Mọi chỗ dùng class `inline-block` trong repo đều đang dính:

- [components/ContactFooter.tsx:38](components/ContactFooter.tsx#L38) — GitHub
- [components/ContactFooter.tsx:50](components/ContactFooter.tsx#L50) — LinkedIn
- [components/ContactFooter.tsx:60](components/ContactFooter.tsx#L60) — phone
- [components/motion/Magnetic.tsx:66](components/motion/Magnetic.tsx#L66) — wrapper
  span của **mọi** control có magnetic effect, nên vùng hover/magnetic cũng sai
- [app/not-found.tsx:32](app/not-found.tsx#L32) — nút "Back to the portfolio",
  đo được **75.2 × 106px** (vỡ 4 dòng y hệt), và `w-fit` trên cùng element đó
  **không cứu được** vì rule `.inline-block` đứng sau `.w-fit` trong file CSS

### Prompt

```
In styles/globals.css, the theme token `--spacing-block` collides with a
Tailwind v4.3 utility name and breaks every element using the `inline-block`
class site-wide.

Mechanism: Tailwind v4.3 generates logical-size utilities `inline-*` →
`inline-size`, sourced from the `--spacing` and `--container` theme namespaces.
Declaring `--spacing-block` registers a `block` key in that namespace, so
Tailwind emits `.inline-block { inline-size: var(--spacing-block) }` alongside
the built-in `.inline-block { display: inline-block }`. The width rule is
emitted later in the compiled sheet and wins, forcing every `inline-block`
element to clamp(2.5rem, 2rem + 3vw, 5rem) wide. Confirmed with JS disabled, so
it is purely a CSS-cascade collision.

Fix the token, not the call sites. Rename `--spacing-block` to a name that
cannot collide with a Tailwind utility suffix (`--spacing-stack` is a good
candidate — verify `inline-stack` and `block-stack` are not Tailwind utility
names before committing to it, and do the same check for `--spacing-gutter` and
`--spacing-section` while you are in there).

Update every consumer of the renamed token across the repo (search for
`-block` in className strings: `mt-block`, `py-block`, `pb-block`, `gap-block`,
and any others), plus the comment at styles/globals.css:89.

Then add a regression guard so this class of collision cannot come back
silently. An e2e spec in e2e/ is the right place: assert that the three contact
pills in #contact each render on a single line (height === 43px at the 1440
desktop viewport) and that their widths differ from each other — three equal
widths is the exact signature of this bug. Follow the conventions in the
existing specs (e2e/seo.spec.ts, e2e/motion.spec.ts).

Verify: `yarn build`, then measure #contact ul li a at 1440px. Expected widths
are approximately GitHub 93.8, LinkedIn 104.3, phone 176.0, all at height 43.
Also re-check app/not-found.tsx's button and Magnetic's wrapper span.
```

**Cần mày cung cấp:** không có. Làm được ngay.

---

## F1 — Chưa có icon riêng cho mày

**Kết luận: ĐÚNG (gần như hoàn toàn).** Có tồn tại một mark, nhưng nó là mark
sinh tự động, không phải identity:

- [app/icon.svg](app/icon.svg) — một ô vuông cam `#f75a2c` với chữ **V** khoét
  ra bằng màu nền. Chỉ có thế.
- [app/apple-icon.png](app/apple-icon.png) (180×180) và
  [app/favicon.ico](app/favicon.ico) — do
  [scripts/generate-brand-assets.mjs](scripts/generate-brand-assets.mjs) sinh ra
  từ chính chữ V đó.
- Trong UI: [components/SiteHeader.tsx:15](components/SiteHeader.tsx#L15) chỉ
  render text `"VAQ"` (`content/ui.ts` → `wordmark`). Không có icon nào.
- Không có logo, không có monogram lockup, không có mark ở footer, không có mark
  trên OG card ngoài chữ.

Nói cách khác: mày có 1 favicon chữ V mặc định, chứ chưa có bộ nhận diện.

### Prompt

```
The site has no identity mark of its own. The only mark that exists is
app/icon.svg — an orange square with a plain "V" knocked out — which
scripts/generate-brand-assets.mjs also derives the apple icon and favicon from.
In the UI, components/SiteHeader.tsx renders the bare text "VAQ" with no mark
at all.

DECIDED: the mark is a single letter Q — not a VAQ monogram, not an abstract
glyph. One letter survives the 16px favicon size that three letters do not.

Design and build a personal identity mark, then wire it through the whole
surface:

1. An SVG Q mark, drawn to the existing design system rather than invented from
   scratch: the ember accent (--color-ember #f75a2c), the sharp-surface /
   pill-control shape rule documented at the top of styles/globals.css, and
   Archivo's expanded (wdth 125) display voice. It must read at 16px as a
   favicon and at large size in the header. The Q's tail is the one place this
   mark can carry a signature — treat it as the design problem, not an
   afterthought, and let it engage the counter or break the enclosing shape.
2. Ship it as a reusable component (components/Mark.tsx) with a size prop, as
   inline SVG so it inherits currentColor and needs no network request.
3. Replace the bare "VAQ" text lockup in components/SiteHeader.tsx with the
   mark. Keep an accessible name on the link.
4. Regenerate app/icon.svg, app/apple-icon.png and app/favicon.ico from the new
   mark via scripts/generate-brand-assets.mjs, and put the mark on the OG card
   the same script renders.
5. Add the mark to the footer next to the copyright line in
   components/ContactFooter.tsx.

Keep it monochrome-capable: it must work in fg, in ember, and knocked out of
ember, since it appears on ink, on raised, and on the OG card.
```

**Mày đã chốt:** concept là **chỉ chữ Q**.

**Còn mở (tao sẽ hỏi khi bắt tay vào làm, không chặn):**

1. Header giữ chữ "VAQ" cạnh icon Q, hay chỉ icon Q trần?
2. Tao sẽ dựng 2–3 phương án Q rồi cho mày chọn, không tự quyết.

---

## F2 — Không có chỗ để ảnh mặt

**Kết luận: ĐÚNG, tuyệt đối.** Không có một tấm ảnh nào trong toàn site:

- `grep -rn "next/image|<Image|avatar|portrait|photo|headshot"` trên
  `app/ components/ content/ lib/` → **0 kết quả**.
- [public/](public/) chỉ chứa `og.png` (card social sinh tự động) và 4 file SVG
  mặc định của Next.js (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
  `window.svg`) — không cái nào được import ở đâu cả.
- [components/About.tsx](components/About.tsx) là một khối text thuần: heading,
  2 đoạn văn, 1 dòng học vấn. Không có cột ảnh, không có slot.
- [components/Hero.tsx](components/Hero.tsx) cũng chỉ có chữ.

### Prompt

```
The site contains zero photography — there is no next/image import anywhere in
app/, components/, content/ or lib/, and public/ holds only the generated og.png
plus unused Next.js starter SVGs. components/About.tsx is a pure text block.

DECIDED: the portrait goes in the HERO, beside the name — not in About. The
source is design/source/F2.jpg (1086x1448, studio shot on a flat grey ground,
navy polo, three-quarter turn with the gaze toward the viewer's left).

DECIDED: cut the background out. Do not ship the grey ground, and do not convert
to black and white or duotone. The subject is knocked out onto the page's own
ink, so the navy shoulders fall away into the dark and the face carries the
composition.

Two things to get right in the cutout, because both are visible at hero size:
- The hair edge. Dark hair on a grey ground mattes badly with a hard threshold —
  expect a jagged rim or a light halo. Refine the edge rather than accepting the
  first mask.
- The shoulders. Navy on near-black means a hard bottom boundary reads as the
  subject being sliced off mid-air. Fade the lower edge out instead of cutting
  it, so the figure resolves into the page.
Export PNG with a real alpha channel (not JPG), then let next/image derive the
AVIF/WebP variants.

Also: he is looking toward the viewer's LEFT. Put the portrait on the RIGHT of
the name so the gaze travels into the content. Mirroring the layout would have
him looking off the edge of the page, which reads as inattentive.

Add it, properly:

1. Add a `portrait` field to SiteMeta in content/types.ts (src, alt, width,
   height) and populate it in content/site.ts. Keep it out of JSX, matching how
   every other string in this repo is handled. The processed PNG goes in
   public/; the raw F2.jpg stays out of public/ (see C1).
2. Rework components/Hero.tsx. It is currently `min-h-dvh flex flex-col
   justify-end` with a bottom-anchored text stack: location, the display-xl
   name, then title + tagline. Introduce the portrait beside the name without
   losing that bottom-anchored composition or the full-viewport height.
   Below md the portrait must not push the name off a phone screen — decide
   between stacking it above the location line or scaling it down, and say
   which you chose and why.
3. This portrait becomes the LCP element. Use next/image with explicit
   width/height, `priority`, AVIF/WebP, and a `sizes` that does not over-fetch
   on mobile. Verify the LCP has not regressed afterwards — the repo already has
   lighthouse in devDependencies and Phase 6 spent real effort on bytes.
4. Three motion contracts already own this section; do not break any of them:
   - `data-split` on the h1 (SplitText masks the words, opacity lifted in
     SectionMotion's onSplit) and `data-reveal` on the surrounding blocks.
     One animation owner per element — the portrait gets its own [data-reveal],
     it does not share an ancestor with the h1.
   - The Preloader (components/motion/Preloader.tsx) covers a cold load and the
     `preloading` class is set by the inline script in app/layout.tsx. The
     portrait must be part of what the preloader actually waits on, otherwise
     it pops in after the curtain lifts.
   - The WebGL background renders behind the hero. Check the portrait reads
     against it at every viewport, and that it still reads on the reduced device
     tier where WebGLMount never loads the three.js chunk.
5. Treat the portrait as a design element, not a stock headshot slot: frame it
   with the same shape rule as ProjectMedia (rounded-media, border-line,
   bg-raised) so it belongs to the system.
6. Add the portrait to the Person structured data in
   components/StructuredData.tsx via the `image` property, and put it on the OG
   card that scripts/generate-brand-assets.mjs renders.
```

**Mày đã chốt hết:** vị trí **Hero, cạnh tên** · xử lý **tách nền** · file đã
nhận. Không còn gì chặn.

Crop tao tự quyết theo bố cục: ảnh gốc đã là 3/4 người (đầu + vai), tách nền
xong thì fade vai xuống dưới nên không cần crop cứng — khung sẽ do layout Hero
quyết định chứ không phải do tỉ lệ ảnh.

---

## F3 — Sao lại là "Selected Work" mà không phải "Projects"?

**Kết luận: ĐÚNG là đang dùng "Selected Work".** Nguồn:
[content/ui.ts:26](content/ui.ts#L26) → `sections.work: "Selected Work"`.

Về lý do: "Selected Work" là quy ước của portfolio designer/studio, hàm ý "đây
là phần tao chọn lọc để trình bày, không phải toàn bộ". "Projects" thì trực
diện và quen thuộc hơn với recruiter kỹ thuật. Không có cái nào sai — nhưng
đúng là với hồ sơ front-end dev có **4 dự án và cả 4 đều hiển thị**, chữ
"Selected" đang hứa một sự chọn lọc không thực sự tồn tại. Theo nghĩa đó
feedback của mày có lý.

Tin tốt: đổi cực rẻ vì không có chuỗi nào hard-code trong JSX — tất cả đi qua
`content/ui.ts`.

### Prompt

```
Rename the work section's heading. Right now content/ui.ts sets
`sections.work: "Selected Work"`, which promises a curation the site does not
actually perform — all four entries in content/projects.ts render.

Change the label to "Projects". Because every string routes through
content/ui.ts, this is a one-line content change, but check the whole surface
for copies that did not come from that module:

- content/ui.ts — sections.work, and navLinks (the nav item currently reads
  "Work"; make it "Projects" too so the nav and the heading it scrolls to agree)
- components/SelectedWork.tsx — the aria-labelledby heading id is "work-heading"
  and the section id is "work"; the "/#work" anchor is referenced in
  content/ui.ts navLinks and in app/(site)/work/[slug]/page.tsx's back link
- ui.project.back currently reads "All work" — "All projects"
- e2e/ specs and app/sitemap.ts for any hardcoded copy or anchors

Do NOT change the /work/<slug> route segment or the #work anchor id — the label
is copy, the URL is an interface. Changing the route would break the sitemap,
the canonical URLs and any existing inbound links. Leave the component filename
components/SelectedWork.tsx alone too, or rename it in its own commit so the
copy change stays reviewable.

Run the e2e suite afterwards.
```

**Mày đã chốt:** nhãn là **"Projects"**. Không còn gì chặn — làm được ngay.

---

## F4 — Dự án chưa lột tả hết + chưa có ảnh minh họa

**Kết luận: ĐÚNG cả hai vế.**

**Vế ảnh — đúng 100%, và code tự thừa nhận.**
[components/ProjectMedia.tsx](components/ProjectMedia.tsx) là placeholder chữ:
nó render tên project bằng Archivo trong một khung `bg-raised`. Trong file có
sẵn hai dòng:

> `Still a typographic placeholder. Real screenshots drop into this same fixed-aspect frame with zero layout shift.`
> `{/* TODO: real product screenshot for this project mounts here */}`

Component này được dùng ở **cả** grid ngoài home
([components/SelectedWork.tsx](components/SelectedWork.tsx)) **và** hero của
case study ([app/(site)/work/[slug]/page.tsx](<app/(site)/work/%5Bslug%5D/page.tsx>)),
nên toàn bộ 4 dự án × 2 vị trí đều là ô chữ. Điểm cộng: khung đã cố định
aspect-ratio sẵn (21/9 flagship, 4/3 card), nên nhét ảnh vào **không gây layout
shift** — hạ tầng đã sẵn sàng, chỉ thiếu ảnh.

**Vế nội dung — đúng, nhưng không đều.** Độ sâu chênh lệch rõ giữa các dự án:

| Project        | highlights | stack | `shipped` | `results` | description    |
| -------------- | ---------- | ----- | --------- | --------- | -------------- |
| Panda ERP      | 3          | 5     | 5         | 3         | 2 câu          |
| Tamda Shipment | 2          | 5     | 4         | 2         | 1 câu          |
| Comzone        | 2          | 6     | 4         | 2         | 1 câu          |
| **Skyline**    | **1**      | **3** | 4         | 2         | **1 câu ngắn** |

Skyline là mỏng nhất rõ rệt — description chỉ đúng một dòng ("A mobile app for
school communication, built with React Native, NativeWind and Zustand"), một
highlight duy nhất, và cái highlight đó ("Cross-platform mobile app built with
React Native") mô tả công nghệ chứ không mô tả việc mày làm.

Vấn đề sâu hơn: **toàn bộ `results` đều định tính, không có số nào.** Đây là do
cố ý — [content/types.ts:12](content/types.ts#L12) ghi rõ:

> `Deliberately qualitative: every line here traces back to the CV, so no invented metrics creep in. Swap results for sourced numbers when they're available.`

Nghĩa là chỗ để số liệu đã chừa sẵn, chỉ chờ mày cấp số thật.

### Prompt

```
Two gaps in the work section, both already anticipated by the code.

PART A — project imagery.
components/ProjectMedia.tsx is still the typographic placeholder its own
comments admit to ("Still a typographic placeholder", "TODO: real product
screenshot for this project mounts here"). It backs both the home grid
(components/SelectedWork.tsx) and the case-study hero
(app/(site)/work/[slug]/page.tsx), so all four projects show a text tile in two
places each.

CONSTRAINT — READ THIS BEFORE TOUCHING ANY IMAGE. The rule is per project, and
it is not the same rule for all four.

- panda-erp: APPROVED, use the real screenshots. Panda is Dan Solutions' OWN
  product and they publish these on their own marketing site, panda.vn. Four
  assets, all 2360x1640 except the last:
    /images/app-screenshots/panda-ipad/ipad-01-pos-table-management.jpg
    /images/app-screenshots/panda-ipad/ipad-02-pos-menu-ordering.jpg
    /images/app-screenshots/panda-ipad/ipad-05-kds-orders-by-table.jpg
    /images/app-screenshots/panda-app-screenshots/01-hero-dashboard-ios.png (1290x2796)
  They were checked for personal data and carry none — table codes, dish names,
  timers, order UUIDs. They also happen to show exactly the surfaces the CV
  claims: the POS order entry and table operations, and the Kitchen Display
  System. Download, re-encode and self-host them; do not hotlink panda.vn.
- skyline: use the Google Play listing screenshots for
  vn.edu.skylineschool.econnect (SKY-LINE School eConnect), which the publisher
  released themselves. ONE BLOCKER: the home screen shows a schoolchild's name
  and class ("Xin chào, Trần Hải Ngân — Lớp 1/1_CS1"). That name must be
  removed or replaced with invented placeholder text before the image goes
  anywhere near the site. Scan every chosen frame for the same problem before
  using it; do not assume only the first one has it.
- comzone: the author's own capstone, unrestricted. Source is his Figma, or the
  repo at github.com/quanva2003/ComZone_MobileApp.
- tamda-express: NO usable source exists. The only screenshot available is a
  logged-in production dispatch console full of named EU customers, street
  addresses, phone numbers and order values — it must never be published in any
  form, redacted or not. This project needs an ORIGINAL mockup.

For the Tamda mockup specifically: it must be recognisably the kind of interface
described in its `detail.shipped` — a map, a trip list, a trip detail panel and
order columns — without reproducing the client's visual design, logo, brand
colours, or any real customer, staff, price, address or phone data. Every string
and number in it is invented placeholder content. If you cannot tell whether a
detail came from the real product or from your own design, leave it out.

Build that mockup as code, not as raster art: a self-contained SVG, or real
markup screenshotted through the Playwright setup that
scripts/generate-brand-assets.mjs already uses. Reasons — it stays diffable in
review, it re-renders when the design tokens change, it costs few bytes, and it
can be drawn in the site's own palette (ink / raised / line / fg-muted / ember).
Commit the generator alongside the output, matching how the brand assets are
already handled.

Label it honestly. A mockup presented as a shipped product screenshot is the one
thing on this site a reader could fairly call dishonest — and the contrast is
now sharper, because the other three cards ARE real. Add a short, quiet caption
on the Tamda card only, along the lines of "Illustrative mockup — client UI not
shown", driven from a content field rather than from JSX.

Then wire it up, keeping every existing invariant:
- The fixed aspect ratios stay (flagship/hero 21:9, card 4:3) so adding imagery
  causes zero layout shift.
- The view-transition-name contract stays exactly as documented in that file:
  every card carries a name, the same string appears on both sides of the
  navigation, and the media frame is never nested under a [data-reveal]
  ancestor.
- Add `image` (or `images`) and a `mediaKind: "screenshot" | "mockup"` field to
  the Project type in content/types.ts and populate them in
  content/projects.ts. Nothing gets hardcoded in JSX.
- Use next/image with explicit dimensions, AVIF/WebP, and `priority` only for
  the flagship card and the case-study hero.
- Keep the typographic tile as the fallback for any project without media yet,
  so this can land project by project.
- Consider more than one image per case study: the case-study route currently
  has no imagery at all between the hero and the end, which is where a second
  or third view belongs.

PART B — deepen the case-study copy.
Depth is uneven. Panda ERP carries 3 highlights, 5 stack entries and 5 `shipped`
lines; Skyline carries 1 highlight, 3 stack entries and a single-sentence
description, and that one highlight ("Cross-platform mobile app built with
React Native") describes a technology rather than a contribution.

- Bring Skyline, Tamda Shipment and Comzone up to Panda ERP's depth: a
  two-sentence description, at least 3 contribution-shaped highlights, and a
  fuller stack list.
- Every highlight must describe what was built or decided, not which library was
  used. The stack list already carries the technology.
- content/types.ts documents that `results` is deliberately qualitative so no
  invented metrics creep in, and says to swap in sourced numbers when available.
  Honour that: use ONLY the numbers supplied with this task. Do not invent,
  estimate, or infer a metric from anything, however plausible.
```

**Mày đã chốt (vòng 2):** dùng được **4 ảnh Panda** từ panda.vn. Cộng với ảnh
Play Store của Skyline, kế hoạch cuối cùng là:

| Dự án         | Ảnh                                        | Việc phải làm                       |
| ------------- | ------------------------------------------ | ----------------------------------- |
| Panda ERP     | 4 ảnh chính chủ từ panda.vn                | Tải về, re-encode, self-host        |
| Skyline       | Play Store `vn.edu.skylineschool.econnect` | **Xoá tên học sinh** trước khi dùng |
| Comzone       | Figma của mày / repo GitHub                | Cần mày gửi                         |
| Tamda Express | không có nguồn nào an toàn                 | Dựng mockup gốc + gắn nhãn          |

So với vòng 1 thì công việc **giảm từ 3 mockup xuống 1**. Đổi lại có một cái
giá phải để ý: 3 ô là ảnh thật, 1 ô là mockup — nên nhãn "Illustrative mockup"
trên ô Tamda giờ càng cần thiết, vì sự tương phản rõ hơn hẳn so với khi cả 3 đều
là mockup.

**Còn đợi mày (không chặn 3 dự án kia):**

1. **Ảnh Comzone.** Figma mày còn giữ, hoặc repo
   `github.com/quanva2003/ComZone_MobileApp`. 2–4 tấm: marketplace, đấu giá
   live, checkout.
2. **Số liệu thật** nếu có: bao nhiêu branch dùng Panda ERP, bao nhiêu
   order/ngày, bao nhiêu user Skyline, load time giảm bao nhiêu... Không có thì
   bỏ trống, tao giữ định tính. **Tao sẽ không bịa số.**
3. **Skyline mày làm gì cụ thể?** Đây là chỗ mỏng nhất còn lại. CV không có
   Skyline nên không giúp được, và highlight duy nhất hiện tại
   ("Cross-platform mobile app built with React Native") nói về công nghệ chứ
   không nói về mày. Ảnh Play Store cho thấy app có điểm danh, bảng điểm, thời
   khoá biểu, lịch kiểm tra, học phí, nội trú, câu lạc bộ, xe đưa đón, thông
   báo, thực đơn — **màn nào là của mày?**

---

## F5 — Experience ghi quá đơn giản

**Kết luận: ĐÚNG.** Toàn bộ phần Experience là
[content/experience.ts](content/experience.ts) với **2 entry**, mỗi entry đúng
**1 câu** summary. Không có bullet thành tựu, không có stack, không có link tới
dự án tương ứng, không có tên sản phẩm.

Nguyên văn cả 2 entry:

- **Dan Solutions** (Jun 2024 – Aug 2026), Front-End Developer — _"Shipped
  production features across web, tablet and mobile: real-time ERP, logistics
  dispatch and multi-tenant platforms."_
- **General Era Digital Solution JSC** (Aug 2023 – Feb 2024), Front-End
  Developer Intern — _"First industry experience building and maintaining React
  front ends."_

[components/Experience.tsx](components/Experience.tsx) render đúng những gì có:
cột ngày tháng mono + role + company + 1 dòng summary. Component không thiếu gì
cả — **thiếu là ở dữ liệu**, nên sửa `experience.ts` trước, rồi mở rộng
component sau.

Hai điểm phụ đáng chú ý:

- 3 trong 4 dự án ở phần Work (Panda ERP, Tamda Shipment, Skyline) là làm tại
  Dan Solutions, nhưng **hai section không hề liên kết với nhau**. Người đọc
  phải tự đoán. Đây là cơ hội rẻ mà giá trị cao.
- Hôm nay là **2026-09-08**, mà Dan Solutions kết thúc **Aug 2026** — nghĩa là
  site đang thể hiện mày không có việc hiện tại. Cái này là cố ý (xem comment
  trong `experience.ts` và commit `f3655b2`), tao chỉ nhắc để mày xác nhận còn
  đúng không.

### Prompt

```
The Experience section is one sentence per role. content/experience.ts holds
exactly two entries, each with a single `summary` string — no achievement
bullets, no stack, no product names, no link to the corresponding case study.
components/Experience.tsx renders faithfully; the shortfall is in the data, so
start there.

1. Extend the ExperienceEntry type in content/types.ts with, at minimum:
   - `highlights: string[]` — contribution-shaped achievement bullets
   - `stack: string[]` — the technologies actually used in that role
   - `projects?: string[]` — slugs from content/projects.ts
   Add doc comments in the same voice as the rest of that file.
2. Fill both entries from the material supplied with this task. Use ONLY that
   material: content/experience.ts carries a comment explaining that its dates
   were corrected against the CV precisely because a portfolio's factual claims
   are the first thing a reader verifies. Same standard applies to everything
   added here. Invent nothing.
3. Extend components/Experience.tsx to render the new fields, keeping the
   existing 12rem mono date column (the comment there explains why it is 12rem
   and not 10rem — do not shrink it) and the [data-reveal] contract of one
   animation owner per element.
4. Wire the two sections together: three of the four projects (panda-erp,
   tamda-shipment, skyline) were built at Dan Solutions, but nothing on the page
   says so. Link each experience entry to its case studies using TransitionLink
   and lib/transition.ts's projectPath, matching how components/SelectedWork.tsx
   links cards.
5. Reflect the richer role data in the Person / WorkExperience structured data
   in components/StructuredData.tsx.
```

**Cần mày cung cấp (bắt buộc):**

1. **Với Dan Solutions:** 3–5 gạch đầu dòng thành tựu cụ thể. Không phải "làm
   React", mà kiểu "xây lại luồng POS giảm số bước nhập order từ X xuống Y",
   "dựng design system dùng chung cho 3 sản phẩm". Nếu có số thì càng tốt.
2. **Với General Era (internship):** mày làm sản phẩm gì? Hiện tại chỉ ghi
   "First industry experience" — đó là mô tả cảm giác, không phải công việc.
3. **Xác nhận trạng thái việc làm:** Dan Solutions kết thúc Aug 2026 (tháng
   trước). Đúng chưa? Mày đang tìm việc, hay đã có chỗ mới cần thêm vào?

---

## Vòng 2 — asset đã nhận và những gì thay đổi

### F7 — CV của mày giàu hơn site rất nhiều (phát hiện mới, không nằm trong feedback)

Đọc `VanAnhQuan_FrontendDeveloper.pdf` xong thì rõ: **site đang bán mày rẻ hơn
CV**. Đây không phải chuyện viết lại cho hay — là chuyện site thiếu hẳn nội
dung mà mày đã viết sẵn.

**Về Panda CMS — ĐÃ GIẢI QUYẾT, không làm gì cả.** CV có **Panda CMS —
Multi-tenant Website Builder** (Next.js 15, React 19, Tailwind 4, Puck editor,
NextAuth v5) nhưng site thì không. Lý do mày đưa ra: **sản phẩm chưa release**.
Hợp lý — không đưa lên site. **Skyline giữ nguyên.**

Một lưu ý nhỏ đi kèm quyết định số 4 (CV cho tải công khai): CV và site sẽ
**lệch nhau ở chỗ ai cũng thấy được**. Recruiter tải CV sẽ đọc thấy Panda CMS
rồi không tìm thấy nó trên site, và ngược lại thấy Skyline trên site mà không có
trong CV. Không phải lỗi, và cũng không chặn gì — nhưng nếu có ai hỏi thì đó là
câu hỏi họ sẽ hỏi. Tuỳ mày: để yên, hoặc sau khi Panda CMS release thì bổ sung
vào site cho khớp.

**Sai lệch từng dự án:**

| Chỗ           | Site đang ghi                          | CV ghi                                                                          |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Tên           | "Tamda Shipment"                       | "Tamda Express — Logistics Dispatch Platform"                                   |
| Tamda stack   | React, TS, Ant Design, Zustand, Socket | + **React 19, Vite, TomTom Maps**                                               |
| Tamda vai trò | "Front-End Developer"                  | **"Largest code owner on the production branch, ahead of six other engineers"** |
| Panda stack   | React, TS, Socket, Zustand, Ant Design | + **React Native, React 18**                                                    |

Riêng Tamda, site **bỏ sót hẳn mảng bản đồ** — thứ mà CV nói mày sở hữu end to
end (đưa TomTom SDK vào, dựng marker, popup, render route, rồi thay
destroy-and-recreate bằng persistent registry keyed by remote id). Đó là bullet
kỹ thuật hay nhất trong cả CV mà site không nhắc một chữ.

**Toàn bộ bullet thành tựu tao xin ở F4/F5 — CV đã có sẵn.** Distributed order
locking qua WebSocket, OpenAPI-to-TypeScript codegen pipeline, KDS first release,
fix state-clobbering bằng field-level merge thay whole-object swap, refactor
pricing thống nhất discount về một representation, chuẩn hoá back-button 6
module thành một component kèm design guideline đầu tiên của dự án. Không cần
mày viết thêm gì cho Dan Solutions nữa.

**Còn thiếu:**

- **Experience:** CV có **5 bullet** cho Dan Solutions (bao gồm "teams ranging
  from three to seven engineers", "scoping requirements directly with the PM and
  the client", "Onboard new frontend developers"). Site có **1 câu**.
- **Section "AI IN MY WORKFLOW"** — cả một đoạn về cách mày dùng Claude Code:
  tự viết agent config, skill-routing file, resumable prompt playbook, agent-run
  QA passes. Site không có. Với thị trường 2026 đây là thứ tạo khác biệt rõ nhất
  và nó đang nằm chết trong PDF.
- **Skills:** CV có Redux, TanStack Query, OpenAPI codegen, Shadcn UI,
  Jest/Vitest, Git, GitHub PR review, Figma, Postman. Site có 11 mục / 4 nhóm.
- **Education:** CV có Aug 2021 – Dec 2024, GPA 7.1/10.0. Site chỉ có tên trường.
- **Summary:** CV mở bằng _"Frontend Engineer specializing in React, React
  Native, and TypeScript, with production experience owning features across
  logistics, F&B, and multi-tenant platforms"_ — cụ thể hơn hẳn tagline hiện tại
  _"Building fast, expressive interfaces across web, tablet and mobile."_

#### Prompt

```
The CV at public/assets/VanAnhQuan_FrontendDeveloper.pdf is substantially richer
than the site content, and the two have diverged. Bring content/ up to the CV.
The CV is the source of truth for facts; do not invent anything beyond it.

1. DO NOT add Panda CMS. It appears on the CV but the product has not shipped,
   so it stays off the site by decision. Keep the Skyline entry. The four
   projects in content/projects.ts remain the four projects.
2. RECONCILE names and stacks:
   - "Tamda Shipment" → "Tamda Express"; add React 19, Vite and TomTom Maps to
     its stack, and add the mapping work to `detail.shipped` — the TomTom SDK
     introduction, order/shipment markers, detail popups, route rendering, and
     the persistent marker registry keyed by remote id that replaced
     destroy-and-recreate. The site omits this entirely today.
   - Panda ERP: add React Native and React 18 to the stack.
3. DEEPEN every project's `detail.shipped` and `highlights` from the CV bullets:
   distributed order locking over WebSocket, the OpenAPI-to-TypeScript codegen
   pipeline, the Web-Worker search/socket consistency fix, the KDS first
   release, the field-level merge that fixed socket payloads clobbering kitchen
   state, the order-item pricing refactor, and the back-button standardisation
   across six modules.
4. REWRITE content/experience.ts's Dan Solutions summary into the CV's five
   bullets, and replace the General Era entry's "First industry experience"
   line — the CV says what actually shipped: a movie web application built
   independently from scratch in ReactJS (routing, API integration, form
   validation, UI components) against an existing API.
5. EXPAND content/skills.ts to the CV's skill table: Redux, TanStack Query,
   OpenAPI codegen, Shadcn UI, Jest/Vitest, Git, GitHub PR review, Figma,
   Postman.
6. ADD education dates and GPA to content/site.ts (Aug 2021 – Dec 2024, GPA
   7.1/10.0).
7. CONSIDER a new section for the CV's "AI in my workflow" material — authoring
   an agent configuration and skill-routing file for a team repository, a
   resumable prompt playbook for a UI-cloning task, and agent-run review/QA
   passes producing issue reports citing file and line. Nothing on the site
   mentions it. Propose the section before building it; do not add it silently.

Every fact you write must trace to the CV. Where the CV is silent, leave the
existing copy alone rather than filling the gap. No invented metrics — this is
the standard content/types.ts already sets for `results`.
```

### F4 cập nhật — ảnh sản phẩm: tình hình đã KHÁC hẳn

Vòng 1 tao chốt "dựng mockup cho cả 3". Sau khi kiểm tra 2 link mày gửi, kết
luận thay đổi:

**Panda — có ảnh dùng được, không cần mockup.** `panda.vn` là site marketing
của **chính DAN Solutions** (footer ghi "© 2026 Công ty TNHH DAN Solutions").
Panda là sản phẩm của chính công ty mày làm, không phải sản phẩm của khách hàng —
khác hẳn giả định vòng 1. Họ tự công bố 4 ảnh sản phẩm:

| Ảnh                                | Nội dung                                                      | Kích thước |
| ---------------------------------- | ------------------------------------------------------------- | ---------- |
| `ipad-01-pos-table-management.jpg` | Sơ đồ bàn POS trên iPad                                       | 2360×1640  |
| `ipad-02-pos-menu-ordering.jpg`    | Order entry: rail danh mục + lưới món + panel đơn + tổng tiền | 2360×1640  |
| `ipad-05-kds-orders-by-table.jpg`  | Kitchen Display System                                        | 2360×1640  |
| `01-hero-dashboard-ios.png`        | Dashboard realtime trên mobile                                | 1290×2796  |

Tao đã mở từng tấm. **Không có PII** — chỉ mã bàn, tên món, hẹn giờ, UUID đơn.
Và quan trọng hơn: đây **đúng những màn CV nói mày sở hữu** — "primary owner of
the POS surface on mobile and tablet: order entry, checkout, discounts, table
operations and shifts" và "designed the first release of the Kitchen Display
System". Ảnh thật, đúng việc mày làm, do chính chủ công bố. Tốt hơn mockup nhiều.

**Skyline — link mày gửi không có ảnh app.** `skylineschool.edu.vn` là **web
marketing của trường**, không phải app. Nó chỉ có ảnh học sinh, cơ sở, tin tức
(và toàn ảnh trẻ em thật — không dùng được). Nhưng tao tìm ra app thật trên
Google Play: **"SKY-LINE School eConnect"**
(`vn.edu.skylineschool.econnect`, publisher: L.I.F.E Investment JSC, 100+
downloads). Listing có screenshot do nhà phát hành tự đăng. **Vướng một chỗ:**
màn hình chính hiển thị tên một học sinh — _"Xin chào, Trần Hải Ngân — Lớp
1/1_CS1"_. Tên trẻ em. Dù nhà phát hành đã tự công bố, tao vẫn sẽ không bê
nguyên lên portfolio cá nhân mà không xoá tên đó.

**Tamda — vẫn không có gì dùng được.** Mockup là đường duy nhất. Bù lại giờ tao
có tham chiếu layout rất tốt từ chính ảnh mày gửi (map trái, danh sách chuyến
giữa, panel chi tiết, cột đơn phải).

**Comzone** — mày nói không còn ảnh, nhưng mày đã dán một tấm ComZone trong
chat, và CV có link repo `github.com/quanva2003/ComZone_MobileApp`. Có thể lấy
được từ đó hoặc từ Figma mày còn giữ.

Tóm lại kế hoạch ảnh mới:

| Dự án         | Nguồn ảnh                         | Cần mockup? |
| ------------- | --------------------------------- | ----------- |
| Panda ERP     | 4 ảnh chính chủ từ panda.vn       | Không       |
| Skyline       | Play Store, phải xoá tên học sinh | Không       |
| Tamda Express | không có nguồn nào an toàn        | **Có**      |
| Comzone       | Figma của mày / repo GitHub       | Không       |

(Panda CMS không có trong bảng vì đã chốt không đưa lên site — chưa release.)

### F2 cập nhật — ảnh mặt đã nhận

`public/assets/F2.jpg`, 1086×1448 (3:4). Chụp studio, nền xám phẳng, áo polo
navy, mặt hướng 3/4 nhìn lệch sang trái khung. Chất lượng tốt, dùng được.

Hai điều đáng chú ý về mặt thiết kế:

- **Hướng nhìn hợp với bố cục.** Mày nhìn sang trái khung, nên nếu đặt ảnh bên
  phải và tên bên trái thì ánh mắt chỉ vào tên. Đặt ngược lại thì mày đang nhìn
  ra ngoài mép trang — nên tránh.
- **Nền xám là vấn đề thật, và mày đã chốt cách xử lý: TÁCH NỀN.** Nền ảnh sáng
  hơn nhiều so với `--color-ink` `#0a0b0d`; dán nguyên vào Hero sẽ ra một khối
  sáng chọi giữa trang tối, ngay cạnh WebGL background. Tách nền xong, áo navy
  sẫm sẽ tan dần vào nền tối và khuôn mặt nổi lên — đúng hướng tao đề xuất.

  Hai chỗ cần cẩn thận khi tách: **viền tóc** (tóc đen trên nền xám, cắt ẩu là
  ra rìa răng cưa hoặc quầng sáng) và **vai áo navy** (rất gần màu nền trang,
  nên nếu để nguyên biên cứng thì vai sẽ như bị cắt ngang giữa không trung —
  fade dần xuống dưới sẽ tự nhiên hơn nhiều). Xuất PNG có alpha, không phải JPG.

### F5 cập nhật — không còn chặn

CV đã có đủ bullet. Xem F7. Mày cũng đã xác nhận: **Dan Solutions kết thúc Aug
2026**, và internship General Era là **một web xem phim dựng từ API có sẵn** —
khớp với CV ("Independently built a movie web application from scratch in
ReactJS"). Không cần hỏi thêm gì cho F5.

---

## Tóm tắt — cái gì chặn cái gì

| #   | Mục                    | Đã chốt                                        | Còn chặn bởi                      |
| --- | ---------------------- | ---------------------------------------------- | --------------------------------- |
| C1  | PII trong `public/`    | CV public + link; Tamda/F2 ra `design/source/` | **Không gì — ưu tiên số 1**       |
| F6  | Contact CSS            | —                                              | **Không gì**                      |
| F3  | Đổi nhãn → "Projects"  | Nhãn "Projects"                                | **Không gì**                      |
| F5  | Experience             | Kết thúc Aug 2026; intern = web phim           | **Không gì — CV có đủ bullet**    |
| F7  | Đồng bộ CV → site      | Giữ Skyline, **không** thêm Panda CMS          | **Không gì**                      |
| F1  | Icon riêng             | Chỉ chữ **Q**                                  | **Không gì** — tao dựng phương án |
| F2  | Ảnh mặt                | Hero cạnh tên, **tách nền**, ảnh đã có         | **Không gì**                      |
| F4  | Dự án: ảnh + chiều sâu | Panda/Skyline ảnh thật; Tamda mockup           | Chỉ Comzone + mô tả Skyline       |

**Cả 8 mục đã sẵn sàng chạy.** Duy nhất F4 còn thiếu ảnh Comzone và mô tả
Skyline — nhưng ba dự án còn lại làm được ngay, và `ProjectMedia` vốn đã có cơ
chế fallback về ô chữ, nên F4 land được từng dự án một mà không phải chờ đủ.

**Thứ tự chạy:** C1 → F6 → F3 → F7 → F1 → F2 → F4.

Lý do thứ tự này, không phải tuỳ tiện:

- **C1 trước hết** vì là rủi ro dữ liệu, và càng để lâu càng dễ lỡ tay `git add .`
- **F6 trước F3 và trước nút download CV** — cả hai đều thêm thứ vào đúng cái
  hàng nút đang hỏng; sửa nền trước rồi mới xây lên
- **F7 trước F4** vì F4 viết nội dung dựa trên chính dữ liệu mà F7 sửa
- **F1 trước F2** vì cả hai đụng vào Hero/Header; làm mark trước thì layout Hero
  chỉ phải đụng một lần

---

## Câu hỏi vòng 2 — đã trả lời hết

| Câu hỏi                     | Mày trả lời                         |
| --------------------------- | ----------------------------------- |
| Skyline hay Panda CMS?      | Giữ Skyline. Panda CMS chưa release |
| Dùng ảnh Panda từ panda.vn? | Được                                |
| Ảnh mặt xử lý sao?          | Tách nền                            |
| CV cho tải công khai?       | Có                                  |

**Còn lại, không chặn gì:** ảnh Comzone, và mày làm màn nào trong Skyline.

---

## Phụ lục — cách kiểm chứng

- Dev server: `yarn dev` → `localhost:3000`
- Đo hình học: Playwright (`@playwright/test` đã có sẵn trong devDependencies),
  đo `getBoundingClientRect()` trên `#contact ul li a` ở viewport 1440 và 390
- Truy nguyên cascade: Chrome DevTools Protocol
  `CSS.getMatchedStylesForNode` — chính cái này chỉ ra
  `.inline-block { width: var(--spacing-block) }`
- Xác nhận trên CSS build ra: `[root-of-the-server]__*.css` dòng 991 và 2099
- Đối chứng cơ chế Tailwind: `node_modules/tailwindcss/dist/lib.js`, bảng
  `[["inline", ["--spacing","--container"], "inline-size"], ...]`
- Loại trừ JS: chạy lại toàn bộ phép đo với `javaScriptEnabled: false` — số đo
  không đổi
