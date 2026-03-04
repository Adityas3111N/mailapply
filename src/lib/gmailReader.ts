/**
 * gmailReader.ts — reads Gmail inbox to find replies to our sent emails.
 * Uses the Gmail REST API directly (no googleapis dep required).
 */

interface GmailMessage {
    messageId: string;   // our original sent messageId (the In-Reply-To value we're searching for)
    snippet: string;     // short text preview
    body: string;        // decoded full body
    receivedAt: Date;
}

async function callGmailAPI(
    path: string,
    accessToken: string,
    query?: Record<string, string>
): Promise<unknown> {
    const url = new URL(`https://gmail.googleapis.com/gmail/v1/${path}`);
    if (query) {
        for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gmail API error ${res.status}: ${text}`);
    }
    return res.json();
}

function decodeBase64Url(str: string): string {
    try {
        return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    } catch {
        return "";
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBody(payload: any): string {
    if (!payload) return "";
    if (payload.body?.data) return decodeBase64Url(payload.body.data);
    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                return decodeBase64Url(part.body.data);
            }
        }
        // fallback to any part
        for (const part of payload.parts) {
            const text = extractBody(part);
            if (text) return text;
        }
    }
    return "";
}

/**
 * Given a list of raw messageIds (from Nodemailer, e.g. "<abc@gmail.com>"),
 * search Gmail for messages that are In-Reply-To them.
 *
 * Returns a map: originalMessageId → GmailMessage
 */
export async function findReplies(
    accessToken: string,
    sentMessageIds: string[]
): Promise<Map<string, GmailMessage>> {
    const result = new Map<string, GmailMessage>();

    for (const msgId of sentMessageIds) {
        const cleanId = msgId.replace(/^<|>$/g, ""); // strip angle brackets if present
        try {
            // Search for messages in-reply to this id
            const search = await callGmailAPI("users/me/messages", accessToken, {
                q: `in:inbox rfc822msgid:${cleanId} OR "In-Reply-To: ${msgId}"`,
                maxResults: "1",
            }) as { messages?: { id: string }[] };

            if (!search.messages?.length) continue;

            const detail = await callGmailAPI(
                `users/me/messages/${search.messages[0].id}`,
                accessToken,
                { format: "full" }
            ) as { snippet?: string; payload?: unknown; internalDate?: string };

            const body = extractBody(detail.payload);
            const receivedAt = detail.internalDate
                ? new Date(parseInt(detail.internalDate))
                : new Date();

            result.set(msgId, {
                messageId: msgId,
                snippet: detail.snippet ?? body.slice(0, 150),
                body: body.slice(0, 1000),
                receivedAt,
            });
        } catch (err) {
            console.warn(`gmailReader: failed to find reply for ${msgId}:`, err);
        }
    }

    return result;
}
