EDULINK – Öğrenci / Öğretmen / Veli Ödev ve Takip Sistemi

Edulink, öğretmen, öğrenci ve velilerin bir arada bulunduğu modern bir ödev takip ve yönetim platformudur.
Backend .NET 9 (ASP.NET Core Web API) ile, frontend ise React ile geliştirilmiştir.

Sistem; kullanıcı rolleri, ödev ekleme, teslim etme, not verme, velinin çocuklarını takip etmesi gibi birçok özelliği kapsar.

Özellikler

Öğretmen Paneli

Ödev oluşturma
Ders seçerek ödev verme
Ödevleri listeleme
Öğrenci teslimlerini görüntüleme
Not verme & geri bildirim yazma

Öğrenci Paneli

Aktif ödevleri görüntüleme
Ödev teslimi (dosya veya metin)
Teslim edilen ödevleri görme

Veli Paneli

Çocuğuna bağlı ödevleri görme
Çocuğun teslim geçmişini inceleme

Genel Özellikler

JWT tabanlı kimlik doğrulama
PostgreSQL veri tabanı
Öğretmen–Öğrenci–Veli ilişkileri
Temiz mimari kullanımına uygun yapı
Modern React arayüzü

Kullanılan Teknolojiler

Backend (.NET)
ASP.NET Core Web API (.NET 9)
Entity Framework Core
PostgreSQL
JWT Authentication
Migrations

Frontend (React)

React + Hooks
Fetch API
Bootstrap
Component yapısı

Edulink/
│
├── Edulink/                # .NET backend
│   ├── Controllers/        # API Controllers
│   ├── Models/             # Veri modelleri
│   ├── Data/               # DbContext
│   ├── Migrations/         # EF Core migrations
│   └── appsettings.json    # DB bağlantısı
│
└── clientapp/              # React frontend
    ├── src/
    ├── public/
    └── package.json

Backend Çalıştırma

Bağımlılıkları yükle
dotnet restore

Migration uygula
dotnet ef database update

API'yi başlat
dotnet run

API varsayılan olarak şu adreste çalışır:
https://localhost:7299/api

Frontend Çalıştırma

cd Edulink/clientapp
npm install
npm start

Tarayıcı otomatik olarak açılır:
http://localhost:3000

Varsayılan Rollerin Açıklaması
| Rol      | Açıklama                       |
| -------- | ------------------------------ |
| öğrenci  | Ödev görüntüleme, teslim etme  |
| öğretmen | Ödev oluşturma, not verme      |
| veli     | Öğrenci ödevlerini görüntüleme |

İletişim
Kaan Alp ÖZDEMİR

