/* ==================================================
   CALCULATION API CLIENT START
   Sends the typed values to the backend and returns the finished numbers.
   The engineering formulas live on the server, not in this file.
================================================== */
"use strict";

(function () {
    var TIMEOUT_MS = 15000;

    /*
     * The backend URL comes from the server, never from a hard-coded host:
     *   - /api/bootstrap.js sets window.MW_API_BASE from the environment,
     *   - a <meta name="mw-api-base"> tag can override it,
     *   - an empty value means "same origin", the normal setup.
     */
    function baseUrl() {
        if (typeof window.MW_API_BASE === "string" && window.MW_API_BASE !== "") {
            return window.MW_API_BASE.replace(/\/+$/, "");
        }

        var meta = document.querySelector('meta[name="mw-api-base"]');

        if (meta && meta.content) {
            return meta.content.replace(/\/+$/, "");
        }

        return "";
    }

    function unavailable() {
        return new Error(
            "The calculation service could not be reached. " +
            "Please check your connection and try again."
        );
    }

    async function request(path, options) {
        var controller = new AbortController();
        var timer = setTimeout(function () {
            controller.abort();
        }, TIMEOUT_MS);

        var response;

        try {
            response = await fetch(baseUrl() + path, {
                method: options.method || "GET",
                headers: options.headers || {},
                body: options.body,
                signal: controller.signal,
                credentials: "same-origin"
            });
        } catch (error) {
            throw unavailable();
        } finally {
            clearTimeout(timer);
        }

        var payload = null;

        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            var message = payload && payload.error && payload.error.message
                ? payload.error.message
                : "The calculation could not be completed.";

            var failure = new Error(message);
            failure.status = response.status;
            failure.field = payload && payload.error ? payload.error.field : null;
            throw failure;
        }

        if (!payload || payload.ok !== true) {
            throw unavailable();
        }

        return payload;
    }

    /**
     * Runs one calculator on the backend.
     *
     * @param {string} slug    calculator folder name, e.g. "plate"
     * @param {object} payload { values, unit, density, quantity, material }
     * @returns {Promise<object>} the finished result object
     */
    async function calculate(slug, payload) {
        var body = await request("/api/calculate/" + encodeURIComponent(slug), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        return body.result;
    }

    window.MWCalc = {
        calculate: calculate,
        request: request,
        baseUrl: baseUrl
    };
})();
/* ==================================================
   CALCULATION API CLIENT END
   This file ends here.
================================================== */
