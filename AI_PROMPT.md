# BekCar — «Xizmat tarixi va kafolat» tizimi uchun AI prompt

> Bu promptni boshqa AI (ChatGPT, Claude, Gemini, Cursor va h.k.) ga to'g'ridan-to'g'ri nusxalab bering.
> Prompt **Canva yoki maket** haqida emas — AI dan ishlaydigan kod yozish talab qilinadi.

---

## ROLE

Sen senior full-stack dasturchisan. Quyidagi loyihaga «Xizmat tarixi va kafolat» (service history & warranty) tizimini to'liq integratsiya qilasan. Natija — ishlaydigan kod, testlar va qisqa README. Maket, Canva yoki mockup emas.

## LOYIHA KONTEKSTI

Papka: `BEKCAR`

- `index.html` — bir sahifali sayt (BekCar avtoservis). Tailwind CSS CDN, Iconify ikonkalari, Inter shrifti. Dizayn: qora fon `#050505`, brend qizil `#dc2626` / `#ef4444`, oq matn, yumaloq kartalar, red glow.
- `i18n.js` — saytning tarjima tizimi. 5 til: `uz`, `en`, `ru`, `pt`, `tr`. Tarjima kalitlari — o'zbekcha matnning o'zi; `changeLang(lang)` funksiyasi matn tugunlarini almashtiradi va `localStorage` ga `bekcar_lang` yozadi.
- `xizmat-tarixi.js` — hozirgi **demo** kabinet moduli (localStorage asosida). Unda barcha 5 tildagi matnlar, ishlar tarixi, kafolat hisobi, egasi paneli, login va modal oynalar mavjud. **Bu faylni o'rganib chiq va mavjud matnlar/atamalarni aynan saqlab qol.**
- `foto/` — sayt rasmlari (`foto/4foto.jpg`, `foto/5foto.jpg`, `foto/yulda qoldingizmi.jpg` va boshqalar).
- Sayt statik hostingda turadi (server yo'q). Shu sabab demo rejimda ma'lumotlar faqat bitta brauzerda saqlanadi.

## MAQSAD

Mijoz **davlat raqami va VIN (seriya) raqamini birgalikda** kiritib, avtomobilida bajarilgan barcha ishlarni, kafolat muddatini va PDF hujjatlarni ko'rsin. Ikkala raqam ham bitta avtomobilga tegishli bo'lishi shart: bittasi xato bo'lsa yoki bazada bunday juftlik bo'lmasa, kirish ochilmaydi. Servis egasi **shu maydonlardan biriga parolni kiritib** kiradi (mijozlar alohida egasi tabini ko'rmaydi), ishlarni qo'shadi, tahrirlaydi, o'chiradi, kafolat beradi va **PDF fayl yuklaydi**. Mijoz PDF'ni sayt ichida ochib ko'radi va yuklab oladi. Sessiya saqlanib qolsin: foydalanuvchi o'zi «Chiqish» bosmaguncha, saytga qaytganda kabinet avtomatik ochilsin.

## 0. QAT'IY QOIDALAR

1. **Canva, Figma, maket, screenshot yoki konstruktor ishlatilmaydi.** Faqat kod.
2. **Bitta kirish paneli, ikkita maydon.** Mijoz va egasi uchun alohida ko'rinadigan tab/bo'lim bo'lmaydi: bitta panelda «Davlat raqami» va «VIN / seriya raqami» maydonlari. Mijoz ikkalasini ham to'ldiradi. Egasi esa ulardan biriga parolni yozadi (ikkinchisi bo'sh qolishi mumkin) — tizim hash bo'yicha egasi ekanini aniqlaydi. Mijozlar egasi kirish imkoniyati borligini sezmasligi kerak.
3. Mavjud sayt matnlari, dizayni va boshqa bo'limlari o'zgartirilmaydi. Faqat yangi kabinet qo'shiladi (nav linklar va yangi bo'lim).
4. **Tarjimalar buzilmasligi shart.** Har bir yangi matn 5 tilda bo'ladi: `uz`, `en`, `ru`, `pt`, `tr`. Tarjimalar tabiiy va savodli bo'lsin; so'zma-so'z mashina tarjimasi, aralash til yoki «â€» kabi buzilgan belgilar bo'lmasin.
5. O'zbekcha matnda `Yog' almashtirish`, `Ta'mirlash`, `Kafolat` kabi to'g'ri yozuv ishlatiladi (masalan, `Yoğalmashtirish` emas).
6. Lorem ipsum, «TODO: text», bo'sh tugma va tarjimasiz matn qoldirilmaydi.
7. Mobil birinchi navbatda (390px), keyin planshet va desktop. Gorizontal scroll bo'lmasin.
8. Har bir tugma va forma ishlashi shart. Bosilganda hech narsa qilmaydigan tugma qoldirilmaydi.

## 1. NATIJA (DELIVERABLE)

1. **Backend** — Node.js 20 + Express (yoki siz tanlagan ishonchli stack). Ma'lumotlar bazasi: PostgreSQL (tavsiya) yoki SQLite (kichik server uchun). Autentifikatsiya, sessiya, validatsiya, xatoliklarni qayta ishlash.
2. **Frontend integratsiyasi** — kabinet `index.html` ichida yangi `#xizmat-tarixi` bo'limi sifatida qoladi; `xizmat-tarixi.js` API bilan ishlaydigan qilib yangilanadi. Dizayn va sinflar (`bc-*`) saqlanadi.
3. **Migratsiyalar + seed** — demo ma'lumotlar (3 ta avtomobil, ishlar, bitta PDF hujjat).
4. **`.env.example`**, **README.md** (o'rnatish, ishga tushirish, parolni o'zgartirish, deploy).
5. **Testlar** — kamida: mijoz plate/VIN bilan kiradi; egasi ish qo'shadi/tahrirlaydi/o'chiradi; kafolat sanasi to'g'ri hisoblanadi; sessiya 30 kun saqlanadi; boshqa tilga o'tganda matnlar to'g'ri.
6. **Xavfsizlik hisoboti** — nima qilindi (parol hash, sessiya cookie, rate limit, CSRF, SQL injection himoyasi).

## 2. FUNKSIONAL TALABLAR

### 2.1. Mijoz (customer)
- **Ikkita maydon: davlat raqami va VIN.** Ikkalasi ham to'ldiriladi; bo'sh joy, chiziqcha va katta-kichik harf hisobga olinmaydi (`01-a-123-bc` = `01A123BC`).
- Faqat **juftlik** mos kelsa kiradi: `norma(plate)` va `norma(vin)` bitta avtomobilnikiga teng bo'lishi shart. Bittasi xato bo'lsa yoki bazada bunday juftlik bo'lmasa — kirish yo'q.
- Bo'sh maydon bo'lsa: «Davlat raqami va VIN raqamini kiriting» xatosi. Juftlik topilmasa: «Bunday davlat raqami va VIN topilmadi...» xatosi (5 tilda) va servis telefoniga havola.
- Kirgach: avtomobil modeli, davlat raqami, VIN, mijoz ismi, bajarilgan ishlar ro'yxati (sana, xizmat turi, izoh, narx, km, holat), kafolat holati va oxirgi tashrif sanasi.
- Har bir ish — **yumaloq burchakli** qizil kartochkada (uchli/uchburchak kesiklar yo'q): chapda sana bloki, o'rtada nomi va ma'lumot, o'ngda kafolat belgisi.
- **PDF ish kartochkasi ichida**: har bir ishga bir yoki bir nechta PDF biriktirilishi mumkin. PDF nomini bosganda **sayt ichidagi modal oynada** (iframe, blob URL) ochiladi; yuklab olish tugmasi faylni saqlaydi. PDF ochilmaydigan brauzerlar uchun yuklab olish zaxira varianti ko'rsatiladi.
- Mijoz PDFni faqat **ochadi va yuklab oladi**; qo'sha olmaydi va o'chira olmaydi. Yuklash/o'chirish tugmalari mijozda ko'rinmaydi.
- Mijoz ma'lumotlarni o'zgartira olmaydi.

### 2.2. Servis egasi (owner)
- **Alohida ko'rinadigan tab yo'q**: parolni «Davlat raqami» yoki «VIN» maydoniga yozadi (ikkinchisi bo'sh qolishi mumkin), tizim hash bo'yicha egasi ekanini aniqlaydi. Mijozlar bu imkoniyatni ko'rmaydi.
- Avtomobil/mijoz CRUD: davlat raqami, VIN, model, yil, mijoz ismi, **telefon**, **email (Gmail)**.
- Ish CRUD: sana, xizmat turi, ixtiyoriy nom, tavsif, narx, km, kafolat (oy), holat (bajarildi / jarayonda / rejalashtirilgan).
- Kafolat muddati ish sanasidan hisoblanadi; tugagan bo'lsa «Kafolat tugagan» ko'rsatiladi.
- **PDF faqat ish orqali**: yangi ish oynasida «PDF fayl» maydoni; tayyor ish kartochkasida **«PDF qo'shish»** tugmasi. Kartochkada PDFni ochish, yuklab olish va **o'chirish** (faqat egasi). Serverda fayl hajmi chegarasi (masalan, 15 MB) va PDF MIME tekshiruvi.
- Qidiruv: raqam, VIN, mijoz ismi yoki telefon bo'yicha.
- Parolni o'zgartirish. Standart parol `bekcar2026` — birinchi kirishda almashtirish tavsiya etiladi.
- O'chirishdan oldin tasdiqlash.

### 2.3. Sessiya
- «Chiqish» bosilmaguncha sessiya saqlanadi (30 kunlik `httpOnly`, `Secure`, `SameSite=Lax` cookie; mobil qurilmada ham).
- Sayt ochilganda, agar sessiya bo'lsa, kabinet avtomatik ochiladi va sahifa shu bo'limga scroll qiladi.
- «Chiqish» sessiyani serverda ham bekor qiladi.
- Parol o'zgarganda boshqa qurilmalardagi sessiyalar bekor qilinadi.

### 2.4. Til
- `uz`, `en`, `ru`, `pt`, `tr` — barcha yangi matnlar, jumladan xatolar, toastlar, sana oylari, select optionlari.
- Til almashtirilganda kabinet darhol qayta chiziladi (mavjud `i18n.js` bilan integratsiya).
- Oylar qisqartmasi: `YAN FEV MAR...` / `JAN FEB...` / `ЯНВ ФЕВ...` / `JAN FEV...` / `OCA ŞUB...`.
- Sanalar `DD.MM.YYYY` formatida.

### 2.5. Dizayn
- Mavjud sayt uslubi: qora fon, qizil brend, oq matn, `rounded-2xl`, nozik oq border, red glow.
- Karta tepasida qizil gradient panel (`BekCar` + holat), ostida foto (`foto/4foto.jpg`), keyin ma'lumot.
- Ish kartochkalari — **yumaloq burchakli** qizil kartochkalar (`border-radius`, uchli kesiklar yo'q); kafolat yashil shield ikonkasi bilan.
- Hujjat qatori: PDF ikonkasi, nom, sana, hajm; «Ko'rish» va yuklab olish tugmalari. PDF ko'rish oynasi keng modal (`max-width: 56rem`), ichida iframe.
- Egasi panelida pastki o'ng burchakda dumaloq qizil «+» tugmasi (rasmdagi kabi) va ro'yxat tepasida «Yangi ish» tugmasi.
- Tugmalar qizil yoki qora (sayt ranglaridan). Boshqa rang (sariq, ko'k, yashil fon) ishlatilmaydi.
- Klaviatura bilan ishlash, `aria-label`, `focus-visible` holatlari.

### 2.6. Xavfsizlik
- Parollar `bcrypt`/`argon2` bilan hash qilinadi (hech qachon ochiq matnda saqlanmaydi).
- Mijoz plate/VIN orqali kiradi — bu maxfiy ma'lumot emas, shuning uchun qo'shimcha himoya: login urinishlarini rate-limit qilish (masalan, 10 urinish / 10 daqiqa / IP) va telefon raqamining oxirgi 4 raqamini ixtiyoriy tasdiqlash.
- Barcha SQL so'rovlar parametrlangan; kirishlar validatsiya qilinadi (uzunlik, format).
- CSRF himoyasi, `helmet`, CORS faqat o'z domeniga.
- Egasi amallari audit logga yoziladi (kim, qachon, nima o'zgartirdi).
- PDF fayllar faqat avtorizatsiyadan o'tgan foydalanuvchiga beriladi; fayl turi (`application/pdf`) va hajmi serverda tekshiriladi; fayl nomi sanitize qilinadi; saqlash yo'li bazaga emas, disk/S3 ga yoziladi.
- Zaxira nusxa (backup) bo'yicha ko'rsatma.

## 3. MA'LUMOTLAR MODELI (tavsiya)

```sql
vehicles (
  id UUID PRIMARY KEY,
  plate TEXT NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  year TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

jobs (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,           -- oil, brakes, engine, gearbox, chassis, electric, diagnostics, tires, body, ac, other
  title TEXT,
  description TEXT,
  price TEXT,
  mileage TEXT,
  warranty_months INT DEFAULT 0,
  status TEXT DEFAULT 'done',   -- done, progress, planned
  created_at TIMESTAMPTZ DEFAULT now()
);

job_documents (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_bytes INT NOT NULL,
  mime TEXT DEFAULT 'application/pdf',
  storage_path TEXT NOT NULL,   -- fayl diskda/S3 da; bazada faqat metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

owners (id UUID PRIMARY KEY, password_hash TEXT NOT NULL, updated_at TIMESTAMPTZ);
sessions (id UUID PRIMARY KEY, owner_id UUID, expires_at TIMESTAMPTZ, revoked BOOLEAN DEFAULT false);
audit_log (id BIGSERIAL, actor TEXT, action TEXT, entity TEXT, entity_id TEXT, payload JSONB, created_at TIMESTAMPTZ DEFAULT now());
```

Kafolat sanasi: `date + warranty_months` (oy oxiri to'g'ri hisoblansin, masalan 31-yanvar + 1 oy = 28/29-fevral).

## 4. API (tavsiya)

- `POST /api/login` `{ plate, vin, password? }` → bitta kirish nuqtasi:
  - agar `plate` yoki `vin` ichida egasi paroli bo'lsa → egasi sessiyasi;
  - aks holda `plate` **va** `vin` juftligi bo'yicha avtomobil qidiriladi; faqat ikkalasi mos kelsa mijoz sessiyasi;
  - aks holda `404`/`401` (boshqa avtomobil ma'lumoti oshkor qilinmaydi).
- `POST /api/owner/login` (ixtiyoriy, ichki) → sessiya cookie
- `POST /api/owner/logout`
- `GET /api/owner/vehicles?q=`
- `POST /api/owner/vehicles`, `PATCH /api/owner/vehicles/:id`, `DELETE /api/owner/vehicles/:id`
- `POST /api/owner/vehicles/:id/jobs`, `PATCH /api/owner/jobs/:id`, `DELETE /api/owner/jobs/:id`
- `POST /api/owner/jobs/:id/documents` (multipart: `file`, `name`) — faqat egasi
- `GET /api/documents/:id` → PDF stream (`Content-Disposition: inline`) — egasi yoki shu ishning avtomobili egasi
- `GET /api/documents/:id?download=1` → `attachment` — yuklab olish uchun
- `DELETE /api/owner/documents/:id` — faqat egasi
- `POST /api/owner/password`
- `GET /api/session` → joriy rol va avtomobil

## 5. MATNLAR

Mavjud demo `xizmat-tarixi.js` faylida 70+ matnning 5 tildagi tarjimasi bor (`TEXT` obyekti). Ularni **aynan** ishlating va yangi matnlarni xuddi shu uslubda qo'shing. Asosiy atamalar:

| UZ | EN | RU | PT | TR |
|---|---|---|---|---|
| Shaxsiy kabinet | Personal cabinet | Личный кабинет | Área pessoal | Kişisel panel |
| Xizmat tarixi va kafolat | Service history and warranty | История обслуживания и гарантия | Histórico de serviços e garantia | Servis geçmişi ve garanti |
| Mijoz | Customer | Клиент | Cliente | Müşteri |
| Servis egasi | Service owner | Владелец сервиса | Proprietário do serviço | Servis sahibi |
| Davlat raqami | Plate number | Госномер | Matrícula | Plaka |
| VIN / seriya raqami | VIN / serial number | VIN / серийный номер | VIN / número de série | VIN / seri numarası |
| Xizmat tarixini ko'rish | View service history | Посмотреть историю обслуживания | Ver histórico de serviços | Servis geçmişini görüntüle |
| Chiqish | Log out | Выйти | Sair | Çıkış |
| Kafolat | Warranty | Гарантия | Garantia | Garanti |
| Kafolat tugagan | Warranty expired | Гарантия истекла | Garantia expirada | Garanti süresi doldu |
| Kafolatsiz | No warranty | Без гарантии | Sem garantia | Garanti yok |
| Bajarilgan ishlar | Completed works | Выполненные работы | Serviços realizados | Yapılan işler |
| Yog' almashtirish | Oil change | Замена масла | Troca de óleo | Yağ değişimi |
| Tormoz tizimi | Brake system | Тормозная система | Sistema de travões | Fren sistemi |
| Motor ta'mirlash | Engine repair | Ремонт двигателя | Reparação do motor | Motor tamiri |
| Karobka ta'mirlash | Gearbox repair | Ремонт КПП | Reparação da caixa | Şanzıman tamiri |
| Diagnostika | Diagnostics | Диагностика | Diagnóstico | Teşhis |
| Shina va g'ildirak | Tyres and wheels | Шины и колёса | Pneus e rodas | Lastik ve jant |
| PDF qo'shish | Add PDF | Добавить PDF | Adicionar PDF | PDF ekle |
| PDF yuklash | Upload PDF | Загрузить PDF | Carregar PDF | PDF yükle |
| Ko'rish | View | Открыть | Ver | Aç |
| Yuklab olish | Download | Скачать | Transferir | İndir |
| Hujjat nomi | Document name | Название документа | Nome do documento | Belge adı |
| Saqlash | Save | Сохранить | Guardar | Kaydet |
| Bekor qilish | Cancel | Отмена | Cancelar | İptal |

Bu jadvalga zid, aralash yoki savodsiz tarjima yozma.

## 6. QABUL QILISH MEZONLARI (acceptance)

1. **Ikkita maydon**: `01 A 123 BC` **va** `WBA5A5C51ED123456` birgalikda kiritilganda mijoz kabineti ochiladi. Faqat bittasi to'g'ri bo'lsa yoki juftlik bazada bo'lmasa — kirish ochilmaydi. Parol (`bekcar2026`) maydonlardan biriga kiritilganda egasi paneli ochiladi. Ekranda alohida tab yo'q.
2. Egasi `bekcar2026` bilan kiradi; yangi ish qo'shadi; sahifa yangilanmaguncha ro'yxatda darhol ko'rinadi; sahifa yangilangach ham saqlanib qoladi.
3. Kafolat: 15.11.2026 + 6 oy = 15.05.2027 deb ko'rsatiladi; o'tgan sana «Kafolat tugagan» bo'ladi.
4. Mijoz telefonda ham, kompyuterda ham kiradi; brauzer yopilib ochilganda sessiya saqlanadi; «Chiqish»dan keyin qayta parol so'raladi.
5. Til `uz → en → ru → pt → tr` almashganda barcha matnlar (xatolar va toastlar ham) tarjima bo'ladi; o'zbekcha matn qolmaydi.
6. Egasi yangi ish qo'shishda PDF biriktiradi yoki tayyor ish kartochkasidagi «PDF qo'shish» orqali qo'shadi; PDF **ish kartochkasi ichida** ko'rinadi, sayt ichidagi modal oynada ochiladi va yuklab olinadi; sahifa yangilangach ham qoladi.
7. Mijozda PDF qo'shish/o'chirish tugmalari **yo'q** — faqat ochish va yuklab olish. PDFni faqat egasi qo'shadi va o'chiradi. Alohida «Hujjatlar» bo'limi yo'q.
8. 390px ekranda gorizontal scroll yo'q; ish kartochkalari yumaloq burchakli; tugmalar barmoq bilan bosishga qulay.
9. Noto'g'ri parol yoki noto'g'ri juftlik 5 marta kiritilsa, vaqtincha bloklanadi.
10. `npm test` yashil; `README` bo'yicha loyiha 5 daqiqada ishga tushadi.

## 7. ISH TARTIBI

1. Avval `index.html`, `i18n.js`, `xizmat-tarixi.js` ni o'qi va mavjud uslubni saqlab qolish rejasini yoz.
2. Backend sxemasi va API shartnomasini tuz.
3. Backendni yoz, migratsiya va seed qo'sh.
4. Frontendni API ga ulang; `localStorage` demo rejimini olib tashla (yoki faqat offline demo sifatida qoldir).
5. Testlarni yoz va ishga tushir.
6. Natijani qisqa hisobot bilan topshir: o'zgargan fayllar, API, standart parol, deploy qadamlari, ma'lum cheklovlar.

## 8. NIMA QILMASLIK KERAK

- Canva, Figma, maket yoki rasm bilan javob berma.
- Mavjud sayt matnlarini qayta yozma.
- Yangi shrift, yangi rang palitrasi yoki boshqa dizayn tili qo'shma.
- Ma'lumotlarni faqat brauzerda saqlab, «tayyor» deb aytma — mijoz boshqa qurilmada ko'rishi uchun server kerak.
- Parolni ochiq matnda saqlama, `console.log` ga chiqarma.
- Test qilinmagan kodni «tayyor» deb topshirma.
