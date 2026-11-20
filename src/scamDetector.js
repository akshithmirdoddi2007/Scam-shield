
const scamPatterns = [
  {
    category: "OTP Theft",
    words: ["share otp", "send otp", "otp verification", "otp code"],
    explanation: "The message may be trying to obtain your one-time password."
  },
  {
    category: "Banking Fraud",
    words: ["bank account", "account blocked", "account suspended", "kyc update"],
    explanation: "The message uses banking or account-related language that may be used in impersonation scams."
  },
  {
    category: "UPI Fraud",
    words: ["upi pin", "scan qr", "payment pending", "receive payment"],
    explanation: "The message contains payment-related language. Never enter your UPI PIN to receive money."
  },
  {
    category: "Prize Scam",
    words: ["you won", "winner", "lottery", "claim your prize", "lucky draw"],
    explanation: "Unexpected prize notifications can be used to trick people into paying fees or sharing information."
  },
  {
    category: "Urgency Tactics",
    words: ["act now", "immediately", "urgent", "within 24 hours", "last chance"],
    explanation: "The message creates urgency to pressure you into acting without checking."
  },
  {
    category: "Job Scam",
    words: ["registration fee", "work from home", "earn money daily", "job offer"],
    explanation: "The message contains job-related claims that should be independently verified."
  },
  {
    category: "Phishing",
    words: ["click here", "verify your identity", "confirm your password", "login immediately"],
    explanation: "The message may be attempting to direct you to a fake login or verification page."
  }
];

const suspiciousLinkPattern =
  /https?:\/\/|www\.|bit\.ly|tinyurl|t\.co/i;

export function analyzeMessage(message) {
  const text = message.toLowerCase();

  let findings = [];

  scamPatterns.forEach((pattern) => {
    const matchedWords = pattern.words.filter((word) =>
      text.includes(word)
    );

    if (matchedWords.length > 0) {
      findings.push({
        category: pattern.category,
        explanation: pattern.explanation,
        matchedWords
      });
    }
  });

  if (suspiciousLinkPattern.test(text)) {
    findings.push({
      category: "Link Detected",
      explanation: "The message contains a web address. Check its destination independently before opening it.",
      matchedWords: ["URL or shortened link"]
    });
  }

  const riskScore = Math.min(
    100,
    findings.reduce((score, finding) => {
      return score + (finding.category === "Link Detected" ? 15 : 20);
    }, 0)
  );

  let riskLevel = "Low";

  if (riskScore >= 60) {
    riskLevel = "High";
  } else if (riskScore >= 30) {
    riskLevel = "Medium";
  }

  return {
    riskScore,
    riskLevel,
    findings,
    isSuspicious: findings.length > 0
  };
}
