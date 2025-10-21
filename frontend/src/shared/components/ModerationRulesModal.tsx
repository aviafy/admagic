/**
 * Modal displaying content moderation rules and guidelines
 */

"use client";

import { useEffect } from "react";

interface ModerationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModerationRulesModal({
  isOpen,
  onClose,
}: ModerationRulesModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Content Moderation Rules
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <p className="text-gray-700 leading-relaxed">
              Our AI-powered moderation system automatically reviews all content
              to ensure a safe and welcoming community. Here's how content is
              evaluated:
            </p>
          </div>

          {/* Approved Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <h3 className="text-lg font-bold text-green-700">
                Approved Content
              </h3>
            </div>
            <div className="ml-10 space-y-2">
              <p className="text-gray-700">
                Content that meets all community guidelines and safety
                standards.
              </p>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  Examples:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>General conversations and discussions</li>
                  <li>Appropriate images and photos</li>
                  <li>Educational and informative content</li>
                  <li>Creative and artistic expressions (within guidelines)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Flagged Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-yellow-700">
                Flagged Content
              </h3>
            </div>
            <div className="ml-10 space-y-2">
              <p className="text-gray-700">
                Content with potential concerns that requires manual review by
                our moderation team before publication.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800 mb-1">
                  Common reasons for flagging:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Ambiguous or borderline content</li>
                  <li>Potentially sensitive topics</li>
                  <li>Content requiring context for proper evaluation</li>
                  <li>Unclear intent or meaning</li>
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800">
                  ⏱️ What happens: Your content will be held for review and
                  published after manual approval.
                </p>
              </div>
            </div>
          </div>

          {/* Rejected Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-lg">❌</span>
              </div>
              <h3 className="text-lg font-bold text-red-700">
                Rejected Content
              </h3>
            </div>
            <div className="ml-10 space-y-2">
              <p className="text-gray-700 font-medium">
                Content that violates our community guidelines and is not
                allowed on the platform.
              </p>

              {/* Prohibited Categories */}
              <div className="space-y-3">
                {/* Adult Content */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-lg mt-0.5">
                      🔞
                    </span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Adult & Sexually Explicit Content (+18)
                      </p>
                      <ul className="text-sm text-gray-700 mt-1 space-y-0.5 list-disc list-inside ml-2">
                        <li>Pornographic content</li>
                        <li>Nudity or sexually explicit material</li>
                        <li>Sexually suggestive content</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Violence */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-lg mt-0.5">
                      ⚔️
                    </span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Violence & Harmful Content
                      </p>
                      <ul className="text-sm text-gray-700 mt-1 space-y-0.5 list-disc list-inside ml-2">
                        <li>Graphic violence or gore</li>
                        <li>Content depicting self-harm</li>
                        <li>Cruelty to animals or people</li>
                        <li>Content promoting harm</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Minors */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-lg mt-0.5">
                      🚨
                    </span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Content Involving Minors
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Any content that exploits or endangers minors is
                        strictly prohibited and may be reported to authorities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other Violations */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-lg mt-0.5">
                      🚫
                    </span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Other Violations
                      </p>
                      <ul className="text-sm text-gray-700 mt-1 space-y-0.5 list-disc list-inside ml-2">
                        <li>Hate speech or discrimination</li>
                        <li>Harassment or bullying</li>
                        <li>Spam or misleading content</li>
                        <li>Illegal activities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  🤖 AI-Powered Analysis
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Our system uses advanced AI (OpenAI GPT & Google Gemini) to
                  analyze both text and images. For certain flagged content, the
                  AI may generate visual explanations to help you understand why
                  content was moderated.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
            <p className="text-sm font-semibold text-cyan-900 mb-2">
              💡 Tips for Success:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside ml-2">
              <li>Be respectful and considerate of all community members</li>
              <li>
                When in doubt, err on the side of caution with your content
              </li>
              <li>
                Context matters - clearly explain potentially ambiguous content
              </li>
              <li>Review your content before submitting</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
