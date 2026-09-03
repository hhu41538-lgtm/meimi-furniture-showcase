export async function copyPageLink(url: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Some embedded webviews expose Clipboard API but reject its permission.
    }
  }

  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  try {
    input.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    input.remove();
  }
}
