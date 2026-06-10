/**
 * @typedef {Object} QuoteWidgetConfig
 * @property {string} containerId - The ID of the DOM element to mount the widget
 * @property {string} partnerId - Your unique partner ID
 * @property {'quote' | 'groupBenefit' | 'annual' | 'annual-activate' | 'docusignConfirmation'} [type] - The type of flow
 * @property {string} [groupId] - Required if type is groupBenefit
 * @property {string} [returnURL] - URL to redirect to after completion
 * @property {Record<string, any>} [extraParam] - Additional URL parameters to append
 * @property {boolean} [AUTOSCROLL] - Whether to auto-scroll the iframe on resize
 */

/**
 * Initializes the Samos Quote Widget
 * @param {QuoteWidgetConfig} config 
 */
(function (global) {
  // Injected dynamically by esbuild during the pipeline
  const VERSION = "__VERSION__";

  const PATH = {
    quote: 'signup',
    groupBenefit: 'activate',
    annual: 'annual',
    'annual-activate': 'annual/activate',
    docusignConfirmation: 'docusignConfirmation'
  };

  const getParamsAsObject = (paramsToFind) => {
    // Get current URL search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const result = {};

    paramsToFind.forEach(param => {
      const value = searchParams.get(param);
      
      // Only add to object if the parameter actually exists in the URL
      if (value !== null) {
        result[param] = value;
      }
    });

    return result;
  };

  const getURL = (type, partnerId, groupId, returnURL, extraParam = {}) => {
    const urlParams = getParamsAsObject([
      "token", "gbId", "r", "ln", "event", "bod", "province", "amount",
      "application", "memberID", "language", "docusignConfirmation", "groupPolicyID", "policyID"
    ]);
    
    const _params = { ...urlParams, gbId: groupId, ...extraParam, returnURL };
    
    try {
      const params = new URLSearchParams(_params);
      let resolvedType = type;
      if (params.get("docusignConfirmation") === "true") {
        resolvedType = "docusignConfirmation";
      }
      
      let _baseUrl;
      try {
        _baseUrl = process.env.BASE_URL;
      } catch (e) {
        _baseUrl = "http://localhost:3000";
      }

      const path = PATH[resolvedType] || PATH.quote;
      const baseUrl = [_baseUrl, "partner", partnerId, path].join("/");
      const iframeUrl = new URL(baseUrl);

      iframeUrl.search = params.toString();
      
      return iframeUrl.toString();

    } catch (err) {
      console.error("Invalid iframe URL:", err);
      return null; // fallback
    }
  };

  const isDictionary = (val) => {
    return val ? val != null && typeof val === 'object' && val.constructor === Object : true;
  };

  function init(config) {
    if (!config || !config.containerId) {
      throw new Error(`QuoteWidget v${VERSION}: containerId required`);
    }

    if (!config || !config.partnerId) {
      throw new Error(`QuoteWidget v${VERSION}: partnerId required`);
    }

    const type = config.type || "quote";

    if (type === "groupBenefit" && !config?.groupId) {
      throw new Error(`QuoteWidget v${VERSION}: groupId required for groupBenefit`);
    }

    if (!config || !isDictionary(config?.extraParam)) {
      throw new Error(`QuoteWidget v${VERSION}: extraParam should be an object`);
    }

    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`QuoteWidget v${VERSION}: container not found`);
    }

    // Create iframe
    const iframe = document.createElement("iframe");
    const currentUrl = window.location.href;
    const returnURL = config.returnURL || currentUrl;
    const partnerId = config.partnerId;
    const autoScroll = config.AUTOSCROLL || false;
    const extraParam = config?.extraParam || {};
    const groupId = config?.groupId;

    iframe.src = getURL(type, partnerId, groupId, returnURL, extraParam);
    iframe.style.width = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.sandbox = "allow-scripts allow-forms allow-same-origin allow-popups";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.loading = "eager";
    
    const allowedOrigin = new URL(iframe.src).origin;
    container.appendChild(iframe);

    window.addEventListener("message", (event) => {
      if (event.origin !== allowedOrigin) return;
      if (event.source !== iframe.contentWindow) return;

      const { type, payload } = event.data || {};

      switch (type) {
        case "RESIZE":
          if (
            payload &&
            typeof payload.height === "number" &&
            payload.height > 0 &&
            payload.height < 10000
          ) {
            iframe.style.height = payload.height + "px";
          }

          if (autoScroll) {
            iframe.scrollIntoView({ behavior: "smooth" });
          }
          break;

        default:
          break;
      }
    });
  }

  // Support for standard script tags (CDN)
  global.QuoteWidget = { init, version: VERSION };

  // Support for NPM (React, Vue, Node imports)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, version: VERSION };
  }

// Prevents SSR crashes in frameworks like Next.js where window is initially undefined
})(typeof window !== "undefined" ? window : globalThis);