// ============================================================================
//  Toast notifications — a single stacked container, auto-dismissing cards.
// ============================================================================

type ToastKind = 'success' | 'error' | 'info';

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-stack';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

export function notify(message: string, kind: ToastKind = 'success'): void {
  const stack = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${kind}`;
  const icon = kind === 'error' ? '⚠' : kind === 'info' ? 'ℹ' : '✓';
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span class="toast__msg"></span>`;
  (toast.querySelector('.toast__msg') as HTMLElement).textContent = message;
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));
  window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4200);
}
