export const printHTML = (html: string) => {
  // Wrap the HTML in a minimal full document
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // Create a hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  iframe.srcdoc = content;

  document.body.appendChild(iframe);

  // Print once iframe is ready
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      document.body.removeChild(iframe);
      console.error("Cannot access iframe contentWindow");
      return;
    }
    win.focus();
    win.print();

    // Cleanup after 1 second
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
};
