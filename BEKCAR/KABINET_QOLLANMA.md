# BekCar — Xizmat tarixi, kafolat va hujjatlar kabineti (qo'llanma)

Saytga **«Xizmat tarixi va kafolat»** bo'limi qo'shildi. Mijoz davlat raqami yoki VIN orqali kirib, avtomobilida bajarilgan ishlarni, kafolat muddatini va **PDF hujjatlarni** ko'radi. Servis egasi xuddi shu joydan (alohida ko'rinadigan tab yo'q) parol bilan kirib, ishlarni va hujjatlarni boshqaradi.

## 1. Qanday ochiladi

- Yuqoridagi menyudan **«Xizmat tarixi»** (mobil menyuda ham bor) ni bosing yoki shu bo'limga scroll qiling.
- Bo'lim manzili: `index.html#xizmat-tarixi`.

## 2. Kirish (bitta panel)

Ekranda ikkita maydon bor: **«Davlat raqami»** va **«VIN / seriya raqami»**. Mijoz ikkalasini ham to'g'ri kiritishi shart. Egasi esa shu maydonlardan biriga parolni yozadi — mijozlar egasi paneli borligini ko'rmaydi.

### Mijoz sifatida
1. Davlat raqami (`01 A 123 BC`) **va** VIN (`WBA5A5C51ED123456`) ni kiriting.
2. **«Xizmat tarixini ko'rish»** tugmasini bosing.
3. Avtomobil, ishlar, kafolat va hujjatlar ko'rsatiladi.

> Ikkala raqam ham bitta avtomobilga tegishli bo'lishi kerak. Bittasi xato bo'lsa yoki bazada bunday juftlik bo'lmasa — kabinet ochilmaydi. Bu tasodifiy raqam bilan kirishni bloklaydi.

Sinov uchun demo avtomobillar:

| Davlat raqami | VIN | Model |
|---|---|---|
| `01 A 123 BC` | `WBA5A5C51ED123456` | BMW 520d (F10) |
| `12 B 456 DE` | `WVWZZZ1KZAW123456` | Volkswagen Passat B7 |
| `77 C 789 FG` | `JTDBR32E720123456` | Toyota Corolla E120 |

### Servis egasi sifatida
1. **Davlat raqami maydoniga parolni yozing** (VIN maydoni bo'sh qolsin) yoki parolni VIN maydoniga yozing (biri bo'sh bo'lsa kifoya).
2. **«Xizmat tarixini ko'rish»** tugmasini bosing — egasi paneli ochiladi.

**Standart parol: `bekcar2026`**

> Parolni mijozlar oldida ko'rsatib yozmang. Birinchi kirishdan keyin **«Parolni o'zgartirish»** orqali almashtiring.

## 3. Egasi panelida nimalar bor

- **Chap tomonda** avtomobillar ro'yxati va qidiruv (raqam, VIN, mijoz ismi, telefon, email).
- **«+»** (ro'yxat tepasida) — yangi avtomobil/mijoz qo'shish.
- **O'ng tomonda** tanlangan avtomobil:
  - mijoz ismi, telefon, email (Gmail);
  - ishlar ro'yxati va **«Yangi ish qo'shish»** (pastdagi dumaloq qizil «+» ham);
  - **«Tahrirlash»** — avtomobil va mijoz ma'lumotlari.
- Yuqoridagi **kalit** — parolni o'zgartirish, **«Chiqish»** — sessiyani yopish.

### Ish qo'shish
Sana, xizmat turi, narx, km, kafolat (oy), holat. Ixtiyoriy: ish nomi va tavsif.

- Kafolat `0` bo'lsa — «Kafolatsiz».
- Kafolat ish sanasidan hisoblanadi (masalan, 15.11.2026 + 6 oy = 15.05.2027). Muddati o'tgan bo'lsa — «Kafolat tugagan».

### Har bir ishga PDF biriktirish
PDF endi alohida bo'limda emas — **har bir ish kartochkasi ichida**:

1. **Yangi ish** oynasida **«PDF fayl»** maydoni bor — faylni tanlab, ish bilan birga saqlaysiz.
2. Yoki tayyor ish kartochkasidagi **«PDF qo'shish»** tugmasini bosing va faylni tanlang.
3. PDF kartochka ichida ko'rinadi: nomini bosib **sayt ichida ochish**, yuklab olish va **o'chirish** (faqat sizda).

Mijoz o'sha kartochkadagi PDFni ochib o'qiydi va kerak bo'lsa yuklab oladi — **qo'sha olmaydi va o'chira olmaydi**. PDF yuklash va o'chirish faqat servis egasida.

> 2 MB cheklovi demo rejimga tegishli: ma'lumotlar brauzer xotirasida saqlanadi. Serverli versiyada cheklov kattaroq bo'ladi.

## 4. Sessiya

- Foydalanuvchi o'zi **«Chiqish»** bosmaguncha sessiya brauzerda saqlanadi. Sayt qayta ochilganda kabinet avtomatik ochiladi.
- Har bir qurilma/brauzer uchun alohida ishlaydi.
- «Chiqish»dan keyin yana parol/raqam so'raladi.

## 5. Tillar

Kabinet saytning mavjud tillarida ishlaydi: **o'zbek, ingliz, rus, portugal, turk**. Til globus menyusidan almashtiriladi — ishlar, hujjatlar, xatolar va oy nomlari darhol yangi tilga o'tadi.

## 6. Demo rejim cheklovi (muhim)

Sayt statik (server yo'q), shuning uchun:

- Ma'lumotlar va PDF fayllar **shu brauzerda** (`localStorage`, base64) saqlanadi.
- Boshqa telefon/kompyuterdan kiritilgan ish yoki PDF ko'rinmaydi; buning uchun **server (backend)** kerak.
- Parol brauzerda hash ko'rinishida saqlanadi — bu demo darajasidagi himoya.

To'liq, ko'p qurilmali versiya uchun `AI_PROMPT.md` faylidagi promptni AI ga bering.

## 7. Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Yangi bo'lim, CSS (yumaloq kartochkalar, hujjat oynasi), nav linklar |
| `xizmat-tarixi.js` | Login, ishlar, kafolat, PDF yuklash/ko'rish, tillar, demo ma'lumotlar |
| `i18n.js` | Yangi nav/sarlavha tarjimalari |
| `AI_PROMPT.md` | Serverli versiyani yaratish uchun AI prompt |
| `KABINET_QOLLANMA.md` | Shu qo'llanma |

## 8. Parolni unutib qo'ysangiz

Brauzer ma'lumotlarini tozalash (`localStorage`) demo bazani va parolni boshlang'ich holatga qaytaradi — bunda kiritilgan ishlar va PDF'lar ham o'chadi. Parolni alohida joyga yozib qo'ying.
