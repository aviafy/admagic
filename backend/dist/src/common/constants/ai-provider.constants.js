"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_AI_PROVIDER = exports.AIProvider = void 0;
var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "openai";
    AIProvider["GEMINI"] = "gemini";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
exports.DEFAULT_AI_PROVIDER = AIProvider.OPENAI;
//# sourceMappingURL=ai-provider.constants.js.map