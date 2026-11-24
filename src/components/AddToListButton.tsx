"use client";

import { useState } from "react";
import { useShoppingList } from "@/lib/client/store";

export function AddToListButton({ productId }: { productId: string }) {
  const { addItem, items, ready } = useShoppingList();
  const [added, setAdded] = useState(false);
  const onList = items.some((i) => i.productId === productId);

  return (
    <button
      type="button"
      className="btn-primary"
      disabled={!ready}
      onClick={() => {
        addItem({ rawText: "", productId, qty: 1, flexible: false });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Added ✓" : onList ? "Add another" : "Add to my list"}
    </button>
  );
}
