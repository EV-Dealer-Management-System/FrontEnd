// useHtmlParser.js
import { useState, useMemo } from "react";

/**
 * Parse HTML từ BE:
 *  - Tách style/head/attr/body
 *  - Freeze wrappers (.center/.meta/.section-title/.muted/.sign)
 *  - Xuất ra 2 phiên bản:
 *    + templateBody: có marker cố định để ráp lại đúng cấu trúc
 *    + editableBody: thân thiện với Quill (holder bằng class ph-<idx>)
 * Rebuild:
 *  - Lấy quillHtml (người dùng chỉnh) + templateBody (giữ marker)
 *  - Bơm innerHTML của từng holder ph-<idx> vào đúng wrapper gốc
 *  - Ghép lại head/styles/attrs/title hoàn chỉnh
 */
export const useHtmlParser = () => {
  const [allStyles, setAllStyles] = useState("");
  const [htmlHead, setHtmlHead] = useState("");
  const [htmlAttributes, setHtmlAttributes] = useState("");
  const [preservedWrappers, setPreservedWrappers] = useState([]);
  const [templateBody, setTemplateBody] = useState("");

  const PRESERVE_SELECTORS = [".center", ".meta", ".section-title", ".muted", ".sign"];

  const parseHtmlFromBE = (rawHtml) => {
    if (!rawHtml) return {};

    console.group("=== PARSING HTML FROM BE (BẢO TOÀN TẤT CẢ STYLE) ===");
    console.log("Raw HTML length:", rawHtml.length);

    // 1) Tách <style> và lấy head/body/attrs
    const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
    const styles = rawHtml.match(styleRegex)?.join("\n") || "";
    const cleaned = rawHtml.replace(styleRegex, "");
    const headMatch = cleaned.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    const _htmlHead = headMatch ? headMatch[1].trim() : "";
    const _htmlAttributes = (rawHtml.match(/<html([^>]*)>/i)?.[1] || "").trim();
    let bodyContent = bodyMatch ? bodyMatch[1].trim() : "";

    console.log("Head length:", _htmlHead.length);
    console.log("Body length (before):", bodyContent.length);

    // 2) Đóng băng wrappers → tạo song song:
    //    - templateDOM: giữ marker cố định
    //    - editableDOM: thay wrapper bằng holder .ph-<idx>
    const templateDOM = document.createElement("div");
    templateDOM.innerHTML = bodyContent;

    const editableDOM = document.createElement("div");
    editableDOM.innerHTML = bodyContent;

    const preserved = [];

    // Lặp qua editable trước để xác định index theo thứ tự xuất hiện
    const toFreeze = editableDOM.querySelectorAll(PRESERVE_SELECTORS.join(", "));
    Array.from(toFreeze).forEach((el, idx) => {
      const type =
        el.classList.contains("sign") ? "sign" :
        el.classList.contains("center") ? "center" :
        el.classList.contains("meta") ? "meta" :
        el.classList.contains("section-title") ? "section-title" :
        el.classList.contains("muted") ? "muted" : "unknown";

      preserved.push({
        type,
        outerHTML: el.outerHTML,
        innerHTML: el.innerHTML
      });

      // editable: thay bằng holder “an toàn với Quill”
      const holder = document.createElement("div");
      holder.className = `__ph_holder ph-${idx}`;
      holder.innerHTML = type === "sign" ? "" : el.innerHTML; // ẩn nội dung .sign trong editor
      el.replaceWith(holder);
    });

    // template: thay wrapper bằng marker + holder-template (không cho vào Quill)
    const toFreezeTemplate = templateDOM.querySelectorAll(PRESERVE_SELECTORS.join(", "));
    Array.from(toFreezeTemplate).forEach((el, idx) => {
      const marker = document.createElement("span");
      marker.className = "__ph_marker";
      marker.setAttribute("data-idx", String(idx));
      marker.setAttribute("style", "display:none");

      const tHolder = document.createElement("div");
      tHolder.className = "__ph_template_holder";
      tHolder.setAttribute("data-idx", String(idx));
      tHolder.innerHTML = ""; // sẽ bơm nội dung khi rebuild

      el.replaceWith(marker, tHolder);
    });

    const editableBody = editableDOM.innerHTML;
    const _templateBody = templateDOM.innerHTML;

    console.log("Parsed results:");
    console.log(" - Preserved wrappers:", preserved.length);
    console.log(" - Editable body length:", editableBody.length);
    console.log(" - Template body length:", _templateBody.length);
    console.groupEnd();

    return {
      editableBody,
      templateBody: _templateBody,
      allStyles: styles,
      htmlHead: _htmlHead,
      htmlAttributes: _htmlAttributes,
      preservedWrappers: preserved
    };
  };

  /**
   * Rebuild hoàn chỉnh:
   *  - quillHtml: HTML hiện tại người dùng chỉnh (editable)
   *  - subject: tiêu đề
   *  - externalAllStyles: styles lưu cache (nếu có)
   */
  const rebuildCompleteHtml = (quillHtml, subject, externalAllStyles) => {
    if (!quillHtml || !templateBody) return "";

    // 1) Lấy inner của từng holder từ quillHtml
    const quillDOM = document.createElement("div");
    quillDOM.innerHTML = quillHtml;

    // 2) Clone templateBody và bơm lại nội dung vào đúng holder
    const wrap = document.createElement("div");
    wrap.innerHTML = templateBody;

    preservedWrappers.forEach((meta, idx) => {
      const editHolder = quillDOM.querySelector(`.ph-${idx}`);
      const editedInner = editHolder ? editHolder.innerHTML : "";

      const templateHolder = wrap.querySelector(`.__ph_template_holder[data-idx="${idx}"]`);
      const marker = wrap.querySelector(`.__ph_marker[data-idx="${idx}"]`);
      if (!templateHolder || !marker) return;

      // Lấy wrapper gốc rồi gắn lại inner
      const tmp = document.createElement("div");
      tmp.innerHTML = meta.outerHTML;
      const newEl = tmp.firstElementChild;
      if (newEl) {
        if (meta.type === "sign" || meta.type === "center" || meta.type === "meta" || meta.type === "section-title" || meta.type === "muted") {
          // Giữ nguyên nội dung gốc của các block cố định
          newEl.innerHTML = meta.innerHTML || newEl.innerHTML;
        } else {
          // Các block bình thường có thể được Quill chỉnh
          newEl.innerHTML = editedInner;
        }
      }

      // thay cặp marker+holder bằng wrapper đã gắn nội dung
      const parent = templateHolder.parentNode;
      parent.replaceChild(newEl, templateHolder);
      parent.removeChild(marker);
    });

    const finalBody = wrap.innerHTML;
    const mergedStyles = externalAllStyles || allStyles || "";

    const finalHtml = `<!doctype html>
<html${htmlAttributes ? " " + htmlAttributes : ""}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject || "Hợp đồng điện tử"}</title>
${htmlHead}
${mergedStyles}
</head>
<body>
${finalBody}
</body>
</html>`;

    console.group("=== REBUILT HTML STRUCTURE ===");
    console.log("Final body length:", finalBody.length);
    console.log("Styles length:", (mergedStyles || "").length);
    console.groupEnd();

    return finalHtml;
  };

  const updateParsedStructure = (parsed) => {
    setAllStyles(parsed.allStyles || "");
    setHtmlHead(parsed.htmlHead || "");
    setHtmlAttributes(parsed.htmlAttributes || "");
    setPreservedWrappers(parsed.preservedWrappers || []);
    setTemplateBody(parsed.templateBody || "");
  };

  const resetStructureStates = () => {
    setAllStyles("");
    setHtmlHead("");
    setHtmlAttributes("");
    setPreservedWrappers([]);
    setTemplateBody("");
  };

  return {
    // states
    allStyles, htmlHead, htmlAttributes, preservedWrappers, templateBody,
    // apis
    parseHtmlFromBE,
    rebuildCompleteHtml,
    updateParsedStructure,
    resetStructureStates,
    // setters (nếu cần)
    setAllStyles, setHtmlHead, setHtmlAttributes
  };
};
