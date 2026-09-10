# Quill API

A RESTful API for a book reading and tracking application. Built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens), Google OAuth 2.0
- **File Storage**: Cloudinary (images, PDFs)
- **PDF Processing**: unpdf
- **Security**: Helmet, CORS, Rate Limiting, mongo-sanitize
- **Validation**: validator
- **Logging**: Morgan
- **Package Manager**: pnpm

## Key Features

### Authentication & User Management
- User registration and login with email/password
- Google OAuth 2.0 authentication
- JWT-based authentication with access and refresh tokens (refresh token stored in httpOnly cookie)
- Password reset token generation
- User profile management (update name, email)
- Account deactivation
- Role-based access control (user, admin)
- Reading streak tracking (current and longest)

### Books
- Admin-only book upload with cover image and PDF
- Automatic PDF text extraction and chunking
- Book listing with access control (public books + user's own uploads)
- Book detail retrieval
- Book download (full content with all chunks)
- Chunk-based reading (pagination)
- Automatic cascade deletion of related data when book is deleted

### Reading Progress
- Track reading progress per book (status: not_started, reading, completed)
- Current chunk index tracking
- Favorite/bookmark books
- Reading list with filtering by status
- Reading session logging (minutes, pages, chunks, words)

### Wishlist
- Add/remove books to personal wishlist
- View wishlist with book details

### Quotes
- Save quotes from books with chunk reference
- View all quotes or filter by book
- Delete quotes

### Bookmarks
- Bookmark specific chunks within books
- View bookmarks across all books or per book
- Delete bookmarks

### Ratings
- Rate books (1-5 stars)
- Update existing ratings
- View aggregate ratings (average, count) per book
- Delete ratings

### Statistics
- Personal reading statistics (total minutes, words, chunks, days)
- Filter by period (week, month, all-time)
- Books completed count
- Current and longest reading streaks

## API Overview

All routes are prefixed with `/api/v1`. Authentication required for all routes except `/auth/*` and `/health`.

| Group | Base Path | Endpoints | Auth Required |
|-------|-----------|-----------|---------------|
| Health | `/health` | `GET` | No |
| Auth | `/auth` | `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /google`, `GET /google/callback` | No (except `/me`) |
| Books | `/books` | `GET /`, `GET /:id`, `GET /:id/download`, `GET /:id/chunks/:chunkIndex`, `POST /` (admin), `DELETE /:id` (admin) | Yes |
| Users | `/users` | `GET /me`, `PATCH /me`, `DELETE /me`, `GET /` (admin), `DELETE /:id` (admin) | Yes |
| Reading | `/reading` | `GET /`, `GET /:bookId`, `PATCH /:bookId/favourite` | Yes |
| Wishlist | `/wishlist` | `GET /`, `POST /:bookId`, `DELETE /:bookId` | Yes |
| Quotes | `/quotes` | `GET /`, `GET /:bookId`, `POST /:bookId`, `DELETE /:id` | Yes |
| Bookmarks | `/bookmarks` | `GET /`, `GET /:bookId`, `POST /:bookId`, `DELETE /:id` | Yes |
| Ratings | `/ratings` | `GET /:bookId`, `POST /:bookId`, `DELETE /:bookId` | Yes |
| Stats | `/stats` | `GET /`, `POST /session` | Yes |

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/quill

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 11+
- MongoDB 7+
- Cloudinary account
- Google Cloud Console project (for OAuth)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server with hot reload
pnpm dev
```

### Production Build

```bash
# Compile TypeScript
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
src/
├── app.ts                 # Express app setup, middleware, route mounting
├── server.ts              # Entry point, DB connection, server startup
├── config/
│   ├── db.ts              # MongoDB connection
│   ├── cloudinary.ts      # Cloudinary configuration
│   └── passport.ts        # Google OAuth strategy
├── controllers/           # Request handlers
│   ├── auth.controller.ts
│   ├── book.controller.ts
│   ├── bookmark.controller.ts
│   ├── quote.controller.ts
│   ├── rating.controller.ts
│   ├── reading.controller.ts
│   ├── stats.controller.ts
│   ├── user.controller.ts
│   └── wishlist.controller.ts
├── middleware/
│   ├── auth.middleware.ts     # JWT verification
│   ├── role.middleware.ts     # Role-based access control
│   ├── upload.middleware.ts   # Multer file upload config
│   └── error.middleware.ts    # Global error handler
├── models/                # Mongoose models
│   ├── book.model.ts
│   ├── bookChunk.model.ts
│   ├── badge.model.ts
│   ├── bookmark.model.ts
│   ├── progress.model.ts
│   ├── quote.model.ts
│   ├── rating.model.ts
│   ├── readingStats.model.ts
│   ├── user.model.ts
│   └── wishlist.model.ts
├── routes/                # Route definitions
│   ├── auth.routes.ts
│   ├── book.routes.ts
│   ├── bookmark.routes.ts
│   ├── quote.routes.ts
│   ├── rating.routes.ts
│   ├── reading.routes.ts
│   ├── stats.routes.ts
│   ├── user.routes.ts
│   └── wishlist.routes.ts
├── types/
│   └── express.d.ts       # TypeScript declarations for Express
└── utils/
    ├── appError.ts        # Custom error class
    ├── chunkText.ts       # PDF text chunking logic
    ├── generateTokens.ts  # JWT token generation
    ├── pdfExtractor.ts    # PDF text extraction
    ├── updateStreak.ts    # Reading streak calculation
    └── uploadToCloudinary.ts # Cloudinary upload helper
```

## API Documentation

API documentation is available in the `docs/Quill` directory as Bruno collection files. Import them into Bruno or use the Postman collection at `docs/quill-postman.json`.

## License

ISC