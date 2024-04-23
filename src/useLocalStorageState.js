import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, itemKey) {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(itemKey)) || initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(itemKey, JSON.stringify(value));
    },
    [value, itemKey]
  );
  return [value, setValue];
}
