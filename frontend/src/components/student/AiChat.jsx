import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext.jsx";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const AiChat = ({ courseId }) => {
  const { backendUrl, token, user } = useContext(AppContext);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I am your course assistant. Ask me anything about this lesson.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✅ Copy function
  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("Copied");
      setTimeout(() => setCopyStatus(""), 1200);
    } catch {
      toast.error("Unable to copy right now.");
    }
  };

  // ✅ Send message
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!user || !token) {
      toast.info("Please login to use AI doubt solver.");
      return;
    }

    if (!courseId) {
      toast.error("Course context missing. Please refresh this page.");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/ai/doubt`,
        { prompt: trimmed, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              response.data.reply || "No response generated.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              response.data.message ||
              "Unable to answer right now.",
          },
        ]);
      }
    } catch (error) {
      const apiMessage =
        error.response?.data?.message || error.message;
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `I hit an error: ${apiMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            AI Doubt Solver
          </h3>
          {copyStatus && (
            <span className="text-xs font-semibold text-emerald-700">
              {copyStatus}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Ask course-specific questions and get fast explanations.
        </p>
      </div>

      {/* Chat Area */}
      <div className="h-[360px] sm:h-[430px] overflow-y-auto p-3 sm:p-4 bg-slate-50">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`max-w-[92%] sm:max-w-[82%] rounded-2xl px-3 sm:px-4 py-3 shadow-sm border ${
                message.role === "user"
                  ? "ml-auto bg-blue-600 text-white border-blue-700"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              {/* ✅ Markdown Rendering */}
              <ReactMarkdown
                components={{
                  code({ inline, className, children }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");

                    if (!inline) {
                      return (
                        <div className="relative mt-2">
                          <button
                            onClick={() => copyToClipboard(code)}
                            className="absolute right-2 top-2 text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Copy
                          </button>

                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match?.[1] || "javascript"}
                            PreTag="div"
                            className="rounded-lg"
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-gray-200 text-black px-1 rounded">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </article>
          ))}

          {/* Loading */}
          {loading && (
            <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 animate-pulse">
              Thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-100"
            placeholder="Ask your doubt. Press Enter to send, Shift+Enter for next line."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            onKeyDown={onInputKeyDown}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 sm:px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default AiChat;