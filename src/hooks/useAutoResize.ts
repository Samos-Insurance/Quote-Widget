
"use client";

import { useEffect } from "react";

export default function useAutoResize() {
  useEffect(() => {
    let timeout: any;

    const sendHeight = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const height = document.body.scrollHeight;

        window.parent.postMessage(
          {
            type: "RESIZE",
            payload: { height },
          },
          "*"
        );
      }, 50);
    };

    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(sendHeight);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    sendHeight();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}