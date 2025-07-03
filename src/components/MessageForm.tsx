'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendCrossChainMessage } from '../lib/layerzero';

export const MessageForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const onSubmit = async () => {
    setLogs([]);
    setLoading(true);
    try {
      const txHash = await sendCrossChainMessage(
        "1", // Use "1" for localhost
        "2", // Use "2" for amoy
        message,
        (msg) => setLogs((prev) => [...prev, msg])
      );
      setLogs((prev) => [...prev, `✅ Sent on source chain: ${txHash}`]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLogs((prev) => [...prev, `❌ Error: ${err.message}`]);
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${String(err)}`]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/10 text-black dark:text-white backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10 dark:bg-zinc-800"
    >
      <h2 className="lg:text-2xl text-[16px] md:text-2xl font-bold text-center mb-6">
        📨 Send Cross-Chain Message
      </h2>

      <div className="mb-4 text-center space-y-1">
        <p className="text-sm font-medium">
          <strong>Source:</strong> Localhost (Ethereum Hardhat)
        </p>
        <p className="text-sm font-medium">
          <strong>Destination:</strong> Polygon Amoy Testnet
        </p>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message..."
        className="mt-4 w-full p-3 rounded-xl border border-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
      />

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: !loading ? 1.03 : 1 }}
        onClick={onSubmit}
        disabled={!message || loading}
        className={`mt-5 w-full py-3 rounded-xl text-lg font-semibold transition-colors ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </motion.button>

      {logs.length > 0 && (
        <div className="mt-6 max-h-64 overflow-y-auto p-4 rounded-xl bg-black/20 border border-zinc-600 text-sm font-mono space-y-2">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {log}
            </motion.div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </motion.div>
  );
};
