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

 const PRESERVE_SELECTORS = [".center", ".meta", ".sign"]; // cho phép sửa section-title

  const parseHtmlFromBE = (rawHtml) => {
    if (!rawHtml) return {};

    console.group("=== PARSING HTML FROM BE (BẢO TOÀN TẤT CẢ STYLE) ===");
    console.log("Raw HTML length:", rawHtml.length);

    // 1) Tách <style> và lấy head/body/attrs
    const headSection = rawHtml.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0] || '';
    const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
    const styles = headSection.match(styleRegex)?.join("\n") || "";
    const cleaned = rawHtml.replace(
    headSection,
    headSection.replace(styleRegex, "")
    );
    const headMatch = cleaned.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    const _htmlHead = headMatch ? headMatch[1].trim() : "";
    const _htmlAttributes = (rawHtml.match(/<html([^>]*)>/i)?.[1] || "").trim();
    let bodyContent = bodyMatch ? bodyMatch[1].trim() : "";

    // 👉 Dùng DOM để bóc tách chính xác, không sợ nested <div>
    const dom = document.createElement('div');
    dom.innerHTML = bodyContent;

    const signEl = dom.querySelector('.sign');
    const centerEl = dom.querySelector('.center');

    const signSection = signEl ? signEl.outerHTML : '';
    const centerSection = centerEl ? centerEl.outerHTML : '';

    if (signEl) signEl.remove();
    if (centerEl) centerEl.remove();

    const editableSection = dom.innerHTML; // phần còn lại đưa vào Quill
    console.log("Head length:", _htmlHead.length);
    console.log("Body length (before):", bodyContent.length);

    // 2) Đóng băng wrappers → tạo song song:
    //    - templateDOM: giữ marker cố định
    //    - editableDOM: thay wrapper bằng holder .ph-<idx>
    const templateDOM = document.createElement("div");
    templateDOM.innerHTML = bodyContent;

    let editableHtml = editableSection;

    const preserved = [];

    // Lặp qua editable trước để xác định index theo thứ tự xuất hiện
    const toFreeze = templateDOM.querySelectorAll(PRESERVE_SELECTORS.join(", "));
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

     const holderHTML = 
     `<div class="__ph_holder ph-${idx}" data-type="${type}">` + 
     (type === "sign" ? "&#8203;" : el.innerHTML) + '</div>'; // &#8203; = zero-width space

     editableHtml = editableHtml.replace(el.outerHTML, holderHTML);
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

    const editableBody = editableHtml;
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
      preservedWrappers: preserved,
      signBody: signSection,
      headerBody: centerSection
    };
  };

  /**
   * Rebuild hoàn chỉnh:
   *  - quillHtml: HTML hiện tại người dùng chỉnh (editable)
   *  - subject: tiêu đề
   *  - externalAllStyles: styles lưu cache (nếu có)
   */
  const rebuildCompleteHtml = (quillHtml, subject, externalAllStyles, signHtml = '', headerHtml = '') => {
    if (!quillHtml || !templateBody) return "";

    // 1) Lấy inner của từng holder từ quillHtml
    const quillDOM = document.createElement("div");
    quillDOM.innerHTML = quillHtml;

    const wrap = quillDOM;

    preservedWrappers.forEach((meta, idx) => {
      const editHolder = wrap.querySelector(`.ph-${idx}`);
      if (!editHolder && !["sign","center","meta"].includes(meta.type)) return;

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
          newEl.innerHTML = editHolder ? editHolder.innerHTML : newEl.innerHTML;
        }
      }

      if(editHolder){
        editHolder.replaceWith(newEl);
      } 
    });

    
    let finalBodyWithSign = wrap.innerHTML;
    if (!/<div[^>]*class=["'][^"']*sign[^"']*["'][^>]*>[\s\S]*?<\/div>/i.test(finalBodyWithSign) && signHtml) {
      finalBodyWithSign += '\n' + signHtml;
    }
    if (!/<div[^>]*class=["'][^"']*center[^"']*["'][^>]*>[\s\S]*?<\/div>/i.test(finalBodyWithSign) && headerHtml) {
      finalBodyWithSign = headerHtml + '\n' + finalBodyWithSign;
    }
    let mergedStyles = (externalAllStyles || allStyles || "").trim();
  if (!/\.center\s*\{[^}]*text-align\s*:\s*center[^}]*\}/i.test(mergedStyles)) {
    mergedStyles += "\n.center { text-align: center; }";
  }

  // ✅ Luôn wrap lại toàn bộ style block (ngay cả khi có <style> cũ)
  const styleWrapped = `<style>\n${mergedStyles.replace(/<\/?style[^>]*>/g, '')}\n</style>`;

    const finalHtml = `<!doctype html>
<html${htmlAttributes ? " " + htmlAttributes : ""}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject || "Hợp đồng điện tử"}</title>
${htmlHead}
${styleWrapped}
</head>
<body>
${finalBodyWithSign}
</body>
</html>`;

    console.group("=== REBUILT HTML STRUCTURE ===");
    console.log("Final body length:", finalBodyWithSign.length);
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
