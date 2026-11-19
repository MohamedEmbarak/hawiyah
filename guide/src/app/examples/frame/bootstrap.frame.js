function hawiyahFrameBootstrap(config, start) {
  // In-frame bootstrap of an example run (editor.frame.protocol). Embedded in the
  // frame document as text by document.ts and called with the run configuration
  // and the start function of the strategy (start-modules or start-bundled).
  // It only posts to the parent; it never reads anything from it.
  'use strict';
  var MAX_TEXT = 4000;
  var now = function () {
    return performance.now();
  };
  var marks = { start: now() };
  var target = window.parent;
  var nonce = (document.currentScript && document.currentScript.nonce) || '';
  var readySent = false;
  var failedLinks = [];

  // The frame policy cannot limit WebRTC in Chromium (no Content-Security-Policy
  // directive covers it, and webrtc 'block' is not recognised), so its constructors
  // are removed before the example code runs. Defence in depth, not a boundary: a
  // nested frame created by the code gets fresh globals.
  ['RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel'].forEach(function (name) {
    try {
      delete window[name];
    } catch (error) {
      // A property that cannot be deleted stays; nothing else depends on it.
    }
  });

  function cut(value) {
    return value.length > MAX_TEXT ? value.slice(0, MAX_TEXT) : value;
  }
  function describe(value) {
    try {
      if (value instanceof Error) return value.name && value.message ? value.name + ': ' + value.message : String(value.message || value);
      if (typeof value === 'string') return value;
      if (value === undefined) return 'undefined';
      var json = JSON.stringify(value);
      return json === undefined ? String(value) : json;
    } catch (error) {
      return String(value);
    }
  }
  function post(type, data) {
    var message = { channel: config.channel, version: config.version, token: config.token, run: config.run, type: type };
    if (data) for (var key in data) message[key] = typeof data[key] === 'string' ? cut(data[key]) : data[key];
    try {
      target.postMessage(message, '*');
    } catch (error) {
      // The parent is gone; nothing to report to.
    }
  }

  // Console output of the example goes to the guide's log as well.
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var parts = [];
      for (var i = 0; i < arguments.length; i += 1) parts.push(describe(arguments[i]));
      post('console', { level: level, text: parts.join(' ') });
      if (original) original.apply(console, arguments);
    };
  });

  // Uncaught errors, unhandled rejections, failed stylesheets and CSP violations.
  window.addEventListener(
    'error',
    function (event) {
      var element = event.target;
      if (element && element !== window && element.nodeType === 1) {
        var url = element.href || element.src || '';
        if (element.localName === 'link') failedLinks.push(element);
        post('error', { text: 'Failed to load ' + url });
        return;
      }
      post('error', { text: event.error ? describe(event.error) : event.message || 'Error' });
    },
    true,
  );
  window.addEventListener('unhandledrejection', function (event) {
    post('error', { text: describe(event.reason) });
  });
  document.addEventListener('securitypolicyviolation', function (event) {
    post('error', { text: 'securitypolicyviolation ' + event.effectiveDirective + ' ' + (event.blockedURI || '') });
  });

  // Links never navigate the frame: a fragment link scrolls within the document,
  // any other link is reported. Forms never submit, except method dialog.
  window.addEventListener('click', function (event) {
    if (event.defaultPrevented || !event.target || !event.target.closest) return;
    var link = event.target.closest('a[href]');
    if (!link) return;
    event.preventDefault();
    var href = link.getAttribute('href') || '';
    if (href.charAt(0) === '#') {
      var id = decodeURIComponent(href.slice(1));
      var element = id ? document.getElementById(id) : null;
      if (element) element.scrollIntoView();
      return;
    }
    post('navigation', { href: href });
  });
  window.addEventListener('submit', function (event) {
    if (event.defaultPrevented) return;
    var form = event.target;
    var submitter = event.submitter;
    var method = (submitter && submitter.getAttribute('formmethod')) || (form && form.getAttribute && form.getAttribute('method')) || '';
    if (method.toLowerCase() === 'dialog') return;
    event.preventDefault();
    post('submit', {});
  });

  // Two animation frames; a frame outside the viewport gets no animation frames in
  // Chromium, so each step also ends after 100 ms.
  function frames(count) {
    return new Promise(function (resolve) {
      var step = function () {
        var done = false;
        var next = function () {
          if (done) return;
          done = true;
          count -= 1;
          if (count <= 0) resolve();
          else step();
        };
        requestAnimationFrame(next);
        setTimeout(next, 100);
      };
      step();
    });
  }

  function stylesheets() {
    var links = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]'));
    return Promise.all(
      links.map(function (link) {
        return new Promise(function (resolve, reject) {
          if (failedLinks.indexOf(link) >= 0) return reject(new Error('Failed to load ' + link.href));
          if (link.sheet) return resolve();
          link.addEventListener('load', function () {
            resolve();
          });
          link.addEventListener('error', function () {
            reject(new Error('Failed to load ' + link.href));
          });
        });
      }),
    );
  }

  function content(mount) {
    var rendered = function () {
      var host = mount.firstElementChild;
      return host ? host.childNodes.length > 0 : mount.childNodes.length > 0;
    };
    if (rendered()) return Promise.resolve();
    return new Promise(function (resolve) {
      var observer = new MutationObserver(function () {
        if (rendered()) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(mount, { childList: true, subtree: true, characterData: true });
    });
  }

  function reportHeight() {
    var height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    post('height', { height: height });
  }

  function run() {
    var mount = document.getElementById('hawiyah-preview-root');
    var styles = stylesheets().then(function () {
      marks.styles = now();
    });
    var modules = Promise.resolve()
      .then(function () {
        return start({ entry: config.entry, classic: config.classic, nonce: nonce, document: document });
      })
      .then(function () {
        marks.modules = now();
      });
    Promise.all([styles, modules])
      .then(function () {
        return content(mount);
      })
      .then(function () {
        marks.content = now();
        return document.fonts ? document.fonts.ready : undefined;
      })
      .then(function () {
        return frames(2);
      })
      .then(function () {
        marks.painted = now();
        readySent = true;
        post('ready', { marks: marks });
        reportHeight();
        if (typeof ResizeObserver === 'function') {
          var observer = new ResizeObserver(reportHeight);
          observer.observe(document.documentElement);
          observer.observe(document.body);
        }
      })
      .catch(function (error) {
        if (!readySent) post('error', { text: describe(error) });
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
}
