/*
 * CORS policy.
 *
 * The frontend is normally served from the same origin as the API, so a
 * request whose Origin matches this server's Host is allowed without any CORS
 * headers (browsers send Origin on POST even for same-origin requests).
 * Cross-origin callers must be listed in ALLOWED_ORIGINS; anything else is
 * refused.
 */
"use strict";

const { ALLOWED_ORIGINS } = require("../config");

function applyCors(req, res) {
    const origin = req.headers.origin;

    if (!origin) {
        return true;  /* same-origin navigation / server-to-server */
    }

    /* Same origin: the page was served by this very server. */
    try {
        if (new URL(origin).host === req.headers.host) {
            return true;
        }
    } catch (error) {
        return false;
    }

    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
        return false;
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    res.setHeader("Access-Control-Max-Age", "600");

    return true;
}

module.exports = { applyCors };
