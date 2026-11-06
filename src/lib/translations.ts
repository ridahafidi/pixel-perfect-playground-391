export const translations = {
  "de": [
    "Startseite",
    "Funktionen",
    "Preise & Download",
    "Bewertungen",
    "Software herunterladen",
    "Sprache wählen",
    "Sprachen",
    "Sprache auswählen",
    "Die Website wird schrittweise übersetzt. Noch nicht übersetzte Inhalte erscheinen auf Deutsch."
  ],
  "en": [
    "Home",
    "Features",
    "Pricing & Download",
    "Reviews",
    "Download software",
    "Choose language",
    "languages",
    "Select language",
    "Translation is being completed. Untranslated content remains in German."
  ],
  "fr": [
    "Accueil",
    "Fonctionnalités",
    "Tarifs et téléchargement",
    "Avis",
    "Télécharger le logiciel",
    "Choisir la langue",
    "langues",
    "Choisir une langue",
    "La traduction est en cours. Les contenus non traduits restent en allemand."
  ],
  "es": [
    "Inicio",
    "Funciones",
    "Precios y descarga",
    "Reseñas",
    "Descargar software",
    "Elegir idioma",
    "idiomas",
    "Seleccionar idioma",
    "La traducción está en curso. El contenido pendiente permanece en alemán."
  ],
  "it": [
    "Home",
    "Funzionalità",
    "Prezzi e download",
    "Recensioni",
    "Scarica il software",
    "Scegli la lingua",
    "lingue",
    "Seleziona la lingua",
    "La traduzione è in corso. I contenuti non tradotti rimangono in tedesco."
  ],
  "pt": [
    "Início",
    "Funcionalidades",
    "Preços e download",
    "Avaliações",
    "Baixar software",
    "Escolher idioma",
    "idiomas",
    "Selecionar idioma",
    "A tradução está em andamento. O conteúdo não traduzido permanece em alemão."
  ],
  "nl": [
    "Startpagina",
    "Functies",
    "Prijzen en download",
    "Beoordelingen",
    "Software downloaden",
    "Kies taal",
    "talen",
    "Selecteer taal",
    "De vertaling is in uitvoering. Niet-vertaalde inhoud blijft in het Duits."
  ],
  "pl": [
    "Strona główna",
    "Funkcje",
    "Ceny i pobieranie",
    "Opinie",
    "Pobierz oprogramowanie",
    "Wybierz język",
    "języków",
    "Wybierz język",
    "Tłumaczenie trwa. Nieprzetłumaczone treści pozostają po niemiecku."
  ],
  "tr": [
    "Ana sayfa",
    "Özellikler",
    "Fiyatlar ve indirme",
    "Yorumlar",
    "Yazılımı indir",
    "Dil seç",
    "dil",
    "Dil seçin",
    "Çeviri devam ediyor. Çevrilmemiş içerikler Almanca kalır."
  ],
  "ro": [
    "Acasă",
    "Funcționalități",
    "Prețuri și descărcare",
    "Recenzii",
    "Descarcă software-ul",
    "Alege limba",
    "limbi",
    "Selectează limba",
    "Traducerea este în curs. Conținutul netradus rămâne în germană."
  ],
  "ru": [
    "Главная",
    "Функции",
    "Цены и загрузка",
    "Отзывы",
    "Скачать программу",
    "Выбрать язык",
    "языков",
    "Выберите язык",
    "Перевод продолжается. Непереведённый контент остаётся на немецком."
  ],
  "uk": [
    "Головна",
    "Можливості",
    "Ціни та завантаження",
    "Відгуки",
    "Завантажити програму",
    "Вибрати мову",
    "мов",
    "Виберіть мову",
    "Переклад триває. Неперекладений вміст залишається німецькою."
  ],
  "ar": [
    "الرئيسية",
    "المميزات",
    "الأسعار والتنزيل",
    "التقييمات",
    "تنزيل البرنامج",
    "اختر اللغة",
    "لغة",
    "اختيار اللغة",
    "الترجمة قيد الإعداد. المحتوى غير المترجم سيبقى بالألمانية."
  ],
  "zh": [
    "首页",
    "功能",
    "价格与下载",
    "评价",
    "下载软件",
    "选择语言",
    "种语言",
    "选择语言",
    "翻译正在进行中。未翻译的内容仍以德语显示."
  ]
} as const;
export type Locale = keyof typeof translations;
export type TranslationKey = "home" | "features" | "pricing" | "reviews" | "download" | "choose" | "languages" | "select" | "notice";
const keys = ["home","features","pricing","reviews","download","choose","languages","select","notice"] as const;
export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale][keys.indexOf(key)];
}
