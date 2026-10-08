import crypto from "node:crypto";

/**
 * AI 대화 내용을 DB에 저장하기 전에 AES-256-GCM으로 암호화한다.
 * 키(CHAT_ENCRYPTION_KEY)는 Vercel 환경변수에만 있어서, Supabase 대시보드·SQL Editor·DB 유출로는
 * 알아볼 수 없는 글자만 보이고 앱(학생 본인 화면, 교사 화면, 가명 내보내기)에서만 풀린다.
 * 키를 잃거나 바꾸면 예전 대화를 읽을 수 없으니 키를 앱 밖에 따로 보관해야 한다.
 *
 * 저장 형식: "enc:v1:" + base64(iv 12바이트 | 인증태그 16바이트 | 암호문)
 */
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const raw = process.env.CHAT_ENCRYPTION_KEY;
  if (raw) {
    const key = Buffer.from(raw, "base64");
    if (key.length === 32) return key;
    console.error("CHAT_ENCRYPTION_KEY는 base64로 인코딩한 32바이트여야 합니다.");
    return null;
  }
  // 로컬 개발에서만 임시 키를 허용한다. 운영에서 비어 있으면 대화를 저장하지 않는다.
  if (process.env.NODE_ENV !== "production") return crypto.createHash("sha256").update("dev-only-chat-key").digest();
  return null;
}

export function isChatEncryptionReady() {
  return getKey() !== null;
}

export function encryptChat(plain: string): string {
  const key = getKey();
  if (!key) throw new Error("CHAT_ENCRYPTION_KEY_MISSING");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

/** 암호문을 푼다. 암호화 전에 저장된 옛 행은 그대로 돌려주고, 풀 수 없으면 안내 문구를 돌려준다. */
export function decryptChat(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored;
  const key = getKey();
  if (!key) return "[키가 없어 읽을 수 없는 대화]";
  try {
    const data = Buffer.from(stored.slice(PREFIX.length), "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return "[키가 맞지 않아 읽을 수 없는 대화]";
  }
}
