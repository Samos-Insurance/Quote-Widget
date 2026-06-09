(function (global) {
  
 const PATH = {
  quote:'signup',
  groupBenefit:'activate',
  annual:'annual',
  'annual-activate':'annual/activate',
  docusignConfirmation:'docusignConfirmation'
 }



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

  const getURL = (type,partnerId,groupId,returnURL,extraParam = {}) => {
    const urlParams = getParamsAsObject(["token","gbId","r","ln","event","bod","province","amount",
      "application","memberID","language","docusignConfirmation","groupPolicyID","policyID"])
    console.log("urlParams:",urlParams)
    const _params = {...urlParams,gbId:groupId,...extraParam,returnURL}
    console.log("_params:",_params)
    try {   
    const params = new URLSearchParams(_params)
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

    const path = PATH[resolvedType] || PATH.quote
    const baseUrl = [_baseUrl ,"partner",partnerId,path].join("/");
    const iframeUrl = new URL(baseUrl)
    

    // Existing params
    //const params = new URLSearchParams(url.search);
    iframeUrl.search = params.toString();
    
    return iframeUrl.toString();

      } catch (err) {
    console.error("Invalid iframe URL:", err);
    return null; // fallback
  }  

  }

  const isDictionary = (val) => {
    return val?val != null && typeof val === 'object' && val.constructor === Object:true;
};

  function init(config) {
    if (!config || !config.containerId) {
      throw new Error("QuoteWidget: containerId required");
    }

    if (!config || !config.partnerId) {
      throw new Error("QuoteWidget: partnerId required");
    }

    const type = config.type || "quote";

    if (type === "groupBenefit" && !config?.groupId){
      throw new Error("groupId: groupId required for groupBenefit");
    }

    // if (!config || !config.returnURL) {
    //   throw new Error("returnURL: returnURL required");
    // }


    if(!config || !isDictionary(config?.extraParam)){
      throw new Error("extraParam: extraParam should be an object");
    }


   





    

    
    
    
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error("QuoteWidget: container not found");
    }


    // Create iframe
    const iframe = document.createElement("iframe");
    const currentUrl = window.location.href;
    console.log("currentUrl:",currentUrl);
    const returnURL = config.returnURL || currentUrl
    const partnerId = config.partnerId;
    const autoScroll = config.AUTOSCROLL || false;
    const extraParam = config?.extraParam || {}
    const groupId = config?.groupId
    

    // const params = new URLSearchParams({
    //   tenant: config.tenant || "default",
    // });

    iframe.src = getURL(type,partnerId,groupId,returnURL,extraParam);
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


    case "LANGUAGE":
      if (payload?.lang) {
        //console.log("Language received from iframe:", payload.lang);

        // return via callback
        if (typeof config.onLanguageChange === "function") {
          config.onLanguageChange(payload.lang);
        }

        // optional: store globally
        global.__QUOTE_WIDGET_LANG__ = payload.lang;
      }
      break;

    default:
      break;
  }
});

    // // Resize listener
    // window.addEventListener("message", (event) => {
    //   if (event.data?.type === "RESIZE") {
    //     iframe.style.height = event.data.payload.height + "px";
    //     if(autoScroll){
    //       console.log("AUTO SCROLLING");
    //       iframe.scrollIntoView({ behavior: "smooth" });
    //     }
    //   }
    // });
  }



  global.QuoteWidget = { init };
})(window);
