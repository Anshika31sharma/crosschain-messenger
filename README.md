# 🌉 Cross-Chain Messaging DApp

This DApp allows users to **send messages between two blockchains** using the **LayerZero cross-chain messaging protocol**. The frontend is built with **Next.js**, **Tailwind CSS**, and **Framer Motion**, offering a modern and responsive UI.

## 🚀 Features

- ✅ Cross-chain message sending (Ethereum → Polygon Amoy)
- 🔐 Secure transaction signing via wallet private key
- 🌓 Light and Dark Mode support
- 🖼️ Animated UI using Framer Motion
- 📡 Live transaction logs and status updates

## 💡 Message Flow

1. User types a message and submits.
2. DApp connects to sender contract on **localhost (Hardhat)**.
3. Calls `sendMessage()` → emits transaction hash.
4. Listens for `MessageReceived` event on **Polygon Amoy**.
5. Displays:
   - ✅ TX hash from source chain
   - ✅ Delivery confirmation on destination chain
   - ✅ Message content once received

---

## 🛠️ Technologies Used

| Layer           | Tech                                 |
| --------------- | ------------------------------------ |
| Frontend        | Next.js, Tailwind CSS, Framer Motion |
| Messaging       | LayerZero                            |
| Smart Contracts | Solidity, Hardhat                    |
| Blockchain      | Ethereum (localhost), Polygon Amoy   |
| Hosting         | Vercel (Frontend)                    |

---

## 📦 How to Run Locally

## 🛠️ Setup

1. Clone the repository: `git clone https://github.com/Anshika31sharma/crosschain-messenger`
2. Navigate to the project directory: `cd crosschain-messenger`
3. Install dependencies: `npm install`
4. Build the app : `npm run build`
5. Start the development server: `npm run dev`

## 👩‍💻 Author

**Anshika Sharma**
