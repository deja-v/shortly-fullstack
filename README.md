# Shortly - An URL Shortener

Shortly is a full-stack URL shortener application that allows users to shorten long URLs, manage their shortened links, and view a history of their URL operations. Built with modern web technologies, Shortly offers a simple and intuitive user experience.

---

## Features

- **URL Shortening**: Convert long URLs into shorter, easy-to-share links.
- **History Tracking**: Keep a record of all shortened URLs with details.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## Tech Stack

### Frontend
- **React**
- **HTML, CSS, JavaScript**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB Atlas** (as the database)

---

## Installation

### Prerequisites
Ensure you have the following installed:
- **Node.js**
- **npm** or **yarn**

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/deja-v/shortly-fullstack.git
   cd shortly-fullstack
   ```

2. **Set Up the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the backend directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=8000
   ```
   Start the backend server:
   ```bash
   npm run start
   ```

3. **Set Up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.

---


## API Endpoints

### Base URL: `http://localhost:5000`

- **POST /shorten**
  - Request: `{ "url": "https://example.com" }`

- **GET /:shortUrl**
  - Redirects to the original long URL.

---

## Future Enhancements

- User authentication for personalized URL management.
- Analytics to track link clicks and performance.
- Improved UI/UX for better user engagement.

---

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests.

---

Made with ❤️ by Devang Jain
