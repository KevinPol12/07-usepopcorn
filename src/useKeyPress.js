import { useEffect } from "react";

export function useKeyPress(keyToListen, action) {
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === keyToListen.toLowerCase()) {
          action();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [action, keyToListen]
  );
}
