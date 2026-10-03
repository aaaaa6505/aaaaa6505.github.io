/* =========================================================
   復活號 宣傳網站 共用互動（index.html／contact.html）
   以 defer 載入；每個功能先確認元素存在再初始化。
   不送出任何網路請求、不寫入 localStorage。
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function scrollBehavior() {
    return reduceMotion.matches ? 'auto' : 'smooth';
  }

  /* ---------- 即將開放提示（3.7） ---------- */
  var showToast = (function () {
    var region = document.querySelector('.toast-region');
    var bubble = region && region.querySelector('.toast');
    if (!bubble) return function () {};

    var hideTimer;
    var clearTimer;

    return function (message) {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
      bubble.classList.remove('is-visible');
      bubble.textContent = '';

      // 先清空再寫入，讓相同訊息連續觸發時螢幕閱讀器仍會宣讀
      setTimeout(function () {
        bubble.textContent = message;
        setTimeout(function () {
          bubble.classList.add('is-visible');
        }, 20);
      }, 50);

      hideTimer = setTimeout(function () {
        bubble.classList.remove('is-visible');
        clearTimer = setTimeout(function () {
          bubble.textContent = '';
        }, 300);
      }, 2500);
    };
  })();

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-soon]');
    if (!trigger) return;
    event.preventDefault();
    showToast(trigger.getAttribute('data-soon') || '此功能即將開放');
  });

  /* ---------- 導覽列底線、回到頂端（3.1、3.5） ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  if (header || toTop) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      var brand = document.querySelector('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------- 手機選單（3.1、第 7 章） ---------- */
  (function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (!toggle || !nav) return;

    var mobile = window.matchMedia('(max-width: 767px)');

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '關閉選單');
      nav.classList.add('is-open');
      document.body.classList.add('is-menu-open');
      var first = nav.querySelector('a');
      if (first) first.focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '開啟選單');
      nav.classList.remove('is-open');
      document.body.classList.remove('is-menu-open');
      if (returnFocus) toggle.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        close(true);
      } else {
        open();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) close(true);
    });

    // 點選單外關閉
    document.addEventListener('click', function (event) {
      if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) close(true);
    });

    // 點選單內連結後關閉
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && isOpen()) close(true);
    });

    // 以 Tab 離開選單時收合（不搶焦點）
    nav.addEventListener('focusout', function (event) {
      var next = event.relatedTarget;
      if (isOpen() && next && !nav.contains(next) && next !== toggle) close(false);
    });

    // 視窗放大到桌機版時重置
    var onChange = function () {
      if (!mobile.matches) close(false);
    };
    if (mobile.addEventListener) {
      mobile.addEventListener('change', onChange);
    } else if (mobile.addListener) {
      mobile.addListener(onChange);
    }
  })();

  /* ---------- 跨頁錨點定位（例：contact.html → index.html#preview） ---------- */
  (function initHashAlign() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;

    // 字型載入後版面高度可能改變，再對齊一次；使用者已自行捲動就不干擾
    var userMoved = false;
    var mark = function () { userMoved = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
      window.addEventListener(type, mark, { once: true, passive: true });
    });

    var align = function () {
      if (!userMoved) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
    window.addEventListener('load', align, { once: true });
  })();

  /* ---------- 聯絡表單（5.4.1、5.4.2） ---------- */
  (function initInquiryForm() {
    var form = document.getElementById('inquiry-form');
    if (!form) return;

    var success = document.getElementById('inquiry-success');
    var successTitle = document.getElementById('inquiry-success-title');
    var successChurch = document.getElementById('inquiry-success-church');
    var resetButton = document.getElementById('inquiry-reset');
    var summary = document.getElementById('form-summary');
    var submitButton = form.querySelector('[type="submit"]');
    var submitLabel = submitButton.querySelector('.btn-label');
    var messageCount = document.getElementById('message-count');
    var messageRequiredMark = document.getElementById('message-required-mark');

    var OTHER = '其他';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_RE = /^[0-9\s+\-()]+$/;

    function field(name) {
      return form.elements.namedItem(name);
    }

    // 以字元（含中文、表情符號）計算長度
    function length(value) {
      return Array.from(value).length;
    }

    function isOther() {
      return field('inquiryType').value === OTHER;
    }

    var rules = {
      inquiryType: function (value) {
        return value ? '' : '請選擇詢問類型';
      },
      church: function (value) {
        var text = value.trim();
        if (!text) return '請填寫教會名稱';
        if (length(text) > 50) return '教會名稱請在 50 字以內';
        return '';
      },
      name: function (value) {
        var text = value.trim();
        if (!text) return '請填寫您的姓名';
        if (length(text) > 30) return '姓名請在 30 字以內';
        return '';
      },
      email: function (value) {
        var text = value.trim();
        if (!text) return '請填寫 Email';
        if (!EMAIL_RE.test(text)) return 'Email 格式不正確，請確認是否包含 @ 與網域，例如 name@example.com';
        return '';
      },
      phone: function (value) {
        var text = value.trim();
        if (!text) return '';
        var digits = text.replace(/\D/g, '').length;
        if (!PHONE_RE.test(text) || digits < 8) return '電話格式不正確，請只輸入數字、空格、+ 或 -';
        return '';
      },
      scale: function (value) {
        return length(value.trim()) > 100 ? '請在 100 字以內' : '';
      },
      message: function (value) {
        if (isOther() && !value.trim()) return '選擇「其他」時，請簡單說明想詢問的內容';
        if (length(value) > 1000) return '內容請在 1000 字以內';
        return '';
      }
    };

    var names = Object.keys(rules);
    var touched = {};
    var submitAttempted = false;

    function setError(name, message) {
      var input = field(name);
      var error = document.getElementById(input.id + '-error');
      var baseDescribedBy = input.getAttribute('data-describedby') || '';

      if (message) {
        error.querySelector('.field-error-text').textContent = message;
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', (error.id + ' ' + baseDescribedBy).trim());
      } else {
        error.hidden = true;
        error.querySelector('.field-error-text').textContent = '';
        input.removeAttribute('aria-invalid');
        if (baseDescribedBy) {
          input.setAttribute('aria-describedby', baseDescribedBy);
        } else {
          input.removeAttribute('aria-describedby');
        }
      }
    }

    function validate(name) {
      var message = rules[name](field(name).value);
      setError(name, message);
      return !message;
    }

    // 送出失敗後，所有錯誤都修正時清除提示
    function refreshSummary() {
      if (!submitAttempted || !summary.textContent) return;
      var remaining = names.filter(function (name) {
        return field(name).getAttribute('aria-invalid') === 'true';
      });
      if (!remaining.length) summary.textContent = '';
    }

    function updateCount() {
      messageCount.textContent = length(field('message').value) + '／1000';
    }

    // 選「其他」時「想詢問的內容」變必填
    function updateMessageRequired() {
      var required = isOther();
      messageRequiredMark.hidden = !required;
      if (required) {
        field('message').setAttribute('aria-required', 'true');
      } else {
        field('message').removeAttribute('aria-required');
      }
    }

    names.forEach(function (name) {
      var input = field(name);

      // 第一次離開欄位後才開始驗證
      input.addEventListener('blur', function () {
        touched[name] = true;
        validate(name);
        refreshSummary();
      });

      // 之後輸入時即時更新
      input.addEventListener('input', function () {
        if (name === 'message') updateCount();
        if (touched[name]) {
          validate(name);
          refreshSummary();
        }
      });
    });

    field('inquiryType').addEventListener('change', function () {
      updateMessageRequired();
      if (touched.inquiryType) validate('inquiryType');
      if (touched.message) validate('message');
      refreshSummary();
    });

    function collectPayload() {
      return {
        inquiryType: field('inquiryType').value,
        church: field('church').value.trim(),
        name: field('name').value.trim(),
        email: field('email').value.trim(),
        phone: field('phone').value.trim(),
        scale: field('scale').value.trim(),
        message: field('message').value.trim()
      };
    }

    function showSuccess(payload) {
      successChurch.textContent = payload.church;
      form.hidden = true;
      success.hidden = false;
      successTitle.focus();
      submitButton.disabled = false;
      submitLabel.textContent = '送出';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitAttempted = true;

      var invalid = names.filter(function (name) {
        touched[name] = true;
        return !validate(name);
      });

      if (invalid.length) {
        // 先清空再寫入，讓同樣的提示再次出現時 role="alert" 仍會宣讀
        summary.textContent = '';
        setTimeout(function () {
          summary.textContent = '有 ' + invalid.length + ' 個欄位需要修正';
        }, 50);
        form.elements[invalid[0]].focus();
        return;
      }

      summary.textContent = '';
      submitButton.disabled = true;
      submitLabel.textContent = '送出中…';

      var payload = collectPayload();

      // TODO(工程串接): 目前僅為前端示意，資料不會送到任何地方。
      // 串接時在此改為呼叫後端 API，收到成功回應後再呼叫 showSuccess()；
      // 失敗時顯示：「送出失敗，請稍後再試，或直接來信 〔待替換：聯絡 Email〕」。
      console.info('[mock] inquiry payload', payload);

      setTimeout(function () {
        showSuccess(payload);
      }, 800);
    });

    resetButton.addEventListener('click', function () {
      form.reset();
      touched = {};
      submitAttempted = false;
      summary.textContent = '';
      names.forEach(function (name) {
        setError(name, '');
      });
      updateCount();
      updateMessageRequired();
      success.hidden = true;
      form.hidden = false;
      field('inquiryType').focus();
    });

    updateCount();
    updateMessageRequired();
  })();
})();
