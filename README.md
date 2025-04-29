# 📈 Job Application Tracker

A full-stack tool that automatically tracks your job applications from your Gmail inbox, saves them into a CSV file, and visualizes your progress with beautiful, interactive charts on a web dashboard.

Built with **Node.js**, **Express**, **Chart.js**, and **Google APIs**.

---

## 🚀 Key Features

- 🔍 **Automatic Gmail Scanning**: Fetches all job application emails since January 2025
- 📂 **Structured Data Storage**: Saves data into a clean `applications.csv`
- 🧠 **Smart Status Detection**: Separates "Applied" and "Rejected" emails automatically
- 📊 **Interactive Visual Dashboard**:
  - **Applications Timeline Chart** — Number of applications submitted each month
  - **Status Pie Chart** — Breakdown of Applied vs Rejected
  - **Top Companies Bar Chart** — Which companies you've applied to most
- 📉 **Insights Extraction**:
  - How many applications per month
  - Top companies and recruiters
  - Visual rejection trends (to analyze improvements)
- 🌍 **Runs Locally or Deployable Online**
- 🔄 **Easy Update System**: Just run `node index.js` to refresh your data
- 🛡️ **Secrets Protected**: `.gitignore` for OAuth tokens and credentials
- 🧩 **Optional SQL Export**: Convert your applications into a SQL database (`generateSQL.js`)

---

## 📦 Project Structure

```plaintext
├── applications.csv         # Data file with all applications
├── credentials.json          # (Ignored) Google OAuth credentials
├── token.json                # (Ignored) Gmail OAuth token
├── index.js                  # Gmail fetcher and CSV updater
├── generateSQL.js            # CSV to SQL file generator (optional)
├── server.js                 # Express.js backend server
├── public/
│   └── index.html            # Frontend dashboard (Chart.js)
├── .gitignore
└── README.md
