function setVisible(element: HTMLElement, visible: boolean): void {
  element.hidden = !visible;
}

export function initializeDemo(root: ParentNode = document): void {
  const tooltipTrigger = root.querySelector<HTMLButtonElement>(
    "[data-demo-tooltip-trigger]",
  );
  const tooltip = root.querySelector<HTMLElement>("[data-demo-tooltip]");
  if (tooltipTrigger && tooltip) {
    tooltipTrigger.addEventListener("mouseenter", () =>
      setVisible(tooltip, true),
    );
    tooltipTrigger.addEventListener("mouseleave", () =>
      setVisible(tooltip, false),
    );
    tooltipTrigger.addEventListener("focus", () => setVisible(tooltip, true));
    tooltipTrigger.addEventListener("blur", () => setVisible(tooltip, false));
  }

  const dialog = root.querySelector<HTMLDialogElement>("[data-demo-dialog]");
  const dialogTrigger = root.querySelector<HTMLButtonElement>(
    "[data-demo-dialog-open]",
  );
  const closeDialog = (): void => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    dialogTrigger?.focus();
  };
  dialogTrigger?.addEventListener("click", () => {
    if (!dialog) return;
    if (dialog.open) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-demo-dialog-close]",
  ))
    button.addEventListener("click", closeDialog);
  root.addEventListener("keydown", (event) => {
    if (event instanceof KeyboardEvent && event.key === "Escape") {
      if (dialog?.open) closeDialog();
    }
  });
}

initializeDemo();
