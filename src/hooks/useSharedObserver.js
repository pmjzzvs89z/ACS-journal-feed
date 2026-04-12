/**
 * Shared IntersectionObserver singleton.
 *
 * Instead of creating one IntersectionObserver per ArticleCard (which means
 * 500+ observers for a large feed), all cards register with a single
 * observer through observeElement / unobserveElement. The observer dispatches
 * each entry to the per-element callback stored in the Map.
 */

/** @type {Map<Element, (entry: IntersectionObserverEntry) => void>} */
const callbacks = new Map();

/** @type {IntersectionObserver | null} */
let observer = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = callbacks.get(entry.target);
          if (cb) cb(entry);
        }
      },
      { threshold: 0.1 }
    );
  }
  return observer;
}

/**
 * Register an element with the shared observer.
 * @param {Element} element
 * @param {(entry: IntersectionObserverEntry) => void} callback
 */
export function observeElement(element, callback) {
  callbacks.set(element, callback);
  getObserver().observe(element);
}

/**
 * Unregister an element from the shared observer.
 * @param {Element} element
 */
export function unobserveElement(element) {
  getObserver().unobserve(element);
  callbacks.delete(element);
}
