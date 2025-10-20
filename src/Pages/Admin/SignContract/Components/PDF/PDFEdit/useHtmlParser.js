import { useState } from 'react';

// Hook xử lý parse và rebuild HTML structure từ/về BE
export const useHtmlParser = () => {
  // ✅ Lưu trữ cấu trúc HTML gốc từ BE
  const [allStyles, setAllStyles] = useState(''); // Lưu TẤT CẢ style blocks
  const [htmlHead, setHtmlHead] = useState('');
  const [htmlAttributes, setHtmlAttributes] = useState('');

  // ✅ Function để tách HTML structure từ BE - BẢO TOÀN TẤT CẢ STYLE
  const parseHtmlFromBE = (rawHtml) => {
    console.log('=== PARSING HTML FROM BE (BẢO TOÀN TẤT CẢ STYLE) ===');
    console.log('Raw HTML length:', rawHtml?.length || 0);
    
    if (!rawHtml) return { bodyContent: '', allStyles: '', htmlHead: '', htmlAttributes: '' };
    
    // ✅ Tách TẤT CẢ <style> tags (cả trong <head> và <body>)
    const allStyleMatches = rawHtml.match(/<style[\s\S]*?<\/style>/gi);
    const allStyles = allStyleMatches ? allStyleMatches.join('\n') : '';
    
    // ✅ Tách <head> content (KHÔNG bao gồm <style> đã tách)
    let headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    let htmlHead = '';
    if (headMatch) {
      htmlHead = headMatch[1]
        .replace(/<style[\s\S]*?<\/style>/gi, '') // Xóa style đã tách
        .replace(/<title[\s\S]*?<\/title>/gi, '') // Xóa title để tránh trùng
        .trim();
    }
    
    // ✅ Tách html attributes
    const htmlMatch = rawHtml.match(/<html([^>]*)>/i);
    const htmlAttributes = htmlMatch ? htmlMatch[1] : ' lang="vi"';
    
    // ✅ Tách body content và LOẠI BỎ tất cả <style> rải rác
    let bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;
    
    // Loại bỏ tất cả <style> rải rác trong body content
    bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    console.log('Parsed results:');
    console.log('- All styles length:', allStyles.length);
    console.log('- Style blocks found:', allStyleMatches?.length || 0);
    console.log('- Head content length:', htmlHead.length);
    console.log('- HTML attributes:', htmlAttributes);
    console.log('- Body content length (after removing styles):', bodyContent.length);
    
    return { bodyContent, allStyles, htmlHead, htmlAttributes };
  };

  // ✅ Function để rebuild HTML đầy đủ khi gửi về BE - BAO GỒM TẤT CẢ STYLE
  const rebuildCompleteHtml = (bodyContent, contractSubject) => {
    console.log('=== REBUILDING COMPLETE HTML (BẢO TOÀN TẤT CẢ STYLE) ===');
    console.log('Body content length:', bodyContent?.length || 0);
    console.log('All styles length:', allStyles?.length || 0);
    console.log('HTML head length:', htmlHead?.length || 0);
    
    const finalHtml = `<!doctype html>
<html${htmlAttributes}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${contractSubject || 'Hợp đồng điện tử'}</title>
${htmlHead}
${allStyles}
</head>
<body>
${bodyContent}
</body>
</html>`;

    console.log('Final HTML length:', finalHtml.length);
    console.log('Styles included in rebuild:', !!allStyles);
    return finalHtml;
  };

  // Method để update parsed structure states
  const updateParsedStructure = (parsedResult) => {
    setAllStyles(parsedResult.allStyles);
    setHtmlHead(parsedResult.htmlHead);
    setHtmlAttributes(parsedResult.htmlAttributes);
  };

  // Method để reset structure states
  const resetStructureStates = () => {
    setAllStyles('');
    setHtmlHead('');
    setHtmlAttributes('');
  };

  return {
    allStyles,
    htmlHead,
    htmlAttributes,
    parseHtmlFromBE,
    rebuildCompleteHtml,
    updateParsedStructure,
    resetStructureStates,
    setAllStyles,
    setHtmlHead,
    setHtmlAttributes
  };
};
