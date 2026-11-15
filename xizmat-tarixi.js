/* ==========================================================================
   BekCar — "Xizmat tarixi va kafolat" (service history & warranty) module
   --------------------------------------------------------------------------
   - Mijoz davlat raqami yoki VIN orqali kiradi va bajarilgan ishlarni ko'radi.
   - Servis egasi parol bilan kiradi: ish qo'shadi, tahrirlaydi, o'chiradi,
     kafolat muddatini belgilaydi, mijoz telefon/emailini boshqaradi.
   - Sessiya brauzerda saqlanadi: foydalanuvchi o'zi "Chiqish" bosmaguncha
     saytga qaytganda kabinet avtomatik ochiladi.
   - Standart egasi paroli: bekc... (KABINET_QOLLANMA.md ga qarang).
   - Demo rejim: ma'lumotlar localStorage ichida saqlanadi.
   ========================================================================== */
(function () {
  'use strict';

  var LANG_KEY = 'bekcar_lang';
  var DB_KEY = 'bekcar_service_db_v1';
  var SESSION_KEY = 'bekcar_service_session_v1';
  var DEFAULT_PASSWORD = 'bekcar2026';

  var LANGS = ['uz', 'en', 'ru', 'pt', 'tr'];
  var TYPES = ['oil', 'brakes', 'engine', 'gearbox', 'chassis', 'electric', 'diagnostics', 'tires', 'body', 'ac', 'other'];
  var STATUSES = ['done', 'progress', 'planned'];
  var MAX_PDF = 2 * 1024 * 1024;
  var DEMO_PDF_SIZE = 1780;
  var DEMO_PDF = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiAvRjIgNSAwIFIgPj4gPj4gL0NvbnRlbnRzIDYgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkID4+CmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKNiAwIG9iago8PCAvTGVuZ3RoIDExMjMgPj4Kc3RyZWFtCjAuODYgMC4xNSAwLjE1IHJnIDAgNzcwIDU5NSA3MiByZSBmCkJUIC9GMiAyMiBUZiAxIDEgMSByZyA0MCA4MDAgVGQgKEJla0NhcikgVGogRVQKQlQgL0YxIDEwIFRmIDEgMSAxIHJnIDQwIDc4MiBUZCAoU0VSVklDTyBBVVRPTU9WRUwpIFRqIEVUCkJUIC9GMiAyMCBUZiAwIDAgMCByZyA0MCA3NjAgVGQgKEJla0NhciAgLSAgU2VydmljbyBBdXRvbW92ZWwpIFRqIEVUCkJUIC9GMSAxNCBUZiAwIDAgMCByZyA0MCA3MjAgVGQgKEhJU09CLUZBS1RVUkEgICAvICAgSU5WT0lDRSAgIDIwMjYvMDE1KSBUaiBFVApCVCAvRjEgMTIgVGYgMCAwIDAgcmcgNDAgNjg2IFRkIChNaWpveiAvIENsaWVudGU6ICBBa21hbCBLYXJpbW92KSBUaiBFVApCVCAvRjEgMTIgVGYgMCAwIDAgcmcgNDAgNjY0IFRkIChBdnRvbW9iaWwgLyBWaWF0dXJhOiAgQk1XIDUyMGQgXFwoRjEwXFwpICAtICAwMSBBIDEyMyBCQykgVGogRVQKQlQgL0YxIDEyIFRmIDAgMCAwIHJnIDQwIDY0MiBUZCAoU2FuYSAvIERhdGE6ICAxNS4xMS4yMDI2KSBUaiBFVApCVCAvRjEgMTIgVGYgMCAwIDAgcmcgNDAgNjAwIFRkIChCYWphcmlsZ2FuIGlzaGxhciAvIFRyYWJhbGhvczopIFRqIEVUCkJUIC9GMSAxMiBUZiAwIDAgMCByZyA0MCA1NzggVGQgKCAgLSAgWW9nIGFsbWFzaHRpcmlzaCAvIFRyb2NhIGRlIG9sZW8gIC4uLi4uLi4uICA4NSBFVVIpIFRqIEVUCkJUIC9GMSAxMiBUZiAwIDAgMCByZyA0MCA1NTYgVGQgKCAgLSAgVG9ybW96IGtvbG9ka2FsYXJpIC8gVHJhdm9lcyAgLi4uLi4uLi4uLi4uLi4uLiAgMjQwIEVVUikgVGogRVQKQlQgL0YxIDEzIFRmIDAgMCAwIHJnIDQwIDUyMCBUZCAoSmFtaSAvIFRvdGFsOiAgMzI1IEVVUikgVGogRVQKQlQgL0YxIDEyIFRmIDAgMCAwIHJnIDQwIDQ3OCBUZCAoS2Fmb2xhdCAvIEdhcmFudGlhOiAgNiBveSAvIG1lc2VzKSBUaiBFVApCVCAvRjEgMTAgVGYgMCAwIDAgcmcgNDAgNDQwIFRkIChCZWtDYXIgIC0gIFBvdm9hIGRlIFZhcnppbSwgUG9ydHVnYWwpIFRqIEVUCkJUIC9GMSAxMCBUZiAwIDAgMCByZyA0MCA0MjQgVGQgKCszNTEgOTY5IDI0MiAyNzkgIC0gIGJla2NhcnNob3BAZ21haWwuY29tKSBUaiBFVAowLjg2IDAuMTUgMC4xNSByZyA0MCA1NDAgNTE1IDEgcmUgZgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDI1NyAwMDAwMCBuIAowMDAwMDAwMzMyIDAwMDAwIG4gCjAwMDAwMDA0MDIgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA3IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoxNTc2CiUlRU9GCg==';

  var MONTHS = {
    uz: ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK'],
    en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    ru: ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'],
    pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'],
    tr: ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA']
  };

  var TEXT = {
    'app.title': { uz: 'Shaxsiy kabinet', en: 'Personal cabinet', ru: 'Личный кабинет', pt: 'Área pessoal', tr: 'Kişisel panel' },
    'login.subtitle': {
      uz: 'Avtomobilingiz tarixi — bir joyda: ishlar, narxlar va kafolat.',
      en: "Your car's history in one place: works, prices and warranty.",
      ru: 'История вашего автомобиля в одном месте: работы, цены и гарантия.',
      pt: 'O histórico do seu carro num só lugar: serviços, preços e garantia.',
      tr: 'Aracınızın geçmişi tek yerde: işlemler, fiyatlar ve garanti.'
    },
    'tabs.customer': { uz: 'Mijoz', en: 'Customer', ru: 'Клиент', pt: 'Cliente', tr: 'Müşteri' },
    'tabs.owner': { uz: 'Servis egasi', en: 'Service owner', ru: 'Владелец сервиса', pt: 'Proprietário do serviço', tr: 'Servis sahibi' },
    'login.plate': { uz: 'Davlat raqami', en: 'Plate number', ru: 'Госномер', pt: 'Matrícula', tr: 'Plaka' },
    'login.platePh': { uz: '01 A 123 BC', en: '01 A 123 BC', ru: '01 A 123 BC', pt: '01 A 123 BC', tr: '01 A 123 BC' },
    'login.vin': { uz: 'VIN / seriya raqami', en: 'VIN / serial number', ru: 'VIN / серийный номер', pt: 'VIN / número de série', tr: 'VIN / seri numarası' },
    'login.vinPh': { uz: 'WBA5A5C51ED123456', en: 'WBA5A5C51ED123456', ru: 'WBA5A5C51ED123456', pt: 'WBA5A5C51ED123456', tr: 'WBA5A5C51ED123456' },
    'login.view': { uz: "Xizmat tarixini ko'rish", en: 'View service history', ru: 'Посмотреть историю обслуживания', pt: 'Ver histórico de serviços', tr: 'Servis geçmişini görüntüle' },
    'login.hint': { uz: 'Davlat raqami va VIN bir avtomobilga tegishli bo\'lishi kerak.', en: 'The plate number and VIN must belong to the same vehicle.', ru: 'Госномер и VIN должны относиться к одному автомобилю.', pt: 'A matrícula e o VIN devem pertencer ao mesmo veículo.', tr: 'Plaka ve VIN aynı araca ait olmalıdır.' },
    'login.bothRequired': { uz: 'Davlat raqami va VIN raqamini kiriting.', en: 'Enter both the plate number and VIN.', ru: 'Введите госномер и VIN.', pt: 'Introduza a matrícula e o VIN.', tr: "Plaka ve VIN'i girin." },
    'login.demoHint': { uz: 'Sinov: 01 A 123 BC', en: 'Try: 01 A 123 BC', ru: 'Демо: 01 A 123 BC', pt: 'Teste: 01 A 123 BC', tr: 'Deneyin: 01 A 123 BC' },
    'login.notFound': {
      uz: 'Bunday davlat raqami va VIN topilmadi. Ikkalasini ham tekshiring.',
      en: 'No vehicle found with this plate and VIN. Check both numbers.',
      ru: 'Автомобиль с таким госномером и VIN не найден. Проверьте оба номера.',
      pt: 'Nenhum veículo encontrado com esta matrícula e VIN. Verifique ambos.',
      tr: 'Bu plaka ve VIN ile araç bulunamadı. İkisini de kontrol edin.'
    },
    'login.ownerPass': { uz: 'Parol', en: 'Password', ru: 'Пароль', pt: 'Palavra-passe', tr: 'Parola' },
    'login.ownerPh': { uz: 'Parolni kiriting', en: 'Enter password', ru: 'Введите пароль', pt: 'Introduza a palavra-passe', tr: 'Parolayı girin' },
    'login.enter': { uz: 'Kirish', en: 'Log in', ru: 'Войти', pt: 'Entrar', tr: 'Giriş' },
    'login.ownerHint': { uz: 'Parol faqat servis egasiga beriladi.', en: 'The password is given to the service owner only.', ru: 'Пароль выдаётся только владельцу сервиса.', pt: 'A palavra-passe é fornecida apenas ao proprietário do serviço.', tr: 'Parola yalnızca servis sahibine verilir.' },
    'login.badPass': { uz: "Parol noto'g'ri.", en: 'Wrong password.', ru: 'Неверный пароль.', pt: 'Palavra-passe incorreta.', tr: 'Parola yanlış.' },
    'logout': { uz: 'Chiqish', en: 'Log out', ru: 'Выйти', pt: 'Sair', tr: 'Çıkış' },
    'welcome': { uz: 'Xush kelibsiz', en: 'Welcome', ru: 'Добро пожаловать', pt: 'Bem-vindo', tr: 'Hoş geldiniz' },
    'stats.jobs': { uz: 'Bajarilgan ishlar', en: 'Completed works', ru: 'Выполненные работы', pt: 'Serviços realizados', tr: 'Yapılan işler' },
    'stats.warranty': { uz: 'Kafolat ostida', en: 'Under warranty', ru: 'На гарантии', pt: 'Em garantia', tr: 'Garanti kapsamında' },
    'stats.last': { uz: 'Oxirgi tashrif', en: 'Last visit', ru: 'Последний визит', pt: 'Última visita', tr: 'Son ziyaret' },
    'jobs.title': { uz: 'Ishlar tarixi', en: 'Service history', ru: 'История работ', pt: 'Histórico de serviços', tr: 'Servis geçmişi' },
    'jobs.add': { uz: "Yangi ish qo'shish", en: 'Add new job', ru: 'Добавить работу', pt: 'Adicionar serviço', tr: 'Yeni iş ekle' },
    'jobs.edit': { uz: 'Tahrirlash', en: 'Edit', ru: 'Редактировать', pt: 'Editar', tr: 'Düzenle' },
    'jobs.delete': { uz: "O'chirish", en: 'Delete', ru: 'Удалить', pt: 'Excluir', tr: 'Sil' },
    'jobs.deleteConfirm': { uz: "Bu ish yozuvini o'chirishni tasdiqlaysizmi?", en: 'Delete this job record?', ru: 'Удалить эту запись?', pt: 'Excluir este serviço?', tr: 'Bu iş kaydı silinsin mi?' },
    'jobs.count': { uz: '{n} ish', en: '{n} jobs', ru: '{n} работ', pt: '{n} serviços', tr: '{n} iş' },
    'jobs.empty': { uz: 'Hozircha ishlar kiritilmagan.', en: 'No works recorded yet.', ru: 'Работы пока не внесены.', pt: 'Ainda não há serviços registados.', tr: 'Henüz iş kaydı yok.' },
    'docs.title': { uz: 'Hujjatlar', en: 'Documents', ru: 'Документы', pt: 'Documentos', tr: 'Belgeler' },
    'docs.add': { uz: "PDF qo'shish", en: 'Add PDF', ru: 'Добавить PDF', pt: 'Adicionar PDF', tr: 'PDF ekle' },
    'docs.upload': { uz: 'Yuklash', en: 'Upload', ru: 'Загрузить', pt: 'Carregar', tr: 'Yükle' },
    'docs.view': { uz: "Ko'rish", en: 'View', ru: 'Открыть', pt: 'Ver', tr: 'Aç' },
    'docs.download': { uz: 'Yuklab olish', en: 'Download', ru: 'Скачать', pt: 'Transferir', tr: 'İndir' },
    'docs.delete': { uz: "O'chirish", en: 'Delete', ru: 'Удалить', pt: 'Excluir', tr: 'Sil' },
    'docs.deleteConfirm': { uz: "Bu hujjatni o'chirishni tasdiqlaysizmi?", en: 'Delete this document?', ru: 'Удалить этот документ?', pt: 'Excluir este documento?', tr: 'Bu belge silinsin mi?' },
    'docs.deletePdfConfirm': { uz: "Bu PDFni o'chirishni tasdiqlaysizmi?", en: 'Delete this PDF?', ru: 'Удалить этот PDF?', pt: 'Excluir este PDF?', tr: 'Bu PDF silinsin mi?' },
    'docs.empty': { uz: "Hozircha hujjatlar yo'q.", en: 'No documents yet.', ru: 'Документов пока нет.', pt: 'Ainda não há documentos.', tr: 'Henüz belge yok.' },
    'docs.name': { uz: 'Hujjat nomi', en: 'Document name', ru: 'Название документа', pt: 'Nome do documento', tr: 'Belge adı' },
    'docs.file': { uz: 'PDF fayl', en: 'PDF file', ru: 'PDF-файл', pt: 'Ficheiro PDF', tr: 'PDF dosyası' },
    'docs.choose': { uz: 'PDF tanlash', en: 'Choose PDF', ru: 'Выбрать PDF', pt: 'Escolher PDF', tr: 'PDF seç' },
    'docs.noFile': { uz: 'Fayl tanlanmagan', en: 'No file selected', ru: 'Файл не выбран', pt: 'Nenhum ficheiro selecionado', tr: 'Dosya seçilmedi' },
    'docs.tooBig': { uz: 'Fayl juda katta. Maksimal 2 MB.', en: 'File is too large. Maximum 2 MB.', ru: 'Файл слишком большой. Максимум 2 МБ.', pt: 'Ficheiro demasiado grande. Máximo 2 MB.', tr: 'Dosya çok büyük. En fazla 2 MB.' },
    'docs.notPdf': { uz: 'Faqat PDF fayl yuklash mumkin.', en: 'Only PDF files are allowed.', ru: 'Можно загружать только PDF.', pt: 'Apenas ficheiros PDF.', tr: 'Yalnızca PDF yüklenebilir.' },
    'docs.storage': { uz: "Xotira to'ldi. Kichikroq fayl tanlang.", en: 'Storage is full. Choose a smaller file.', ru: 'Память заполнена. Выберите файл меньше.', pt: 'Armazenamento cheio. Escolha um ficheiro menor.', tr: 'Depolama dolu. Daha küçük bir dosya seçin.' },
    'docs.openError': { uz: 'PDF ochilmadi. Qayta urinib ko\'ring.', en: 'Could not open the PDF. Please try again.', ru: 'Не удалось открыть PDF. Попробуйте снова.', pt: 'Não foi possível abrir o PDF. Tente novamente.', tr: 'PDF açılamadı. Lütfen tekrar deneyin.' },
    'docs.pdfLabel': { uz: 'PDF', en: 'PDF', ru: 'PDF', pt: 'PDF', tr: 'PDF' },
    'docs.viewerHint': { uz: "PDF ochilmasa, «Yuklab olish» tugmasini bosing.", en: "If the PDF doesn't open, tap Download.", ru: 'Если PDF не открывается, нажмите «Скачать».', pt: 'Se o PDF não abrir, toque em Transferir.', tr: "PDF açılmazsa İndir'e dokunun." },
    'status.done': { uz: 'Bajarildi', en: 'Completed', ru: 'Выполнено', pt: 'Concluído', tr: 'Tamamlandı' },
    'status.progress': { uz: 'Jarayonda', en: 'In progress', ru: 'В процессе', pt: 'Em curso', tr: 'Devam ediyor' },
    'status.planned': { uz: 'Rejalashtirilgan', en: 'Scheduled', ru: 'Запланировано', pt: 'Agendado', tr: 'Planlandı' },
    'warranty.label': { uz: 'Kafolat', en: 'Warranty', ru: 'Гарантия', pt: 'Garantia', tr: 'Garanti' },
    'warranty.months': { uz: '{n} oy kafolat', en: '{n} months warranty', ru: 'Гарантия {n} мес.', pt: 'Garantia de {n} meses', tr: '{n} ay garanti' },
    'warranty.expired': { uz: 'Kafolat tugagan', en: 'Warranty expired', ru: 'Гарантия истекла', pt: 'Garantia expirada', tr: 'Garanti süresi doldu' },
    'warranty.none': { uz: 'Kafolatsiz', en: 'No warranty', ru: 'Без гарантии', pt: 'Sem garantia', tr: 'Garanti yok' },
    'owner.title': { uz: 'Servis egasi paneli', en: 'Service owner panel', ru: 'Панель владельца сервиса', pt: 'Painel do proprietário', tr: 'Servis sahibi paneli' },
    'owner.statsCustomers': { uz: 'Mijozlar', en: 'Customers', ru: 'Клиенты', pt: 'Clientes', tr: 'Müşteriler' },
    'owner.statsJobs': { uz: 'Jami ishlar', en: 'Total jobs', ru: 'Всего работ', pt: 'Total de serviços', tr: 'Toplam iş' },
    'owner.searchPh': { uz: 'Raqam, VIN yoki mijoz...', en: 'Plate, VIN or customer...', ru: 'Номер, VIN или клиент...', pt: 'Matrícula, VIN ou cliente...', tr: 'Plaka, VIN veya müşteri...' },
    'owner.noResults': { uz: 'Hech narsa topilmadi.', en: 'Nothing found.', ru: 'Ничего не найдено.', pt: 'Nada encontrado.', tr: 'Sonuç yok.' },
    'owner.customer': { uz: 'Mijoz', en: 'Customer', ru: 'Клиент', pt: 'Cliente', tr: 'Müşteri' },
    'owner.phone': { uz: 'Telefon', en: 'Phone', ru: 'Телефон', pt: 'Telefone', tr: 'Telefon' },
    'owner.email': { uz: 'Email', en: 'Email', ru: 'Email', pt: 'Email', tr: 'E-posta' },
    'owner.settings': { uz: "Parolni o'zgartirish", en: 'Change password', ru: 'Изменить пароль', pt: 'Alterar palavra-passe', tr: 'Parolayı değiştir' },
    'owner.dataNote': { uz: "Ma'lumotlar shu brauzerda saqlanadi.", en: 'Data is stored in this browser.', ru: 'Данные хранятся в этом браузере.', pt: 'Os dados são guardados neste navegador.', tr: 'Veriler bu tarayıcıda saklanır.' },
    'owner.selectHint': { uz: "Ro'yxatdan avtomobil tanlang yoki yangi qo'shing.", en: 'Select a vehicle from the list or add a new one.', ru: 'Выберите автомобиль из списка или добавьте новый.', pt: 'Selecione um veículo da lista ou adicione um novo.', tr: 'Listeden bir araç seçin veya yeni ekleyin.' },
    'vehicle.new': { uz: 'Yangi avtomobil', en: 'New vehicle', ru: 'Новый автомобиль', pt: 'Novo veículo', tr: 'Yeni araç' },
    'vehicle.edit': { uz: 'Avtomobilni tahrirlash', en: 'Edit vehicle', ru: 'Редактировать автомобиль', pt: 'Editar veículo', tr: 'Aracı düzenle' },
    'vehicle.plate': { uz: 'Davlat raqami', en: 'Plate number', ru: 'Госномер', pt: 'Matrícula', tr: 'Plaka' },
    'vehicle.model': { uz: 'Model', en: 'Model', ru: 'Модель', pt: 'Modelo', tr: 'Model' },
    'vehicle.year': { uz: 'Yil', en: 'Year', ru: 'Год', pt: 'Ano', tr: 'Yıl' },
    'vehicle.vinFull': { uz: 'VIN / seriya raqami', en: 'VIN / serial number', ru: 'VIN / серийный номер', pt: 'VIN / número de série', tr: 'VIN / seri numarası' },
    'vehicle.deleteConfirm': { uz: "Avtomobil va uning barcha ishlari o'chirilsinmi?", en: 'Delete this vehicle and all its jobs?', ru: 'Удалить автомобиль и все его работы?', pt: 'Excluir este veículo e todos os seus serviços?', tr: 'Bu araç ve tüm işleri silinsin mi?' },
    'customer.name': { uz: 'Mijoz ismi', en: 'Customer name', ru: 'Имя клиента', pt: 'Nome do cliente', tr: 'Müşteri adı' },
    'customer.phone': { uz: 'Telefon raqami', en: 'Phone number', ru: 'Номер телефона', pt: 'Número de telefone', tr: 'Telefon numarası' },
    'customer.email': { uz: 'Email (Gmail)', en: 'Email (Gmail)', ru: 'Email (Gmail)', pt: 'Email (Gmail)', tr: 'E-posta (Gmail)' },
    'form.date': { uz: 'Sana', en: 'Date', ru: 'Дата', pt: 'Data', tr: 'Tarih' },
    'form.type': { uz: 'Xizmat turi', en: 'Service type', ru: 'Тип услуги', pt: 'Tipo de serviço', tr: 'Hizmet türü' },
    'form.title': { uz: 'Ish nomi (ixtiyoriy)', en: 'Job title (optional)', ru: 'Название работы (необязательно)', pt: 'Nome do serviço (opcional)', tr: 'İş adı (isteğe bağlı)' },
    'form.desc': { uz: 'Tavsif (ixtiyoriy)', en: 'Description (optional)', ru: 'Описание (необязательно)', pt: 'Descrição (opcional)', tr: 'Açıklama (isteğe bağlı)' },
    'form.descPh': { uz: 'Bajarilgan ish tafsiloti...', en: 'Details of the work done...', ru: 'Детали выполненной работы...', pt: 'Detalhes do serviço...', tr: 'Yapılan işin ayrıntıları...' },
    'form.price': { uz: 'Narx', en: 'Price', ru: 'Цена', pt: 'Preço', tr: 'Fiyat' },
    'form.km': { uz: "Bosib o'tgan masofa (km)", en: 'Mileage (km)', ru: 'Пробег (км)', pt: 'Quilometragem (km)', tr: 'Kilometre (km)' },
    'form.warranty': { uz: 'Kafolat (oy)', en: 'Warranty (months)', ru: 'Гарантия (мес.)', pt: 'Garantia (meses)', tr: 'Garanti (ay)' },
    'form.status': { uz: 'Holat', en: 'Status', ru: 'Статус', pt: 'Estado', tr: 'Durum' },
    'form.save': { uz: 'Saqlash', en: 'Save', ru: 'Сохранить', pt: 'Guardar', tr: 'Kaydet' },
    'form.cancel': { uz: 'Bekor qilish', en: 'Cancel', ru: 'Отмена', pt: 'Cancelar', tr: 'İptal' },
    'form.newJob': { uz: 'Yangi ish', en: 'New job', ru: 'Новая работа', pt: 'Novo serviço', tr: 'Yeni iş' },
    'form.editJob': { uz: 'Ishni tahrirlash', en: 'Edit job', ru: 'Редактировать работу', pt: 'Editar serviço', tr: 'İşi düzenle' },
    'form.close': { uz: 'Yopish', en: 'Close', ru: 'Закрыть', pt: 'Fechar', tr: 'Kapat' },
    'pass.current': { uz: 'Joriy parol', en: 'Current password', ru: 'Текущий пароль', pt: 'Palavra-passe atual', tr: 'Mevcut parola' },
    'pass.new': { uz: 'Yangi parol', en: 'New password', ru: 'Новый пароль', pt: 'Nova palavra-passe', tr: 'Yeni parola' },
    'pass.repeat': { uz: 'Yangi parolni takrorlang', en: 'Repeat new password', ru: 'Повторите новый пароль', pt: 'Repita a nova palavra-passe', tr: 'Yeni parolayı tekrarlayın' },
    'pass.bad': { uz: "Joriy parol noto'g'ri.", en: 'Current password is wrong.', ru: 'Текущий пароль неверен.', pt: 'A palavra-passe atual está incorreta.', tr: 'Mevcut parola yanlış.' },
    'pass.mismatch': { uz: 'Parollar mos kelmadi.', en: 'Passwords do not match.', ru: 'Пароли не совпадают.', pt: 'As palavras-passe não coincidem.', tr: 'Parolalar eşleşmiyor.' },
    'pass.short': { uz: "Parol kamida 6 belgidan iborat bo'lishi kerak.", en: 'Password must be at least 6 characters.', ru: 'Пароль должен быть не короче 6 символов.', pt: 'A palavra-passe deve ter pelo menos 6 caracteres.', tr: 'Parola en az 6 karakter olmalı.' },
    'toast.jobSaved': { uz: 'Ish saqlandi.', en: 'Job saved.', ru: 'Работа сохранена.', pt: 'Serviço guardado.', tr: 'İş kaydedildi.' },
    'toast.pdfSaved': { uz: "PDF qo'shildi.", en: 'PDF added.', ru: 'PDF добавлен.', pt: 'PDF adicionado.', tr: 'PDF eklendi.' },
    'toast.pdfDeleted': { uz: "PDF o'chirildi.", en: 'PDF deleted.', ru: 'PDF удалён.', pt: 'PDF excluído.', tr: 'PDF silindi.' },
    'toast.docSaved': { uz: 'Hujjat yuklandi.', en: 'Document uploaded.', ru: 'Документ загружен.', pt: 'Documento carregado.', tr: 'Belge yüklendi.' },
    'toast.docDeleted': { uz: "Hujjat o'chirildi.", en: 'Document deleted.', ru: 'Документ удалён.', pt: 'Documento excluído.', tr: 'Belge silindi.' },
    'toast.jobDeleted': { uz: "Ish o'chirildi.", en: 'Job deleted.', ru: 'Работа удалена.', pt: 'Serviço excluído.', tr: 'İş silindi.' },
    'toast.vehicleSaved': { uz: 'Avtomobil saqlandi.', en: 'Vehicle saved.', ru: 'Автомобиль сохранён.', pt: 'Veículo guardado.', tr: 'Araç kaydedildi.' },
    'toast.vehicleDeleted': { uz: "Avtomobil o'chirildi.", en: 'Vehicle deleted.', ru: 'Автомобиль удалён.', pt: 'Veículo excluído.', tr: 'Araç silindi.' },
    'toast.passSaved': { uz: 'Parol yangilandi.', en: 'Password updated.', ru: 'Пароль обновлён.', pt: 'Palavra-passe atualizada.', tr: 'Parola güncellendi.' },
    'type.oil': { uz: "Yog' almashtirish", en: 'Oil change', ru: 'Замена масла', pt: 'Troca de óleo', tr: 'Yağ değişimi' },
    'type.brakes': { uz: 'Tormoz tizimi', en: 'Brake system', ru: 'Тормозная система', pt: 'Sistema de travões', tr: 'Fren sistemi' },
    'type.engine': { uz: "Motor ta'mirlash", en: 'Engine repair', ru: 'Ремонт двигателя', pt: 'Reparação do motor', tr: 'Motor tamiri' },
    'type.gearbox': { uz: "Karobka ta'mirlash", en: 'Gearbox repair', ru: 'Ремонт КПП', pt: 'Reparação da caixa', tr: 'Şanzıman tamiri' },
    'type.chassis': { uz: 'Xodovoy (shassi)', en: 'Chassis / suspension', ru: 'Ходовая часть', pt: 'Suspensão / chassis', tr: 'Yürüyen aksam' },
    'type.electric': { uz: 'Elektrik ishlari', en: 'Electrical works', ru: 'Электрика', pt: 'Trabalhos elétricos', tr: 'Elektrik işleri' },
    'type.diagnostics': { uz: 'Diagnostika', en: 'Diagnostics', ru: 'Диагностика', pt: 'Diagnóstico', tr: 'Teşhis' },
    'type.tires': { uz: "Shina va g'ildirak", en: 'Tyres and wheels', ru: 'Шины и колёса', pt: 'Pneus e rodas', tr: 'Lastik ve jant' },
    'type.body': { uz: "Kuzov va bo'yoq", en: 'Body and paint', ru: 'Кузов и покраска', pt: 'Carroçaria e pintura', tr: 'Kaporta ve boya' },
    'type.ac': { uz: 'Konditsioner', en: 'Air conditioning', ru: 'Кондиционер', pt: 'Ar condicionado', tr: 'Klima' },
    'type.other': { uz: 'Boshqa ishlar', en: 'Other works', ru: 'Прочие работы', pt: 'Outros serviços', tr: 'Diğer işler' }
  };

  var db = null;
  var session = null;
  var state = {
    tab: 'customer',
    ownerVehicleId: null,
    search: ''
  };

  /* ---------------------------------------------------------------- utils */

  function currentLang() {
    var lang = null;
    try { lang = localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
    return LANGS.indexOf(lang) >= 0 ? lang : 'en';
  }

  function t(key, vars) {
    var entry = TEXT[key];
    if (!entry) return key;
    var value = entry[currentLang()] || entry.uz || key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = value.split('{' + name + '}').join(String(vars[name]));
      });
    }
    return value;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(value) {
    return esc(value);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function parseISO(value) {
    if (!value) return new Date(NaN);
    var parts = String(value).split('-');
    if (parts.length !== 3) return new Date(NaN);
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function isoOf(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function todayISO() { return isoOf(new Date()); }

  function formatDate(value) {
    var d = parseISO(value);
    if (isNaN(d.getTime())) return '—';
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  function addMonthsISO(value, months) {
    var d = parseISO(value);
    if (isNaN(d.getTime())) return value;
    var day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
    return isoOf(d);
  }

  function isWarrantyActive(job) {
    var months = Number(job && job.warranty) || 0;
    if (months <= 0 || !job.date) return false;
    return addMonthsISO(job.date, months) >= todayISO();
  }

  function sortedJobs(jobs) {
    return (jobs || []).slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function norm(value) {
    return String(value == null ? '' : value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function toast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    }
  }

  /* ----------------------------------------------------------------- data */

  function seedDB() {
    return {
      v: 1,
      ownerHash: hash(DEFAULT_PASSWORD),
      vehicles: [
        {
          id: 'v-bmw',
          plate: '01 A 123 BC',
          vin: 'WBA5A5C51ED123456',
          model: 'BMW 520d (F10)',
          year: '2014',
          customer: { name: 'Akmal Karimov', phone: '+351 912 345 678', email: 'akmal.karimov@gmail.com' },
          jobs: [
            {
              id: 'j-1', date: '2026-11-15', type: 'oil', title: '', desc: '', price: '85 €', km: '182 400', warranty: 6, status: 'done',
              pdfs: [{ id: 'p-1', name: 'BekCar_hisob_2026-015', size: DEMO_PDF_SIZE, data: DEMO_PDF }]
            },
            { id: 'j-2', date: '2026-09-03', type: 'brakes', title: '', desc: '', price: '240 €', km: '176 500', warranty: 12, status: 'done' },
            { id: 'j-3', date: '2026-06-21', type: 'engine', title: '', desc: '', price: '1 250 €', km: '171 200', warranty: 24, status: 'done' },
            { id: 'j-4', date: '2026-04-10', type: 'tires', title: '', desc: '', price: '320 €', km: '168 900', warranty: 0, status: 'done' }
          ]
        },
        {
          id: 'v-vw',
          plate: '12 B 456 DE',
          vin: 'WVWZZZ1KZAW123456',
          model: 'Volkswagen Passat B7',
          year: '2012',
          customer: { name: 'Mário Silva', phone: '+351 934 567 890', email: 'mario.silva@gmail.com' },
          jobs: [
            { id: 'j-5', date: '2026-10-27', type: 'diagnostics', title: '', desc: '', price: '40 €', km: '235 100', warranty: 0, status: 'done' },
            { id: 'j-6', date: '2026-08-14', type: 'electric', title: '', desc: '', price: '160 €', km: '229 800', warranty: 12, status: 'done' }
          ]
        },
        {
          id: 'v-toyota',
          plate: '77 C 789 FG',
          vin: 'JTDBR32E720123456',
          model: 'Toyota Corolla E120',
          year: '2005',
          customer: { name: 'Rustam Bek', phone: '+351 969 242 279', email: 'rustam.bek@gmail.com' },
          jobs: [
            { id: 'j-7', date: '2026-11-02', type: 'chassis', title: '', desc: '', price: '380 €', km: '310 400', warranty: 6, status: 'progress' },
            { id: 'j-8', date: '2026-07-19', type: 'ac', title: '', desc: '', price: '120 €', km: '305 600', warranty: 12, status: 'done' }
          ]
        }
      ]
    };
  }

  function loadDB() {
    var raw = null;
    try { raw = localStorage.getItem(DB_KEY); } catch (e) { raw = null; }
    var data = null;
    if (raw) {
      try { data = JSON.parse(raw); } catch (e) { data = null; }
    }
    if (!data || !Array.isArray(data.vehicles)) data = seedDB();
    if (!data.ownerHash) data.ownerHash = hash(DEFAULT_PASSWORD);
    if (!data.v) data.v = 1;
    delete data.allowCustomerDocs;

    data.vehicles.forEach(function (vehicle) {
      if (!Array.isArray(vehicle.jobs)) vehicle.jobs = [];
      if (!vehicle.customer) vehicle.customer = { name: '', phone: '', email: '' };

      vehicle.jobs.forEach(function (job) {
        if (!Array.isArray(job.pdfs)) job.pdfs = [];
      });

      // Eski versiyadagi avtomobil hujjatlarini ishlar ichiga ko'chirish
      if (Array.isArray(vehicle.documents) && vehicle.documents.length) {
        vehicle.documents.forEach(function (doc, index) {
          var target = vehicle.jobs[index] || vehicle.jobs[0];
          if (!target) return;
          target.pdfs.push({
            id: doc.id || ('p' + Date.now().toString(36) + index),
            name: doc.name || 'PDF',
            size: doc.size || 0,
            data: doc.data || ''
          });
        });
      }
      delete vehicle.documents;
    });

    return data;
  }

  function saveDB() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      toast(t('docs.storage'));
      return false;
    }
  }

  function readSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeSession(value) {
    try {
      if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  }

  function vehicleById(id) {
    return (db.vehicles || []).filter(function (v) { return v.id === id; })[0] || null;
  }

  function canAccessVehicle(vehicleId) {
    if (!session) return false;
    if (session.role === 'owner') return true;
    return session.role === 'customer' && session.vehicleId === vehicleId;
  }

  function jobById(vehicle, id) {
    if (!vehicle) return null;
    return (vehicle.jobs || []).filter(function (j) { return j.id === id; })[0] || null;
  }

  function findVehicleByBoth(plate, vin) {
    var p = norm(plate);
    var v = norm(vin);
    if (!p || !v) return null;
    return db.vehicles.filter(function (vehicle) {
      return norm(vehicle.plate) === p && norm(vehicle.vin) === v;
    })[0] || null;
  }

  /* ---------------------------------------------------------------- views */

  function statCard(value, label) {
    return '<div class="bc-stat"><span class="bc-stat-value">' + esc(value) + '</span><span class="bc-stat-label">' + esc(label) + '</span></div>';
  }

  function errorBox(message) {
    return '<div class="bc-error"><iconify-icon icon="lucide:alert-circle" width="15"></iconify-icon><span>' + esc(message) + '</span></div>';
  }

  function statusChip(status) {
    var value = STATUSES.indexOf(status) >= 0 ? status : 'done';
    return '<span class="bc-chip bc-status-' + value + '"><span class="bc-dot"></span>' + esc(t('status.' + value)) + '</span>';
  }

  function warrantyChip(job) {
    var months = Number(job.warranty) || 0;
    if (!months) {
      return '<span class="bc-chip bc-chip-muted"><iconify-icon icon="lucide:shield-off" width="13"></iconify-icon>' + esc(t('warranty.none')) + '</span>';
    }
    var until = addMonthsISO(job.date, months);
    if (until < todayISO()) {
      return '<span class="bc-chip bc-chip-muted"><iconify-icon icon="lucide:shield-x" width="13"></iconify-icon>' + esc(t('warranty.expired')) + '</span>';
    }
    return '<span class="bc-chip bc-chip-ok"><iconify-icon icon="lucide:shield-check" width="13"></iconify-icon>' +
      '<span>' + esc(t('warranty.months', { n: months })) + ' · ' + esc(formatDate(until)) + '</span></span>';
  }

  function emptyJobs() {
    return '<div class="bc-empty flex flex-col items-center justify-center text-center py-8">' +
      '<iconify-icon icon="lucide:wrench" width="26" class="text-slate-600"></iconify-icon>' +
      '<p class="text-xs text-slate-500 mt-2">' + esc(t('jobs.empty')) + '</p></div>';
  }

  function pdfChip(job, pdf, vehicleId, editable) {
    var name = pdf.name || 'PDF';
    var base = ' data-vehicle="' + escAttr(vehicleId) + '" data-job="' + escAttr(job.id) + '" data-pdf="' + escAttr(pdf.id) + '"';
    return '<span class="bc-pdf">' +
      '<button type="button" data-act="view-job-pdf"' + base + ' class="bc-pdf-open" title="' + escAttr(name) + '">' +
      '<iconify-icon icon="lucide:file-text" width="12"></iconify-icon>' +
      '<span class="bc-pdf-name">' + esc(name) + '</span>' +
      '</button>' +
      '<button type="button" data-act="download-job-pdf"' + base + ' class="bc-pdf-dl" title="' + escAttr(t('docs.download')) + '" aria-label="' + escAttr(t('docs.download')) + '"><iconify-icon icon="lucide:download" width="12"></iconify-icon></button>' +
      (editable
        ? '<button type="button" data-act="delete-job-pdf"' + base + ' class="bc-pdf-del" title="' + escAttr(t('docs.delete')) + '" aria-label="' + escAttr(t('docs.delete')) + '"><iconify-icon icon="lucide:trash-2" width="12"></iconify-icon></button>'
        : '') +
      '</span>';
  }

  function ticket(job, vehicleId, editable) {
    var d = parseISO(job.date);
    var months = MONTHS[currentLang()] || MONTHS.en;
    var monthName = isNaN(d.getTime()) ? '—' : (months[d.getMonth()] || '');
    var title = job.title ? job.title : t('type.' + job.type);
    var pdfs = job.pdfs || [];
    var html = '<div class="bc-ticket-wrap"><div class="bc-ticket"><div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">';

    html += '<div class="bc-date">' +
      '<span class="bc-date-day">' + (isNaN(d.getTime()) ? '—' : d.getDate()) + '</span>' +
      '<span class="bc-date-mon">' + esc(monthName) + '</span>' +
      '<span class="bc-date-year">' + (isNaN(d.getTime()) ? '' : d.getFullYear()) + '</span>' +
      '</div>';

    html += '<div class="min-w-0 flex-1">';
    html += '<div class="flex flex-wrap items-center gap-2">';
    html += '<span class="bc-ticket-title">' + esc(title) + '</span>';
    if (job.title) html += '<span class="bc-chip">' + esc(t('type.' + job.type)) + '</span>';
    html += statusChip(job.status);
    html += '</div>';
    if (job.desc) html += '<p class="bc-ticket-desc">' + esc(job.desc) + '</p>';
    if (job.km || job.price) {
      html += '<div class="bc-ticket-meta">';
      if (job.km) html += '<span><iconify-icon icon="lucide:gauge" width="13"></iconify-icon>' + esc(job.km) + ' km</span>';
      if (job.price) html += '<span><iconify-icon icon="lucide:wallet" width="13"></iconify-icon>' + esc(job.price) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="flex sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">';
    html += warrantyChip(job);
    if (editable) {
      html += '<div class="flex gap-1.5">' +
        '<button type="button" data-act="edit-job" data-vehicle="' + escAttr(vehicleId) + '" data-id="' + escAttr(job.id) + '" class="bc-ribbon-btn" title="' + escAttr(t('jobs.edit')) + '" aria-label="' + escAttr(t('jobs.edit')) + '"><iconify-icon icon="lucide:pencil" width="14"></iconify-icon></button>' +
        '<button type="button" data-act="delete-job" data-vehicle="' + escAttr(vehicleId) + '" data-id="' + escAttr(job.id) + '" class="bc-ribbon-btn" title="' + escAttr(t('jobs.delete')) + '" aria-label="' + escAttr(t('jobs.delete')) + '"><iconify-icon icon="lucide:trash-2" width="14"></iconify-icon></button>' +
        '</div>';
    }
    html += '</div>';

    html += '</div>';

    if (pdfs.length || editable) {
      html += '<div class="bc-ticket-pdf">';
      pdfs.forEach(function (pdf) { html += pdfChip(job, pdf, vehicleId, editable); });
      if (editable) {
        html += '<button type="button" data-act="add-job-pdf" data-vehicle="' + escAttr(vehicleId) + '" data-job="' + escAttr(job.id) + '" class="bc-pdf-add"><iconify-icon icon="lucide:paperclip" width="12"></iconify-icon>' + esc(t('docs.add')) + '</button>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function formatSize(bytes) {
    var size = Number(bytes) || 0;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return Math.round(size / 1024) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function jobPdf(vehicleId, jobId, pdfId) {
    var vehicle = vehicleById(vehicleId);
    var job = jobById(vehicle, jobId);
    if (!job) return null;
    return (job.pdfs || []).filter(function (pdf) { return pdf.id === pdfId; })[0] || null;
  }

  function base64ToBlob(base64) {
    var binary = atob(base64 || '');
    var length = binary.length;
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'application/pdf' });
  }

  var activeDocUrl = null;

  function releaseDocUrl() {
    if (activeDocUrl) {
      try { URL.revokeObjectURL(activeDocUrl); } catch (e) { /* ignore */ }
      activeDocUrl = null;
    }
  }

  function openDocViewer(doc) {
    if (!doc) return;
    releaseDocUrl();
    var blob;
    try {
      blob = base64ToBlob(doc.data);
    } catch (e) {
      toast(t('docs.openError'));
      return;
    }
    activeDocUrl = URL.createObjectURL(blob);
    var fileName = String(doc.name || 'document').replace(/\.pdf$/i, '') + '.pdf';

    var body = '<div class="bc-docview"><iframe src="' + escAttr(activeDocUrl) + '" title="' + escAttr(doc.name) + '"></iframe></div>' +
      '<p class="px-5 pb-3 text-[11px] text-slate-500">' + esc(t('docs.viewerHint')) + '</p>' +
      '<div class="flex gap-2 px-5 pb-5">' +
      '<a class="bc-btn bc-btn-red flex-1" href="' + escAttr(activeDocUrl) + '" download="' + escAttr(fileName) + '"><iconify-icon icon="lucide:download" width="15"></iconify-icon>' + esc(t('docs.download')) + '</a>' +
      '<button type="button" data-act="close-modal" class="bc-btn bc-btn-dark">' + esc(t('form.close')) + '</button>' +
      '</div>';

    openModal(modalShell(doc.name, formatSize(doc.size) + ' · ' + t('docs.pdfLabel'), body, true));
  }

  function downloadDoc(doc) {
    if (!doc) return;
    var blob;
    try {
      blob = base64ToBlob(doc.data);
    } catch (e) {
      toast(t('docs.openError'));
      return;
    }
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = String(doc.name || 'document').replace(/\.pdf$/i, '') + '.pdf';
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function guestView() {
    var html = '<div class="max-w-2xl mx-auto"><div class="bc-card">';

    html += '<div class="bc-topbar">' +
      '<span class="flex items-center gap-2 font-bold tracking-tight"><iconify-icon icon="lucide:wrench" width="16"></iconify-icon><span>Bek<span class="text-white/70">Car</span></span></span>' +
      '<span class="bc-topbar-label">' + esc(t('app.title')) + '</span>' +
      '</div>';

    html += '<div class="relative h-40 sm:h-48 overflow-hidden">' +
      '<img src="foto/5foto.jpg" alt="BekCar" class="w-full h-full object-cover">' +
      '<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/45 to-transparent"></div>' +
      '<p class="absolute bottom-4 left-5 right-5 text-sm text-white/80 font-light">' + esc(t('login.subtitle')) + '</p>' +
      '</div>';

    html += '<div class="p-5 sm:p-7">';
    html += loginForm();
    html += '<p class="text-[11px] text-slate-600 text-center mt-4">' + esc(t('owner.dataNote')) + '</p>';
    html += '</div></div></div>';
    return html;
  }

  function loginForm() {
    return '<form data-bc-form="login" class="mt-1 space-y-4" novalidate>' +
      '<div>' +
      '<label class="bc-label" for="bc-plate">' + esc(t('login.plate')) + '</label>' +
      '<div class="bc-input-icon">' +
      '<iconify-icon icon="lucide:car-front" width="18"></iconify-icon>' +
      '<input id="bc-plate" class="bc-input" type="text" name="plate" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + escAttr(t('login.platePh')) + '">' +
      '</div></div>' +
      '<div>' +
      '<label class="bc-label" for="bc-vin">' + esc(t('login.vin')) + '</label>' +
      '<div class="bc-input-icon">' +
      '<iconify-icon icon="lucide:hash" width="18"></iconify-icon>' +
      '<input id="bc-vin" class="bc-input" type="text" name="vin" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + escAttr(t('login.vinPh')) + '">' +
      '</div></div>' +
      '<button type="submit" class="bc-btn bc-btn-red w-full">' + esc(t('login.view')) +
      '<iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon></button>' +
      '<p class="text-[11px] text-slate-500">' + esc(t('login.hint')) + '</p>' +
      '</form>';
  }

  function customerView(vehicle) {
    var jobs = sortedJobs(vehicle.jobs);
    var active = jobs.filter(isWarrantyActive).length;
    var html = '<div class="max-w-3xl mx-auto"><div class="bc-card">';

    html += '<div class="bc-topbar">' +
      '<span class="flex items-center gap-2 font-bold tracking-tight"><iconify-icon icon="lucide:wrench" width="16"></iconify-icon><span>Bek<span class="text-white/70">Car</span></span></span>' +
      '<button type="button" data-act="logout" class="bc-topbar-btn"><iconify-icon icon="lucide:log-out" width="14"></iconify-icon>' + esc(t('logout')) + '</button>' +
      '</div>';

    html += '<div class="relative h-44 sm:h-52 overflow-hidden">' +
      '<img src="foto/4foto.jpg" alt="' + escAttr(vehicle.model) + '" class="w-full h-full object-cover">' +
      '<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/45 to-transparent"></div>' +
      '<div class="absolute bottom-4 left-5 right-5">' +
      '<h3 class="text-xl sm:text-2xl font-bold tracking-tight">' + esc(vehicle.model) + '</h3>' +
      '<div class="mt-2 flex flex-wrap items-center gap-2">' +
      '<span class="bc-plate">' + esc(vehicle.plate) + '</span>' +
      '<span class="bc-chip">VIN ' + esc(vehicle.vin) + '</span>' +
      '</div></div></div>';

    html += '<div class="p-5 sm:p-7">';
    html += '<div class="flex items-center justify-between gap-3 mb-5">' +
      '<div><p class="text-[10px] uppercase tracking-widest text-slate-500">' + esc(t('welcome')) + '</p>' +
      '<p class="text-sm font-semibold">' + esc(vehicle.customer.name) + '</p></div>' +
      '<span class="bc-chip bc-chip-dark">' + esc(t('owner.customer')) + '</span></div>';

    html += '<div class="grid grid-cols-3 gap-2 sm:gap-3 mb-6">' +
      statCard(String(jobs.length), t('stats.jobs')) +
      statCard(String(active), t('stats.warranty')) +
      statCard(jobs.length ? formatDate(jobs[0].date) : '—', t('stats.last')) +
      '</div>';

    html += '<div class="flex items-center justify-between mb-3">' +
      '<h4 class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">' + esc(t('jobs.title')) + '</h4>' +
      '<span class="text-[11px] text-slate-500">' + esc(t('jobs.count', { n: jobs.length })) + '</span></div>';

    html += jobs.length ? jobs.map(function (job) { return ticket(job, vehicle.id, false); }).join('') : emptyJobs();
    html += '<p class="text-[11px] text-slate-600 text-center mt-5">' + esc(t('owner.dataNote')) + '</p>';
    html += '</div></div></div>';
    return html;
  }

  function vehicleRow(vehicle) {
    var active = (vehicle.jobs || []).filter(isWarrantyActive).length;
    var isActive = vehicle.id === state.ownerVehicleId;
    var meta = esc(vehicle.customer.name) + ' · ' + esc(t('jobs.count', { n: (vehicle.jobs || []).length }));
    if (active) meta += ' · ' + esc(t('stats.warranty'));
    return '<button type="button" data-act="select-vehicle" data-id="' + escAttr(vehicle.id) + '" class="bc-vrow' + (isActive ? ' is-active' : '') + '">' +
      '<span class="bc-vrow-model">' + esc(vehicle.model) + '</span>' +
      '<span class="bc-vrow-plate">' + esc(vehicle.plate) + '</span>' +
      '<span class="bc-vrow-meta">' + meta + '</span>' +
      '</button>';
  }

  function filteredVehicles() {
    var q = state.search.trim().toLowerCase();
    if (!q) return db.vehicles.slice();
    return db.vehicles.filter(function (v) {
      return String(v.model || '').toLowerCase().indexOf(q) >= 0 ||
        String(v.plate || '').toLowerCase().indexOf(q) >= 0 ||
        String(v.vin || '').toLowerCase().indexOf(q) >= 0 ||
        String(v.customer.name || '').toLowerCase().indexOf(q) >= 0 ||
        String(v.customer.phone || '').toLowerCase().indexOf(q) >= 0 ||
        String(v.customer.email || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function ownerEmpty() {
    return '<div class="bc-empty h-full flex flex-col items-center justify-center text-center py-14">' +
      '<iconify-icon icon="lucide:car" width="34" class="text-slate-600"></iconify-icon>' +
      '<p class="text-sm text-slate-500 mt-3 max-w-xs">' + esc(t('owner.selectHint')) + '</p></div>';
  }

  function ownerDetail(vehicle) {
    var jobs = sortedJobs(vehicle.jobs);
    var html = '<div class="bc-detail relative">';

    html += '<div class="flex flex-wrap items-start justify-between gap-3 mb-4">' +
      '<div><h3 class="text-lg font-bold">' + esc(vehicle.model) + ' <span class="text-slate-500 font-normal">' + esc(vehicle.year || '') + '</span></h3>' +
      '<div class="mt-2 flex flex-wrap gap-2"><span class="bc-plate">' + esc(vehicle.plate) + '</span>' +
      '<span class="bc-chip bc-chip-dark">VIN ' + esc(vehicle.vin) + '</span></div></div>' +
      '<div class="flex gap-2">' +
      '<button type="button" data-act="edit-vehicle" data-id="' + escAttr(vehicle.id) + '" class="bc-btn bc-btn-dark bc-btn-sm"><iconify-icon icon="lucide:pencil" width="14"></iconify-icon>' + esc(t('jobs.edit')) + '</button>' +
      '<button type="button" data-act="delete-vehicle" data-id="' + escAttr(vehicle.id) + '" class="bc-icon-btn" title="' + escAttr(t('jobs.delete')) + '" aria-label="' + escAttr(t('jobs.delete')) + '"><iconify-icon icon="lucide:trash-2" width="16"></iconify-icon></button>' +
      '</div></div>';

    html += '<div class="bc-info-grid">' +
      '<div><span>' + esc(t('owner.customer')) + '</span><strong>' + esc(vehicle.customer.name) + '</strong></div>' +
      '<div><span>' + esc(t('owner.phone')) + '</span><a href="tel:' + escAttr(vehicle.customer.phone) + '">' + esc(vehicle.customer.phone) + '</a></div>' +
      '<div><span>' + esc(t('owner.email')) + '</span><a href="mailto:' + escAttr(vehicle.customer.email) + '">' + esc(vehicle.customer.email) + '</a></div>' +
      '</div>';

    html += '<div class="flex items-center justify-between gap-3 mt-6 mb-3">' +
      '<h4 class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">' + esc(t('jobs.title')) +
      ' <span class="text-slate-600">' + jobs.length + '</span></h4>' +
      '<button type="button" data-act="new-job" data-vehicle="' + escAttr(vehicle.id) + '" class="bc-btn bc-btn-red bc-btn-sm"><iconify-icon icon="lucide:plus" width="14"></iconify-icon>' + esc(t('jobs.add')) + '</button>' +
      '</div>';

    html += '<div class="pb-14">' + (jobs.length ? jobs.map(function (job) { return ticket(job, vehicle.id, true); }).join('') : emptyJobs()) + '</div>';

    html += '<button type="button" data-act="new-job" data-vehicle="' + escAttr(vehicle.id) + '" class="bc-fab" title="' + escAttr(t('jobs.add')) + '" aria-label="' + escAttr(t('jobs.add')) + '"><iconify-icon icon="lucide:plus" width="26"></iconify-icon></button>';

    html += '</div>';
    return html;
  }

  function ownerView() {
    var selected = vehicleById(state.ownerVehicleId) || db.vehicles[0] || null;
    if (selected) state.ownerVehicleId = selected.id;

    var totalJobs = db.vehicles.reduce(function (n, v) { return n + (v.jobs || []).length; }, 0);
    var totalActive = db.vehicles.reduce(function (n, v) {
      return n + (v.jobs || []).filter(isWarrantyActive).length;
    }, 0);

    var list = filteredVehicles();
    var html = '<div class="max-w-5xl mx-auto"><div class="bc-card">';

    html += '<div class="bc-topbar">' +
      '<span class="flex items-center gap-2 min-w-0 font-bold tracking-tight"><iconify-icon icon="lucide:shield-check" width="16"></iconify-icon>' +
      '<span class="whitespace-nowrap">Bek<span class="text-white/70">Car</span></span>' +
      '<span class="bc-topbar-label hidden sm:inline">' + esc(t('owner.title')) + '</span></span>' +
      '<span class="flex items-center gap-2">' +
      '<button type="button" data-act="settings" class="bc-topbar-btn" title="' + escAttr(t('owner.settings')) + '" aria-label="' + escAttr(t('owner.settings')) + '"><iconify-icon icon="lucide:key-round" width="14"></iconify-icon><span class="hidden sm:inline">' + esc(t('owner.settings')) + '</span></button>' +
      '<button type="button" data-act="logout" class="bc-topbar-btn"><iconify-icon icon="lucide:log-out" width="14"></iconify-icon>' + esc(t('logout')) + '</button>' +
      '</span></div>';

    html += '<div class="p-5 sm:p-7">';
    html += '<div class="grid grid-cols-3 gap-2 sm:gap-3 mb-6">' +
      statCard(String(db.vehicles.length), t('owner.statsCustomers')) +
      statCard(String(totalJobs), t('owner.statsJobs')) +
      statCard(String(totalActive), t('stats.warranty')) +
      '</div>';

    html += '<div class="grid lg:grid-cols-[300px_1fr] gap-5">';

    html += '<div class="min-w-0">' +
      '<div class="flex gap-2">' +
      '<input id="bc-search" class="bc-input" type="search" autocomplete="off" value="' + escAttr(state.search) + '" placeholder="' + escAttr(t('owner.searchPh')) + '">' +
      '<button type="button" data-act="new-vehicle" class="bc-icon-btn bc-icon-red" title="' + escAttr(t('vehicle.new')) + '" aria-label="' + escAttr(t('vehicle.new')) + '"><iconify-icon icon="lucide:plus" width="18"></iconify-icon></button>' +
      '</div>' +
      '<div id="bc-vehicle-list" class="mt-3 space-y-2 max-h-[430px] overflow-y-auto pr-1 bc-scroll">' +
      (list.length ? list.map(vehicleRow).join('') : '<p class="text-xs text-slate-500 p-3">' + esc(t('owner.noResults')) + '</p>') +
      '</div>' +
      '<p class="text-[10px] text-slate-600 mt-3 leading-relaxed">' + esc(t('owner.dataNote')) + '</p>' +
      '</div>';

    html += '<div class="min-w-0">' + (selected ? ownerDetail(selected) : ownerEmpty()) + '</div>';
    html += '</div></div></div></div>';
    return html;
  }

  function render() {
    var root = document.getElementById('bc-app');
    if (!root || !db) return;

    if (session && session.role === 'owner') {
      root.innerHTML = ownerView();
      return;
    }
    if (session && session.role === 'customer') {
      var vehicle = vehicleById(session.vehicleId);
      if (!vehicle) {
        session = null;
        writeSession(null);
        root.innerHTML = guestView();
        return;
      }
      root.innerHTML = customerView(vehicle);
      return;
    }
    root.innerHTML = guestView();
  }

  function refreshVehicleList() {
    var box = document.getElementById('bc-vehicle-list');
    if (!box) return;
    var list = filteredVehicles();
    box.innerHTML = list.length ? list.map(vehicleRow).join('') : '<p class="text-xs text-slate-500 p-3">' + esc(t('owner.noResults')) + '</p>';
  }

  /* --------------------------------------------------------------- modals */

  function modalShell(title, subtitle, body, wide) {
    return '<div class="bc-overlay" id="bc-overlay"><div class="bc-modal' + (wide ? ' bc-modal-wide' : '') + '">' +
      '<div class="bc-modal-head"><div>' +
      (subtitle ? '<p class="bc-eyebrow">' + esc(subtitle) + '</p>' : '') +
      '<h3 class="bc-modal-title">' + esc(title) + '</h3>' +
      '</div>' +
      '<button type="button" data-act="close-modal" class="bc-icon-btn" aria-label="' + escAttr(t('form.close')) + '"><iconify-icon icon="lucide:x" width="18"></iconify-icon></button>' +
      '</div>' + body + '</div></div>';
  }

  function openModal(html) {
    var root = document.getElementById('bc-modal-root');
    if (!root) return;
    root.innerHTML = html;
    document.body.style.overflow = 'hidden';
    var first = root.querySelector('input, select, textarea');
    if (first) {
      setTimeout(function () { try { first.focus(); } catch (e) { /* ignore */ } }, 60);
    }
  }

  function closeModal() {
    releaseDocUrl();
    var root = document.getElementById('bc-modal-root');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
  }

  function typeOptions(selected) {
    return TYPES.map(function (key) {
      return '<option value="' + key + '"' + (key === selected ? ' selected' : '') + '>' + esc(t('type.' + key)) + '</option>';
    }).join('');
  }

  function statusOptions(selected) {
    return STATUSES.map(function (key) {
      return '<option value="' + key + '"' + (key === selected ? ' selected' : '') + '>' + esc(t('status.' + key)) + '</option>';
    }).join('');
  }

  function openJobModal(vehicle, job) {
    if (!vehicle) return;
    var model = job || { date: todayISO(), type: 'oil', title: '', desc: '', price: '', km: '', warranty: 12, status: 'done' };
    var body = '<form data-bc-form="job" class="bc-form" data-vehicle="' + escAttr(vehicle.id) + '" data-job="' + escAttr(job ? job.id : '') + '">' +
      '<div class="bc-grid2">' +
      '<label class="bc-field"><span>' + esc(t('form.date')) + '</span><input class="bc-input" type="date" name="date" required value="' + escAttr(model.date) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('form.type')) + '</span><select class="bc-input" name="type">' + typeOptions(model.type) + '</select></label>' +
      '<label class="bc-field"><span>' + esc(t('form.price')) + '</span><input class="bc-input" type="text" name="price" placeholder="85 €" value="' + escAttr(model.price) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('form.km')) + '</span><input class="bc-input" type="text" name="km" inputmode="numeric" placeholder="182 000" value="' + escAttr(model.km) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('form.warranty')) + '</span><input class="bc-input" type="number" min="0" max="120" step="1" name="warranty" placeholder="12" value="' + escAttr(model.warranty) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('form.status')) + '</span><select class="bc-input" name="status">' + statusOptions(model.status) + '</select></label>' +
      '</div>' +
      '<label class="bc-field"><span>' + esc(t('form.title')) + '</span><input class="bc-input" type="text" name="title" maxlength="80" placeholder="' + escAttr(t('type.oil')) + '" value="' + escAttr(model.title) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('form.desc')) + '</span><textarea class="bc-input" name="desc" rows="3" maxlength="400" placeholder="' + escAttr(t('form.descPh')) + '">' + esc(model.desc) + '</textarea></label>' +
      '<label class="bc-field"><span>' + esc(t('docs.file')) + '</span>' +
      '<span class="bc-file-box">' +
      '<input class="bc-file-input" type="file" name="pdf" accept="application/pdf,.pdf" data-bc-file>' +
      '<span class="bc-file-btn">' + esc(t('docs.choose')) + '</span>' +
      '<span class="bc-file-name">' + esc(t('docs.noFile')) + '</span>' +
      '</span></label>' +
      '<p class="text-[11px] text-slate-500 -mt-1">PDF · 2 MB</p>' +
      '<div class="flex gap-2 pt-1">' +
      '<button type="submit" class="bc-btn bc-btn-red flex-1"><iconify-icon icon="lucide:check" width="16"></iconify-icon>' + esc(t('form.save')) + '</button>' +
      '<button type="button" data-act="close-modal" class="bc-btn bc-btn-dark">' + esc(t('form.cancel')) + '</button>' +
      '</div></form>';
    openModal(modalShell(job ? t('form.editJob') : t('form.newJob'), vehicle.plate + ' · ' + vehicle.model, body));
  }

  function openVehicleModal(vehicle) {
    var v = vehicle || { plate: '', vin: '', model: '', year: '', customer: { name: '', phone: '', email: '' } };
    var body = '<form data-bc-form="vehicle" class="bc-form" data-id="' + escAttr(vehicle ? vehicle.id : '') + '">' +
      '<div class="bc-grid2">' +
      '<label class="bc-field"><span>' + esc(t('vehicle.plate')) + '</span><input class="bc-input" type="text" name="plate" required placeholder="01 A 123 BC" value="' + escAttr(v.plate) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('vehicle.year')) + '</span><input class="bc-input" type="text" name="year" placeholder="2014" value="' + escAttr(v.year) + '"></label>' +
      '</div>' +
      '<label class="bc-field"><span>' + esc(t('vehicle.model')) + '</span><input class="bc-input" type="text" name="model" required placeholder="BMW 520d (F10)" value="' + escAttr(v.model) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('vehicle.vinFull')) + '</span><input class="bc-input" type="text" name="vin" required placeholder="WBA5A5C51ED123456" value="' + escAttr(v.vin) + '"></label>' +
      '<div class="bc-grid2">' +
      '<label class="bc-field"><span>' + esc(t('customer.name')) + '</span><input class="bc-input" type="text" name="cname" required placeholder="Akmal Karimov" value="' + escAttr(v.customer.name) + '"></label>' +
      '<label class="bc-field"><span>' + esc(t('customer.phone')) + '</span><input class="bc-input" type="tel" name="cphone" placeholder="+351 912 345 678" value="' + escAttr(v.customer.phone) + '"></label>' +
      '</div>' +
      '<label class="bc-field"><span>' + esc(t('customer.email')) + '</span><input class="bc-input" type="email" name="cemail" placeholder="name@gmail.com" value="' + escAttr(v.customer.email) + '"></label>' +
      '<div class="flex gap-2 pt-1">' +
      '<button type="submit" class="bc-btn bc-btn-red flex-1"><iconify-icon icon="lucide:check" width="16"></iconify-icon>' + esc(t('form.save')) + '</button>' +
      '<button type="button" data-act="close-modal" class="bc-btn bc-btn-dark">' + esc(t('form.cancel')) + '</button>' +
      '</div></form>';
    openModal(modalShell(vehicle ? t('vehicle.edit') : t('vehicle.new'), '', body));
  }

  function openPasswordModal() {
    var body = '<form data-bc-form="password" class="bc-form" novalidate>' +
      '<label class="bc-field"><span>' + esc(t('pass.current')) + '</span><input class="bc-input" type="password" name="current" autocomplete="current-password" required></label>' +
      '<label class="bc-field"><span>' + esc(t('pass.new')) + '</span><input class="bc-input" type="password" name="next" autocomplete="new-password" minlength="6" required></label>' +
      '<label class="bc-field"><span>' + esc(t('pass.repeat')) + '</span><input class="bc-input" type="password" name="repeat" autocomplete="new-password" minlength="6" required></label>' +
      '<div class="flex gap-2 pt-1">' +
      '<button type="submit" class="bc-btn bc-btn-red flex-1">' + esc(t('form.save')) + '</button>' +
      '<button type="button" data-act="close-modal" class="bc-btn bc-btn-dark">' + esc(t('form.cancel')) + '</button>' +
      '</div></form>';
    openModal(modalShell(t('owner.settings'), 'BekCar', body));
  }

  function setFormError(form, message) {
    var box = form.querySelector('.bc-error');
    if (!box) {
      box = document.createElement('div');
      box.className = 'bc-error';
      form.insertBefore(box, form.firstChild);
    }
    box.innerHTML = '<iconify-icon icon="lucide:alert-circle" width="15"></iconify-icon><span></span>';
    box.querySelector('span').textContent = message;
  }

  function clearFormError(form) {
    var box = form.querySelector('.bc-error');
    if (box) box.parentNode.removeChild(box);
  }

  function field(form, name) {
    var el = form.elements.namedItem(name);
    return el ? String(el.value == null ? '' : el.value) : '';
  }

  /* -------------------------------------------------------------- actions */

  function submitLogin(form) {
    var plate = field(form, 'plate').trim();
    var vin = field(form, 'vin').trim();

    // Egasi: parolni ikkala maydonning istalgan biriga yozadi, ikkinchisi bo'sh qolishi mumkin.
    if ((plate.length >= 6 && hash(plate) === db.ownerHash) ||
        (vin.length >= 6 && hash(vin) === db.ownerHash)) {
      session = { role: 'owner', at: Date.now() };
      writeSession(session);
      state.ownerVehicleId = db.vehicles[0] ? db.vehicles[0].id : null;
      render();
      scrollToCabinet();
      return;
    }

    if (!plate || !vin) {
      setFormError(form, t('login.bothRequired'));
      return;
    }

    var vehicle = findVehicleByBoth(plate, vin);
    if (!vehicle) {
      setFormError(form, t('login.notFound'));
      return;
    }

    session = { role: 'customer', vehicleId: vehicle.id, at: Date.now() };
    writeSession(session);
    render();
    scrollToCabinet();
  }

  function logout() {
    session = null;
    writeSession(null);
    state.ownerVehicleId = null;
    state.search = '';
    closeModal();
    render();
  }

  function isPdfFile(file) {
    return !!file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
  }

  function makePdfRecord(file, result) {
    return {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: String(file.name || 'document').replace(/\.pdf$/i, ''),
      size: file.size,
      data: String(result || '').split(',')[1] || ''
    };
  }

  function saveJob(form) {
    if (!session || session.role !== 'owner') return;
    var vehicle = vehicleById(form.getAttribute('data-vehicle'));
    if (!vehicle) return;
    var jobId = form.getAttribute('data-job');
    var date = field(form, 'date') || todayISO();
    var warranty = parseInt(field(form, 'warranty') || '0', 10);
    if (isNaN(warranty) || warranty < 0) warranty = 0;

    var payload = {
      date: date,
      type: TYPES.indexOf(field(form, 'type')) >= 0 ? field(form, 'type') : 'other',
      title: field(form, 'title').trim(),
      desc: field(form, 'desc').trim(),
      price: field(form, 'price').trim(),
      km: field(form, 'km').trim(),
      warranty: warranty,
      status: STATUSES.indexOf(field(form, 'status')) >= 0 ? field(form, 'status') : 'done'
    };

    var pdfInput = form.elements.namedItem('pdf');
    var file = pdfInput && pdfInput.files && pdfInput.files[0];
    if (file) {
      if (!isPdfFile(file)) {
        setFormError(form, t('docs.notPdf'));
        return;
      }
      if (file.size > MAX_PDF) {
        setFormError(form, t('docs.tooBig'));
        return;
      }
    }

    var persist = function (pdfRecord) {
      var job = null;
      if (jobId) {
        job = jobById(vehicle, jobId);
        if (!job) return;
        Object.keys(payload).forEach(function (key) { job[key] = payload[key]; });
      } else {
        payload.id = 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        payload.pdfs = [];
        vehicle.jobs.push(payload);
        job = payload;
      }

      if (pdfRecord) {
        if (!Array.isArray(job.pdfs)) job.pdfs = [];
        job.pdfs.push(pdfRecord);
      }

      if (!saveDB()) return;
      closeModal();
      render();
      toast(t('toast.jobSaved'));
    };

    if (file) {
      var reader = new FileReader();
      reader.onload = function () { persist(makePdfRecord(file, reader.result)); };
      reader.onerror = function () { setFormError(form, t('docs.openError')); };
      reader.readAsDataURL(file);
    } else {
      persist(null);
    }
  }

  function saveVehicle(form) {
    if (!session || session.role !== 'owner') return;
    var id = form.getAttribute('data-id');
    var plate = field(form, 'plate').trim();
    var vin = field(form, 'vin').trim();
    var model = field(form, 'model').trim();
    if (!plate || !model || !vin) return;

    var payload = {
      plate: plate,
      vin: vin,
      model: model,
      year: field(form, 'year').trim(),
      customer: {
        name: field(form, 'cname').trim(),
        phone: field(form, 'cphone').trim(),
        email: field(form, 'cemail').trim()
      }
    };

    if (id) {
      var vehicle = vehicleById(id);
      if (vehicle) {
        vehicle.plate = payload.plate;
        vehicle.vin = payload.vin;
        vehicle.model = payload.model;
        vehicle.year = payload.year;
        vehicle.customer = payload.customer;
      }
    } else {
      payload.id = 'v' + Date.now().toString(36);
      payload.jobs = [];
      db.vehicles.push(payload);
      state.ownerVehicleId = payload.id;
    }

    saveDB();
    closeModal();
    render();
    toast(t('toast.vehicleSaved'));
  }

  function addJobPdf(vehicleId, jobId) {
    var vehicle = vehicleById(vehicleId);
    var job = jobById(vehicle, jobId);
    if (!job) return;

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,.pdf';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      if (!isPdfFile(file)) {
        toast(t('docs.notPdf'));
        return;
      }
      if (file.size > MAX_PDF) {
        toast(t('docs.tooBig'));
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        if (!Array.isArray(job.pdfs)) job.pdfs = [];
        job.pdfs.push(makePdfRecord(file, reader.result));
        if (!saveDB()) {
          job.pdfs.pop();
          return;
        }
        render();
        toast(t('toast.pdfSaved'));
      };
      reader.onerror = function () { toast(t('docs.openError')); };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function deleteJobPdf(vehicleId, jobId, pdfId) {
    if (!session || session.role !== 'owner') return;
    var vehicle = vehicleById(vehicleId);
    var job = jobById(vehicle, jobId);
    if (!job) return;
    if (!window.confirm(t('docs.deletePdfConfirm'))) return;
    job.pdfs = (job.pdfs || []).filter(function (pdf) { return pdf.id !== pdfId; });
    saveDB();
    render();
    toast(t('toast.pdfDeleted'));
  }

  function savePassword(form) {
    if (!session || session.role !== 'owner') return;
    var current = field(form, 'current');
    var next = field(form, 'next');
    var repeat = field(form, 'repeat');

    if (hash(current) !== db.ownerHash) {
      setFormError(form, t('pass.bad'));
      return;
    }
    if (next.length < 6) {
      setFormError(form, t('pass.short'));
      return;
    }
    if (next !== repeat) {
      setFormError(form, t('pass.mismatch'));
      return;
    }

    db.ownerHash = hash(next);
    saveDB();
    closeModal();
    toast(t('toast.passSaved'));
  }

  function deleteJob(vehicleId, jobId) {
    if (!session || session.role !== 'owner') return;
    var vehicle = vehicleById(vehicleId);
    if (!vehicle) return;
    if (!window.confirm(t('jobs.deleteConfirm'))) return;
    vehicle.jobs = vehicle.jobs.filter(function (job) { return job.id !== jobId; });
    saveDB();
    render();
    toast(t('toast.jobDeleted'));
  }

  function deleteVehicle(vehicleId) {
    if (!session || session.role !== 'owner') return;
    if (!window.confirm(t('vehicle.deleteConfirm'))) return;
    db.vehicles = db.vehicles.filter(function (v) { return v.id !== vehicleId; });
    if (state.ownerVehicleId === vehicleId) {
      state.ownerVehicleId = db.vehicles[0] ? db.vehicles[0].id : null;
    }
    saveDB();
    render();
    toast(t('toast.vehicleDeleted'));
  }

  function scrollToCabinet() {
    var section = document.getElementById('xizmat-tarixi');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function patchChangeLang() {
    if (typeof window.changeLang !== 'function' || window.changeLang.__bcPatched) return;
    var original = window.changeLang;
    var patched = function (lang) {
      original.apply(this, arguments);
      render();
    };
    patched.__bcPatched = true;
    window.changeLang = patched;
  }

  /* --------------------------------------------------------------- events */

  document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'bc-overlay') {
      closeModal();
      return;
    }

    var trigger = event.target.closest ? event.target.closest('[data-act]') : null;
    if (!trigger) return;

    var action = trigger.getAttribute('data-act');

    if (action === 'logout') { logout(); return; }
    if (action === 'new-vehicle') { openVehicleModal(null); return; }
    if (action === 'edit-vehicle') { openVehicleModal(vehicleById(trigger.getAttribute('data-id'))); return; }
    if (action === 'delete-vehicle') { deleteVehicle(trigger.getAttribute('data-id')); return; }
    if (action === 'select-vehicle') {
      state.ownerVehicleId = trigger.getAttribute('data-id');
      render();
      return;
    }
    if (action === 'new-job') { openJobModal(vehicleById(trigger.getAttribute('data-vehicle')), null); return; }
    if (action === 'add-job-pdf') {
      if (!session || session.role !== 'owner') return;
      addJobPdf(trigger.getAttribute('data-vehicle'), trigger.getAttribute('data-job'));
      return;
    }
    if (action === 'view-job-pdf') {
      var pdfVehicleId = trigger.getAttribute('data-vehicle');
      if (!canAccessVehicle(pdfVehicleId)) return;
      openDocViewer(jobPdf(pdfVehicleId, trigger.getAttribute('data-job'), trigger.getAttribute('data-pdf')));
      return;
    }
    if (action === 'download-job-pdf') {
      var dlVehicleId = trigger.getAttribute('data-vehicle');
      if (!canAccessVehicle(dlVehicleId)) return;
      downloadDoc(jobPdf(dlVehicleId, trigger.getAttribute('data-job'), trigger.getAttribute('data-pdf')));
      return;
    }
    if (action === 'delete-job-pdf') {
      if (!session || session.role !== 'owner') return;
      deleteJobPdf(trigger.getAttribute('data-vehicle'), trigger.getAttribute('data-job'), trigger.getAttribute('data-pdf'));
      return;
    }
    if (action === 'edit-job') {
      var vehicle = vehicleById(trigger.getAttribute('data-vehicle'));
      openJobModal(vehicle, jobById(vehicle, trigger.getAttribute('data-id')));
      return;
    }
    if (action === 'delete-job') {
      deleteJob(trigger.getAttribute('data-vehicle'), trigger.getAttribute('data-id'));
      return;
    }
    if (action === 'settings') { openPasswordModal(); return; }
    if (action === 'close-modal') { closeModal(); return; }
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.getAttribute || !form.getAttribute('data-bc-form')) return;
    event.preventDefault();

    var kind = form.getAttribute('data-bc-form');
    if (kind === 'login') { submitLogin(form); return; }
    if (kind === 'job') { saveJob(form); return; }
    if (kind === 'vehicle') { saveVehicle(form); return; }
    if (kind === 'password') { savePassword(form); return; }
  });

  document.addEventListener('input', function (event) {
    if (event.target && event.target.id === 'bc-search') {
      state.search = event.target.value;
      refreshVehicleList();
    }
  });

  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input || !input.matches || !input.matches('[data-bc-file]')) return;
    var box = input.closest('.bc-file-box');
    var label = box ? box.querySelector('.bc-file-name') : null;
    var file = input.files && input.files[0];
    if (label) label.textContent = file ? file.name : t('docs.noFile');
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
  });

  /* ----------------------------------------------------------------- boot */

  function boot() {
    try {
      db = loadDB();
      saveDB();
      session = readSession();
      if (session && session.role === 'customer' && !vehicleById(session.vehicleId)) {
        session = null;
        writeSession(null);
      }
      if (session && session.role === 'owner') {
        state.ownerVehicleId = db.vehicles[0] ? db.vehicles[0].id : null;
      }
      render();
      patchChangeLang();
      if (session && !window.location.hash) {
        setTimeout(scrollToCabinet, 700);
      }
    } catch (error) {
      if (window.console && console.error) console.error('BekCar cabinet error:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
