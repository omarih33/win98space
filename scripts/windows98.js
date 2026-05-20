// Windows 98 shell behavior for the active Squarespace 7.0 template
(function () {
  var openWindows = {};
  var zIndex = 100;
  var dragState = null;
  var clickTimer = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var welcomeWindow = document.getElementById('welcome-window');
    if (welcomeWindow) {
      showWindow(welcomeWindow);
      openWindows[welcomeWindow.id] = true;
      bringToFront(welcomeWindow);
    }

    bindOpeners();
    bindControls();
    bindStartMenu();
    bindDragging();
    bindBsod();
    bindThemes();
    updateClock();
    setInterval(updateClock, 1000);
    updateTaskbar();
  });

  function bindOpeners() {
    document.addEventListener('click', function (event) {
      var target = event.target.closest('[data-window], [data-action], [data-theme]');
      if (!target) return;

      if (target.classList.contains('desktop-icon')) {
        selectOnly(target, '.desktop-icon');
        clearTimeout(clickTimer);
        clickTimer = setTimeout(function () {}, 180);
        return;
      }

      activateTarget(event, target);
    });

    document.addEventListener('dblclick', function (event) {
      var target = event.target.closest('[data-window], [data-action]');
      if (!target) return;
      activateTarget(event, target);
    });
  }

  function activateTarget(event, target) {
    var windowId = target.getAttribute('data-window');
    var action = target.getAttribute('data-action');
    var theme = target.getAttribute('data-theme');

    if (windowId) {
      event.preventDefault();
      openWindow(windowId);
      closeStartMenu();
    }

    if (action) {
      event.preventDefault();
      runAction(action, target);
    }

    if (theme) {
      event.preventDefault();
      setTheme(theme);
    }
  }

  function bindControls() {
    document.addEventListener('click', function (event) {
      var control = event.target.closest('.title-bar-controls button, .window-control');
      if (!control) return;

      var win = control.closest('.window');
      if (!win) return;

      var label = control.getAttribute('aria-label') || '';
      var action = control.getAttribute('data-action') || label.toLowerCase();

      event.preventDefault();
      event.stopPropagation();

      if (action === 'close') closeWindow(win.id);
      if (action === 'minimize') minimizeWindow(win.id);
      if (action === 'maximize') maximizeWindow(win.id);
    });

    document.addEventListener('mousedown', function (event) {
      var win = event.target.closest('.window');
      if (win) bringToFront(win);
    });
  }

  function bindStartMenu() {
    var startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleStartMenu();
      });
    }

    document.addEventListener('click', function (event) {
      if (!event.target.closest('#start-menu') && !event.target.closest('#start-button')) {
        closeStartMenu();
      }
    });
  }

  function bindDragging() {
    document.addEventListener('mousedown', function (event) {
      var header = event.target.closest('.title-bar, .window-header');
      if (!header || event.target.closest('.title-bar-controls, .window-controls')) return;

      var win = header.closest('.window');
      if (!win || win.classList.contains('maximized')) return;

      var rect = win.getBoundingClientRect();
      dragState = {
        win: win,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };

      bringToFront(win);
      event.preventDefault();
    });

    document.addEventListener('mousemove', function (event) {
      if (!dragState) return;

      var desktop = document.getElementById('desktop');
      var maxX = window.innerWidth - dragState.win.offsetWidth;
      var maxY = (desktop ? desktop.offsetHeight : window.innerHeight - 40) - dragState.win.offsetHeight;

      dragState.win.style.left = Math.max(0, Math.min(maxX, event.clientX - dragState.offsetX)) + 'px';
      dragState.win.style.top = Math.max(0, Math.min(maxY, event.clientY - dragState.offsetY)) + 'px';
    });

    document.addEventListener('mouseup', function () {
      dragState = null;
    });
  }

  function bindBsod() {
    document.addEventListener('keydown', hideBsod);
    var bsod = document.getElementById('bsod');
    if (bsod) bsod.addEventListener('click', hideBsod);
  }

  function bindThemes() {
    var savedTheme = window.localStorage ? window.localStorage.getItem('win98space-theme') : null;
    if (savedTheme) setTheme(savedTheme, true);
  }

  function runAction(action, target) {
    if (action === 'recycle-bin') alert('The Recycle Bin is empty.');
    if (action === 'bsod') {
      showBsod();
      closeStartMenu();
    }
    if (action === 'close-parent') {
      var win = target.closest('.window');
      if (win) closeWindow(win.id);
    }
  }

  function selectOnly(target, selector) {
    var items = document.querySelectorAll(selector);
    Array.prototype.forEach.call(items, function (item) {
      item.classList.remove('selected');
    });
    target.classList.add('selected');
  }

  function showWindow(win) {
    win.hidden = false;
    win.style.display = 'block';
    win.setAttribute('aria-hidden', 'false');
  }

  function hideWindow(win) {
    win.hidden = true;
    win.style.display = 'none';
    win.setAttribute('aria-hidden', 'true');
  }

  function isHidden(win) {
    return win.hidden || win.style.display === 'none';
  }

  function openWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    showWindow(win);
    openWindows[win.id] = true;
    bringToFront(win);
    updateTaskbar();
  }

  function closeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    hideWindow(win);
    delete openWindows[win.id];
    updateTaskbar();
  }

  function minimizeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    hideWindow(win);
    updateTaskbar();
  }

  function maximizeWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    win.classList.toggle('maximized');
    showWindow(win);
    openWindows[win.id] = true;
    bringToFront(win);
    updateTaskbar();
  }

  function bringToFront(win) {
    zIndex += 1;
    win.style.zIndex = zIndex;

    var windows = document.querySelectorAll('.window');
    Array.prototype.forEach.call(windows, function (item) {
      item.classList.remove('active');
      var title = item.querySelector('.title-bar');
      if (title) title.classList.add('inactive-title-bar');
    });

    win.classList.add('active');
    var activeTitle = win.querySelector('.title-bar');
    if (activeTitle) activeTitle.classList.remove('inactive-title-bar');
    updateTaskbar(win.id);
  }

  function getTitle(win) {
    var title = win.querySelector('.title-bar-text, .window-title');
    return title ? title.textContent.replace(/^[★▣▤▥⚙?]\s*/, '') : win.id;
  }

  function updateTaskbar(activeId) {
    var container = document.getElementById('taskbar-programs');
    if (!container) return;

    container.innerHTML = '';

    var windows = document.querySelectorAll('.window');
    Array.prototype.forEach.call(windows, function (win) {
      if (!openWindows[win.id]) return;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'program';
      button.textContent = getTitle(win);
      if (activeId === win.id || win.classList.contains('active')) button.classList.add('program-clicked');

      button.addEventListener('click', function () {
        if (isHidden(win)) showWindow(win);
        bringToFront(win);
      });

      container.appendChild(button);
    });
  }

  function toggleStartMenu() {
    var menu = document.getElementById('start-menu');
    var button = document.getElementById('start-button');
    if (!menu || !button) return;

    var open = menu.hidden || menu.style.display === 'none' || menu.style.display === '';
    menu.hidden = !open;
    menu.style.display = open ? 'block' : 'none';
    button.classList.toggle('startbutton-on', open);
    button.classList.toggle('startbutton-off', !open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeStartMenu() {
    var menu = document.getElementById('start-menu');
    var button = document.getElementById('start-button');
    if (!menu || !button) return;

    menu.hidden = true;
    menu.style.display = 'none';
    button.classList.remove('startbutton-on');
    button.classList.add('startbutton-off');
    button.setAttribute('aria-expanded', 'false');
  }

  function updateClock() {
    var now = new Date();
    var time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    var clock = document.getElementById('clock');
    var timeDisplay = document.getElementById('time-display');
    var status = document.getElementById('status-time');
    if (clock && !timeDisplay) clock.textContent = time;
    if (timeDisplay) timeDisplay.textContent = time;
    if (status) status.textContent = time;
  }

  function showBsod() {
    var bsod = document.getElementById('bsod');
    if (!bsod) return;
    bsod.hidden = false;
    bsod.style.display = 'block';
    bsod.focus();
  }

  function hideBsod() {
    var bsod = document.getElementById('bsod');
    if (!bsod || bsod.hidden) return;
    bsod.hidden = true;
    bsod.style.display = 'none';
  }

  function setTheme(theme, skipSave) {
    var body = document.body;
    body.classList.remove('theme-night', 'theme-rose', 'theme-galaxy');
    if (theme && theme !== 'default') body.classList.add('theme-' + theme);
    if (!skipSave && window.localStorage) window.localStorage.setItem('win98space-theme', theme || 'default');
  }

  window.openWindow = openWindow;
  window.closeWindow = closeWindow;
  window.toggleStartMenu = toggleStartMenu;
})();
