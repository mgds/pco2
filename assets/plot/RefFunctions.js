class RefFunctions {
  static referenceFormatShort(reference) {
    return `${RefFunctions.authorsBasicFormat(reference.author)} (${reference.issued['date-parts'][0][0]})`;
  }
  static referenceFormatFull(reference) {
    var ref = `<span class="reference">`;
    ref += `<span class="refauthors">${RefFunctions.authorsFormatFull(reference.author)}</span> `;
    ref += `<span class="refyear">(${reference.issued['date-parts'][0][0]})</span> `;
    ref += `<span class="reftitle" style="font-weight:bold;">`;
    ref += `<a style="color:#0c1f72;" href="https://doi.org/${reference.doi}">${reference.title}</a>.`;
    ref += `</span> `;
    if (reference.type == 'article-journal')
      ref += RefFunctions.journalFormat(reference);
    else if (reference.type == 'chapter')
      ref += RefFunctions.chapterFormat(reference);
    ref += ` <span class="refdoi"><a href="https://doi.org/${reference.doi}">https://doi.org/${reference.doi}</a></span>`;
    ref += `</span>`;
    return ref;
  }

  static journalFormat(reference) {
    var ref = `<span class="refjournal">`;
    ref += `<span style="font-style:italic;" class="journaltitle">${reference['container-title']}</span>`;
    if (reference.volume) {
      ref += `, <span style="font-style:italic;" class="journalvolume">${reference.volume}</span>`;
      if (reference['journal-issue'] && reference['journal-issue'].issue)
        ref += ` <span class="journalissue">(${reference['journal-issue'].issue})</span>`;
    }
    if (reference.page)
      ref += `, <span class="journalpages">${reference.page}</span>.`;
    ref += `</span>`;
    return ref;
  }
  static chapterFormat(reference) {
    var ref = `<span class="refchapter">`;
    ref += `In <span class="refeditors">${RefFunctions.editorsFormat(reference)}</span>, `;
    ref += `<span style="font-style:italic;" class="booktitle">${reference['container-title']}</span>`;
    if (reference.volume || reference.page) {
      ref += `(`;
      if (reference.volume)
        ref += `<span style="font-style:italic;" class="journalvolume">${reference.volume}</span>`;
      if (reference.volume && reference.page) ref += `, `;
      if (reference.page)
        ref += `<span style="journalpages">${reference.page}</span>`;
      ref += `)`;
    }
    ref += `. `;
    ref += `<span class="refpublisher">${reference['publisher-location']}: ${reference.publisher}</span>`;
    ref += `</span>`;
    return ref;
  }
  static authorsFormatFull(authors) {
    if (!authors)
      return '';
    if (authors.length === 1) {
      return RefFunctions.authorFormatFull(authors[0]);
    } else if (authors.length === 2) {
      return RefFunctions.authorFormatFull(authors[0])+' &amp; '+RefFunctions.authorFormatFull(authors[1]);
    } else if (authors.length > 2) {
      var auFormat = [];
      for (var i = 0; i<authors.length; i++) {
        auFormat.push(RefFunctions.authorFormatFull(authors[i]));
      }
      auFormat[authors.length-1] = '&amp; ' + auFormat[authors.length-1];
      return auFormat.join(", ");
    }
  }
  static authorFormatFull(auBlock) {
    if (!auBlock.given || !auBlock.family) return '';
    var el = "span";
    var attr = "";
    if (auBlock.ORCID) {
      el = "a";
      attr += ` href="${auBlock.ORCID}"`;
    }
    if (auBlock.affiliation && auBlock.affiliation[0]) {
      attr += ` title="${auBlock.affiliation.map(a => a.name).join('; ')}"`;
    }
    return `<${el}${attr}>${RefFunctions.lastFirst(auBlock)}</${el}>`;
  }
  static authorsBasicFormat(authors) {
    if (!authors)
      return '';
    if (authors.length === 1) {
      return authors[0].family;
    } else if (authors.length === 2) {
      return authors[0].family + ' & ' + authors[1].family;
    } else if (authors.length > 2) {
      return authors[0].family + ' et al.';
    }
  }
  static lastFirst(auBlock) {
    if (!auBlock.given || !auBlock.family) return '';
    return `${auBlock.family}, ${auBlock.given.split(" ").map((n)=>n[0]).join(". ")}.`;
  }
  static firstLast(auBlock) {
    if (!auBlock.given || !auBlock.family) return '';
    return `${auBlock.given.split(" ").map((n)=>n[0]).join(".")}. ${auBlock.family}`;
  }
  static editorsFormat(editors){
      var auFormat = [];
      for (var i = 0; i<editors.length; i++) {
        auFormat.push(RefFunctions.editor(editors[i]));
      }
      return auFormat.join(", ")+" (Eds.)";
  }
  static editor(auBlock){
    if (!auBlock.given || !auBlock.family) return '';
    var el = "span";
    var attr = "";
    if (auBlock.ORCID) {
      el = "a";
      attr += ` href="${auBlock.ORCID}"`;
    }
    if (auBlock.affiliation && auBlock.affiliation[0]) {
      attr += ` title="${auBlock.affiliation[0].name}"`;
    }
    return `<${el}${attr}>${RefFunctions.firstLast(auBlock)}</${el}>`;
  }
}
