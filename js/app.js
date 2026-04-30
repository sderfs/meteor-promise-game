/**
 * 《流星雨的约定》游戏核心逻辑
 * IIFE 封装，避免全局污染
 * 数据通过 window.gameData 访问
 */
(function () {
  'use strict';

  // ========== 1. Toast 提示 ==========
  const Toast = {
    /**
     * 显示居中提示信息
     * @param {string} message - 提示文本
     * @param {number} duration - 显示时长（毫秒），默认 3000
     */
    show(message, duration = 3000) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.style.display = 'block';
      // 重置动画以触发 reflow
      toast.style.animation = 'none';
      toast.offsetHeight; // 强制 reflow
      toast.style.animation = `fadeInOut ${duration / 1000}s ease forwards`;
      setTimeout(() => {
        toast.style.display = 'none';
      }, duration);
    }
  };

  // ========== 1.5 菜单大图查看器 ==========
  const ShopMenuViewer = {
    show(src) {
      // 创建遮罩
      var overlay = document.createElement('div');
      overlay.id = 'menu-viewer-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';

      // 关闭按钮（左上角）
      var closeBtn = document.createElement('div');
      closeBtn.style.cssText = 'position:absolute;top:12px;left:12px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;z-index:201;cursor:pointer;font-size:20px;color:#fff;';
      closeBtn.textContent = '\u2715';
      closeBtn.addEventListener('click', function() { ShopMenuViewer.hide(); });
      overlay.appendChild(closeBtn);

      // 可滚动、可缩放的图片容器
      var scrollWrap = document.createElement('div');
      scrollWrap.style.cssText = 'width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;justify-content:center;';

      var img = document.createElement('img');
      img.src = src;
      img.style.cssText = 'width:100%;max-width:430px;height:auto;object-fit:contain;transform-origin:center center;transition:transform 0.1s ease;user-select:none;-webkit-user-drag:none;';

      // 双指缩放
      var lastDist = 0;
      var currentScale = 1;

      img.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          e.preventDefault();
        }
      }, { passive: false });

      img.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
          var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
          currentScale = Math.min(Math.max(currentScale * (dist / lastDist), 0.5), 5);
          img.style.transform = 'scale(' + currentScale + ')';
          lastDist = dist;
          e.preventDefault();
        }
      }, { passive: false });

      // 双击重置缩放
      var lastTap = 0;
      img.addEventListener('touchend', function(e) {
        var now = Date.now();
        if (now - lastTap < 300 && e.changedTouches.length === 1) {
          currentScale = currentScale > 1 ? 1 : 2.5;
          img.style.transform = 'scale(' + currentScale + ')';
        }
        lastTap = now;
      });

      scrollWrap.appendChild(img);
      overlay.appendChild(scrollWrap);

      // 点击遮罩（非图片区域）关闭
      scrollWrap.addEventListener('click', function(e) {
        if (e.target === scrollWrap) {
          ShopMenuViewer.hide();
        }
      });

      document.body.appendChild(overlay);

      // 淡入
      requestAnimationFrame(function() {
        overlay.style.opacity = '1';
      });
    },

    hide() {
      var overlay = document.getElementById('menu-viewer-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(function() {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }
    }
  };

  // ========== 1.6 相册大图查看器 ==========
  const GalleryViewer = {
    show(photos, startIndex) {
      var currentIndex = startIndex || 0;
      var overlay = document.createElement('div');
      overlay.id = 'gallery-viewer-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:200;display:flex;flex-direction:column;opacity:0;transition:opacity 0.3s ease;';

      // 顶部栏：关闭按钮 + 计数
      var topBar = document.createElement('div');
      topBar.style.cssText = 'position:absolute;top:0;left:0;right:0;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:201;';

      var closeBtn = document.createElement('div');
      closeBtn.style.cssText = 'width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#fff;';
      closeBtn.textContent = '\u2715';
      closeBtn.addEventListener('click', function() { GalleryViewer.hide(); });
      topBar.appendChild(closeBtn);

      var counter = document.createElement('span');
      counter.style.cssText = 'font-size:14px;color:rgba(255,255,255,0.7);';
      counter.textContent = (currentIndex + 1) + ' / ' + photos.length;
      topBar.appendChild(counter);

      var spacer = document.createElement('div');
      spacer.style.cssText = 'width:36px;';
      topBar.appendChild(spacer);

      overlay.appendChild(topBar);

      // 图片容器（左右滑动）
      var slideWrap = document.createElement('div');
      slideWrap.style.cssText = 'flex:1;overflow:hidden;position:relative;';

      var track = document.createElement('div');
      track.style.cssText = 'display:flex;height:100%;transition:transform 0.3s ease;';

      var slides = [];
      photos.forEach(function(photo, idx) {
        var slide = document.createElement('div');
        slide.style.cssText = 'min-width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';

        var img = document.createElement('img');
        img.style.cssText = 'max-width:100%;max-height:70vh;object-fit:contain;user-select:none;-webkit-user-drag:none;transform-origin:center center;transition:transform 0.15s ease;';
        // 懒加载：只加载当前和相邻的
        if (Math.abs(idx - startIndex) <= 1) {
          img.src = photo.src || '';
        } else {
          img.alt = photo.desc || '';
          img.style.background = '#111';
        }
        slide.appendChild(img);

        // 照片信息卡片
        var infoCard = document.createElement('div');
        infoCard.style.cssText = 'padding:12px 20px;text-align:center;';

        if (photo.date) {
          var dateEl = document.createElement('div');
          dateEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.6);';
          dateEl.textContent = photo.date;
          infoCard.appendChild(dateEl);
        }

        if (photo.location) {
          var locEl = document.createElement('div');
          locEl.style.cssText = 'font-size:14px;color:rgba(255,255,255,0.9);margin-top:4px;';
          if (photo.unknown) {
            locEl.style.cssText += 'font-style:italic;color:rgba(255,255,255,0.4);';
          }
          if (photo.selectable) {
            locEl.style.cssText += '-webkit-user-select:text;user-select:text;cursor:text;';
          }
          locEl.textContent = photo.location;
          infoCard.appendChild(locEl);
        }

        slide.appendChild(infoCard);
        track.appendChild(slide);
        slides.push({ slide: slide, img: img, src: photo.src || '' });
      });

      slideWrap.appendChild(track);
      overlay.appendChild(slideWrap);

      // 左右滑动
      var startX = 0, moveX = 0, isDragging = false;
      track.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          isDragging = true;
          track.style.transition = 'none';
        }
      }, { passive: true });

      track.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
          moveX = e.touches[0].clientX - startX;
          track.style.transform = 'translateX(' + (moveX - currentIndex * slideWrap.offsetWidth) + 'px)';
        }
      }, { passive: true });

      track.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s ease';
        var threshold = slideWrap.offsetWidth * 0.2;
        if (moveX < -threshold && currentIndex < photos.length - 1) {
          currentIndex++;
        } else if (moveX > threshold && currentIndex > 0) {
          currentIndex--;
        }
        moveX = 0;
        track.style.transform = 'translateX(' + (-currentIndex * slideWrap.offsetWidth) + 'px)';
        counter.textContent = (currentIndex + 1) + ' / ' + photos.length;
        // 懒加载：加载当前和相邻图片
        for (var i = Math.max(0, currentIndex - 1); i <= Math.min(photos.length - 1, currentIndex + 1); i++) {
          if (slides[i] && !slides[i].img.src) {
            slides[i].img.src = slides[i].src;
          }
        }
      });

      // 双击放大
      photos.forEach(function(photo, idx) {
        var slides = track.children;
        if (!slides[idx]) return;
        var img = slides[idx].querySelector('img');
        if (!img) return;
        var scale = 1;
        var lastTap = 0;
        img.addEventListener('touchend', function(e) {
          var now = Date.now();
          if (now - lastTap < 300) {
            scale = scale > 1 ? 1 : 3;
            img.style.transform = 'scale(' + scale + ')';
          }
          lastTap = now;
        });
      });

      document.body.appendChild(overlay);
      requestAnimationFrame(function() {
        overlay.style.opacity = '1';
        track.style.transform = 'translateX(' + (-currentIndex * slideWrap.offsetWidth) + 'px)';
      });
    },

    hide() {
      var overlay = document.getElementById('gallery-viewer-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(function() {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      }
    }
  };

  // ========== 1.7 密码提示弹窗（统一） ==========
  function showPasswordHint(message) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:14px;padding:20px;width:260px;max-width:80vw;text-align:center;animation:scaleIn 0.2s ease-out;';

    var msg = document.createElement('div');
    msg.style.cssText = 'font-size:16px;color:#6B5340;margin-bottom:20px;line-height:1.5;';
    msg.textContent = message;
    modal.appendChild(msg);

    var btn = document.createElement('div');
    btn.style.cssText = 'display:inline-block;background:#5B9BD5;color:#fff;font-size:15px;font-weight:600;padding:10px 40px;border-radius:14px;cursor:pointer;';
    btn.textContent = '\u786E\u5B9A';
    btn.addEventListener('click', function() { overlay.remove(); });
    modal.appendChild(btn);

    overlay.appendChild(modal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  // ========== 2. Modal 模态框 ==========
  const Modal = {
    /**
     * 显示底部弹出式模态框
     * @param {string} title - 标题
     * @param {string} message - 正文内容
     * @param {Array<{text: string, onClick?: Function}>} buttons - 按钮数组
     */
    show(title, message, buttons = []) {
      const modal = document.getElementById('modal');
      if (!modal) return;
      modal.removeAttribute('hidden');
      modal.style.display = 'block';

      // 构建模态框内容
      let html = '<div class="modal-content">';
      html += `<div class="modal-title">${title}</div>`;
      html += `<div style="font-size:14px;color:#3C3C43;line-height:1.6;margin-bottom:20px;text-align:center;">${message}</div>`;

      if (buttons.length > 0) {
        html += '<div style="display:flex;gap:12px;">';
        buttons.forEach((btn, idx) => {
          const isPrimary = idx === buttons.length - 1;
          html += `<button class="form-btn" style="flex:1;background-color:${isPrimary ? '#007AFF' : '#E5E5EA'};color:${isPrimary ? '#FFFFFF' : '#1C1C1E'};" data-modal-btn="${idx}">${btn.text}</button>`;
        });
        html += '</div>';
      } else {
        html += '<button class="form-btn" data-modal-btn="close">确定</button>';
      }

      html += '</div>';
      modal.innerHTML = html;

      // 绑定按钮事件
      modal.querySelectorAll('[data-modal-btn]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = el.dataset.modalBtn;
          if (idx === 'close') {
            Modal.hide();
          } else if (buttons[idx] && typeof buttons[idx].onClick === 'function') {
            buttons[idx].onClick();
            Modal.hide();
          }
        });
      });

      // 点击遮罩关闭
      modal.addEventListener('click', (e) => {
        if (e.target === modal) Modal.hide();
      });
    },

    /** 隐藏模态框 */
    hide() {
      const modal = document.getElementById('modal');
      if (modal) {
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
        modal.innerHTML = '';
      }
    }
  };

  // ========== 3. PasswordValidator 密码验证 ==========
  const PasswordValidator = {
    /**
     * 验证密码是否匹配
     * @param {string} key - passwords 表中的键名
     * @param {string} input - 用户输入
     * @returns {boolean} 是否匹配
     */
    validate(key, input) {
      const rule = window.gameData.passwords[key];
      if (!rule) return false;
      // 支持大小写不敏感的验证
      if (rule.caseInsensitive) {
        return input.toLowerCase() === rule.password.toLowerCase();
      }
      return input === rule.password;
    }
  };

  // ========== 3.5 StateSaver 状态持久化 ==========
  const StateSaver = {
    save() {
      try { localStorage.setItem('meteor_game_state', JSON.stringify(window.gameData.state)); } catch(e) {}
    }
  };

  // ========== 4. Router 路由系统 ==========
  const Router = {
    currentPage: null,
    _navStack: [], // 导航栈，支持多级返回

    /**
     * 导航到指定页面
     * @param {string} pageId - 目标页面 ID
     * @param {boolean} pushToStack - 是否压入导航栈（默认true）
     */
    navigate(pageId, pushToStack = true, params = {}) {
      const state = window.gameData.state;

      // 保存临时参数供渲染器使用
      window.gameData.state._navParams = params;

      // 重置目标页面的内部导航标志（确保从外部进入时phase被重置）
      const targetPage = window.gameData.pages[pageId];
      if (targetPage && targetPage.data) {
        targetPage.data._internalNav = false;
      }

      // 1. 记录当前页到 previousPage
      state.previousPage = state.currentPage;

      // 2. 压入导航栈
      if (pushToStack && this.currentPage) {
        this._navStack.push(this.currentPage);
      }

      // 3. 更新 currentPage
      state.currentPage = pageId;
      this.currentPage = pageId;

      // 4. 如果页面未访问过，添加到 visitedPages
      // 对于特殊路由（07_chat_xxx, 02_detail_xxx），记录基础页面ID
      let visitId = pageId;
      if (pageId.startsWith('07_chat_')) visitId = '07';
      if (pageId.startsWith('02_detail')) visitId = '02';
      if (!state.visitedPages.includes(visitId)) {
        state.visitedPages.push(visitId);
      }

      // 5. 持久化状态
      StateSaver.save();
      document.getElementById('main-scroll').style.display = 'none';
      const searchBarEnter = document.getElementById('search-bar');
      if (searchBarEnter) searchBarEnter.style.display = 'none';

      // 6. 渲染页面（聊天详情和短信详情由调用方自行渲染）
      if (pageId === 'footprints') {
        renderFootprints();
      } else if (!pageId.startsWith('07_chat_') && !pageId.startsWith('02_detail')) {
        PageRenderer.render(pageId);
      }

      // 7. 更新页面编号显示
      const pageNumber = document.getElementById('page-number');
      if (pageNumber) {
        pageNumber.textContent = pageId;
        pageNumber.style.display = 'block';
      }
    },

    /** 返回上一页（从导航栈弹出一层） */
    back() {
      if (this._navStack.length > 0) {
        const prevPageId = this._navStack.pop();
        this.currentPage = prevPageId;
        window.gameData.state.currentPage = prevPageId;

        const container = document.getElementById('page-container');
        container.innerHTML = '';
        container.className = 'page-enter active';

        // 特殊页面处理
        if (prevPageId.startsWith('07_chat_')) {
          // 返回微信聊天详情
          const chatName = prevPageId.replace('07_chat_', '');
          const page = window.gameData.pages['07'];
          PageRenderer._renderWechatChat(page, chatName);
        } else if (prevPageId.startsWith('02_detail')) {
          // 返回短信详情
          const container2 = document.getElementById('page-container');
          container2.innerHTML = '';
          // 短信详情无法恢复，回到短信列表
          PageRenderer.render('02');
        } else if (prevPageId === 'footprints') {
          renderFootprints();
        } else {
          PageRenderer.render(prevPageId);
        }

        // 更新页面编号
        const pageNumber = document.getElementById('page-number');
        if (pageNumber) {
          const displayId = prevPageId.startsWith('07_chat_') ? '07' : prevPageId;
          pageNumber.textContent = displayId;
          pageNumber.style.display = 'block';
        }
      } else {
        // 栈为空，回到主屏幕
        document.getElementById('main-scroll').style.display = '';
        document.getElementById('page-container').innerHTML = '';
        document.getElementById('page-container').className = '';
        document.getElementById('page-number').style.display = 'none';
        Search.show();
        this.currentPage = null;
        window.gameData.state.previousPage = null;
        window.gameData.state.currentPage = null;
      }
    },

    /** 返回主屏幕（清空导航栈） */
    goHome() {
      this._navStack = [];
      document.getElementById('main-scroll').style.display = '';
      document.getElementById('page-container').innerHTML = '';
      document.getElementById('page-container').className = '';
      document.getElementById('page-number').style.display = 'none';
      // 清除结局动画overlay等残留元素
      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.querySelectorAll('[style*="z-index:9999"]').forEach(el => el.remove());
      }
      // 隐藏搜索结果面板
      const searchPanel = document.getElementById('search-history');
      if (searchPanel) searchPanel.style.display = 'none';
      Search.show();
      this.currentPage = null;
      window.gameData.state.previousPage = null;
      window.gameData.state.currentPage = null;
    }
  };

  // ========== 5. PageRenderer 页面渲染器 ==========
  const PageRenderer = {
    /**
     * 根据页面 type 分发到对应的渲染方法
     * @param {string} pageId - 页面 ID
     */
    render(pageId) {
      const page = window.gameData.pages[pageId];
      if (!page) return;

      const container = document.getElementById('page-container');
      container.innerHTML = '';
      container.className = 'page-enter active';

      // 根据 type 分发渲染
      switch (page.type) {
        case 'list-detail': this.renderListDetail(page); break;
        case 'chat': this.renderChat(page); break;
        case 'wechat-chat': this.renderWechatChat(page); break;
        case 'tabs': this.renderTabs(page); break;
        case 'login': this.renderLogin(page); break;
        case 'search-results': this.renderSearchResults(page); break;
        case 'browser-search': this.renderBrowserSearch(page); break;
        case 'bilibili-home': this.renderBilibiliHome(page); break;
        case 'bilibili-video': this.renderBilibiliVideo(page); break;
        case 'bilibili-history': this.renderBilibiliHistory(page); break;
        case 'article': this.renderArticle(page); break;
        case 'profile': this.renderProfile(page); break;
        case 'qq-space': this.renderQQSpace(page); break;
        case 'weibo-profile': this.renderWeiboProfile(page); break;
        case 'weibo-locked': this.renderWeiboLocked(page); break;
        case 'product': this.renderProduct(page); break;
        case 'shop': this.renderShop(page); break;
        case 'calendar': this.renderCalendar(page); break;
        case 'photo-grid': this.renderPhotoGrid(page); break;
        case 'widget': this.renderWidget(page); break;
        case 'choice': this.renderChoice(page); break;
        case 'input-verify': this.renderInputVerify(page); break;
        case 'animation': this.renderAnimation(page); break;
        case 'dialog': this.renderDialog(page); break;
        case 'memo': this.renderMemo(page); break;
        case 'sms': this.renderSms(page); break;
        case 'call-log': this.renderCallLog(page); break;
        case 'phone': this.renderPhone(page); break;
        case 'order-list': this.renderOrderList(page); break;
        case 'weibo-private': this.renderWeiboPrivate(page); break;
        case 'video-history': this.renderVideoHistory(page); break;
        case 'forum': this.renderForum(page); break;
        case 'forum-login': this.renderForumLogin(page); break;
        case 'xiaohongshu': this.renderXiaohongshu(page); break;
        case 'choice-list': this.renderChoiceList(page); break;
        case 'input-code': this.renderInputCode(page); break;
        case 'map': this.renderMap(page); break;
        case 'menu': this.renderMenu(page); break;
        case 'finale': this.renderFinale(page); break;
        case 'wechat-list': this.renderWechatList(page); break;
        case 'taobao-home': this.renderTaobaoHome(page); break;
        case 'gallery': this.renderGallery(page); break;
        case 'diary': this.renderDiary(page); break;
        default: this.renderPlaceholder(page); break;
      }

      // 在页面右下角添加页面编号
      const badge = document.createElement('div');
      badge.textContent = pageId;
      badge.style.cssText = 'position:absolute;bottom:8px;right:12px;font-size:11px;color:rgba(0,0,0,0.25);font-weight:500;pointer-events:none;z-index:10;';
      container.appendChild(badge);
    },

    /**
     * 创建通用页面头部
     * @param {string} title - 标题文字
     * @param {boolean} showBack - 是否显示返回按钮，默认 true
     * @returns {HTMLElement} header 元素
     */
    createHeader(title, showBack = true) {
      const header = document.createElement('header');
      header.className = 'page-header';

      if (showBack) {
        const backBtn = document.createElement('span');
        backBtn.className = 'back-btn';
        backBtn.textContent = '\u2039 返回';
        backBtn.addEventListener('click', () => Router.back());
        header.appendChild(backBtn);
      }

      const titleEl = document.createElement('span');
      titleEl.className = 'title';
      titleEl.textContent = title;
      header.appendChild(titleEl);

      // 右侧占位，保持标题居中
      const spacer = document.createElement('span');
      spacer.style.width = '60px';
      spacer.style.minWidth = '60px';
      header.appendChild(spacer);

      return header;
    },

    createHomeBar() {
      const homeBar = document.createElement('div');
      homeBar.className = 'page-home-bar';
      homeBar.innerHTML = '<div class="home-bar"></div>';
      homeBar.addEventListener('click', () => Router.goHome());
      return homeBar;
    },

    /**
     * 备忘录渲染（点击展开/收起手风琴模式）
     * @param {Object} page - 页面数据对象
     */
    renderMemo(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '12px 16px 40px';

      const sections = page.data.sections || [];
      sections.forEach((section) => {
        const item = document.createElement('div');
        item.className = 'memo-accordion-item';

        // 标题栏（可点击）
        const header = document.createElement('div');
        header.className = 'memo-accordion-header';
        header.textContent = section.title;
        header.addEventListener('click', () => {
          const body = item.querySelector('.memo-accordion-body');
          const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
          if (isOpen) {
            body.style.maxHeight = '0px';
            header.classList.remove('open');
          } else {
            body.style.maxHeight = body.scrollHeight + 'px';
            header.classList.add('open');
          }
        });

        // 内容区（默认收起）
        const body = document.createElement('div');
        body.className = 'memo-accordion-body';
        body.style.maxHeight = '0px';

        const text = document.createElement('div');
        text.className = 'memo-accordion-text';
        // 支持 boldKeywords
        var contentStr = section.content || '';
        var boldKws = section.boldKeywords || [];
        if (boldKws.length > 0) {
          // 按关键词长度降序排列，避免短关键词先匹配
          boldKws.sort(function(a, b) { return b.length - a.length; });
          // 将内容按所有关键词分割并加粗
          var segments = [contentStr];
          boldKws.forEach(function(kw) {
            var newSegments = [];
            segments.forEach(function(seg) {
              if (seg._isBold) {
                newSegments.push(seg);
              } else {
                var parts = seg.split(kw);
                parts.forEach(function(part, i) {
                  if (part) newSegments.push(part);
                  if (i < parts.length - 1) {
                    var b = document.createElement('span');
                    b.textContent = kw;
                    b.style.fontWeight = '700';
                    b._isBold = true;
                    newSegments.push(b);
                  }
                });
              }
            });
            segments = newSegments;
          });
          segments.forEach(function(seg) {
            if (seg._isBold) {
              text.appendChild(seg);
            } else {
              text.appendChild(document.createTextNode(seg));
            }
          });
        } else {
          text.textContent = contentStr;
        }
        body.appendChild(text);

        item.appendChild(header);
        item.appendChild(body);
        content.appendChild(item);
      });

      container.appendChild(content);
    },

    /**
     * 占位符渲染（未实现的页面类型）
     * @param {Object} page - 页面数据对象
     */
    renderPlaceholder(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.textAlign = 'center';
      content.style.padding = '60px 20px';
      content.innerHTML = `
        <div style="font-size:48px;margin-bottom:16px">\u{1F6A7}</div>
        <div style="font-size:17px;font-weight:600;color:#6B5340;margin-bottom:8px">${page.title}</div>
        <div style="font-size:14px;color:#8E8E93">\u9875\u9762\u7F16\u53F7\uFF1A${page.id}</div>
        <div style="font-size:13px;color:#AEAEB2;margin-top:16px">\u8BE5\u9875\u9762\u6B63\u5728\u5EFA\u8BBE\u4E2D...</div>
      `;
      container.appendChild(content);
    },

    // ===== 以下为各类型页面的渲染方法 =====

    /**
     * 渲染列表详情页（备忘录、短信等）
     * 支持两种数据格式：
     *   - 标准格式：{ title, subtitle?, content? }
     *   - 短信格式：{ sender, preview, date }
     * @param {Object} page - 页面数据对象
     */
    renderListDetail(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const items = page.data.items || [];
      items.forEach((item) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.style.flexDirection = 'column';
        listItem.style.alignItems = 'flex-start';

        // 判断是短信格式还是标准格式
        const isSms = item.sender !== undefined;

        if (isSms) {
          // 短信格式：sender + preview + date
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.width = '100%';

          const senderEl = document.createElement('div');
          senderEl.style.fontWeight = '600';
          senderEl.style.fontSize = '15px';
          senderEl.style.color = '#1C1C1E';
          senderEl.textContent = item.sender;

          const dateEl = document.createElement('div');
          dateEl.style.fontSize = '12px';
          dateEl.style.color = '#8E8E93';
          dateEl.style.flexShrink = '0';
          dateEl.style.marginLeft = '12px';
          dateEl.textContent = item.date;

          row.appendChild(senderEl);
          row.appendChild(dateEl);
          listItem.appendChild(row);

          const previewEl = document.createElement('div');
          previewEl.style.fontSize = '13px';
          previewEl.style.color = '#8E8E93';
          previewEl.style.marginTop = '4px';
          previewEl.style.overflow = 'hidden';
          previewEl.style.textOverflow = 'ellipsis';
          previewEl.style.whiteSpace = 'nowrap';
          previewEl.style.width = '100%';
          previewEl.textContent = item.preview;
          listItem.appendChild(previewEl);
        } else {
          // 标准格式：title + subtitle + content（可展开）
          const titleEl = document.createElement('div');
          titleEl.style.fontWeight = '600';
          titleEl.style.fontSize = '15px';
          titleEl.style.color = '#1C1C1E';
          titleEl.textContent = item.title;
          listItem.appendChild(titleEl);

          if (item.subtitle) {
            const subtitleEl = document.createElement('div');
            subtitleEl.style.fontSize = '12px';
            subtitleEl.style.color = '#8E8E93';
            subtitleEl.style.marginTop = '2px';
            subtitleEl.textContent = item.subtitle;
            listItem.appendChild(subtitleEl);
          }

          // 如果有 content，支持展开/收起
          if (item.content) {
            // 添加展开指示箭头
            const arrow = document.createElement('span');
            arrow.textContent = '>';
            arrow.style.cssText = 'position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:14px;color:#C7C7CC;transition:transform 0.2s ease;';
            listItem.style.position = 'relative';
            listItem.appendChild(arrow);

            // 创建展开内容区域
            const detailEl = document.createElement('div');
            detailEl.style.cssText = 'padding:12px 16px;background:#F2F2F7;border-radius:8px;margin-top:8px;font-size:14px;line-height:1.6;white-space:pre-wrap;display:none;width:100%;';
            detailEl.textContent = item.content;

            // 点击切换展开/收起
            listItem.addEventListener('click', () => {
              const isVisible = detailEl.style.display === 'block';
              detailEl.style.display = isVisible ? 'none' : 'block';
              arrow.style.transform = isVisible ? 'translateY(-50%)' : 'translateY(-50%) rotate(90deg)';
            });

            // 将 detailEl 放在 listItem 之后
            listItem.appendChild(detailEl);
          }
        }

        content.appendChild(listItem);
      });

      container.appendChild(content);
    },

    /**
     * 渲染聊天页（DeepSeek、微信等）
     * 支持两种数据格式：
     *   - 简单消息列表：page.data.messages
     *   - 多会话模式：page.data.tabs + page.data.conversations
     * @param {Object} page - 页面数据对象
     */
    renderChat(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      // 判断是否有 tabs（多会话模式，如微信）
      const hasTabs = page.data.tabs && page.data.tabs.length > 0;
      let currentTab = hasTabs ? page.data.tabs[0] : null;

      // 如果有 tabs，创建标签栏
      if (hasTabs) {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs';

        page.data.tabs.forEach((tabName) => {
          const tab = document.createElement('button');
          tab.className = 'tab' + (tabName === currentTab ? ' active' : '');
          tab.textContent = tabName;
          tab.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tabName;
            renderMessages(tabName);
          });
          tabsContainer.appendChild(tab);
        });

        container.appendChild(tabsContainer);
      }

      // 创建聊天消息容器
      const chatContainer = document.createElement('div');
      chatContainer.className = 'chat-container';
      chatContainer.style.flex = '1';
      chatContainer.style.overflowY = 'auto';
      chatContainer.style.backgroundColor = '#EDEDED';
      chatContainer.style.paddingBottom = '8px';
      container.appendChild(chatContainer);

      /**
       * 渲染消息列表
       */
      function renderMessages(tabName) {
        chatContainer.innerHTML = '';

        let messages;
        if (tabName && page.data.conversations) {
          messages = page.data.conversations[tabName] || [];
        } else {
          messages = page.data.messages || [];
        }

        messages.forEach((msg) => {
          const isSent = msg.role === 'self' || msg.role === 'user' || msg.name === tabName;

          // 微信风格：不显示名字，直接显示气泡
          // 气泡外层容器控制对齐
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `display:flex;flex-direction:column;align-items:${isSent ? 'flex-end' : 'flex-start'};margin-bottom:12px;`;

          // 气泡
          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble ' + (isSent ? 'sent' : 'received');
          bubble.textContent = msg.text;

          // 微信风格气泡微调
          bubble.style.maxWidth = '70%';
          bubble.style.padding = '9px 13px';
          bubble.style.fontSize = '15px';
          bubble.style.lineHeight = '1.5';
          bubble.style.wordBreak = 'break-word';

          wrapper.appendChild(bubble);

          // 日期显示
          if (msg.date) {
            const dateEl = document.createElement('div');
            dateEl.style.cssText = 'font-size:11px;color:#999;margin-top:3px;padding:0 4px;';
            dateEl.textContent = msg.date;
            wrapper.appendChild(dateEl);
          }

          chatContainer.appendChild(wrapper);
        });

        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      // 初始渲染消息
      renderMessages(currentTab);

      // 恢复线索对话历史（DeepSeek页面）
      const hintHistory = window.gameData.state.hintChatHistory || [];
      if (hintHistory.length > 0 && page.data.inputPlaceholder && page.data.inputPlaceholder.includes('页面编号')) {
        hintHistory.forEach(msg => {
          const isSent = msg.role === 'user';
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `display:flex;flex-direction:column;align-items:${isSent ? 'flex-end' : 'flex-start'};margin-bottom:12px;`;
          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble ' + (isSent ? 'sent' : 'received');
          bubble.style.cssText = 'max-width:70%;padding:9px 13px;font-size:15px;line-height:1.5;word-break:break-word;';
          bubble.textContent = msg.text;
          wrapper.appendChild(bubble);
          chatContainer.appendChild(wrapper);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      // 底部固定输入框区域
      const inputArea = document.createElement('div');
      inputArea.style.cssText = 'position:sticky;bottom:0;background:#F5DEB3;padding:8px 16px;border-top:0.5px solid #E5E5EA;display:flex;gap:8px;align-items:center;z-index:5;';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-input';
      input.style.cssText = 'flex:1;height:36px;border-radius:18px;padding:0 14px;font-size:14px;';
      input.placeholder = page.data.inputPlaceholder || '输入消息...';

      const sendBtn = document.createElement('button');
      sendBtn.className = 'form-btn';
      sendBtn.style.cssText = 'width:auto;padding:0 16px;height:36px;border-radius:18px;font-size:14px;';
      sendBtn.textContent = '发送';

      // 发送按钮点击事件
      sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        // 判断是否为 DeepSeek 页面
        if (page.id === '11') {
          DeepSeek.handleInput(text);
        }

        input.value = '';
      });

      // 回车发送
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          sendBtn.click();
        }
      });

      inputArea.appendChild(input);
      inputArea.appendChild(sendBtn);
      container.appendChild(inputArea);
    },

    /**
     * 微信聊天详情页（直接渲染默认对话）
     * @param {Object} page - 页面数据对象
     */
    renderWechatChat(page) {
      const defaultChat = page.data.defaultChat || Object.keys(page.data.conversations || {})[0];
      if (defaultChat) {
        PageRenderer._renderWechatChat(page, defaultChat);
      }
    },

    /**
     * 微信聊天详情页（内部方法，渲染指定对话）
     */
    _renderWechatChat(page, chatName) {
      const container = document.getElementById('page-container');
      container.className = 'page-enter active';
      container.innerHTML = '';
      container.appendChild(this.createHeader(chatName));

      const conversation = page.data.conversations[chatName] || [];
      const links = page.data.links[chatName] || {};

      // 聊天区域
      const chatArea = document.createElement('div');
      chatArea.style.cssText = 'flex:1;overflow-y:auto;background:#EDEDED;padding:12px 16px 60px;';

      conversation.forEach((group) => {
        // 时间标签
        if (group.time) {
          const timeLabel = document.createElement('div');
          timeLabel.style.cssText = 'text-align:center;font-size:11px;color:#8E8E93;margin:12px 0 8px;';
          timeLabel.textContent = group.time;
          chatArea.appendChild(timeLabel);
        }

        (group.messages || []).forEach((msg) => {
          const isSent = msg.role === 'self';
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `display:flex;flex-direction:column;align-items:${isSent ? 'flex-end' : 'flex-start'};margin-bottom:10px;`;

          const bubble = document.createElement('div');
          bubble.style.cssText = `max-width:70%;padding:9px 13px;border-radius:18px;font-size:15px;line-height:1.5;word-break:break-word;background:${isSent ? '#C7B8A8' : '#E9E9EB'};color:#3A2A1A;${isSent ? 'border-bottom-right-radius:4px;' : 'border-bottom-left-radius:4px;'}`;

          // 检查是否包含分享链接
          const hasXiaohongshuLink = msg.text.includes('【小红书链接】');
          const hasBiliLink = msg.text.includes('【B站链接】');
          const hasTaobaoLink = msg.text.includes('【发送淘宝链接】');
          let linkTarget = null;
          let linkType = null;
          if (hasXiaohongshuLink && links['小红书链接']) { linkTarget = links['小红书链接']; linkType = 'xiaohongshu'; }
          else if (hasBiliLink && links['B站链接']) { linkTarget = links['B站链接']; linkType = 'bilibili'; }
          else if (hasTaobaoLink && links['淘宝链接']) { linkTarget = links['淘宝链接']; linkType = 'taobao'; }

          if (msg.bold) {
            bubble.innerHTML = msg.text.replace(/椰子本身过敏/, '<b>椰子本身过敏</b>');
          } else {
            bubble.textContent = msg.text;
          }

          // 如果有链接，在气泡下方添加微信风格的链接卡片
          if (linkTarget) {
            // 气泡只显示文字部分（去掉链接标记）
            const cleanText = (html) => html.replace(/【小红书链接】/, '').replace(/【B站链接】/, '').replace(/【发送淘宝链接】/, '');
            if (!msg.bold) {
              bubble.textContent = cleanText(msg.text);
            } else {
              bubble.innerHTML = cleanText(bubble.innerHTML);
            }

            // 链接卡片信息
            const linkInfo = {
              xiaohongshu: { title: '小红书：密码记不住星人', desc: '真的服了，现在这些平台的密码规则是防用户还是防贼啊', source: '小红书' },
              bilibili: { title: 'B站：露营装备开箱看得我有点心动', desc: '户外老猫 · 露营装备开箱', source: '哔哩哔哩' },
              taobao: { title: '淘宝：露营箱 大容量便携款', desc: '65L 环保PP塑料 承重80kg 可折叠带滑轮', source: '淘宝' }
            };
            const info = linkInfo[linkType] || linkInfo.taobao;

            // 微信风格链接卡片
            const linkCard = document.createElement('div');
            linkCard.style.cssText = `max-width:70%;margin-top:4px;background:#F5DEB3;border-radius:8px;overflow:hidden;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.08);${isSent ? 'align-self:flex-end;' : 'align-self:flex-start;'}`;

            const linkTitle = document.createElement('div');
            linkTitle.style.cssText = 'padding:10px 12px 4px;font-size:13px;color:#6B5340;font-weight:500;line-height:1.4;';
            linkTitle.textContent = info.title;

            const linkDesc = document.createElement('div');
            linkDesc.style.cssText = 'padding:2px 12px 10px;font-size:11px;color:#8E8E93;line-height:1.3;';
            linkDesc.textContent = info.desc;

            const linkFooter = document.createElement('div');
            linkFooter.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border-top:0.5px solid #F0F0F0;';
            const linkSource = document.createElement('span');
            linkSource.style.cssText = 'font-size:10px;color:#8E8E93;';
            linkSource.textContent = info.source;
            const linkArrow = document.createElement('span');
            linkArrow.style.cssText = 'font-size:12px;color:#C7C7CC;';
            linkArrow.textContent = '›';
            linkFooter.appendChild(linkSource);
            linkFooter.appendChild(linkArrow);

            linkCard.appendChild(linkTitle);
            linkCard.appendChild(linkDesc);
            linkCard.appendChild(linkFooter);

            const capturedTarget = linkTarget;
            linkCard.addEventListener('click', (e) => {
              e.stopPropagation();
              // 支持 "中间页>目标页" 格式，先导航到中间页再导航到目标页
              if (capturedTarget.includes('>')) {
                const parts = capturedTarget.split('>');
                Router.navigate(parts[0]); // 压栈中间页
                Router.navigate(parts[1]); // 压栈目标页
              } else {
                Router.navigate(capturedTarget);
              }
            });

            wrapper.appendChild(bubble);
            wrapper.appendChild(linkCard);
          } else {
            wrapper.appendChild(bubble);
          }

          chatArea.appendChild(wrapper);
        });
      });

      container.appendChild(chatArea);

      // 底部输入栏（纯展示）
      const inputBar = document.createElement('div');
      inputBar.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#F7F7F7;border-top:0.5px solid #E6E2D3;';
      const voiceBtn = document.createElement('div');
      voiceBtn.style.cssText = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#8E8E93;flex-shrink:0;';
      voiceBtn.textContent = '🎙';
      const inputBox = document.createElement('div');
      inputBox.style.cssText = 'flex:1;height:36px;background:#F5DEB3;border-radius:4px;display:flex;align-items:center;padding:0 10px;font-size:14px;color:#C7C7CC;';
      inputBox.textContent = '输入消息...';
      const moreBtn = document.createElement('div');
      moreBtn.style.cssText = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#8E8E93;flex-shrink:0;';
      moreBtn.textContent = '😊';
      const plusBtn = document.createElement('div');
      plusBtn.style.cssText = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#8E8E93;flex-shrink:0;';
      plusBtn.textContent = '+';
      inputBar.appendChild(voiceBtn);
      inputBar.appendChild(inputBox);
      inputBar.appendChild(moreBtn);
      inputBar.appendChild(plusBtn);
      container.appendChild(inputBar);

      chatArea.scrollTop = chatArea.scrollHeight;

      // 页面编号
      const chatBadge = document.createElement('div');
      chatBadge.textContent = page.id;
      chatBadge.style.cssText = 'position:absolute;bottom:8px;right:12px;font-size:11px;color:rgba(0,0,0,0.25);font-weight:500;pointer-events:none;z-index:10;';
      container.appendChild(chatBadge);
    },

    /**
     * 渲染标签页（电话等）
     * @param {Object} page - 页面数据对象
     */
    renderTabs(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const tabs = page.data.tabs || [];
      if (tabs.length === 0) {
        this.renderPlaceholder(page);
        return;
      }

      // 创建标签栏
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'tabs';

      // 内容区域
      const contentArea = document.createElement('div');
      contentArea.className = 'page-content';
      contentArea.style.padding = '0';

      tabs.forEach((tabName, index) => {
        const tab = document.createElement('button');
        tab.className = 'tab' + (index === 0 ? ' active' : '');
        tab.textContent = tabName;
        tab.addEventListener('click', () => {
          // 切换 active 状态
          tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          // 切换内容
          renderTabContent(tabName);
        });
        tabsContainer.appendChild(tab);
      });

      container.appendChild(tabsContainer);

      /**
       * 渲染标签页内容
       * 根据页面数据中与 tabName 对应的 key 获取数据
       * @param {string} tabName - 当前标签名
       */
      function renderTabContent(tabName) {
        contentArea.innerHTML = '';

        // 根据页面 ID 和 tab 名选择不同的渲染方式
        if (page.id === '03') {
          // 电话页面：联系人 / 通话记录
          if (tabName === '联系人') {
            renderContacts(contentArea, page.data);
          } else if (tabName === '通话记录') {
            renderCallHistory(contentArea, page.data);
          }
        } else {
          // 通用：尝试从 page.data 中找到对应 key 的数组
          const keyMap = {
            '联系人': 'contacts',
            '通话记录': 'callHistory'
          };
          const dataKey = keyMap[tabName];
          if (dataKey && Array.isArray(page.data[dataKey])) {
            page.data[dataKey].forEach(item => {
              const row = document.createElement('div');
              row.className = 'list-item';
              row.textContent = typeof item === 'string' ? item : JSON.stringify(item);
              contentArea.appendChild(row);
            });
          } else {
            contentArea.innerHTML = '<div style="text-align:center;padding:40px;color:#8E8E93;">暂无数据</div>';
          }
        }
      }

      /**
       * 渲染联系人列表
       */
      function renderContacts(parent, data) {
        const contacts = data.contacts || [];
        contacts.forEach(contact => {
          const row = document.createElement('div');
          row.className = 'list-item';
          row.style.gap = '12px';

          const avatar = document.createElement('span');
          avatar.style.fontSize = '28px';
          avatar.textContent = contact.avatar || '';

          const info = document.createElement('div');
          info.style.flex = '1';

          const name = document.createElement('div');
          name.style.fontWeight = '600';
          name.style.fontSize = '15px';
          name.textContent = contact.name;

          const phone = document.createElement('div');
          phone.style.fontSize = '13px';
          phone.style.color = '#8E8E93';
          phone.style.marginTop = '2px';
          phone.textContent = contact.phone;

          info.appendChild(name);
          info.appendChild(phone);
          row.appendChild(avatar);
          row.appendChild(info);
          parent.appendChild(row);
        });

        // 显示本机号码
        if (data.ownNumber) {
          const ownRow = document.createElement('div');
          ownRow.className = 'list-item';
          ownRow.style.justifyContent = 'center';
          ownRow.style.color = '#8E8E93';
          ownRow.style.fontSize = '13px';
          ownRow.textContent = '本机号码：' + data.ownNumber;
          parent.appendChild(ownRow);
        }
      }

      /**
       * 渲染通话记录列表
       */
      function renderCallHistory(parent, data) {
        const history = data.callHistory || [];
        history.forEach(record => {
          const row = document.createElement('div');
          row.className = 'list-item';
          row.style.flexDirection = 'column';
          row.style.alignItems = 'flex-start';

          const topRow = document.createElement('div');
          topRow.style.display = 'flex';
          topRow.style.justifyContent = 'space-between';
          topRow.style.width = '100%';

          const name = document.createElement('div');
          name.style.fontWeight = '600';
          name.style.fontSize = '15px';
          name.textContent = record.name;

          const time = document.createElement('div');
          time.style.fontSize = '12px';
          time.style.color = '#8E8E93';
          time.textContent = record.time;

          topRow.appendChild(name);
          topRow.appendChild(time);

          const duration = document.createElement('div');
          duration.style.fontSize = '13px';
          duration.style.color = '#8E8E93';
          duration.style.marginTop = '2px';
          duration.textContent = record.duration;

          row.appendChild(topRow);
          row.appendChild(duration);
          parent.appendChild(row);
        });
      }

      container.appendChild(contentArea);

      // 默认渲染第一个 tab 的内容
      renderTabContent(tabs[0]);
    },

    /**
     * 渲染登录页（QQ、微博、论坛等）
     * @param {Object} page - 页面数据对象
     */
    renderLogin(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const form = document.createElement('div');
      form.className = 'login-form';

      // 应用标题
      const appTitle = document.createElement('div');
      appTitle.style.cssText = 'text-align:center;font-size:22px;font-weight:700;color:#6B5340;margin-bottom:32px;';
      appTitle.textContent = page.title;
      form.appendChild(appTitle);

      // 账号输入框
      const accountGroup = document.createElement('div');
      accountGroup.style.marginBottom = '16px';

      const accountLabel = document.createElement('label');
      accountLabel.style.cssText = 'font-size:13px;color:#8E8E93;display:block;margin-bottom:6px;';
      accountLabel.textContent = page.data.accountType === 'phone' ? '手机号' : '账号';

      const accountInput = document.createElement('input');
      accountInput.type = page.data.accountType === 'phone' ? 'tel' : 'text';
      accountInput.className = 'form-input';
      accountInput.placeholder = page.data.accountPlaceholder || '\u8BF7\u8F93\u5165\u8D26\u53F7';
      accountInput.id = 'login-account';
      accountInput.maxLength = page.data.accountType === 'phone' ? 11 : undefined;

      // 手机号类型：不预填，检查是否有已保存的正确手机号
      if (page.data.accountType === 'phone') {
        const savedKey = 'saved_account_' + page.id;
        const savedAccount = window.gameData.state[savedKey];
        if (savedAccount) {
          accountInput.value = savedAccount;
          accountInput.readOnly = true;
          accountInput.style.backgroundColor = '#F2F2F7';
          accountInput.style.color = '#8E8E93';
        }
      } else if (page.data.account) {
        // 非手机号：如果有预填账号，设为只读
        accountInput.value = page.data.account;
        accountInput.readOnly = true;
        accountInput.style.backgroundColor = '#F2F2F7';
        accountInput.style.color = '#8E8E93';
      }
      if (page.data.accountReadonly) {
        accountInput.value = page.data.account || '';
        accountInput.readOnly = true;
        accountInput.style.color = '#8E8E93';
        accountInput.style.backgroundColor = '#F2F2F7';
      }

      accountGroup.appendChild(accountLabel);
      accountGroup.appendChild(accountInput);
      form.appendChild(accountGroup);

      // 密码输入框
      const passwordGroup = document.createElement('div');
      passwordGroup.style.marginBottom = '24px';

      const passwordLabel = document.createElement('label');
      passwordLabel.style.cssText = 'font-size:13px;color:#8E8E93;display:block;margin-bottom:6px;';
      passwordLabel.textContent = '密码';

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.className = 'form-input';
      passwordInput.placeholder = page.data.passwordPlaceholder || '请输入密码';
      passwordInput.id = 'login-password';

      // 如果之前已保存密码，自动预填
      const savedPwdKey = 'saved_pwd_' + page.id;
      if (window.gameData.state[savedPwdKey]) {
        passwordInput.value = window.gameData.state[savedPwdKey];
      }

      passwordGroup.appendChild(passwordLabel);
      passwordGroup.appendChild(passwordInput);
      form.appendChild(passwordGroup);

      // 登录按钮
      const loginBtn = document.createElement('button');
      loginBtn.className = 'form-btn';
      loginBtn.textContent = '登录';
      loginBtn.style.marginBottom = '16px';

      loginBtn.addEventListener('click', () => {
        const account = accountInput.value.trim();
        const password = passwordInput.value.trim();

        if (!account || !password) {
          Toast.show('请输入账号和密码');
          return;
        }

        // 手机号验证
        if (page.data.accountType === 'phone') {
          if (!/^1\d{10}$/.test(account)) {
            Toast.show('手机号格式错误');
            return;
          }
          if (account !== page.data.account) {
            Toast.show('手机号错误');
            return;
          }
          // 手机号正确，保存到state
          const savedKey = 'saved_account_' + page.id;
          window.gameData.state[savedKey] = account;
          StateSaver.save();
        }

        // 根据页面 ID 查找对应的密码规则
        const passwordKey = page.data.passwordKey;

        if (passwordKey) {
          const rule = window.gameData.passwords[passwordKey];
          if (rule && PasswordValidator.validate(passwordKey, password)) {
            Toast.show('登录成功');
            // 保存密码，下次自动预填
            const pwdKey = 'saved_pwd_' + page.id;
            window.gameData.state[pwdKey] = password;
            StateSaver.save();
            // 登录成功后的跳转逻辑
            const successTarget = page.data.successTarget;
            if (successTarget) {
              setTimeout(() => Router.navigate(successTarget), 800);
            }
          } else {
            Toast.show('账号或密码错误');
          }
        } else {
          // 没有对应密码规则的页面，提示建设中
          Toast.show('该页面正在建设中');
        }
      });

      form.appendChild(loginBtn);

      // 可选的"忘记密码？"链接
      const forgotLink = document.createElement('div');
      forgotLink.style.cssText = 'text-align:center;font-size:14px;color:#007AFF;cursor:pointer;padding:8px 0;text-decoration:underline;';
      forgotLink.textContent = '\u5FD8\u8BB0\u5BC6\u7801\uFF1F';
      forgotLink.addEventListener('click', () => {
        const passwordKey = page.data.passwordKey;
        if (passwordKey) {
          const rule = window.gameData.passwords[passwordKey];
          if (rule && rule.securityQuestion) {
            showPasswordHint(rule.securityQuestion);
          } else {
            Toast.show('\u6682\u4E0D\u652F\u6301\u5BC6\u7801\u627E\u56DE');
          }
        }
      });

      form.appendChild(forgotLink);

      container.appendChild(form);
    },

    // ===== 以下为空实现的渲染方法（调用 renderPlaceholder）=====

    /** 渲染搜索结果页 */
    renderSearchResults(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader('搜索：' + (page.data.query || '')));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const results = page.data.results || [];
      results.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-item';
        row.style.cssText = 'min-height:60px;justify-content:space-between;align-items:center;';

        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-size:17px;color:' + (item.clickable !== false ? '#3A3A3A' : '#8E8E93') + ';';
        titleEl.textContent = item.title || '';
        row.appendChild(titleEl);

        if (item.clickable !== false && item.target) {
          const arrow = document.createElement('span');
          arrow.style.cssText = 'font-size:18px;color:#007AFF;flex-shrink:0;margin-left:12px;';
          arrow.textContent = '›';
          row.appendChild(arrow);

          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            Router.navigate(item.target);
          });
        }

        content.appendChild(row);
      });

      container.appendChild(content);
    },

    /** 渲染浏览器搜索结果页（模拟Safari/Chrome） */
    renderBrowserSearch(page) {
      const container = document.getElementById('page-container');
      const d = page.data;
      container.appendChild(this.createHeader(page.title));

      // 浏览器地址栏
      const addressBar = document.createElement('div');
      addressBar.style.cssText = 'flex-shrink:0;padding:6px 16px;background:#F5DEB3;';
      const urlBox = document.createElement('div');
      urlBox.style.cssText = 'display:flex;align-items:center;height:36px;background:#F2F2F7;border-radius:10px;padding:0 10px;gap:6px;';
      const lockIcon = document.createElement('span');
      lockIcon.style.cssText = 'font-size:12px;color:#8E8E93;flex-shrink:0;';
      lockIcon.textContent = '🔒';
      const urlText = document.createElement('span');
      urlText.style.cssText = 'font-size:13px;color:#8E8E93;flex-shrink:0;white-space:nowrap;';
      urlText.textContent = d.url || 'www.baidu.com';
      const queryText = document.createElement('span');
      queryText.style.cssText = 'font-size:14px;color:#6B5340;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      queryText.textContent = d.query || '';
      const clearBtn = document.createElement('span');
      clearBtn.style.cssText = 'font-size:16px;color:#8E8E93;flex-shrink:0;cursor:pointer;padding:4px;';
      clearBtn.textContent = '✕';
      urlBox.appendChild(lockIcon);
      urlBox.appendChild(urlText);
      urlBox.appendChild(queryText);
      urlBox.appendChild(clearBtn);
      addressBar.appendChild(urlBox);
      // 底部分割线
      const divider = document.createElement('div');
      divider.style.cssText = 'height:0.5px;background:#E5E5EA;';
      addressBar.appendChild(divider);
      container.appendChild(addressBar);

      // 搜索结果列表
      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;background:#F5DEB3;';

      const results = d.results || [];
      results.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'padding:12px 16px;border-bottom:0.5px solid #F0F0F0;cursor:' + (item.clickable !== false ? 'pointer' : 'default') + ';';

        // 标题
        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-size:17px;color:#6B5340;font-weight:500;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;';
        const titleText = document.createElement('span');
        titleText.textContent = item.title || '';
        titleEl.appendChild(titleText);

        if (item.clickable !== false && item.target) {
          const arrow = document.createElement('span');
          arrow.style.cssText = 'font-size:20px;color:#C7C7CC;flex-shrink:0;margin-left:8px;';
          arrow.textContent = '›';
          titleEl.appendChild(arrow);
        }

        row.appendChild(titleEl);

        // 摘要
        if (item.summary) {
          const summaryEl = document.createElement('div');
          summaryEl.style.cssText = 'font-size:13px;color:#8E8E93;line-height:1.4;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';
          summaryEl.textContent = item.summary;
          row.appendChild(summaryEl);
        }

        // 来源
        if (item.source) {
          const sourceEl = document.createElement('div');
          sourceEl.style.cssText = 'font-size:11px;color:#8E8E93;';
          sourceEl.textContent = item.source;
          row.appendChild(sourceEl);
        }

        if (item.clickable !== false && item.target) {
          const capturedTarget = item.target;
          row.addEventListener('click', () => Router.navigate(capturedTarget));
        }

        content.appendChild(row);
      });

      // 相关搜索
      if (d.relatedSearches && d.relatedSearches.length > 0) {
        const relatedSection = document.createElement('div');
        relatedSection.style.cssText = 'padding:12px 16px;border-bottom:0.5px solid #F0F0F0;';
        const relatedTitle = document.createElement('div');
        relatedTitle.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:8px;';
        relatedTitle.textContent = '相关搜索';
        relatedSection.appendChild(relatedTitle);
        const relatedTags = document.createElement('div');
        relatedTags.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        d.relatedSearches.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.style.cssText = 'font-size:13px;color:#6B5340;background:#F2F2F7;padding:4px 10px;border-radius:16px;';
          tagEl.textContent = tag;
          relatedTags.appendChild(tagEl);
        });
        relatedSection.appendChild(relatedTags);
        content.appendChild(relatedSection);
      }

      // 大家都在搜
      if (d.trendingSearches && d.trendingSearches.length > 0) {
        const trendingSection = document.createElement('div');
        trendingSection.style.cssText = 'padding:12px 16px;';
        const trendingTitle = document.createElement('div');
        trendingTitle.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:8px;';
        trendingTitle.textContent = '大家都在搜';
        trendingSection.appendChild(trendingTitle);
        const trendingTags = document.createElement('div');
        trendingTags.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        d.trendingSearches.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.style.cssText = 'font-size:13px;color:#6B5340;background:#F2F2F7;padding:4px 10px;border-radius:16px;';
          tagEl.textContent = tag;
          trendingTags.appendChild(tagEl);
        });
        trendingSection.appendChild(trendingTags);
        content.appendChild(trendingSection);
      }

      container.appendChild(content);

      // 底部浏览器工具栏（装饰性）
      const toolbar = document.createElement('div');
      toolbar.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-around;height:44px;background:rgba(255,255,255,0.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:0.5px solid #E5E5EA;';
      const tools = ['◀', '▶', '↗', '☆', '⊞'];
      tools.forEach(t => {
        const btn = document.createElement('span');
        btn.style.cssText = 'font-size:18px;color:#8E8E93;width:44px;height:44px;display:flex;align-items:center;justify-content:center;';
        btn.textContent = t;
        toolbar.appendChild(btn);
      });
      // 第一个按钮（后退）点击返回
      toolbar.children[0].style.cursor = 'pointer';
      toolbar.children[0].addEventListener('click', () => Router.back());
      container.appendChild(toolbar);
    },

    /** 渲染B站首页 */
    renderBilibiliHome(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;background:#F4F4F4;';

      // 功能入口区
      const entryCard = document.createElement('div');
      entryCard.style.cssText = 'margin:12px 16px;background:#F5DEB3;border-radius:12px;padding:16px;display:flex;gap:16px;';
      (page.data.entries || []).forEach(entry => {
        const btn = document.createElement('div');
        btn.style.cssText = 'flex:1;text-align:center;padding:12px 0;border-radius:8px;cursor:' + (entry.clickable ? 'pointer' : 'default') + ';' + (entry.clickable ? '' : 'opacity:0.5;');
        const icon = document.createElement('div');
        icon.style.cssText = 'font-size:24px;margin-bottom:6px;';
        icon.textContent = entry.clickable ? '📺' : '📁';
        const label = document.createElement('div');
        label.style.cssText = 'font-size:13px;color:#6B5340;';
        label.textContent = entry.text;
        btn.appendChild(icon);
        btn.appendChild(label);
        if (entry.clickable && entry.target) {
          btn.addEventListener('click', () => Router.navigate(entry.target));
        }
        entryCard.appendChild(btn);
      });
      content.appendChild(entryCard);

      // 推荐视频标题
      const recTitle = document.createElement('div');
      recTitle.style.cssText = 'padding:20px 16px 12px;font-size:16px;color:#6B5340;font-weight:700;';
      recTitle.textContent = '推荐视频';
      content.appendChild(recTitle);

      // 推荐视频列表
      const videoList = document.createElement('div');
      videoList.style.cssText = 'background:#F5DEB3;';
      (page.data.videos || []).forEach(video => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;padding:12px 16px;gap:12px;border-bottom:0.5px solid #F0F0F0;cursor:default;';

        const thumb = document.createElement('div');
        thumb.style.cssText = 'width:120px;height:68px;background:#E6E2D3;border-radius:6px;flex-shrink:0;';
        row.appendChild(thumb);

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;display:flex;flex-direction:column;justify-content:center;';
        const vTitle = document.createElement('div');
        vTitle.style.cssText = 'font-size:14px;color:#6B5340;font-weight:500;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';
        vTitle.textContent = video.title;
        const vMeta = document.createElement('div');
        vMeta.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:4px;';
        vMeta.textContent = video.author + ' \u00b7 ' + video.views;
        info.appendChild(vTitle);
        info.appendChild(vMeta);
        row.appendChild(info);
        videoList.appendChild(row);
      });
      content.appendChild(videoList);

      // 底部导航栏
      this._createBilibiliNavBar(container, page.data.navTabs);

      container.appendChild(content);
    },

    /** 创建B站底部导航栏 */
    _createBilibiliNavBar(container, navTabs) {
      const navBar = document.createElement('div');
      navBar.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-around;height:50px;background:rgba(255,255,255,0.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:0.5px solid #E5E5EA;';
      (navTabs || []).forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.style.cssText = 'text-align:center;font-size:10px;color:' + (tab.active ? '#5B9BD5' : '#8E8E93') + ';cursor:' + (tab.target ? 'pointer' : 'default') + ';';
        tabEl.textContent = tab.text;
        if (tab.target) {
          tabEl.addEventListener('click', () => Router.navigate(tab.target));
        }
        navBar.appendChild(tabEl);
      });
      container.appendChild(navBar);
    },

    /** 渲染B站观看历史 */
    renderBilibiliHistory(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;background:#F5DEB3;';

      (page.data.videos || []).forEach(video => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;padding:10px 16px;gap:12px;border-bottom:0.5px solid #F0F0F0;height:60px;';

        if (video.target) {
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            if (row._clicked) return;
            row._clicked = true;
            Router.navigate(video.target);
          });
          row.addEventListener('touchstart', () => { row.style.backgroundColor = '#F5F5F5'; });
          row.addEventListener('touchend', () => { row.style.backgroundColor = ''; });
        }

        const thumb = document.createElement('div');
        thumb.style.cssText = 'width:120px;height:68px;background:#E6E2D3;border-radius:4px;flex-shrink:0;';
        row.appendChild(thumb);

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;';
        const vTitle = document.createElement('div');
        vTitle.style.cssText = 'font-size:14px;color:#6B5340;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        if (video.bold && video.title) {
          let html = video.title;
          video.bold.forEach(b => { html = html.split(b).join('<b style="font-weight:700">' + b + '</b>'); });
          vTitle.innerHTML = html;
        } else {
          vTitle.textContent = video.title;
        }
        const vMeta = document.createElement('div');
        vMeta.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:2px;';
        vMeta.textContent = video.progress;
        const vDate = document.createElement('div');
        vDate.style.cssText = 'font-size:11px;color:#8E8E93;margin-top:1px;';
        vDate.textContent = video.date;
        info.appendChild(vTitle);
        info.appendChild(vMeta);
        info.appendChild(vDate);
        row.appendChild(info);
        content.appendChild(row);
      });

      container.appendChild(content);
    },

    /**
     * 渲染淘宝主页
     * @param {Object} page - 页面数据对象
     */
    renderTaobaoHome(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;background:#F4F4F4;';

      // 搜索栏
      const searchBar = document.createElement('div');
      searchBar.style.cssText = 'margin:10px 16px;height:40px;background:#F2F2F7;border-radius:20px;display:flex;align-items:center;padding:0 14px;';
      const searchIcon = document.createElement('span');
      searchIcon.style.cssText = 'font-size:14px;color:#8E8E93;margin-right:6px;';
      searchIcon.textContent = '🔍';
      const searchPlaceholder = document.createElement('span');
      searchPlaceholder.style.cssText = 'font-size:13px;color:#8E8E93;';
      searchPlaceholder.textContent = page.data.searchPlaceholder || '搜索';
      searchBar.appendChild(searchIcon);
      searchBar.appendChild(searchPlaceholder);
      content.appendChild(searchBar);

      // 功能入口区
      const entryCard = document.createElement('div');
      entryCard.style.cssText = 'margin:12px 16px;background:#F5DEB3;border-radius:12px;padding:16px;display:flex;gap:16px;';
      (page.data.entries || []).forEach(entry => {
        const btn = document.createElement('div');
        btn.style.cssText = 'flex:1;text-align:center;padding:12px 0;border-radius:8px;cursor:' + (entry.clickable ? 'pointer' : 'default') + ';' + (entry.clickable ? '' : 'opacity:0.5;');
        const icon = document.createElement('div');
        icon.style.cssText = 'font-size:24px;margin-bottom:6px;';
        icon.textContent = entry.clickable ? '📦' : '📁';
        const label = document.createElement('div');
        label.style.cssText = 'font-size:13px;color:#6B5340;';
        label.textContent = entry.text;
        btn.appendChild(icon);
        btn.appendChild(label);
        if (entry.clickable && entry.target) {
          btn.addEventListener('click', () => Router.navigate(entry.target));
        }
        entryCard.appendChild(btn);
      });
      content.appendChild(entryCard);

      // 推荐商品标题
      const recTitle = document.createElement('div');
      recTitle.style.cssText = 'padding:20px 16px 10px;font-size:16px;color:#6B5340;font-weight:700;';
      recTitle.textContent = '猜你喜欢';
      content.appendChild(recTitle);

      // 推荐商品列表（2列网格）
      const recGrid = document.createElement('div');
      recGrid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 16px;';
      (page.data.recommendations || []).forEach(rec => {
        const card = document.createElement('div');
        card.style.cssText = 'background:#F5DEB3;border-radius:10px;overflow:hidden;';
        const thumb = document.createElement('div');
        thumb.style.cssText = 'width:100%;aspect-ratio:1/1;background:#E8E8E8;';
        card.appendChild(thumb);
        const info = document.createElement('div');
        info.style.cssText = 'padding:8px 10px 10px;';
        const rTitle = document.createElement('div');
        rTitle.style.cssText = 'font-size:13px;color:#6B5340;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        rTitle.textContent = rec.title;
        const rPrice = document.createElement('div');
        rPrice.style.cssText = 'font-size:14px;color:#FF3B30;font-weight:600;margin-top:4px;';
        rPrice.textContent = rec.price || '';
        info.appendChild(rTitle);
        info.appendChild(rPrice);
        card.appendChild(info);
        if (rec.target) {
          card.style.cursor = 'pointer';
          const t = rec.target;
          card.addEventListener('click', () => Router.navigate(t));
        }
        recGrid.appendChild(card);
      });
      content.appendChild(recGrid);

      container.appendChild(content);

      // 底部导航栏
      const navBar = document.createElement('div');
      navBar.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-around;height:50px;background:rgba(255,255,255,0.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:0.5px solid #E5E5EA;';
      const tabs = [
        { label: '首页', active: true },
        { label: '购物车', active: false },
        { label: '消息', active: false },
        { label: '我的淘宝', active: false, target: '10' }
      ];
      tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.style.cssText = 'text-align:center;font-size:10px;color:' + (tab.active ? '#5B9BD5' : '#8E8E93') + ';' + (tab.target ? 'cursor:pointer;' : 'cursor:default;');
        tabEl.textContent = tab.label;
        if (tab.target) {
          tabEl.addEventListener('click', () => Router.navigate(tab.target));
        }
        navBar.appendChild(tabEl);
      });
      container.appendChild(navBar);
    },

    /** 渲染B站视频详情页 */
    renderBilibiliVideo(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;background:#F5DEB3;';

      // 视频播放区
      const videoArea = document.createElement('div');
      videoArea.style.cssText = 'width:100%;aspect-ratio:16/9;background:#1C1C1E;display:flex;align-items:center;justify-content:center;position:relative;';
      const playBtn = document.createElement('div');
      playBtn.style.cssText = 'width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;';
      playBtn.textContent = '▶';
      videoArea.appendChild(playBtn);
      // 进度条
      const progress = document.createElement('div');
      progress.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.2);';
      const progressFill = document.createElement('div');
      progressFill.style.cssText = 'width:33%;height:100%;background:#D4A843;';
      progress.appendChild(progressFill);
      videoArea.appendChild(progress);
      content.appendChild(videoArea);

      // 视频信息
      const infoArea = document.createElement('div');
      infoArea.style.cssText = 'padding:16px;';
      const vTitle = document.createElement('div');
      vTitle.style.cssText = 'font-size:18px;color:#6B5340;font-weight:700;line-height:1.4;';
      vTitle.textContent = page.data.videoTitle;
      const vMeta = document.createElement('div');
      vMeta.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:6px;';
      vMeta.textContent = page.data.views + ' \u00b7 ' + page.data.date;
      const upRow = document.createElement('div');
      upRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:12px;';
      const upAvatar = document.createElement('div');
      upAvatar.style.cssText = 'width:32px;height:32px;border-radius:50%;background:#E6E2D3;display:flex;align-items:center;justify-content:center;font-size:14px;';
      upAvatar.textContent = '👤';
      const upName = document.createElement('span');
      upName.style.cssText = 'font-size:14px;color:#6B5340;';
      upName.textContent = page.data.upName;
      const followBtn = document.createElement('span');
      followBtn.style.cssText = 'font-size:12px;color:#5B9BD5;border:1px solid #5B9BD5;border-radius:14px;padding:2px 12px;margin-left:auto;';
      followBtn.textContent = '关注';
      upRow.appendChild(upAvatar);
      upRow.appendChild(upName);
      upRow.appendChild(followBtn);
      const interactRow = document.createElement('div');
      interactRow.style.cssText = 'display:flex;gap:20px;margin-top:12px;font-size:13px;color:#8E8E93;';
      interactRow.textContent = '👍1.2万  👎  ⭐收藏  ↩分享';
      infoArea.appendChild(vTitle);
      infoArea.appendChild(vMeta);
      infoArea.appendChild(interactRow);
      infoArea.appendChild(upRow);
      content.appendChild(infoArea);

      // 评论区
      const commentHeader = document.createElement('div');
      commentHeader.style.cssText = 'padding:12px 16px;font-size:16px;color:#6B5340;font-weight:700;border-top:0.5px solid #F0F0F0;';
      commentHeader.textContent = '评论 230';
      content.appendChild(commentHeader);

      (page.data.comments || []).forEach(c => {
        const comment = document.createElement('div');
        comment.style.cssText = 'padding:12px 16px;border-bottom:0.5px solid #F0F0F0;' + (c.isReply ? 'padding-left:32px;' : '');

        if (c.pinned) {
          const pinTag = document.createElement('span');
          pinTag.style.cssText = 'font-size:10px;color:#FF3B30;background:#FFF0F0;padding:1px 6px;border-radius:4px;margin-right:6px;';
          pinTag.textContent = '置顶';
          comment.appendChild(pinTag);
        }

        const userEl = document.createElement('div');
        userEl.style.cssText = 'font-size:13px;color:#6B5340;font-weight:500;display:flex;align-items:center;gap:6px;';
        userEl.textContent = c.user;
        comment.appendChild(userEl);

        const textEl = document.createElement('div');
        textEl.style.cssText = 'font-size:14px;color:#6B5340;margin-top:4px;line-height:1.5;';
        // "荒野之心"加粗
        var ct = c.text || '';
        var kw = '荒野之心';
        if (ct.includes(kw)) {
          var parts = ct.split(kw);
          parts.forEach(function(part, i) {
            textEl.appendChild(document.createTextNode(part));
            if (i < parts.length - 1) {
              var b = document.createElement('strong');
              b.textContent = kw;
              b.style.fontWeight = '700';
              textEl.appendChild(b);
            }
          });
        } else {
          textEl.textContent = ct;
        }
        comment.appendChild(textEl);

        if (c.likes || c.replies) {
          const statsEl = document.createElement('div');
          statsEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:4px;';
          statsEl.textContent = [c.likes, c.replies].filter(Boolean).join('  ');
          comment.appendChild(statsEl);
        }

        content.appendChild(comment);
      });

      container.appendChild(content);
    },

    /** 渲染小红书笔记页 */
    renderXiaohongshu(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader("小红书"));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'padding:0;background:#fff;';

      // 作者行
      const authorRow = document.createElement('div');
      authorRow.style.cssText = 'display:flex;align-items:center;padding:16px;background:#fff;';

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#F2F2F7;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;';
      avatar.textContent = '\uD83D\uDC64';

      const authorInfo = document.createElement('div');
      authorInfo.style.cssText = 'flex:1;margin-left:12px;';

      const authorName = document.createElement('div');
      authorName.style.cssText = 'font-size:16px;font-weight:700;color:#333;';
      authorName.textContent = page.data.author || '';
      authorInfo.appendChild(authorName);

      authorRow.appendChild(avatar);
      authorRow.appendChild(authorInfo);

      const followBtn = document.createElement('div');
      followBtn.style.cssText = 'padding:6px 16px;border:1px solid #5B9BD5;border-radius:20px;font-size:13px;color:#5B9BD5;font-weight:600;cursor:pointer;';
      followBtn.textContent = '关注';
      authorRow.appendChild(followBtn);

      content.appendChild(authorRow);

      // 正文
      const bodyEl = document.createElement('div');
      bodyEl.style.cssText = 'padding:0 16px;font-size:16px;color:#333;line-height:1.6;white-space:pre-wrap;';
      bodyEl.textContent = page.data.content || '';
      content.appendChild(bodyEl);

      // 时间标签
      const timeEl = document.createElement('div');
      timeEl.style.cssText = 'padding:12px 16px 8px;font-size:13px;color:#999;';
      timeEl.textContent = page.data.time || '';
      content.appendChild(timeEl);

      // 互动行
      const likesRow = document.createElement('div');
      likesRow.style.cssText = 'padding:8px 16px;font-size:15px;color:#333;';
      likesRow.textContent = page.data.likes || '';
      content.appendChild(likesRow);

      // 分割线
      const divider = document.createElement('div');
      divider.style.cssText = 'height:0.5px;background:#E5E5EA;margin:0 16px;';
      content.appendChild(divider);

      // 评论区标题
      const commentTitle = document.createElement('div');
      commentTitle.style.cssText = 'padding:12px 16px 8px;font-size:16px;font-weight:700;color:#333;';
      commentTitle.textContent = '评论 230';
      content.appendChild(commentTitle);

      // 评论区列表
      const comments = page.data.comments || [];
      comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.style.cssText = `padding:8px 16px;${comment.isReply ? 'margin-left:32px;' : ''}`;

        const commentUser = document.createElement('div');
        commentUser.style.cssText = 'font-size:13px;font-weight:700;color:#333;';
        commentUser.textContent = comment.user || '';
        commentEl.appendChild(commentUser);

        const commentText = document.createElement('div');
        commentText.style.cssText = 'font-size:14px;color:#333;margin-top:4px;';
        // "荒野之心"加粗
        var ct = comment.text || '';
        var kw = '荒野之心';
        if (ct.includes(kw)) {
          var parts = ct.split(kw);
          parts.forEach(function(part, i) {
            commentText.appendChild(document.createTextNode(part));
            if (i < parts.length - 1) {
              var b = document.createElement('strong');
              b.textContent = kw;
              b.style.fontWeight = '700';
              b.style.color = '#333';
              commentText.appendChild(b);
            }
          });
        } else {
          commentText.textContent = ct;
        }
        commentEl.appendChild(commentText);

        if (comment.time) {
          const commentTime = document.createElement('div');
          commentTime.style.cssText = 'font-size:12px;color:#999;margin-top:4px;';
          commentTime.textContent = comment.time;
          commentEl.appendChild(commentTime);
        }

        content.appendChild(commentEl);
      });

      container.appendChild(content);
    },

    /** 渲染文章详情页 */
    renderArticle(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;border-radius:14px;padding:20px;margin-bottom:12px;';

      // 视频占位框（B站视频页）
      if (page.data.subtitle && page.data.subtitle.includes('UP主')) {
        const videoPlaceholder = document.createElement('div');
        videoPlaceholder.style.cssText = 'width:100%;aspect-ratio:16/9;background:#E6E2D3;border-radius:8px;margin-bottom:16px;overflow:hidden;position:relative;';
        if (page.data.coverImg) {
          const coverImg = document.createElement('img');
          coverImg.src = page.data.coverImg;
          coverImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          coverImg.alt = '视频封面';
          videoPlaceholder.appendChild(coverImg);
        }
        const playIcon = document.createElement('div');
        playIcon.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
        playIcon.innerHTML = '<div style="width:0;height:0;border-left:18px solid #fff;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px;"></div>';
        videoPlaceholder.appendChild(playIcon);
        card.appendChild(videoPlaceholder);
      } else if (page.data.coverImg) {
        // 新闻/文章配图
        const imgWrap = document.createElement('div');
        imgWrap.style.cssText = 'width:100%;aspect-ratio:16/9;border-radius:8px;margin-bottom:16px;overflow:hidden;';
        const coverImg = document.createElement('img');
        coverImg.src = page.data.coverImg;
        coverImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        coverImg.alt = '配图';
        imgWrap.appendChild(coverImg);
        card.appendChild(imgWrap);
      }

      const title = document.createElement('div');
      title.style.cssText = 'font-size:22px;font-weight:700;color:#6B5340;margin-bottom:8px;';
      title.textContent = page.data.title || '';
      card.appendChild(title);

      // 副标题（如备忘录分类标签）
      if (page.data.subtitle) {
        const subtitle = document.createElement('div');
        subtitle.style.cssText = 'font-size:15px;font-weight:600;color:#007AFF;margin-bottom:16px;padding:8px 12px;background:#F0F5FF;border-radius:8px;';
        subtitle.textContent = page.data.subtitle;
        card.appendChild(subtitle);
      }

      if (page.data.author || page.data.date) {
        const meta = document.createElement('div');
        meta.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:16px;';
        if (page.data.author) {
          const authorSpan = document.createElement('span');
          if (page.data.authorTarget) {
            authorSpan.style.cssText = 'color:#007AFF;cursor:pointer;';
            const target = page.data.authorTarget;
            const prefill = page.data.authorPrefillAccount || null;
            authorSpan.addEventListener('click', () => {
              if (prefill) Router.navigate(target, true, { prefillAccount: prefill });
              else Router.navigate(target);
            });
          }
          authorSpan.textContent = page.data.author;
          meta.appendChild(authorSpan);
        }
        if (page.data.author && page.data.date) {
          const sep = document.createTextNode(' · ');
          meta.appendChild(sep);
        }
        if (page.data.date) {
          const dateSpan = document.createTextNode(page.data.date);
          meta.appendChild(dateSpan);
        }
        card.appendChild(meta);
      }

      const body = document.createElement('div');
      body.style.cssText = 'font-size:16px;line-height:1.6;color:#6B5340;white-space:pre-wrap;';
      if (page.data.boldContent) {
        body.style.fontWeight = '700';
      }
      let textContent = page.data.content || '';
      if (page.data.bold && page.data.bold.length > 0) {
        let html = textContent;
        page.data.bold.forEach(boldText => {
          html = html.split(boldText).join('<b>' + boldText + '</b>');
        });
        body.innerHTML = html;
      } else {
        body.textContent = textContent;
      }
      card.appendChild(body);

      // 底部注释（如备忘录说明）
      if (page.data.footerNote) {
        const footer = document.createElement('div');
        footer.style.cssText = 'font-size:13px;color:#8E8E93;line-height:1.6;margin-top:20px;padding-top:16px;border-top:0.5px solid #E5E5EA;white-space:pre-wrap;font-style:italic;';
        footer.textContent = page.data.footerNote;
        card.appendChild(footer);
      }

      content.appendChild(card);

      // 评论区
      if (page.data.comments && page.data.comments.length > 0) {
        const commentSection = document.createElement('div');
        commentSection.style.cssText = 'background:#fff;border-radius:14px;padding:20px;margin-bottom:12px;';

        const commentTitle = document.createElement('div');
        commentTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;margin-bottom:12px;';
        commentTitle.textContent = '评论区';
        commentSection.appendChild(commentTitle);

        page.data.comments.forEach(comment => {
          const commentCard = document.createElement('div');
          commentCard.style.cssText = 'background:#F2F2F7;border-radius:10px;padding:12px;margin-bottom:8px;';

          const commentHeader = document.createElement('div');
          commentHeader.style.cssText = 'display:flex;align-items:center;margin-bottom:6px;';

          const userName = document.createElement('span');
          userName.style.cssText = 'font-size:13px;font-weight:600;color:#6B5340;';
          userName.textContent = comment.user || '';

          commentHeader.appendChild(userName);

          if (comment.pinned) {
            const pinTag = document.createElement('span');
            pinTag.style.cssText = 'font-size:11px;color:#FF3B30;background:#FFF0F0;padding:1px 6px;border-radius:4px;margin-left:8px;';
            pinTag.textContent = '置顶';
            commentHeader.appendChild(pinTag);
          }

          if (comment.time) {
            const timeEl = document.createElement('span');
            timeEl.style.cssText = 'font-size:11px;color:#8E8E93;margin-left:auto;';
            timeEl.textContent = comment.time;
            commentHeader.appendChild(timeEl);
          }

          commentCard.appendChild(commentHeader);

          const commentText = document.createElement('div');
          commentText.style.cssText = 'font-size:14px;color:#6B5340;';
          // 支持 boldKeywords 加粗（页面级）或 comment.bold（评论级）
          var ct = comment.text || '';
          var keywords = page.data.boldKeywords || [];
          if (comment.bold && comment.bold.length > 0) {
            comment.bold.forEach(function(boldText) {
              ct = ct.split(boldText).join('<b style="font-weight:700">' + boldText + '</b>');
            });
            commentText.innerHTML = ct;
          } else if (keywords.length > 0 && keywords.some(kw => ct.includes(kw))) {
            // 找到第一个匹配的关键词进行加粗
            var matchedKw = keywords.find(kw => ct.includes(kw));
            var parts = ct.split(matchedKw);
            parts.forEach(function(part, i) {
              commentText.appendChild(document.createTextNode(part));
              if (i < parts.length - 1) {
                var b = document.createElement('strong');
                b.textContent = matchedKw;
                b.style.fontWeight = '700';
                commentText.appendChild(b);
              }
            });
          } else {
            commentText.textContent = ct;
          }
          commentCard.appendChild(commentText);

          commentSection.appendChild(commentCard);
        });

        content.appendChild(commentSection);
      }

      container.appendChild(content);
    },

    /** 渲染个人主页 */
    renderProfile(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};

      // 自动检测 profile 类型
      const profileType = this._detectProfileType(data);

      // 导航栏
      container.appendChild(this.createHeader(data.nickname || page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 通用头部：个人信息卡片
      const headerCard = this._createProfileHeader(data, profileType);
      content.appendChild(headerCard);

      // 根据类型渲染帖子列表
      if (profileType === 'qq') {
        this._renderQQPosts(content, data);
      } else if (profileType === 'weibo') {
        this._renderWeiboPosts(content, data);
      } else if (profileType === 'forum') {
        this._renderForumPosts(content, data);
      }

      // 收藏列表
      if (data.favorites && data.favorites.length > 0) {
        const favSection = document.createElement('div');
        favSection.style.cssText = 'padding:16px;';

        const favTitle = document.createElement('div');
        favTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;margin-bottom:12px;';
        favTitle.textContent = '\u6211\u7684\u6536\u85CF';
        favSection.appendChild(favTitle);

        data.favorites.forEach(function(fav) {
          const row = document.createElement('div');
          row.className = 'list-item';
          row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:0.5px solid #E6E2D3;cursor:default;';

          const leftCol = document.createElement('div');
          leftCol.style.cssText = 'flex:1;min-width:0;';

          const titleEl = document.createElement('div');
          titleEl.style.cssText = 'font-size:15px;color:#6B5340;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
          titleEl.textContent = fav.title || '';
          leftCol.appendChild(titleEl);

          const metaEl = document.createElement('div');
          metaEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:2px;';
          var metaParts = [];
          if (fav.author) metaParts.push(fav.author);
          if (fav.date) metaParts.push('\u6536\u85CF\u4E8E ' + fav.date);
          metaEl.textContent = metaParts.join(' \xB7 ');
          leftCol.appendChild(metaEl);

          row.appendChild(leftCol);

          if (fav.clickable && fav.target) {
            var arrow = document.createElement('div');
            arrow.style.cssText = 'color:#007AFF;font-size:18px;margin-left:8px;flex-shrink:0;cursor:pointer;';
            arrow.textContent = '\u203A';
            arrow.addEventListener('click', function() { Router.navigate(fav.target); });
            row.appendChild(arrow);
            row.style.cursor = 'pointer';
            row.addEventListener('click', function() { Router.navigate(fav.target); });
          }

          favSection.appendChild(row);
        });

        content.appendChild(favSection);
      }

      // 草稿箱
      if (data.drafts && data.drafts.length > 0) {
        var draftSection = document.createElement('div');
        draftSection.style.cssText = 'padding:16px;';

        var draftTitle = document.createElement('div');
        draftTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;margin-bottom:12px;';
        draftTitle.textContent = '\u8349\u7A3F\u7BB1';
        draftSection.appendChild(draftTitle);

        data.drafts.forEach(function(draft) {
          var row = document.createElement('div');
          row.className = 'memo-accordion-item';

          var rowHeader = document.createElement('div');
          rowHeader.className = 'memo-accordion-header';
          rowHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:0.5px solid #E6E2D3;cursor:pointer;';

          var rowLeft = document.createElement('div');
          rowLeft.style.cssText = 'flex:1;min-width:0;';

          var rowTitleEl = document.createElement('div');
          rowTitleEl.style.cssText = 'font-size:15px;color:#6B5340;font-weight:500;';
          rowTitleEl.textContent = draft.title || '';
          rowLeft.appendChild(rowTitleEl);

          var rowDate = document.createElement('div');
          rowDate.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:2px;';
          rowDate.textContent = '\u6700\u540E\u7F16\u8F91 ' + (draft.date || '');
          rowLeft.appendChild(rowDate);

          rowHeader.appendChild(rowLeft);

          var rowArrow = document.createElement('div');
          rowArrow.style.cssText = 'color:#007AFF;font-size:18px;margin-left:8px;flex-shrink:0;';
          rowArrow.textContent = '>';
          rowHeader.appendChild(rowArrow);

          row.appendChild(rowHeader);

          var rowBody = document.createElement('div');
          rowBody.className = 'memo-accordion-body';
          rowBody.style.maxHeight = '0px';

          if (draft.content) {
            var rowContent = document.createElement('div');
            rowContent.className = 'memo-accordion-text';
            rowContent.style.cssText = 'font-size:14px;color:#6B5340;line-height:1.6;white-space:pre-wrap;padding:12px 16px;';
            // 支持 boldKeywords
            if (draft.boldKeywords && draft.boldKeywords.length > 0) {
              var dcText = draft.content;
              draft.boldKeywords.forEach(function(kw) {
                dcText = dcText.split(kw).join('<b>' + kw + '</b>');
              });
              rowContent.innerHTML = dcText;
            } else {
              rowContent.textContent = draft.content;
            }
            rowBody.appendChild(rowContent);
          }

          row.appendChild(rowBody);

          rowHeader.addEventListener('click', function() {
            var isOpen = rowBody.style.maxHeight && rowBody.style.maxHeight !== '0px';
            if (isOpen) {
              rowBody.style.maxHeight = '0px';
            } else {
              rowBody.style.maxHeight = rowBody.scrollHeight + 'px';
            }
          });

          draftSection.appendChild(row);
        });

        content.appendChild(draftSection);
      }

      container.appendChild(content);
    },

    renderQQSpace(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader(data.nickname || page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 头部卡片
      const headerCard = document.createElement('div');
      headerCard.style.cssText = 'background:linear-gradient(135deg, #43cea2 0%, #185a9d 100%);padding:24px 20px;text-align:center;';

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;';
      avatar.textContent = (data.nickname || '?')[0];
      headerCard.appendChild(avatar);

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin-bottom:4px;';
      nameEl.textContent = data.nickname || '';
      headerCard.appendChild(nameEl);

      if (data.signature) {
        const sigEl = document.createElement('div');
        sigEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.8);';
        sigEl.textContent = data.signature;
        headerCard.appendChild(sigEl);
      }
      content.appendChild(headerCard);

      // 置顶转发
      if (data.pinnedRepost) {
        const pr = data.pinnedRepost;
        const pinCard = document.createElement('div');
        pinCard.style.cssText = 'background:#fff;padding:16px 20px;border-bottom:0.5px solid #E5E5EA;';

        // 置顶标签 + 昵称 + 日期
        const pinHeader = document.createElement('div');
        pinHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';

        const pinLeft = document.createElement('div');
        pinLeft.style.cssText = 'display:flex;align-items:center;gap:6px;';

        const pinTag = document.createElement('span');
        pinTag.style.cssText = 'font-size:11px;color:#fff;background:#FF3B30;padding:1px 6px;border-radius:3px;';
        pinTag.textContent = '\u7F6E\u9876';
        pinLeft.appendChild(pinTag);

        const pinNickname = document.createElement('span');
        pinNickname.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;';
        pinNickname.textContent = data.nickname || '';
        pinLeft.appendChild(pinNickname);

        pinHeader.appendChild(pinLeft);

        const pinDate = document.createElement('span');
        pinDate.style.cssText = 'font-size:12px;color:#8E8E93;';
        pinDate.textContent = pr.date || '';
        pinHeader.appendChild(pinDate);

        pinCard.appendChild(pinHeader);

        // 转发配文（用户自己写的评论）
        if (pr.comment) {
          const pinComment = document.createElement('div');
          pinComment.style.cssText = 'font-size:15px;color:#6B5340;line-height:1.5;margin-bottom:10px;';
          pinComment.textContent = pr.comment;
          pinCard.appendChild(pinComment);
        }

        // 原文卡片（灰色背景区域，模仿QQ空间转发样式）
        const origCard = document.createElement('div');
        origCard.style.cssText = 'background:#F7F7F7;border-radius:8px;padding:12px;margin-bottom:8px;';

        // 原文标题
        const pinTitle = document.createElement('div');
        pinTitle.style.cssText = 'font-size:14px;font-weight:600;color:#576B95;margin-bottom:6px;';
        // Gemini 加粗
        var pinTitleText = pr.title || '';
        var pinParts = pinTitleText.split('Gemini');
        if (pinParts.length > 1) {
          pinParts.forEach(function(part, i) {
            pinTitle.appendChild(document.createTextNode(part));
            if (i < pinParts.length - 1) {
              var b = document.createElement('span');
              b.textContent = 'Gemini';
              b.style.fontWeight = '700';
              b.style.color = '#3A3A3A';
              pinTitle.appendChild(b);
            }
          });
        } else {
          pinTitle.textContent = pinTitleText;
        }
        origCard.appendChild(pinTitle);

        // 折叠区域：科普正文 + 评论区
        var expandArea = document.createElement('div');
        expandArea.style.cssText = 'display:none;';

        // 科普正文
        if (pr.fullContent) {
          var fullEl = document.createElement('div');
          fullEl.style.cssText = 'font-size:13px;color:#6B5340;line-height:1.7;margin-bottom:10px;white-space:pre-wrap;';
          // Gemini 加粗
          var fcText = pr.fullContent || '';
          var boldKws = pr.boldKeywords || [];
          if (boldKws.length > 0) {
            boldKws.sort(function(a, b) { return b.length - a.length; });
            var segments = [fcText];
            boldKws.forEach(function(kw) {
              var newSegs = [];
              segments.forEach(function(seg) {
                if (seg._isBold) {
                  newSegs.push(seg);
                } else {
                  var parts = seg.split(kw);
                  parts.forEach(function(part, i) {
                    if (part) newSegs.push(part);
                    if (i < parts.length - 1) {
                      var b = document.createElement('span');
                      b.textContent = kw;
                      b.style.fontWeight = '700';
                      b._isBold = true;
                      newSegs.push(b);
                    }
                  });
                }
              });
              segments = newSegs;
            });
            segments.forEach(function(seg) {
              if (seg._isBold) {
                fullEl.appendChild(seg);
              } else {
                fullEl.appendChild(document.createTextNode(seg));
              }
            });
          } else {
            fullEl.textContent = fcText;
          }
          expandArea.appendChild(fullEl);
        }

        // 评论区（分割线 + 评论列表）
        if (pr.replies && pr.replies.length > 0) {
          var commentSep = document.createElement('div');
          commentSep.style.cssText = 'height:0.5px;background:#D8D8D8;margin:8px 0;';
          expandArea.appendChild(commentSep);

          pr.replies.forEach(function(reply) {
            var rEl = document.createElement('div');
            rEl.style.cssText = 'font-size:13px;color:#6B5340;padding:3px 0;line-height:1.4;' + (reply.isReply ? 'padding-left:12px;' : '');
            var userSpan = document.createElement('span');
            userSpan.style.cssText = 'color:#576B95;font-weight:500;';
            userSpan.textContent = reply.user;
            rEl.appendChild(userSpan);
            if (reply.isReply) {
              var replyArrow = document.createElement('span');
              replyArrow.style.cssText = 'color:#8E8E93;margin:0 4px;';
              replyArrow.textContent = '\u56DE\u590D';
              rEl.appendChild(replyArrow);
              // 找到被回复的用户
              if (pr.replies.length > 0) {
                var repliedUser = '';
                for (var ri = 0; ri < pr.replies.length; ri++) {
                  if (pr.replies[ri] === reply) {
                    // 找前一个非回复的评论
                    for (var rj = ri - 1; rj >= 0; rj--) {
                      if (!pr.replies[rj].isReply) {
                        repliedUser = pr.replies[rj].user;
                        break;
                      }
                    }
                    break;
                  }
                }
                if (repliedUser) {
                  var repliedSpan = document.createElement('span');
                  repliedSpan.style.cssText = 'color:#576B95;font-weight:500;';
                  repliedSpan.textContent = repliedUser;
                  rEl.appendChild(repliedSpan);
                }
              }
            }
            rEl.appendChild(document.createTextNode('\uFF1A' + reply.text));
            expandArea.appendChild(rEl);
          });
        }

        origCard.appendChild(expandArea);
        pinCard.appendChild(origCard);

        // 展开/收起按钮（在原文卡片内，蓝色链接样式）
        var expandBtn = document.createElement('div');
        expandBtn.style.cssText = 'font-size:13px;color:#576B95;cursor:pointer;padding:4px 0;text-align:center;';
        expandBtn.textContent = '\u5C55\u5F00\u5168\u6587';
        expandBtn.addEventListener('click', function() {
          var isHidden = expandArea.style.display === 'none' || !expandArea.style.display;
          if (isHidden) {
            expandArea.style.display = 'block';
            expandBtn.textContent = '\u6536\u8D77';
          } else {
            expandArea.style.display = 'none';
            expandBtn.textContent = '\u5C55\u5F00\u5168\u6587';
          }
        });
        origCard.appendChild(expandBtn);

        content.appendChild(pinCard);
      }

      // 日志
      if (data.journals && data.journals.length > 0) {
        var journalSection = document.createElement('div');
        journalSection.style.cssText = 'background:#fff;padding:16px 20px;border-bottom:0.5px solid #E5E5EA;';

        var journalLabel = document.createElement('div');
        journalLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:12px;font-weight:600;';
        journalLabel.textContent = '日志';
        journalSection.appendChild(journalLabel);

        data.journals.forEach(function(journal) {
          var jItem = document.createElement('div');
          jItem.className = 'memo-accordion-item';

          var jHeader = document.createElement('div');
          jHeader.className = 'memo-accordion-header';

          if (journal.locked) {
            // 私密日志：显示锁图标
            jHeader.textContent = journal.lockLabel || ('🔒 ' + journal.title);
            jHeader.addEventListener('click', function() {
              // 弹出密保验证弹窗
              var modal = document.getElementById('modal');
              if (!modal) return;
              modal.removeAttribute('hidden');
              modal.style.display = 'flex';
              modal.style.alignItems = 'center';
              modal.style.justifyContent = 'center';
              modal.innerHTML = '';

              var modalContent = document.createElement('div');
              modalContent.style.cssText = 'background:#fff;border-radius:16px;padding:28px 24px;width:85%;max-width:320px;text-align:center;';

              var modalIcon = document.createElement('div');
              modalIcon.style.cssText = 'font-size:36px;margin-bottom:12px;';
              modalIcon.textContent = '🔒';
              modalContent.appendChild(modalIcon);

              var modalTitle = document.createElement('div');
              modalTitle.style.cssText = 'font-size:17px;font-weight:700;color:#3C3C43;margin-bottom:6px;';
              modalTitle.textContent = '私密日志';
              modalContent.appendChild(modalTitle);

              var modalDesc = document.createElement('div');
              modalDesc.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:20px;';
              modalDesc.textContent = '查看此日志需要验证身份';
              modalContent.appendChild(modalDesc);

              var questionLabel = document.createElement('div');
              questionLabel.style.cssText = 'font-size:14px;color:#3C3C43;font-weight:600;margin-bottom:8px;text-align:left;';
              questionLabel.textContent = '密保问题：' + (journal.securityQuestion || '');
              modalContent.appendChild(questionLabel);

              var answerInput = document.createElement('input');
              answerInput.type = 'text';
              answerInput.style.cssText = 'width:100%;height:42px;border:1.5px solid #D1D1D6;border-radius:10px;padding:0 14px;font-size:15px;color:#3C3C43;outline:none;box-sizing:border-box;margin-bottom:6px;';
              answerInput.placeholder = '请输入答案';
              answerInput.autocomplete = 'off';
              modalContent.appendChild(answerInput);

              var errMsg = document.createElement('div');
              errMsg.style.cssText = 'font-size:12px;color:#FF3B30;height:18px;text-align:left;margin-bottom:12px;';
              modalContent.appendChild(errMsg);

              var confirmBtn = document.createElement('button');
              confirmBtn.style.cssText = 'width:100%;height:42px;border:none;border-radius:10px;background:#43cea2;color:#fff;font-size:15px;font-weight:600;cursor:pointer;';
              confirmBtn.textContent = '确认';
              confirmBtn.addEventListener('click', function() {
                var val = answerInput.value.trim().toLowerCase();
                if (val === (journal.securityAnswer || '').toLowerCase()) {
                  // 验证成功，解锁日志
                  journal.locked = false;
                  modal.style.display = 'none';
                  modal.innerHTML = '';
                  // 重新渲染日志区域
                  journalSection.innerHTML = '';
                  journalLabel = document.createElement('div');
                  journalLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:12px;font-weight:600;';
                  journalLabel.textContent = '日志';
                  journalSection.appendChild(journalLabel);
                  // 重新创建已解锁的日志项
                  var jItem2 = document.createElement('div');
                  jItem2.className = 'memo-accordion-item';
                  var jHeader2 = document.createElement('div');
                  jHeader2.className = 'memo-accordion-header';
                  jHeader2.textContent = journal.title;
                  jHeader2.addEventListener('click', function() {
                    var body = jItem2.querySelector('.memo-accordion-body');
                    var isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
                    if (isOpen) {
                      body.style.maxHeight = '0px';
                      jHeader2.classList.remove('open');
                    } else {
                      body.style.maxHeight = body.scrollHeight + 'px';
                      jHeader2.classList.add('open');
                    }
                  });
                  jItem2.appendChild(jHeader2);
                  var jBody2 = document.createElement('div');
                  jBody2.className = 'memo-accordion-body';
                  jBody2.style.maxHeight = '0px';
                  var jDate2 = document.createElement('div');
                  jDate2.style.cssText = 'font-size:12px;color:#8E8E93;margin-bottom:8px;';
                  jDate2.textContent = journal.date || '';
                  jBody2.appendChild(jDate2);
                  var jContent2 = document.createElement('div');
                  jContent2.className = 'memo-accordion-text';
                  jContent2.textContent = journal.content || '';
                  jBody2.appendChild(jContent2);
                  jItem2.appendChild(jBody2);
                  journalSection.appendChild(jItem2);
                } else {
                  errMsg.textContent = '答案错误';
                  answerInput.value = '';
                  answerInput.focus();
                }
              });
              answerInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') confirmBtn.click();
              });
              modalContent.appendChild(confirmBtn);

              modal.appendChild(modalContent);
              setTimeout(function() { answerInput.focus(); }, 100);
            });
          } else {
            // 普通日志
            jHeader.textContent = journal.title;
            jHeader.addEventListener('click', function() {
              var jBody = jItem.querySelector('.memo-accordion-body');
              var isOpen = jBody.style.maxHeight && jBody.style.maxHeight !== '0px';
              if (isOpen) {
                jBody.style.maxHeight = '0px';
                jHeader.classList.remove('open');
              } else {
                jBody.style.maxHeight = jBody.scrollHeight + 'px';
                jHeader.classList.add('open');
              }
            });
          }
          jItem.appendChild(jHeader);

          if (!journal.locked) {
            var jBody = document.createElement('div');
            jBody.className = 'memo-accordion-body';
            jBody.style.maxHeight = '0px';

            var jDate = document.createElement('div');
            jDate.style.cssText = 'font-size:12px;color:#8E8E93;margin-bottom:8px;';
            jDate.textContent = journal.date || '';
            jBody.appendChild(jDate);

            var jContent = document.createElement('div');
            jContent.className = 'memo-accordion-text';
            jContent.textContent = journal.content || '';
            jBody.appendChild(jContent);

            jItem.appendChild(jBody);
          }

          journalSection.appendChild(jItem);
        });

        content.appendChild(journalSection);
      }

      // 说说
      if (data.posts && data.posts.length > 0) {
        var postSection = document.createElement('div');
        postSection.style.cssText = 'background:#fff;padding:16px 20px;border-bottom:0.5px solid #E5E5EA;';

        var postLabel = document.createElement('div');
        postLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:12px;font-weight:600;';
        postLabel.textContent = '\u8BF4\u8BF4';
        postSection.appendChild(postLabel);

        data.posts.forEach(function(post) {
          var pCard = document.createElement('div');
          pCard.style.cssText = 'padding:12px 0;border-bottom:0.5px solid #F0F0F0;';

          // 昵称
          var pUser = document.createElement('div');
          pUser.style.cssText = 'font-size:14px;font-weight:600;color:#6B5340;margin-bottom:4px;';
          pUser.textContent = data.nickname || '';
          pCard.appendChild(pUser);

          // 文字内容（支持 @mention 点击）
          var pText = document.createElement('div');
          pText.style.cssText = 'font-size:15px;color:#6B5340;line-height:1.5;margin-bottom:4px;';
          if (post.mentionTarget) {
            // 分割 @mention
            var mentionRegex = /@(\S+)\s/;
            var match = post.text.match(mentionRegex);
            if (match) {
              var before = post.text.substring(0, match.index);
              var mentionName = match[1];
              var after = post.text.substring(match.index + match[0].length);
              pText.appendChild(document.createTextNode(before));
              var mentionSpan = document.createElement('span');
              mentionSpan.style.cssText = 'color:#007AFF;cursor:pointer;font-weight:500;';
              mentionSpan.textContent = '@' + mentionName + ' ';
              mentionSpan.addEventListener('click', function() { Router.navigate(post.mentionTarget); });
              pText.appendChild(mentionSpan);
              pText.appendChild(document.createTextNode(after));
            } else {
              pText.textContent = post.text;
            }
          } else {
            pText.textContent = post.text;
          }
          pCard.appendChild(pText);

          // 日期
          var pDate = document.createElement('div');
          pDate.style.cssText = 'font-size:12px;color:#8E8E93;margin-bottom:8px;';
          pDate.textContent = post.date || '';
          pCard.appendChild(pDate);

          // 评论
          if (post.replies && post.replies.length > 0) {
            post.replies.forEach(function(reply) {
              var rEl = document.createElement('div');
              rEl.style.cssText = 'font-size:13px;color:#6B5340;padding:3px 0;' + (reply.isReply ? 'padding-left:16px;' : '');
              if (reply.bold) rEl.style.fontWeight = '700';
              var rUser = document.createElement('span');
              rUser.style.fontWeight = '600';
              rUser.textContent = reply.user + '\uFF1A';
              rEl.appendChild(rUser);
              rEl.appendChild(document.createTextNode(reply.text));
              pCard.appendChild(rEl);
            });
          }

          postSection.appendChild(pCard);
        });

        content.appendChild(postSection);
      }

      // 相册
      if (data.albums && data.albums.length > 0) {
        var albumSection = document.createElement('div');
        albumSection.style.cssText = 'background:#fff;padding:16px 20px;';

        var albumLabel = document.createElement('div');
        albumLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:12px;font-weight:600;';
        albumLabel.textContent = '\u76F8\u518C';
        albumSection.appendChild(albumLabel);

        data.albums.forEach(function(album) {
          var aCard = document.createElement('div');
          aCard.style.cssText = 'display:flex;align-items:center;padding:12px;border:1px solid #E5E5EA;border-radius:10px;margin-bottom:8px;cursor:pointer;';

          var aIcon = document.createElement('div');
          aIcon.style.cssText = 'width:48px;height:48px;background:#F2F2F7;border-radius:8px;margin-right:12px;display:flex;align-items:center;justify-content:center;font-size:24px;';
          aIcon.textContent = '\uD83D\uDBC2';
          aCard.appendChild(aIcon);

          var aInfo = document.createElement('div');
          aInfo.style.cssText = 'flex:1;';
          var aTitle = document.createElement('div');
          aTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;';
          aTitle.textContent = album.title || '';
          aInfo.appendChild(aTitle);
          if (album.caption) {
            var aCaption = document.createElement('div');
            aCaption.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:2px;';
            aCaption.textContent = album.caption;
            aInfo.appendChild(aCaption);
          }
          aCard.appendChild(aInfo);

          albumSection.appendChild(aCard);
        });

        content.appendChild(albumSection);
      }

      container.appendChild(content);
    },

    /**
     * 检测 profile 数据结构类型
     * @param {Object} data - 页面数据
     * @returns {string} 'qq' | 'weibo' | 'forum' | 'basic'
     */
    _detectProfileType(data) {
      const posts = data.posts || [];
      if (posts.length > 0 && posts[0].title !== undefined) {
        return 'forum';
      }
      if (data.sidebar) {
        return 'weibo';
      }
      if (posts.length > 0 && posts[0].type !== undefined) {
        return 'qq';
      }
      return 'basic';
    },

    /**
     * 创建通用个人信息头部卡片
     * @param {Object} data - 页面数据
     * @param {string} profileType - profile 类型
     * @returns {HTMLElement}
     */
    _createProfileHeader(data, profileType) {
      // 根据类型选择渐变背景色
      const gradients = {
        qq: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
        weibo: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        forum: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        basic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };

      const card = document.createElement('div');
      card.style.cssText = 'padding:24px 16px 20px;text-align:center;background:' +
        (gradients[profileType] || gradients.basic) + ';color:#fff;margin-bottom:12px;';

      // 头像
      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;';
      avatar.textContent = data.avatar || '\uD83D\uDC64';
      card.appendChild(avatar);

      // 昵称
      const nickname = document.createElement('div');
      nickname.style.cssText = 'font-size:18px;font-weight:bold;margin-bottom:4px;';
      nickname.textContent = data.nickname || '';
      card.appendChild(nickname);

      // 签名 / 简介
      const signature = data.signature || data.bio || '';
      if (signature) {
        const sigEl = document.createElement('div');
        sigEl.style.cssText = 'font-size:13px;opacity:0.8;margin-bottom:4px;';
        sigEl.textContent = signature;
        card.appendChild(sigEl);
      }

      // 论坛类型：显示注册日期和帖子数
      if (profileType === 'forum') {
        if (data.registerDate) {
          const regDate = document.createElement('div');
          regDate.style.cssText = 'font-size:12px;opacity:0.7;margin-bottom:2px;';
          regDate.textContent = '注册日期: ' + data.registerDate;
          card.appendChild(regDate);
        }
        if (data.postCount !== undefined) {
          const postCount = document.createElement('div');
          postCount.style.cssText = 'font-size:12px;opacity:0.7;';
          postCount.textContent = '发帖数: ' + data.postCount;
          card.appendChild(postCount);
        }
      }

      return card;
    },

    /**
     * 渲染 QQ空间帖子列表
     * @param {HTMLElement} content - 内容容器
     * @param {Object} data - 页面数据
     */
    _renderQQPosts(content, data) {
      const posts = data.posts || [];
      posts.forEach(post => {
        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:12px;padding:16px;margin:0 12px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);';

        // 顶部行：类型标签 + 日期
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';

        if (post.type) {
          const typeTag = document.createElement('span');
          typeTag.style.cssText = 'font-size:11px;color:#43cea2;font-weight:500;';
          typeTag.textContent = post.type;
          topRow.appendChild(typeTag);
        }

        if (post.date) {
          const dateEl = document.createElement('span');
          dateEl.style.cssText = 'font-size:11px;color:#999;';
          dateEl.textContent = post.date;
          topRow.appendChild(dateEl);
        }

        card.appendChild(topRow);

        // 帖子内容
        if (post.text) {
          const textEl = document.createElement('div');
          textEl.style.cssText = 'font-size:15px;color:#333;line-height:1.5;margin-bottom:8px;';
          textEl.textContent = post.text;
          card.appendChild(textEl);
        }

        // 评论区
        const comments = post.comments || [];
        if (comments.length > 0) {
          const commentBox = document.createElement('div');
          commentBox.style.cssText = 'border-top:1px solid #f0f0f0;padding-top:8px;margin-top:4px;';

          comments.forEach(comment => {
            const commentRow = document.createElement('div');
            commentRow.style.cssText = 'margin-bottom:6px;padding-left:8px;font-size:13px;color:#555;line-height:1.4;';

            const userName = document.createElement('span');
            userName.style.cssText = 'font-weight:bold;color:#333;margin-right:6px;';

            if (post.clickableUser && comment.user === post.clickableUser && post.clickTarget) {
              userName.style.cssText += 'color:#43cea2;cursor:pointer;text-decoration:underline;';
              userName.addEventListener('click', () => {
                Router.navigate(post.clickTarget);
              });
            }

            userName.textContent = comment.user;
            commentRow.appendChild(userName);

            const commentText = document.createElement('span');
            commentText.textContent = ': ' + comment.text;
            commentRow.appendChild(commentText);

            commentBox.appendChild(commentRow);
          });

          card.appendChild(commentBox);
        }

        content.appendChild(card);
      });
    },

    /**
     * 渲染微博帖子列表（含可选侧边栏）
     * @param {HTMLElement} content - 内容容器
     * @param {Object} data - 页面数据
     */
    _renderWeiboPosts(content, data) {
      const hasSidebar = !!data.sidebar;

      // 如果有侧边栏，使用 flex 布局
      if (hasSidebar) {
        const flexWrap = document.createElement('div');
        flexWrap.style.cssText = 'display:flex;gap:10px;padding:0 12px;';

        // 左侧：帖子列表
        const postsCol = document.createElement('div');
        postsCol.style.cssText = 'flex:1;min-width:0;';

        this._renderWeiboPostCards(postsCol, data.posts || []);
        flexWrap.appendChild(postsCol);

        // 右侧：侧边栏
        const sidebarCard = document.createElement('div');
        sidebarCard.style.cssText = 'width:120px;flex-shrink:0;background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);align-self:flex-start;position:sticky;top:50px;';

        const sidebarTitle = document.createElement('div');
        sidebarTitle.style.cssText = 'font-size:12px;color:#999;margin-bottom:8px;';
        sidebarTitle.textContent = data.sidebar.text || '可能认识的人';
        sidebarCard.appendChild(sidebarTitle);

        if (data.sidebar.name) {
          const sidebarName = document.createElement('div');
          const isBold = data.sidebar.bold !== false;
          sidebarName.style.cssText = 'font-size:14px;color:#f5af19;cursor:pointer;' +
            (isBold ? 'font-weight:bold;' : '');
          sidebarName.textContent = data.sidebar.name;
          if (data.sidebar.target) {
            sidebarName.addEventListener('click', () => {
              Router.navigate(data.sidebar.target);
            });
          }
          sidebarCard.appendChild(sidebarName);
        }

        flexWrap.appendChild(sidebarCard);
        content.appendChild(flexWrap);
      } else {
        // 无侧边栏，直接渲染帖子
        this._renderWeiboPostCards(content, data.posts || []);
      }
    },

    /**
     * 渲染微博帖子卡片列表
     * @param {HTMLElement} parent - 父容器
     * @param {Array} posts - 帖子数组
     */
    _renderWeiboPostCards(parent, posts) {
      posts.forEach(post => {
        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:12px;padding:16px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);';

        // 日期（右上角）
        if (post.date) {
          const dateEl = document.createElement('div');
          dateEl.style.cssText = 'text-align:right;font-size:11px;color:#999;margin-bottom:8px;';
          dateEl.textContent = post.date;
          card.appendChild(dateEl);
        }

        // 内容
        if (post.text) {
          const textEl = document.createElement('div');
          textEl.style.cssText = 'font-size:15px;color:#333;line-height:1.5;';
          textEl.textContent = post.text;
          card.appendChild(textEl);
        }

        parent.appendChild(card);
      });
    },

    /**
     * 渲染论坛帖子列表
     * @param {HTMLElement} content - 内容容器
     * @param {Object} data - 页面数据
     */
    _renderForumPosts(content, data) {
      const posts = data.posts || [];
      posts.forEach(post => {
        const row = document.createElement('div');
        row.className = 'list-item';
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:0.5px solid #E6E2D3;cursor:default;';

        // 左侧：标题 + 日期
        const leftCol = document.createElement('div');
        leftCol.style.cssText = 'flex:1;min-width:0;';

        const title = document.createElement('div');
        title.style.cssText = 'font-size:16px;color:#6B5340;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        title.textContent = post.title || '';
        leftCol.appendChild(title);

        if (post.date) {
          const dateEl = document.createElement('div');
          dateEl.style.cssText = 'font-size:13px;color:#8E8E93;';
          dateEl.textContent = post.date;
          leftCol.appendChild(dateEl);
        }

        if (post.subtitle) {
          const subEl = document.createElement('div');
          subEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:2px;';
          subEl.textContent = post.subtitle;
          leftCol.appendChild(subEl);
        }

        row.appendChild(leftCol);

        // 右侧：可点击箭头
        if (post.clickable && post.target) {
          const arrow = document.createElement('div');
          arrow.style.cssText = 'color:#007AFF;font-size:18px;margin-left:8px;flex-shrink:0;cursor:pointer;';
          arrow.textContent = '\u203A'; // ›
          arrow.addEventListener('click', () => {
            Router.navigate(post.target);
          });
          row.appendChild(arrow);
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            Router.navigate(post.target);
          });
        } else if (post.clickable && post.clickAction === 'locked') {
          row.style.cursor = 'pointer';
          title.style.color = '#007AFF';
          row.addEventListener('click', () => {
            Modal.show('提示', post.clickMessage || '该帖不可查看', [{ text: '确定', onClick: () => {} }]);
          });
        }

        content.appendChild(row);
      });
    },

    renderWeiboProfile(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader(data.nickname || page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 头部卡片
      const headerCard = document.createElement('div');
      headerCard.style.cssText = 'background:linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);padding:24px 20px;text-align:center;';

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;';
      avatar.textContent = (data.nickname || '?')[0];
      headerCard.appendChild(avatar);

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin-bottom:4px;';
      nameEl.textContent = data.nickname || '';
      headerCard.appendChild(nameEl);

      if (data.bio) {
        const bioEl = document.createElement('div');
        bioEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.85);';
        bioEl.textContent = data.bio;
        headerCard.appendChild(bioEl);
      }
      content.appendChild(headerCard);

      // 微博列表
      if (data.posts && data.posts.length > 0) {
        var postSection = document.createElement('div');
        postSection.style.cssText = 'background:#fff;';

        data.posts.forEach(function(post) {
          var pCard = document.createElement('div');
          pCard.style.cssText = 'padding:14px 20px;border-bottom:0.5px solid #F0F0F0;';

          var pUser = document.createElement('div');
          pUser.style.cssText = 'font-size:14px;font-weight:600;color:#6B5340;margin-bottom:6px;';
          pUser.textContent = data.nickname || '';
          pCard.appendChild(pUser);

          var pText = document.createElement('div');
          pText.style.cssText = 'font-size:15px;color:#6B5340;line-height:1.5;margin-bottom:6px;';
          pText.textContent = post.text;
          pCard.appendChild(pText);

          var pDate = document.createElement('div');
          pDate.style.cssText = 'font-size:12px;color:#8E8E93;';
          pDate.textContent = post.date || '';
          pCard.appendChild(pDate);

          // 评论区
          if (post.comments && post.comments.length > 0) {
            var commentBox = document.createElement('div');
            commentBox.style.cssText = 'background:#F7F7F7;border-radius:8px;padding:10px 12px;margin-top:8px;';
            post.comments.forEach(function(c) {
              var cEl = document.createElement('div');
              cEl.style.cssText = 'font-size:13px;color:#6B5340;padding:2px 0;line-height:1.4;' + (c.isReply ? 'padding-left:12px;' : '');
              var cUser = document.createElement('span');
              cUser.style.cssText = 'color:#576B95;font-weight:500;';
              cUser.textContent = c.user;
              cEl.appendChild(cUser);
              if (c.isReply) {
                var cReply = document.createElement('span');
                cReply.style.cssText = 'color:#8E8E93;margin:0 4px;';
                cReply.textContent = '\u56DE\u590D';
                cEl.appendChild(cReply);
              }
              cEl.appendChild(document.createTextNode('\uFF1A' + c.text));
              commentBox.appendChild(cEl);
            });
            pCard.appendChild(commentBox);
          }

          postSection.appendChild(pCard);
        });

        content.appendChild(postSection);
      }

      // 侧边栏推荐
      var sidebarData = data.sidebar;
      if (sidebarData) {
        var sidebarList = Array.isArray(sidebarData) ? sidebarData : [sidebarData];
        sidebarList.forEach(function(item) {
          if (!item.name) return;
          var sidebarSection = document.createElement('div');
          sidebarSection.style.cssText = 'background:#fff;padding:16px 20px;margin-top:8px;border-top:0.5px solid #E5E5EA;';

          if (item.text) {
            var sidebarLabel = document.createElement('div');
            sidebarLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:10px;';
            sidebarLabel.textContent = item.text;
            sidebarSection.appendChild(sidebarLabel);
          }

          var sidebarRow = document.createElement('div');
          sidebarRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px;background:#F7F7F7;border-radius:8px;' + (item.clickable !== false ? 'cursor:pointer;' : 'opacity:0.5;');
          if (item.clickable && item.target) {
            sidebarRow.addEventListener('click', function() { Router.navigate(item.target); });
          }

          var sidebarName = document.createElement('div');
          sidebarName.style.cssText = 'font-size:15px;color:#6B5340;' + (item.bold ? 'font-weight:700;' : '');
          sidebarName.textContent = item.name;
          sidebarRow.appendChild(sidebarName);

          if (item.clickable !== false) {
            var sidebarArrow = document.createElement('div');
            sidebarArrow.style.cssText = 'color:#007AFF;font-size:18px;';
            sidebarArrow.textContent = '>';
            sidebarRow.appendChild(sidebarArrow);
          }

          sidebarSection.appendChild(sidebarRow);
          content.appendChild(sidebarSection);
        });
      }

      container.appendChild(content);
    },

    renderWeiboLocked(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader(data.nickname || page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 头部卡片
      const headerCard = document.createElement('div');
      headerCard.style.cssText = 'background:linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);padding:24px 20px;text-align:center;';

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;';
      avatar.textContent = (data.nickname || '?')[0];
      headerCard.appendChild(avatar);

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin-bottom:4px;';
      nameEl.textContent = data.nickname || '';
      headerCard.appendChild(nameEl);

      if (data.bio) {
        const bioEl = document.createElement('div');
        bioEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.7);';
        bioEl.textContent = data.bio;
        headerCard.appendChild(bioEl);
      }
      content.appendChild(headerCard);

      // 锁定提示区域
      const lockArea = document.createElement('div');
      lockArea.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;';

      const lockIcon = document.createElement('div');
      lockIcon.style.cssText = 'font-size:48px;color:#C7C7CC;margin-bottom:16px;';
      lockIcon.textContent = '\uD83D\uDD12';
      lockArea.appendChild(lockIcon);

      const lockTitle = document.createElement('div');
      lockTitle.style.cssText = 'font-size:17px;font-weight:600;color:#6B5340;margin-bottom:6px;';
      lockTitle.textContent = '\u4F60\u65E0\u6CD5\u67E5\u770B\u8FD9\u4E9B\u5FAE\u535A';
      lockArea.appendChild(lockTitle);

      const lockDesc = document.createElement('div');
      lockDesc.style.cssText = 'font-size:14px;color:#8E8E93;';
      lockDesc.textContent = '\u8BE5\u8D26\u53F7\u8BBE\u7F6E\u4E86\u9690\u79C1\u4FDD\u62A4';
      lockArea.appendChild(lockDesc);

      content.appendChild(lockArea);
      container.appendChild(content);

      // 导航栏右侧登录按钮
      const navBar = container.querySelector('.page-header');
      if (navBar && data.loginTarget) {
        const loginBtn = document.createElement('span');
        loginBtn.style.cssText = 'font-size:15px;color:#5B9BD5;font-weight:600;cursor:pointer;margin-left:auto;';
        loginBtn.textContent = '\u767B\u5F55';
        loginBtn.addEventListener('click', function() { Router.navigate(data.loginTarget); });
        // 替换右侧占位符
        var spacer = navBar.querySelector('span[style]');
        if (spacer && spacer.textContent === '') {
          navBar.replaceChild(loginBtn, spacer);
        } else {
          navBar.appendChild(loginBtn);
        }
      }
    },

    /** 渲染商品详情页 */
    renderProduct(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 商品图片区
      const imgArea = document.createElement('div');
      imgArea.style.cssText = 'width:100%;aspect-ratio:3/2;overflow:hidden;';
      const productImg = document.createElement('img');
      productImg.src = 'assets/camping-box.jpg';
      productImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      productImg.alt = '露营箱';
      imgArea.appendChild(productImg);
      content.appendChild(imgArea);

      // 商品信息区
      const infoArea = document.createElement('div');
      infoArea.style.cssText = 'padding:16px;background:#F5DEB3;';

      const titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:18px;color:#6B5340;font-weight:700;line-height:1.4;';
      titleEl.textContent = page.data.name;
      infoArea.appendChild(titleEl);

      const priceEl = document.createElement('div');
      priceEl.style.cssText = 'font-size:22px;color:#FF3B30;font-weight:700;margin-top:8px;';
      priceEl.textContent = page.data.price;
      infoArea.appendChild(priceEl);

      const salesEl = document.createElement('div');
      salesEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:4px;';
      salesEl.textContent = (page.data.sales || '') + (page.data.shipping ? ' · ' + page.data.shipping : '');
      infoArea.appendChild(salesEl);
      content.appendChild(infoArea);

      // 规格选择区
      if (page.data.specSelected) {
        const specArea = document.createElement('div');
        specArea.style.cssText = 'margin:12px 16px;background:#F2F2F7;border-radius:10px;padding:12px;font-size:14px;color:#6B5340;';
        specArea.textContent = '已选：' + page.data.specSelected;
        content.appendChild(specArea);
      }

      // 商品详情
      if (page.data.details && page.data.details.length > 0) {
        const detailTitle = document.createElement('div');
        detailTitle.style.cssText = 'padding:16px 16px 8px;font-size:16px;color:#6B5340;font-weight:700;';
        detailTitle.textContent = '商品详情';
        content.appendChild(detailTitle);

        const detailCard = document.createElement('div');
        detailCard.style.cssText = 'padding:0 16px 16px;background:#F5DEB3;';
        page.data.details.forEach(d => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;padding:8px 0;border-bottom:0.5px solid #F0F0F0;font-size:14px;';
          const label = document.createElement('span');
          label.style.cssText = 'color:#8E8E93;width:60px;flex-shrink:0;';
          label.textContent = d.label;
          const value = document.createElement('span');
          value.style.cssText = 'color:#6B5340;';
          value.textContent = d.value;
          row.appendChild(label);
          row.appendChild(value);
          detailCard.appendChild(row);
        });
        content.appendChild(detailCard);
      }

      // 买家评价
      if (page.data.reviews && page.data.reviews.length > 0) {
        const reviewTitle = document.createElement('div');
        reviewTitle.style.cssText = 'padding:16px 16px 8px;font-size:16px;color:#6B5340;font-weight:700;';
        reviewTitle.textContent = '买家评价';
        content.appendChild(reviewTitle);

        const reviewCard = document.createElement('div');
        reviewCard.style.cssText = 'padding:0 16px 16px;background:#F5DEB3;';
        page.data.reviews.forEach(r => {
          const item = document.createElement('div');
          item.style.cssText = 'padding:12px 0;border-bottom:0.5px solid #F0F0F0;';
          const userEl = document.createElement('div');
          userEl.style.cssText = 'font-size:14px;color:#6B5340;font-weight:500;';
          userEl.textContent = r.user;
          const textEl = document.createElement('div');
          textEl.style.cssText = 'font-size:14px;color:#6B5340;margin-top:4px;line-height:1.5;';
          textEl.textContent = r.text;
          const likesEl = document.createElement('div');
          likesEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:4px;';
          likesEl.textContent = r.likes || '';
          item.appendChild(userEl);
          item.appendChild(textEl);
          if (r.likes) item.appendChild(likesEl);
          reviewCard.appendChild(item);
        });
        content.appendChild(reviewCard);
      }

      // 底部按钮区
      const btnArea = document.createElement('div');
      btnArea.style.cssText = 'padding:12px 16px;background:#F5DEB3;display:flex;gap:12px;';
      const addCartBtn = document.createElement('div');
      addCartBtn.style.cssText = 'flex:1;height:44px;border-radius:20px;background:#5B9BD5;color:#FFFFFF;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;';
      addCartBtn.textContent = '加入购物车';
      const buyBtn = document.createElement('div');
      buyBtn.style.cssText = 'flex:1;height:44px;border-radius:20px;border:1px solid #5B9BD5;color:#5B9BD5;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;';
      buyBtn.textContent = '立即购买';
      btnArea.appendChild(addCartBtn);
      btnArea.appendChild(buyBtn);
      content.appendChild(btnArea);

      container.appendChild(content);
    },

    /** 渲染大众点评商家页 */
    renderShop(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 商家头部图片占位
      const imgArea = document.createElement('div');
      imgArea.style.cssText = 'width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#FFF5E6,#FFE0B2);display:flex;align-items:center;justify-content:center;';
      imgArea.innerHTML = '<span style="font-size:48px;">🍰</span>';
      content.appendChild(imgArea);

      // 商家信息卡片
      const infoCard = document.createElement('div');
      infoCard.style.cssText = 'padding:16px;background:#fff;';

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:18px;font-weight:700;color:#6B5340;';
      nameEl.textContent = page.data.subtitle || page.data.title || '';
      infoCard.appendChild(nameEl);

      const catEl = document.createElement('div');
      catEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:4px;';
      catEl.textContent = page.data.category || '';
      infoCard.appendChild(catEl);

      // 分割线
      const divider1 = document.createElement('div');
      divider1.style.cssText = 'height:0.5px;background:#E5E5EA;margin:12px 0;';
      infoCard.appendChild(divider1);

      // 营业信息
      var shopInfo = [
        { label: '营业时间', value: page.data.hours || '' },
        { label: '地址', value: page.data.address || '' },
        { label: '电话', value: page.data.phone || '' }
      ];
      shopInfo.forEach(function(info) {
        if (!info.value) return;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;padding:6px 0;font-size:14px;';
        var label = document.createElement('span');
        label.style.cssText = 'color:#8E8E93;width:70px;flex-shrink:0;';
        label.textContent = info.label;
        var value = document.createElement('span');
        value.style.cssText = 'color:#6B5340;';
        value.textContent = info.value;
        row.appendChild(label);
        row.appendChild(value);
        infoCard.appendChild(row);
      });

      content.appendChild(infoCard);

      // 推荐菜
      if (page.data.recommend) {
        var recCard = document.createElement('div');
        recCard.style.cssText = 'padding:16px;background:#fff;margin-top:8px;';

        var recTitle = document.createElement('div');
        recTitle.style.cssText = 'font-size:16px;font-weight:600;color:#6B5340;margin-bottom:10px;';
        recTitle.textContent = '推荐菜';
        recCard.appendChild(recTitle);

        var recList = document.createElement('div');
        recList.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
        var items = page.data.recommend.split('、');
        items.forEach(function(item) {
          var tag = document.createElement('span');
          tag.style.cssText = 'padding:4px 12px;background:#F2F2F7;border-radius:14px;font-size:13px;color:#3C3C43;';
          tag.textContent = item.trim();
          recList.appendChild(tag);
        });
        recCard.appendChild(recList);
        content.appendChild(recCard);
      }

      // 查看完整菜单按钮
      if (page.data.buttonText) {
        var btnArea = document.createElement('div');
        btnArea.style.cssText = 'padding:16px;background:#fff;margin-top:8px;';
        var menuBtn = document.createElement('button');
        menuBtn.className = 'form-btn';
        menuBtn.textContent = page.data.buttonText;
        menuBtn.addEventListener('click', function() {
          ShopMenuViewer.show(page.data.menuImage || 'assets/menu.png');
        });
        btnArea.appendChild(menuBtn);
        content.appendChild(btnArea);
      }

      container.appendChild(content);
    },

    /** 渲染日历页 */
    renderCalendar(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader('日历'));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const year = page.data.year || 2026;
      const month = page.data.month || 1;
      const marked = page.data.marked || {};
      const today = 13;

      const monthTitle = document.createElement('div');
      monthTitle.style.cssText = 'text-align:center;font-size:17px;font-weight:600;color:#6B5340;padding:16px 0 12px;';
      monthTitle.textContent = year + '年' + month + '月';
      content.appendChild(monthTitle);

      const weekRow = document.createElement('div');
      weekRow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);padding:0 8px;margin-bottom:4px;';
      ['日', '一', '二', '三', '四', '五', '六'].forEach(d => {
        const cell = document.createElement('div');
        cell.style.cssText = 'text-align:center;font-size:13px;color:#8E8E93;padding:4px 0;';
        cell.textContent = d;
        weekRow.appendChild(cell);
      });
      content.appendChild(weekRow);

      const firstDay = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

      // 事件详情区域（显示在日历下方）
      const eventDetail = document.createElement('div');
      eventDetail.id = 'calendar-event-detail';
      eventDetail.style.cssText = 'display:none;padding:16px 20px;border-top:0.5px solid #E5E5EA;background:#fff;min-height:80px;';

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:0 8px;';

      let selectedCell = null;

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;font-size:15px;color:#6B5340;border-radius:50%;cursor:pointer;transition:background 0.15s;';

        if (d === today) {
          cell.style.background = '#5B9BD5';
          cell.style.fontWeight = '600';
          cell.style.color = '#fff';
        }

        if (marked[d]) {
          const dot = document.createElement('span');
          dot.style.cssText = 'position:absolute;top:2px;right:2px;width:6px;height:6px;background:#FF3B30;border-radius:50%;';
          cell.appendChild(dot);
        }

        cell.addEventListener('click', () => {
          // 清除之前选中状态
          if (selectedCell && selectedCell !== cell) {
            selectedCell.style.outline = 'none';
          }
          // 选中当前日期
          selectedCell = cell;
          cell.style.outline = '2px solid #5B9BD5';
          cell.style.outlineOffset = '-2px';

          // 显示事件详情
          eventDetail.style.display = 'block';
          eventDetail.innerHTML = '';

          const dateStr = month + '月' + d + '日';
          const dateLabel = document.createElement('div');
          dateLabel.style.cssText = 'font-size:15px;font-weight:600;color:#3C3C43;margin-bottom:8px;';
          dateLabel.textContent = dateStr;
          eventDetail.appendChild(dateLabel);

          if (marked[d]) {
            const eventText = document.createElement('div');
            eventText.style.cssText = 'font-size:14px;color:#6B5340;line-height:1.5;padding:12px 16px;background:#F7F7F7;border-radius:10px;';
            eventText.textContent = marked[d];
            eventDetail.appendChild(eventText);
          } else {
            const noEvent = document.createElement('div');
            noEvent.style.cssText = 'font-size:14px;color:#8E8E93;';
            noEvent.textContent = '暂无日程';
            eventDetail.appendChild(noEvent);
          }
        });

        const num = document.createElement('span');
        num.textContent = d;
        cell.insertBefore(num, cell.firstChild);
        grid.appendChild(cell);
      }

      content.appendChild(grid);
      content.appendChild(eventDetail);
      container.appendChild(content);
    },

    /** 渲染图片网格页 */
    renderPhotoGrid(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader('相册'));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const photos = page.data.photos || [];

      // 渐变色列表，用于照片占位
      const gradients = [
        'linear-gradient(135deg,#667eea,#764ba2)',
        'linear-gradient(135deg,#f093fb,#f5576c)',
        'linear-gradient(135deg,#4facfe,#00f2fe)',
        'linear-gradient(135deg,#43e97b,#38f9d7)',
        'linear-gradient(135deg,#fa709a,#fee140)',
        'linear-gradient(135deg,#a18cd1,#fbc2eb)',
        'linear-gradient(135deg,#fccb90,#d57eeb)',
        'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
        'linear-gradient(135deg,#f5576c,#ff9a9e)'
      ];

      // 网格视图
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px;';

      photos.forEach((photo, index) => {
        const thumb = document.createElement('div');
        thumb.style.cssText = 'aspect-ratio:1;border-radius:2px;cursor:pointer;position:relative;overflow:hidden;background:' + gradients[index % gradients.length] + ';';

        if (photo.watermark) {
          const wm = document.createElement('div');
          wm.style.cssText = 'position:absolute;bottom:4px;right:4px;font-size:9px;color:rgba(255,255,255,0.6);pointer-events:none;';
          wm.textContent = photo.watermark;
          thumb.appendChild(wm);
        }

        thumb.addEventListener('click', () => {
          showLightbox(photo, index);
        });

        grid.appendChild(thumb);
      });

      content.appendChild(grid);

      // 大图模式
      function showLightbox(photo, index) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#1C1C1E;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;';

        const closeHint = document.createElement('div');
        closeHint.style.cssText = 'position:absolute;top:16px;right:16px;font-size:24px;color:rgba(255,255,255,0.7);cursor:pointer;width:36px;height:36px;display:flex;align-items:center;justify-content:center;';
        closeHint.textContent = '\u2715';
        closeHint.addEventListener('click', () => {
          document.body.removeChild(overlay);
        });
        overlay.appendChild(closeHint);

        const bigPhoto = document.createElement('div');
        bigPhoto.style.cssText = 'width:90vw;max-width:360px;aspect-ratio:1;border-radius:8px;background:' + gradients[index % gradients.length] + ';position:relative;overflow:hidden;margin-bottom:16px;';

        if (photo.watermark) {
          const wm = document.createElement('div');
          wm.style.cssText = 'position:absolute;bottom:12px;right:12px;font-size:13px;color:rgba(255,255,255,0.5);pointer-events:none;';
          wm.textContent = photo.watermark;
          bigPhoto.appendChild(wm);
        }

        overlay.appendChild(bigPhoto);

        const infoArea = document.createElement('div');
        infoArea.style.cssText = 'padding:0 20px;text-align:center;max-width:360px;';

        if (photo.desc) {
          const desc = document.createElement('div');
          desc.style.cssText = 'font-size:15px;color:#fff;margin-bottom:6px;';
          desc.textContent = photo.desc;
          infoArea.appendChild(desc);
        }

        if (photo.special) {
          const special = document.createElement('div');
          special.style.cssText = 'font-size:14px;color:#5B9BD5;margin-bottom:6px;';
          special.textContent = photo.special;
          infoArea.appendChild(special);
        }

        const metaParts = [];
        if (photo.date) metaParts.push(photo.date);
        if (photo.location) metaParts.push(photo.location);
        if (metaParts.length > 0) {
          const meta = document.createElement('div');
          meta.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.5);';
          meta.textContent = metaParts.join(' · ');
          infoArea.appendChild(meta);
        }

        overlay.appendChild(infoArea);

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            document.body.removeChild(overlay);
          }
        });

        document.body.appendChild(overlay);
      }

      container.appendChild(content);
    },

    /** 渲染桌面小组件 */
    renderWidget(page) { this.renderPlaceholder(page); },

    /** 渲染选项页 */
    renderChoice(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:40px 20px;';

      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;border-radius:20px;padding:24px;width:100%;max-width:320px;text-align:center;';

      if (page.data.title) {
        const title = document.createElement('div');
        title.style.cssText = 'font-size:17px;font-weight:600;color:#6B5340;margin-bottom:20px;';
        title.textContent = page.data.title;
        card.appendChild(title);
      }

      const options = page.data.options || [];
      const btnContainer = document.createElement('div');
      btnContainer.style.cssText = 'display:flex;flex-direction:column;gap:16px;';

      options.forEach(opt => {
        const btn = document.createElement('div');
        btn.style.cssText = 'background:#5B9BD5;color:#fff;font-size:17px;font-weight:600;text-align:center;line-height:50px;border-radius:14px;height:50px;cursor:pointer;';
        btn.textContent = opt.text || '';

        if (opt.subtext) {
          const sub = document.createElement('div');
          sub.style.cssText = 'font-size:13px;font-weight:400;opacity:0.85;margin-top:2px;';
          sub.textContent = opt.subtext;
          btn.appendChild(sub);
        }

        if (opt.target) {
          btn.addEventListener('click', () => {
            Router.navigate(opt.target, true, { prefillAccount: opt.prefillAccount });
          });
        }

        btnContainer.appendChild(btn);
      });

      card.appendChild(btnContainer);
      content.appendChild(card);
      container.appendChild(content);
    },

    /** 渲染输入验证页 */
    renderInputVerify(page) { this.renderPlaceholder(page); },

    /** 渲染动画/结局页 */
    renderAnimation(page) { this.renderPlaceholder(page); },

    /** 渲染对话框页 */
    renderDialog(page) { this.renderPlaceholder(page); },

    // ===== 新增页面类型渲染方法 =====

    /**
     * 渲染短信列表页
     * @param {Object} page - 页面数据对象
     */
    renderSms(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';
      content.style.background = '#FFFFFF';

      const items = page.data.items || [];
      items.forEach((item) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;padding:12px 16px;gap:12px;border-bottom:0.5px solid #E6E2D3;border-left:16px solid transparent;cursor:pointer;-webkit-tap-highlight-color:transparent;min-height:60px;';

        // 左侧圆形头像占位
        const avatar = document.createElement('div');
        avatar.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#E6E2D3;display:flex;align-items:center;justify-content:center;font-size:16px;color:#8E8E93;flex-shrink:0;';
        avatar.textContent = '💬';

        // 右侧文字区
        const textArea = document.createElement('div');
        textArea.style.cssText = 'flex:1;min-width:0;';

        // 第一行：发件人 + 时间
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;';

        const senderEl = document.createElement('div');
        senderEl.style.cssText = 'font-size:17px;color:#6B5340;font-weight:400;';
        // bold数组中的关键词同时加粗发件人名称
        if (item.bold && item.bold.includes(item.sender)) {
          senderEl.style.fontWeight = '700';
        }
        senderEl.textContent = item.sender;

        const dateEl = document.createElement('div');
        dateEl.style.cssText = 'font-size:11px;color:#8E8E93;flex-shrink:0;margin-left:8px;';
        dateEl.textContent = item.date;

        topRow.appendChild(senderEl);
        topRow.appendChild(dateEl);

        // 第二行：预览（最多两行）
        const previewEl = document.createElement('div');
        previewEl.style.cssText = 'font-size:13px;color:#8E8E93;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';

        if (item.bold && item.preview) {
          let html = item.preview;
          item.bold.forEach(b => { html = html.split(b).join('<b>' + b + '</b>'); });
          previewEl.innerHTML = html;
        } else {
          previewEl.textContent = item.preview || '';
        }

        textArea.appendChild(topRow);
        textArea.appendChild(previewEl);

        row.appendChild(avatar);
        row.appendChild(textArea);

        // 点击进入详情
        row.addEventListener('click', () => {
          Router._navStack.push('02');
          Router.currentPage = '02_detail';
          this._renderSmsDetail(page, item);
        });

        // 点击反馈
        row.addEventListener('touchstart', () => { row.style.backgroundColor = '#ECECEC'; });
        row.addEventListener('touchend', () => { row.style.backgroundColor = ''; });

        content.appendChild(row);
      });

      container.appendChild(content);
    },

    /** 短信详情页 */
    _renderSmsDetail(page, item) {
      const container = document.getElementById('page-container');
      container.innerHTML = '';
      container.appendChild(this.createHeader(item.sender));

      const chatArea = document.createElement('div');
      chatArea.style.cssText = 'flex:1;overflow-y:auto;background:#fff;padding:16px;';

      // 对方气泡
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;margin-bottom:8px;';

      const bubble = document.createElement('div');
      bubble.style.cssText = 'max-width:75%;padding:10px 14px;border-radius:18px;font-size:16px;line-height:1.5;word-break:break-word;background:#E9E9EB;color:#6B5340;border-bottom-left-radius:4px;';

      if (item.bold && item.fullText) {
        let html = item.fullText;
        item.bold.forEach(b => { html = html.split(b).join('<b>' + b + '</b>'); });
        bubble.innerHTML = html;
      } else {
        bubble.textContent = item.fullText || item.preview || '';
      }

      wrapper.appendChild(bubble);
      chatArea.appendChild(wrapper);

      // 完整时间
      const timeEl = document.createElement('div');
      timeEl.style.cssText = 'text-align:left;font-size:13px;color:#8E8E93;margin-top:4px;padding-left:4px;';
      timeEl.textContent = item.fullTime || item.date;
      chatArea.appendChild(timeEl);

      container.appendChild(chatArea);
      chatArea.scrollTop = chatArea.scrollHeight;

      // 页面编号
      const smsBadge = document.createElement('div');
      smsBadge.textContent = page.id;
      smsBadge.style.cssText = 'position:absolute;bottom:8px;right:12px;font-size:11px;color:rgba(0,0,0,0.25);font-weight:500;pointer-events:none;z-index:10;';
      container.appendChild(smsBadge);
    },

    /**
     * 渲染通话记录页
     * @param {Object} page - 页面数据对象
     */
    renderCallLog(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';
      content.style.background = '#FFFFFF';

      const records = page.data.records || [];
      records.forEach((rec) => {
        const isMissed = rec.missed === true;

        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;padding:0 16px;height:60px;border-bottom:0.5px solid #E6E2D3;border-left:16px solid transparent;';

        // 左侧：联系人姓名
        const nameEl = document.createElement('div');
        nameEl.style.cssText = `font-size:17px;color:${isMissed ? '#FF3B30' : '#1C1C1E'};font-weight:${isMissed ? '600' : '400'};flex-shrink:0;`;
        nameEl.textContent = rec.name || '叶禾';

        // 右侧：日期+通话类型
        const rightArea = document.createElement('div');
        rightArea.style.cssText = 'flex:1;text-align:right;margin-left:12px;min-width:0;';

        const dateEl = document.createElement('div');
        dateEl.style.cssText = `font-size:13px;color:${isMissed ? '#FF3B30' : '#8E8E93'};`;
        dateEl.textContent = rec.date;

        const detailEl = document.createElement('div');
        detailEl.style.cssText = `font-size:12px;color:${isMissed ? '#FF3B30' : '#8E8E93'};margin-top:1px;`;
        detailEl.textContent = rec.detail;

        rightArea.appendChild(dateEl);
        rightArea.appendChild(detailEl);

        row.appendChild(nameEl);
        row.appendChild(rightArea);
        content.appendChild(row);
      });

      container.appendChild(content);
    },

    /**
     * 渲染电话页（联系人+通话记录标签切换）
     * @param {Object} page - 页面数据对象
     */
    renderPhone(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      // 标签栏
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'tabs';

      const tabNames = page.data.tabs || ['联系人', '通话记录'];
      const contentArea = document.createElement('div');
      contentArea.className = 'page-content';
      contentArea.style.padding = '0';
      contentArea.style.background = '#FFFFFF';

      tabNames.forEach((tabName, index) => {
        const tab = document.createElement('button');
        tab.className = 'tab' + (index === 0 ? ' active' : '');
        tab.textContent = tabName;
        tab.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          renderTabContent(tabName);
        });
        tabsContainer.appendChild(tab);
      });

      container.appendChild(tabsContainer);

      function renderTabContent(tabName) {
        contentArea.innerHTML = '';

        if (tabName === '联系人') {
          // 本机信息卡片
          if (page.data.ownNumber) {
            const ownCard = document.createElement('div');
            ownCard.style.cssText = 'margin:12px 16px;padding:16px;background:#F2F2F7;border-radius:12px;';
            const ownName = document.createElement('div');
            ownName.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:4px;';
            ownName.textContent = '本机';
            const ownNumber = document.createElement('div');
            ownNumber.style.cssText = 'font-size:17px;color:#6B5340;font-weight:600;';
            ownNumber.textContent = page.data.ownNumber;
            const ownLabel = document.createElement('div');
            ownLabel.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:2px;';
            ownLabel.textContent = '林晓';
            ownCard.appendChild(ownName);
            ownCard.appendChild(ownNumber);
            ownCard.appendChild(ownLabel);
            contentArea.appendChild(ownCard);
          }

          // 联系人列表
          const contacts = page.data.contacts || [];
          contacts.forEach(contact => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;padding:0 16px;height:60px;border-bottom:0.5px solid #E6E2D3;border-left:16px solid transparent;';

            const avatar = document.createElement('div');
            avatar.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#E6E2D3;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;margin-right:12px;';
            avatar.textContent = '📞';

            const info = document.createElement('div');
            info.style.flex = '1';

            const name = document.createElement('div');
            name.style.cssText = 'font-size:17px;color:#6B5340;font-weight:400;';
            name.textContent = contact.name;

            const phone = document.createElement('div');
            phone.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:2px;';
            phone.textContent = contact.phone;

            info.appendChild(name);
            info.appendChild(phone);
            row.appendChild(avatar);
            row.appendChild(info);
            contentArea.appendChild(row);
          });
        } else if (tabName === '通话记录') {
          const history = page.data.callHistory || [];
          history.forEach(record => {
            const isMissed = record.missed === true;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;padding:0 16px;height:60px;border-bottom:0.5px solid #E6E2D3;border-left:16px solid transparent;';

            const nameEl = document.createElement('div');
            nameEl.style.cssText = `font-size:17px;color:${isMissed ? '#FF3B30' : '#1C1C1E'};font-weight:${isMissed ? '600' : '400'};flex-shrink:0;`;
            nameEl.textContent = record.name;

            const rightArea = document.createElement('div');
            rightArea.style.cssText = 'flex:1;text-align:right;margin-left:12px;min-width:0;';

            const dateEl = document.createElement('div');
            dateEl.style.cssText = `font-size:13px;color:${isMissed ? '#FF3B30' : '#8E8E93'};`;
            dateEl.textContent = record.date;

            const detailEl = document.createElement('div');
            detailEl.style.cssText = `font-size:12px;color:${isMissed ? '#FF3B30' : '#8E8E93'};margin-top:1px;`;
            detailEl.textContent = record.detail;

            rightArea.appendChild(dateEl);
            rightArea.appendChild(detailEl);

            row.appendChild(nameEl);
            row.appendChild(rightArea);
            contentArea.appendChild(row);
          });
        }
      }

      container.appendChild(contentArea);
      renderTabContent(tabNames[0]);
    },

    /**
     * 渲染淘宝订单列表页
     * @param {Object} page - 页面数据对象
     */
    renderOrderList(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'padding:0;background:#F4F4F4;';

      const groups = page.data.groups || [];
      groups.forEach(group => {
        // 月份标题
        const monthTitle = document.createElement('div');
        monthTitle.style.cssText = 'font-size:13px;color:#8E8E93;padding:12px 16px 6px;background:#F4F4F4;';
        monthTitle.textContent = group.month;
        content.appendChild(monthTitle);

        // 订单列表（白色卡片）
        const items = group.items || [];
        items.forEach(item => {
          const card = document.createElement('div');
          card.style.cssText = 'background:#F5DEB3;margin:0 12px 8px;border-radius:10px;padding:12px;';

          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:10px;';

          // 商品缩略图占位
          const thumb = document.createElement('div');
          thumb.style.cssText = 'width:60px;height:60px;background:#F2F2F7;border-radius:6px;flex-shrink:0;';
          row.appendChild(thumb);

          // 商品信息
          const info = document.createElement('div');
          info.style.cssText = 'flex:1;min-width:0;';

          const nameEl = document.createElement('div');
          nameEl.style.cssText = 'font-size:14px;color:#6B5340;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;' + (item.bold ? 'font-weight:600;' : '');
          nameEl.textContent = item.name;

          const metaRow = document.createElement('div');
          metaRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:6px;';

          const priceEl = document.createElement('span');
          priceEl.style.cssText = 'font-size:15px;color:#FF3B30;font-weight:600;';
          priceEl.textContent = item.price;

          const statusEl = document.createElement('span');
          statusEl.style.cssText = 'font-size:11px;color:#8E8E93;';
          statusEl.textContent = item.status || '交易成功';

          metaRow.appendChild(priceEl);
          metaRow.appendChild(statusEl);

          const dateEl = document.createElement('div');
          dateEl.style.cssText = 'font-size:11px;color:#C7C7CC;margin-top:4px;';
          dateEl.textContent = item.date;

          info.appendChild(nameEl);
          info.appendChild(metaRow);
          info.appendChild(dateEl);
          row.appendChild(info);
          card.appendChild(row);
          content.appendChild(card);
        });
      });

      container.appendChild(content);
    },

    /**
     * 渲染微博小号页（公开+私密微博）
     * @param {Object} page - 页面数据对象
     */
    renderWeiboPrivate(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader(data.nickname || page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 头部卡片
      const headerCard = document.createElement('div');
      headerCard.style.cssText = 'background:linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);padding:24px 20px;text-align:center;';

      const avatar = document.createElement('div');
      avatar.style.cssText = 'width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.3);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;';
      avatar.textContent = (data.nickname || '?')[0];
      headerCard.appendChild(avatar);

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:18px;font-weight:700;color:#fff;margin-bottom:4px;';
      nameEl.textContent = data.nickname || '';
      headerCard.appendChild(nameEl);

      if (data.bio) {
        const bioEl = document.createElement('div');
        bioEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.85);';
        bioEl.textContent = data.bio;
        headerCard.appendChild(bioEl);
      }
      content.appendChild(headerCard);

      // 微博列表
      const items = data.posts || [];
      items.forEach(function(item) {
        const post = document.createElement('div');
        post.style.cssText = 'background:#fff;padding:14px 20px;border-bottom:0.5px solid #F0F0F0;';

        const dateEl = document.createElement('div');
        dateEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-bottom:6px;';
        dateEl.textContent = item.date || '';
        post.appendChild(dateEl);

        const textEl = document.createElement('div');
        textEl.style.cssText = 'font-size:15px;color:#6B5340;line-height:1.5;';
        textEl.textContent = item.text || '';
        post.appendChild(textEl);

        if (item.isPrivate) {
          const lockIcon = document.createElement('div');
          lockIcon.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:6px;';
          lockIcon.textContent = '\uD83D\uDD12 \u4EC5\u81EA\u5DF1\u53EF\u89C1';
          post.appendChild(lockIcon);
        }

        content.appendChild(post);
      });

      container.appendChild(content);
    },

    /**
     * 渲染视频历史页
     * @param {Object} page - 页面数据对象
     */
    renderVideoHistory(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      const items = page.data.items || [];
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-item';
        row.style.flexDirection = 'column';
        row.style.alignItems = 'flex-start';
        row.style.borderBottom = '0.5px solid #E6E2D3';

        if (item.clickable) {
          row.style.cursor = 'pointer';
        }

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;';

        const titleEl = document.createElement('div');
        const isBold = item.clickable && item.bold;
        titleEl.style.cssText = `font-size:15px;color:#6B5340;${isBold ? 'font-weight:600;' : ''}`;
        titleEl.textContent = item.title;

        topRow.appendChild(titleEl);

        // 可点击项显示蓝色箭头
        if (item.clickable) {
          const arrow = document.createElement('span');
          arrow.style.cssText = 'font-size:16px;color:#007AFF;';
          arrow.textContent = '>';
          topRow.appendChild(arrow);
        }

        row.appendChild(topRow);

        const progressEl = document.createElement('div');
        progressEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:4px;';
        progressEl.textContent = item.progress || '';
        row.appendChild(progressEl);

        const dateEl = document.createElement('div');
        dateEl.style.cssText = 'font-size:12px;color:#AEAEB2;margin-top:2px;';
        dateEl.textContent = item.date || '';
        row.appendChild(dateEl);

        // 可点击项绑定跳转
        if (item.clickable && item.target) {
          row.addEventListener('click', () => {
            Router.navigate(item.target);
          });
        }

        content.appendChild(row);
      });

      container.appendChild(content);
    },

    /**
     * 渲染论坛主页
     * @param {Object} page - 页面数据对象
     */
    renderForum(page) {
      const container = document.getElementById('page-container');

      // 自定义导航栏：标题居中，左侧返回，右侧登录
      const header = document.createElement('header');
      header.className = 'page-header';

      const backBtn = document.createElement('span');
      backBtn.className = 'back-btn';
      backBtn.textContent = '\u2039 返回';
      backBtn.addEventListener('click', () => Router.back());
      header.appendChild(backBtn);

      const titleEl = document.createElement('span');
      titleEl.className = 'title';
      titleEl.textContent = page.title;
      header.appendChild(titleEl);

      // 右侧登录按钮
      const loginBtn = document.createElement('span');
      loginBtn.style.cssText = 'font-size:15px;color:#5B9BD5;cursor:pointer;font-weight:500;min-width:40px;text-align:right;';
      loginBtn.textContent = '登录';
      if (page.data.loginTarget) {
        loginBtn.addEventListener('click', () => Router.navigate(page.data.loginTarget));
      }
      header.appendChild(loginBtn);

      container.appendChild(header);

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 版块导航标签栏（水平滚动）
      const boards = page.data.boards || [];
      const tabBar = document.createElement('div');
      tabBar.style.cssText = 'display:flex;gap:0;overflow-x:auto;-webkit-overflow-scrolling:touch;background:#fff;border-bottom:0.5px solid #E6E2D3;flex-shrink:0;';
      boards.forEach((board, idx) => {
        const tab = document.createElement('div');
        tab.style.cssText = 'flex-shrink:0;padding:10px 16px;font-size:13px;color:#8E8E93;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;transition:color 0.2s;';
        tab.textContent = board.name + ' ' + board.count;
        tab.addEventListener('click', () => {
          // 滚动到对应版块
          const target = document.getElementById('board-' + idx);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        tabBar.appendChild(tab);
      });
      content.appendChild(tabBar);

      // 置顶帖
      const pinnedPosts = page.data.pinnedPosts || [];
      if (pinnedPosts.length > 0) {
        const pinSection = document.createElement('div');
        pinSection.style.cssText = 'padding:12px 16px 8px;background:#F9F9F9;';
        const pinTitle = document.createElement('div');
        pinTitle.style.cssText = 'font-size:12px;color:#8E8E93;font-weight:600;margin-bottom:6px;';
        pinTitle.textContent = '置顶帖';
        pinSection.appendChild(pinTitle);
        pinnedPosts.forEach(post => {
          const row = document.createElement('div');
          row.style.cssText = 'font-size:13px;color:#8E8E93;padding:4px 0;';
          row.textContent = '\u00B7 ' + post.title;
          pinSection.appendChild(row);
        });
        content.appendChild(pinSection);
      }

      // 各版块帖子列表
      boards.forEach((board, boardIdx) => {
        const section = document.createElement('div');
        section.id = 'board-' + boardIdx;
        section.style.cssText = 'padding:0 0 8px;';

        // 版块标题
        const boardHeader = document.createElement('div');
        boardHeader.style.cssText = 'padding:12px 16px 6px;font-size:13px;color:#8E8E93;font-weight:600;background:#FAFAFA;';
        boardHeader.textContent = board.name + '版块最新帖子：';
        section.appendChild(boardHeader);

        const posts = board.posts || [];
        posts.forEach(post => {
          const row = document.createElement('div');
          row.style.cssText = 'padding:10px 16px;border-bottom:0.5px solid #F0F0F0;background:#fff;';

          // 帖子标题
          const titleRow = document.createElement('div');
          titleRow.style.cssText = 'display:flex;align-items:center;gap:6px;';

          const dot = document.createElement('span');
          dot.textContent = '\u00B7';
          dot.style.cssText = 'font-size:16px;color:#6B5340;flex-shrink:0;';
          titleRow.appendChild(dot);

          const titleText = document.createElement('span');
          titleText.style.cssText = 'font-size:15px;color:#6B5340;flex:1;';
          titleText.textContent = post.title;
          titleRow.appendChild(titleText);

          // 标题点击
          if (post.clickable && post.target) {
            titleText.style.color = '#007AFF';
            titleText.style.cursor = 'pointer';
            titleText.addEventListener('click', () => Router.navigate(post.target));
          } else if (post.clickable && post.clickAction === 'locked') {
            titleText.style.color = '#007AFF';
            titleText.style.cursor = 'pointer';
            titleText.addEventListener('click', () => {
              Modal.show('提示', post.clickMessage, [{ text: '确定', onClick: () => {} }]);
            });
          }

          row.appendChild(titleRow);

          // 昵称/时间行
          if (post.meta) {
            const metaEl = document.createElement('div');
            metaEl.style.cssText = 'font-size:12px;color:#8E8E93;margin-top:4px;margin-left:16px;';
            if (post.clickNickname && post.clickNicknameTarget) {
              // 分割 meta，昵称高亮
              const nickname = post.clickNickname;
              const metaStr = post.meta;
              const idx = metaStr.indexOf(nickname);
              if (idx >= 0) {
                if (idx > 0) metaEl.appendChild(document.createTextNode(metaStr.substring(0, idx)));
                const nickSpan = document.createElement('span');
                nickSpan.textContent = nickname;
                nickSpan.style.cssText = 'color:#5B9BD5;cursor:pointer;font-weight:500;';
                nickSpan.addEventListener('click', () => Router.navigate(post.clickNicknameTarget, true, { prefillAccount: post.clickNickname }));
                metaEl.appendChild(nickSpan);
                const rest = metaStr.substring(idx + nickname.length);
                if (rest) metaEl.appendChild(document.createTextNode(rest));
              } else {
                metaEl.textContent = metaStr;
              }
            } else {
              metaEl.textContent = post.meta;
            }
            row.appendChild(metaEl);
          }

          section.appendChild(row);
        });

        content.appendChild(section);
      });

      container.appendChild(content);
    },

    /**
     * 渲染论坛通用登录页（页面29）
     * 支持 localStorage 账号保存与切换
     */
    renderForumLogin(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const data = page.data || {};
      const storageKey = data.storageKey || 'forum_saved_accounts';
      const accountsConfig = data.accounts || {};
      const navParams = window.gameData.state._navParams || {};
      const prefillAccount = navParams.prefillAccount || '';

      // 忘记密码提示映射
      const forgotHints = {
        '\u94F6\u9B03\u732B\u7684\u6700\u7231': '\u6807\u51C6\u683C\u5F0F',
        '\u8292\u72D7\u5192\u9669\u5BB6': '\u9F99\u7684\u540D\u5B57\uFF08\u82F1\u6587\uFF09'
      };

      // 读取已保存账号
      let savedAccounts = [];
      try {
        savedAccounts = JSON.parse(localStorage.getItem(storageKey)) || [];
      } catch(e) { savedAccounts = []; }

      // 确定当前选中账号
      let currentAccount = '';
      let currentPassword = '';
      if (prefillAccount) {
        // 有预填账号：直接使用，并查找已保存的密码
        currentAccount = prefillAccount;
        const found = savedAccounts.find(a => a.username === prefillAccount);
        if (found) {
          currentPassword = found.password;
        }
      } else if (savedAccounts.length > 0) {
        savedAccounts.sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));
        currentAccount = savedAccounts[0].username;
        currentPassword = savedAccounts[0].password;
      }

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;';

      const card = document.createElement('div');
      card.id = 'forum-login-card';
      card.style.cssText = 'background:#fff;border-radius:20px;padding:24px;width:100%;max-width:320px;transition:transform 0.3s,opacity 0.3s;';

      // 标题
      const titleLabel = document.createElement('div');
      titleLabel.style.cssText = 'text-align:center;font-size:20px;font-weight:700;color:#6B5340;margin-bottom:24px;';
      titleLabel.textContent = data.title || '\u767B\u5F55';
      card.appendChild(titleLabel);

      // 当前账号显示
      const accountRow = document.createElement('div');
      accountRow.style.marginBottom = '16px';
      accountRow.id = 'forum-login-account-row';
      if (!currentAccount) accountRow.style.display = 'none';

      const accountLabel = document.createElement('label');
      accountLabel.style.cssText = 'font-size:13px;color:#8E8E93;display:block;margin-bottom:6px;';
      accountLabel.textContent = '\u5F53\u524D\u8D26\u53F7';
      accountRow.appendChild(accountLabel);

      const accountDisplay = document.createElement('div');
      accountDisplay.id = 'forum-login-account-display';
      accountDisplay.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#F2F2F7;border-radius:10px;font-size:15px;color:#6B5340;';
      if (currentAccount) {
        accountDisplay.textContent = currentAccount;
        if (savedAccounts.length > 1) {
          const arrow = document.createElement('span');
          arrow.style.cssText = 'color:#8E8E93;font-size:18px;cursor:pointer;';
          arrow.textContent = '\u25BE';
          accountDisplay.appendChild(arrow);
          accountDisplay.style.cursor = 'pointer';
          accountDisplay.addEventListener('click', function() { showAccountSwitcher(); });
        }
      }
      accountRow.appendChild(accountDisplay);
      card.appendChild(accountRow);

      // 用户名输入框
      const usernameGroup = document.createElement('div');
      usernameGroup.style.marginBottom = '16px';
      usernameGroup.id = 'forum-login-username-group';
      if (currentAccount) usernameGroup.style.display = 'none';

      const usernameLabel = document.createElement('label');
      usernameLabel.style.cssText = 'font-size:13px;color:#8E8E93;display:block;margin-bottom:6px;';
      usernameLabel.textContent = '\u7528\u6237\u540D';
      usernameGroup.appendChild(usernameLabel);

      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.className = 'form-input';
      usernameInput.placeholder = '\u8BF7\u8F93\u5165\u7528\u6237\u540D';
      usernameInput.id = 'forum-login-username';
      if (prefillAccount && !currentAccount) usernameInput.value = prefillAccount;
      usernameGroup.appendChild(usernameInput);
      card.appendChild(usernameGroup);

      // 密码输入框
      const passwordGroup = document.createElement('div');
      passwordGroup.style.marginBottom = '24px';

      const passwordLabel = document.createElement('label');
      passwordLabel.style.cssText = 'font-size:13px;color:#8E8E93;display:block;margin-bottom:6px;';
      passwordLabel.textContent = '\u5BC6\u7801';
      passwordGroup.appendChild(passwordLabel);

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.className = 'form-input';
      passwordInput.placeholder = data.defaultPlaceholder || '\u8BF7\u8F93\u5165\u5BC6\u7801';
      passwordInput.id = 'forum-login-password';
      if (currentPassword) passwordInput.value = currentPassword;
      passwordGroup.appendChild(passwordInput);
      card.appendChild(passwordGroup);

      // 登录按钮
      const loginBtn = document.createElement('button');
      loginBtn.className = 'form-btn';
      loginBtn.textContent = '\u767B\u5F55';
      loginBtn.style.marginBottom = '16px';
      loginBtn.style.transition = 'transform 0.1s,filter 0.1s';
      loginBtn.addEventListener('click', function() {
        loginBtn.style.transform = 'scale(0.97)';
        loginBtn.style.filter = 'brightness(0.9)';
        setTimeout(function() {
          loginBtn.style.transform = '';
          loginBtn.style.filter = '';
        }, 100);

        var username = currentAccount || usernameInput.value.trim();
        var password = passwordInput.value.trim();
        if (!username || !password) { Toast.show('\u8BF7\u8F93\u5165\u7528\u6237\u540D\u548C\u5BC6\u7801'); return; }

        var accountConfig = accountsConfig[username];
        if (!accountConfig) { Toast.show('\u8D26\u53F7\u4E0D\u5B58\u5728'); return; }

        if (PasswordValidator.validate(accountConfig.passwordKey, password)) {
          saveAccount(username, password);
          card.style.transform = 'translateY(-20px)';
          card.style.opacity = '0';
          setTimeout(function() { Router.navigate(accountConfig.successTarget); }, 300);
        } else {
          passwordInput.style.borderColor = '#FF3B30';
          passwordInput.style.animation = 'shake 0.4s ease';
          setTimeout(function() {
            passwordInput.style.borderColor = '';
            passwordInput.style.animation = '';
          }, 500);
          Toast.show('\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF');
        }
      });
      card.appendChild(loginBtn);

      // 忘记密码
      var forgotLink = document.createElement('div');
      forgotLink.style.cssText = 'text-align:center;font-size:14px;color:#007AFF;cursor:pointer;padding:8px 0;text-decoration:underline;';
      forgotLink.textContent = '\u5FD8\u8BB0\u5BC6\u7801\uFF1F';
      forgotLink.addEventListener('click', function() {
        var username = currentAccount || usernameInput.value.trim();
        var hintMsg = '';
        if (!username) {
          hintMsg = '\u8BF7\u5148\u8F93\u5165\u8D26\u53F7';
        } else if (forgotHints[username]) {
          hintMsg = forgotHints[username];
        } else {
          hintMsg = '\u6682\u65E0\u8BE5\u8D26\u53F7\u7684\u5BC6\u7801\u63D0\u793A';
        }
        showPasswordHint(hintMsg);
      });
      card.appendChild(forgotLink);

      content.appendChild(card);
      container.appendChild(content);

      // ---- 辅助函数 ----

      function saveAccount(username, password) {
        var list = [];
        try { list = JSON.parse(localStorage.getItem(storageKey)) || []; } catch(e) {}
        var idx = list.findIndex(function(a) { return a.username === username; });
        var entry = { username: username, password: password, lastLogin: Date.now() };
        if (idx >= 0) { list[idx] = entry; } else { list.push(entry); }
        localStorage.setItem(storageKey, JSON.stringify(list));
      }

      function showAccountSwitcher() {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';

        var modal = document.createElement('div');
        modal.style.cssText = 'background:#fff;border-radius:20px;padding:20px;width:280px;max-width:85vw;animation:scaleIn 0.2s ease-out;';

        var modalTitle = document.createElement('div');
        modalTitle.style.cssText = 'text-align:center;font-size:17px;font-weight:600;color:#6B5340;margin-bottom:16px;';
        modalTitle.textContent = '\u9009\u62E9\u8981\u767B\u5F55\u7684\u8D26\u53F7';
        modal.appendChild(modalTitle);

        savedAccounts.forEach(function(account) {
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;padding:12px 8px;cursor:pointer;border-radius:8px;';

          var isSelected = account.username === currentAccount;
          var dot = document.createElement('span');
          dot.style.cssText = 'width:20px;height:20px;border-radius:50%;border:2px solid ' +
            (isSelected ? '#5B9BD5' : '#8E8E93') + ';margin-right:12px;flex-shrink:0;' +
            (isSelected ? 'background:#5B9BD5;' : '');
          row.appendChild(dot);

          var name = document.createElement('span');
          name.style.cssText = 'font-size:16px;color:#6B5340;';
          name.textContent = account.username;
          row.appendChild(name);

          row.addEventListener('click', function() {
            if (!isSelected) switchToAccount(account.username, account.password);
            overlay.remove();
          });

          modal.appendChild(row);
        });

        var otherRow = document.createElement('div');
        otherRow.style.cssText = 'display:flex;align-items:center;padding:12px 8px;cursor:pointer;border-radius:8px;border-top:0.5px solid #E5E5EA;margin-top:4px;';
        var plusSign = document.createElement('span');
        plusSign.style.cssText = 'width:20px;text-align:center;margin-right:12px;color:#8E8E93;font-size:16px;';
        plusSign.textContent = '+';
        otherRow.appendChild(plusSign);
        var otherText = document.createElement('span');
        otherText.style.cssText = 'font-size:14px;color:#8E8E93;';
        otherText.textContent = '\u767B\u5F55\u5176\u4ED6\u8D26\u53F7';
        otherRow.appendChild(otherText);
        otherRow.addEventListener('click', function() {
          switchToAccount('', '');
          overlay.remove();
        });
        modal.appendChild(otherRow);

        var cancelBtn = document.createElement('div');
        cancelBtn.style.cssText = 'text-align:center;font-size:14px;color:#8E8E93;padding:12px 0 4px;cursor:pointer;';
        cancelBtn.textContent = '\u53D6\u6D88';
        cancelBtn.addEventListener('click', function() { overlay.remove(); });
        modal.appendChild(cancelBtn);

        overlay.appendChild(modal);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
      }

      function switchToAccount(username, password) {
        currentAccount = username;
        currentPassword = password;
        passwordInput.value = password;
        usernameInput.value = username;

        if (username) {
          accountRow.style.display = 'block';
          accountDisplay.textContent = username;
          // 移除旧的箭头
          while (accountDisplay.lastChild && accountDisplay.lastChild !== accountDisplay.firstChild) {
            accountDisplay.removeChild(accountDisplay.lastChild);
          }
          if (savedAccounts.length > 1) {
            var arrow = document.createElement('span');
            arrow.style.cssText = 'color:#8E8E93;font-size:18px;cursor:pointer;';
            arrow.textContent = '\u25BE';
            accountDisplay.appendChild(arrow);
            accountDisplay.style.cursor = 'pointer';
            accountDisplay.onclick = function() { showAccountSwitcher(); };
          }
          usernameGroup.style.display = 'none';
        } else {
          accountRow.style.display = 'none';
          usernameGroup.style.display = 'block';
          usernameInput.value = '';
          passwordInput.value = '';
        }
      }
    },

    /**
     * 渲染单选列表页
     * @param {Object} page - 页面数据对象
     */
    renderChoiceList(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '12px 16px 40px';

      const allItems = page.data.items || page.data.options || page.data.allOptions || [];

      // 搜索框（可编辑，实时匹配）
      const searchBox = document.createElement('div');
      searchBox.style.cssText = 'display:flex;align-items:center;background:#F2F2F7;border-radius:10px;padding:10px 14px;margin-bottom:16px;';
      const searchIcon = document.createElement('span');
      searchIcon.style.cssText = 'font-size:14px;color:#8E8E93;margin-right:8px;';
      searchIcon.textContent = '🔍';
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.style.cssText = 'flex:1;border:none;background:transparent;font-size:15px;color:#3C3C43;outline:none;';
      searchInput.placeholder = page.data.searchPlaceholder || page.data.query || '搜索';
      if (page.data.query) {
        searchInput.value = page.data.query;
        searchInput.readOnly = true;
        searchInput.style.color = '#8E8E93';
      }
      searchBox.appendChild(searchIcon);
      searchBox.appendChild(searchInput);
      content.appendChild(searchBox);

      // 选项列表容器
      const optionsContainer = document.createElement('div');
      optionsContainer.style.marginBottom = '16px';
      content.appendChild(optionsContainer);

      // 无匹配提示
      const noMatchMsg = document.createElement('div');
      noMatchMsg.style.cssText = 'text-align:center;font-size:14px;color:#8E8E93;padding:24px 0;display:none;';
      noMatchMsg.textContent = page.data.noMatchMessage || '未找到匹配结果';
      content.appendChild(noMatchMsg);

      // 确认按钮
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'form-btn';
      confirmBtn.textContent = page.data.confirmText || '确认';
      content.appendChild(confirmBtn);

      let selectedIndex = -1;
      let matchedItems = [];

      // 渲染匹配结果
      function renderResults(items) {
        matchedItems = items;
        selectedIndex = -1;
        optionsContainer.innerHTML = '';

        if (items.length === 0) {
          noMatchMsg.style.display = 'block';
          return;
        }
        noMatchMsg.style.display = 'none';

        items.forEach((item, index) => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;padding:14px 16px;background:#fff;border-bottom:0.5px solid #E5E5EA;cursor:pointer;';
          row.addEventListener('click', () => {
            selectedIndex = index;
            updateSelection();
          });
          row.addEventListener('touchstart', () => { row.style.backgroundColor = '#F5F5F5'; });
          row.addEventListener('touchend', () => { row.style.backgroundColor = ''; });

          const radio = document.createElement('div');
          radio.style.cssText = 'width:22px;height:22px;border-radius:50%;border:2px solid #C7C7CC;margin-right:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;';

          const label = document.createElement('span');
          label.style.cssText = 'font-size:15px;color:#6B5340;';
          label.textContent = item.text || '';

          row.appendChild(radio);
          row.appendChild(label);
          optionsContainer.appendChild(row);
        });
      }

      function updateSelection() {
        const rows = optionsContainer.children;
        for (let i = 0; i < rows.length; i++) {
          const radio = rows[i].firstChild;
          if (i === selectedIndex) {
            radio.style.cssText = 'width:22px;height:22px;border-radius:50%;border:2px solid #5B9BD5;background:#5B9BD5;margin-right:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;';
            radio.innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>';
          } else {
            radio.style.cssText = 'width:22px;height:22px;border-radius:50%;border:2px solid #C7C7CC;margin-right:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;';
            radio.innerHTML = '';
          }
        }
      }

      // 搜索匹配逻辑
      function doSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) {
          renderResults([]);
          return;
        }
        const filtered = allItems.filter(item => item.text.toLowerCase().includes(keyword));
        renderResults(filtered);
      }

      // 实时搜索（非只读时）
      if (!searchInput.readOnly) {
        searchInput.addEventListener('input', () => {
          doSearch();
          // 实时保存搜索关键词
          const savedKey = 'saved_search_' + page.id;
          window.gameData.state[savedKey] = searchInput.value.trim();
          StateSaver.save();
        });
      }

      // 确认按钮
      confirmBtn.addEventListener('click', () => {
        if (selectedIndex < 0) {
          Toast.show('请先选择一个地址');
          return;
        }
        // 保存搜索关键词
        const savedKey = 'saved_search_' + page.id;
        window.gameData.state[savedKey] = searchInput.value.trim();
        StateSaver.save();

        const selectedItem = matchedItems[selectedIndex];
        const target = page.data.correctTarget;
        if (target) {
          // 传入柜机是否正确的标记
          Router.navigate(target, true, { correctAddress: !!selectedItem.correct });
        }
      });

      // 初始渲染
      if (searchInput.readOnly && searchInput.value) {
        doSearch();
      } else {
        // 恢复之前保存的搜索关键词
        const savedKey = 'saved_search_' + page.id;
        const savedSearch = window.gameData.state[savedKey];
        if (savedSearch) {
          searchInput.value = savedSearch;
          doSearch();
        }
      }

      container.appendChild(content);
    },

    /**
     * 渲染6格输入码页
     * @param {Object} page - 页面数据对象
     */
    renderInputCode(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - 120px);';

      // 柜机地址信息
      if (page.data.address) {
        const addrInfo = document.createElement('div');
        addrInfo.style.cssText = 'font-size:14px;color:#8E8E93;margin-bottom:24px;text-align:center;';
        addrInfo.textContent = '柜机地址：' + page.data.address;
        content.appendChild(addrInfo);
      }

      const prompt = document.createElement('div');
      prompt.style.cssText = 'font-size:15px;color:#3C3C43;margin-bottom:24px;text-align:center;';
      prompt.textContent = page.data.prompt || '请输入验证码';
      content.appendChild(prompt);

      // 6个输入框容器
      const codeContainer = document.createElement('div');
      codeContainer.style.cssText = 'display:flex;gap:8px;margin-bottom:24px;';

      const inputs = [];
      for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.className = 'form-input';
        input.style.cssText = 'width:44px;height:52px;text-align:center;font-size:22px;font-weight:600;border-radius:8px;';
        input.dataset.index = i;
        inputs.push(input);

        input.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val && i < 5) {
            inputs[i + 1].focus();
          }
          checkCode();
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && i > 0) {
            inputs[i - 1].focus();
          }
        });

        codeContainer.appendChild(input);
      }

      content.appendChild(codeContainer);

      function checkCode() {
        const code = inputs.map(inp => inp.value).join('');
        if (code.length === 6) {
          const navParams = window.gameData.state._navParams || {};
          const correctAddress = navParams.correctAddress !== false; // 默认true
          const correctCode = page.data.code || page.data.correctCode;

          if (correctAddress && correctCode && code.toLowerCase() === correctCode.toLowerCase()) {
            // 正确
            if (page.data.setHasCoin) {
              window.gameData.state.hasCoin = true;
              StateSaver.save();
            }
            // 自定义弹窗带图片
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:200;display:flex;align-items:center;justify-content:center;';
            const modal = document.createElement('div');
            modal.style.cssText = 'background:#fff;border-radius:16px;padding:24px 20px 20px;width:280px;text-align:center;';
            const img = document.createElement('img');
            img.src = 'assets/coin-gift.jpg';
            img.style.cssText = 'width:100%;border-radius:10px;margin-bottom:16px;';
            img.alt = '金币礼物';
            modal.appendChild(img);
            const title = document.createElement('div');
            title.style.cssText = 'font-size:17px;font-weight:600;color:#6B5340;margin-bottom:8px;';
            title.textContent = page.data.successTitle || '验证成功';
            modal.appendChild(title);
            const desc = document.createElement('div');
            desc.style.cssText = 'font-size:14px;color:#8E8E93;margin-bottom:16px;line-height:1.5;';
            desc.textContent = page.data.successContent || '验证码正确';
            modal.appendChild(desc);
            const btn = document.createElement('button');
            btn.className = 'form-btn';
            btn.textContent = page.data.successBtnText || '确定';
            btn.addEventListener('click', () => { document.body.removeChild(overlay); });
            modal.appendChild(btn);
            overlay.appendChild(modal);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
            document.body.appendChild(overlay);
          } else {
            // 错误
            Modal.show('提示', '取件码无效', [
              {
                text: '重新输入',
                onClick: () => {
                  inputs.forEach(inp => { inp.value = ''; });
                  inputs[0].focus();
                }
              }
            ]);
          }
        }
      }

      container.appendChild(content);
    },

    /**
     * 渲染地图页
     * @param {Object} page - 页面数据对象
     */
    renderMap(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';

      // 地图图片
      const mapPlaceholder = document.createElement('div');
      mapPlaceholder.style.cssText = 'width:100%;height:240px;overflow:hidden;';
      const mapImg = document.createElement('img');
      mapImg.src = 'assets/map-qingtai.jpg';
      mapImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      mapImg.alt = '青苔巷地图';
      mapPlaceholder.appendChild(mapImg);
      content.appendChild(mapPlaceholder);

      // 信息卡片
      const card = document.createElement('div');
      card.style.cssText = 'margin:12px 16px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);';

      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:17px;font-weight:600;color:#6B5340;margin-bottom:6px;';
      nameEl.textContent = page.data.name || '';
      card.appendChild(nameEl);

      const addressEl = document.createElement('div');
      addressEl.style.cssText = 'font-size:14px;color:#3C3C43;font-weight:600;margin-bottom:8px;';
      addressEl.textContent = page.data.address || '';
      card.appendChild(addressEl);

      const statusEl = document.createElement('div');
      statusEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:4px;';
      statusEl.textContent = page.data.status || '';
      card.appendChild(statusEl);

      const transportEl = document.createElement('div');
      transportEl.style.cssText = 'font-size:13px;color:#8E8E93;';
      transportEl.textContent = page.data.transport || '';
      card.appendChild(transportEl);

      content.appendChild(card);
      container.appendChild(content);
    },

    /**
     * 渲染菜单页
     * @param {Object} page - 页面数据对象
     */
    renderMenu(page) {
      const container = document.getElementById('page-container');
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '12px 16px 40px';
      content.style.zoom = '1';

      const categories = page.data.categories || [];
      categories.forEach(category => {
        // 分类标题
        const catTitle = document.createElement('div');
        catTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;margin:16px 0 8px;padding-bottom:6px;border-bottom:1px solid #E5E5EA;';
        catTitle.textContent = category.title;
        content.appendChild(catTitle);

        // 菜单项
        const items = category.items || [];
        items.forEach(item => {
          const row = document.createElement('div');
          row.className = 'list-item';
          row.style.justifyContent = 'space-between';

          const enName = document.createElement('div');
          enName.style.cssText = 'font-size:15px;color:#6B5340;';
          enName.textContent = item.en;

          const cnName = document.createElement('div');
          cnName.style.cssText = 'font-size:13px;color:#8E8E93;';
          cnName.textContent = item.cn;

          row.appendChild(enName);
          row.appendChild(cnName);
          content.appendChild(row);
        });
      });

      container.appendChild(content);
    },

    /**
     * 渲染结局流程页
     * @param {Object} page - 页面数据对象
     */
    renderFinale(page) {
      const container = document.getElementById('page-container');
      const self = this;

      // 每次从外部导航进入时重置为search阶段
      if (!page.data._internalNav) {
        page.data.phase = 'search';
        page.data._internalNav = false;
      }

      try {
      container.appendChild(this.createHeader(page.title));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.cssText = 'padding:0;background:#fff;';

      const phase = page.data.phase || 'search';
      console.log('[renderFinale] phase:', phase, 'mapCard:', !!page.data.mapCard);

      if (phase === 'search') {
        // 搜索结果列表 + 地图卡片
        const results = page.data.results || [];
        results.forEach(item => {
          const row = document.createElement('div');
          row.className = 'list-item';
          row.style.flexDirection = 'column';
          row.style.alignItems = 'flex-start';
          row.style.borderBottom = '0.5px solid #E6E2D3';

          const titleEl = document.createElement('div');
          titleEl.style.cssText = 'font-size:15px;color:#6B5340;font-weight:500;';
          titleEl.textContent = item.title;
          row.appendChild(titleEl);

          const descEl = document.createElement('div');
          descEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-top:4px;';
          descEl.textContent = item.desc || '';
          row.appendChild(descEl);

          if (item.clickable) {
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
              if (item.target) Router.navigate(item.target);
            });
          }

          content.appendChild(row);
        });

        // 地图卡片
        if (page.data.mapCard) {
          const mapCard = document.createElement('div');
          mapCard.style.cssText = 'margin:12px 16px;padding:0;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;';

          // 地图图片
          const mapImgWrap = document.createElement('div');
          mapImgWrap.style.cssText = 'width:100%;height:200px;overflow:hidden;';
          const mapImg = document.createElement('img');
          mapImg.src = 'assets/map-qingtai.jpg';
          mapImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
          mapImg.alt = '青苔巷地图';
          mapImgWrap.appendChild(mapImg);
          mapCard.appendChild(mapImgWrap);

          const mapInfo = document.createElement('div');
          mapInfo.style.padding = '16px';

          const mapTitle = document.createElement('div');
          mapTitle.style.cssText = 'font-size:15px;font-weight:600;color:#6B5340;margin-bottom:8px;';
          mapTitle.textContent = page.data.mapCard.title || '';
          mapInfo.appendChild(mapTitle);

          const mapDesc = document.createElement('div');
          mapDesc.style.cssText = 'font-size:13px;color:#8E8E93;';
          mapDesc.textContent = page.data.mapCard.desc || '';
          mapInfo.appendChild(mapDesc);

          // 导航按钮
          const navBtn = document.createElement('button');
          navBtn.className = 'form-btn';
          navBtn.style.marginTop = '12px';
          navBtn.textContent = page.data.mapCard.btnText || '导航';
          navBtn.addEventListener('click', () => {
            const state = window.gameData.state;
            if (state.hasCoin) {
              // 切换到准备阶段（在同一页面内）
              page.data.phase = 'prepare';
              page.data.text = page.data.preparationContent || '';
              page.data.buttons = [
                { text: '返回', primary: false, action: 'goHome' },
                { text: '前往青苔巷', primary: true, action: 'switch-scene' }
              ];
              page.data._internalNav = true;
              // 重新渲染
              container.innerHTML = '';
              self.renderFinale(page);
            } else {
              Modal.show('提示', page.data.mapCard.noCoinMsg || '你还没有获得硬币', [
                { text: '确定', onClick: () => {} }
              ]);
            }
          });
          mapInfo.appendChild(navBtn);
          mapCard.appendChild(mapInfo);

          content.appendChild(mapCard);
        }
      } else if (phase === 'prepare') {
        // 准备页面：标题 + 文案 + 按钮
        if (page.data.prepareTitle) {
          const titleEl = document.createElement('div');
          titleEl.style.cssText = 'font-size:22px;font-weight:700;color:#6B5340;text-align:center;padding:24px 16px 12px;';
          titleEl.textContent = page.data.prepareTitle;
          content.appendChild(titleEl);
        }

        const textEl = document.createElement('div');
        textEl.style.cssText = 'font-size:15px;color:#3C3C43;line-height:1.8;padding:8px 16px 20px;text-align:center;white-space:pre-wrap;';
        textEl.textContent = page.data.text || '';
        content.appendChild(textEl);

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'padding:0 16px 24px;display:flex;gap:12px;';

        const buttons = page.data.buttons || [];
        buttons.forEach(btn => {
          const button = document.createElement('button');
          button.className = 'form-btn';
          button.style.cssText = `flex:1;${btn.primary ? '' : 'background:#E5E5EA;color:#6B5340;'}`;
          button.textContent = btn.text;
          button.addEventListener('click', () => {
            if (btn.action === 'switch-scene') {
              // 切换到场景阶段
              page.data.phase = 'scene';
              page.data.text = page.data.sceneText || '';
              page.data.btnText = '念出龙语';
              page.data.errorMessage = page.data.errorMessage || '辉光没有变化。再想想那个词。';
              page.data._internalNav = true;
              container.innerHTML = '';
              self.renderFinale(page);
            } else if (btn.action === 'goHome') {
              Router.goHome();
            } else if (btn.target) {
              Router.navigate(btn.target);
            }
          });
          btnContainer.appendChild(button);
        });

        content.appendChild(btnContainer);
      } else if (phase === 'scene') {
        // 如果龙语已通过，直接触发结局动画
        if (window.gameData.state.dragonLanguagePassed) {
          self.triggerFinaleAnimation(container, page);
          container.appendChild(content);
          return;
        }
        // 场景页面：标题 + 文案 + 输入框 + 按钮
        if (page.data.sceneTitle) {
          const titleEl = document.createElement('div');
          titleEl.style.cssText = 'font-size:22px;font-weight:700;color:#6B5340;text-align:center;padding:24px 16px 12px;';
          titleEl.textContent = page.data.sceneTitle;
          content.appendChild(titleEl);
        }

        const textEl = document.createElement('div');
        textEl.style.cssText = 'font-size:15px;color:#3C3C43;line-height:1.8;padding:8px 16px 20px;text-align:center;white-space:pre-wrap;';
        textEl.textContent = page.data.text || '';
        content.appendChild(textEl);

        const inputGroup = document.createElement('div');
        inputGroup.style.cssText = 'padding:0 16px;margin-bottom:16px;';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input';
        input.placeholder = page.data.inputPlaceholder || '请输入...';
        inputGroup.appendChild(input);
        content.appendChild(inputGroup);

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'padding:0 16px 24px;display:flex;gap:12px;';

        // 返回按钮
        const backBtn = document.createElement('button');
        backBtn.className = 'form-btn';
        backBtn.style.cssText = 'flex:1;background:#E5E5EA;color:#6B5340;';
        backBtn.textContent = '返回';
        backBtn.addEventListener('click', () => {
          page.data.phase = 'prepare';
          page.data.text = page.data.preparationContent || '';
          page.data.buttons = [
            { text: '返回', primary: false, action: 'goHome' },
            { text: '前往青苔巷', primary: true, action: 'switch-scene' }
          ];
          page.data._internalNav = true;
          container.innerHTML = '';
          self.renderFinale(page);
        });
        btnContainer.appendChild(backBtn);

        // 念出龙语按钮
        const submitBtn = document.createElement('button');
        submitBtn.className = 'form-btn';
        submitBtn.style.cssText = 'flex:1;';
        submitBtn.textContent = page.data.btnText || '念出龙语';
        submitBtn.addEventListener('click', () => {
          const val = input.value.trim();
          if (!val) {
            Toast.show('请输入龙语');
            return;
          }
          const correctAnswer = page.data.correctAnswer || 'luminar';
          if (val.toLowerCase() === correctAnswer.toLowerCase()) {
            // 保存龙语已通过
            window.gameData.state.dragonLanguagePassed = true;
            StateSaver.save();
            // 触发结局动画
            self.triggerFinaleAnimation(container, page);
          } else {
            Modal.show('提示', page.data.errorMessage || '辉光没有变化。再想想那个词。', [
              { text: '确定', onClick: () => { input.value = ''; input.focus(); } }
            ]);
          }
        });
        btnContainer.appendChild(submitBtn);
        content.appendChild(btnContainer);

        // 回车提交
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') submitBtn.click();
        });
      }

      container.appendChild(content);
      } catch(e) {
        console.error('[renderFinale] Error:', e);
        container.innerHTML = '<div style="padding:20px;color:red;">渲染出错: ' + e.message + '</div>';
      }
    },

    /**
     * 结局动画效果
     * @param {HTMLElement} container - 页面容器
     * @param {Object} page - 页面数据对象
     */
    triggerFinaleAnimation(container, page) {
      container.innerHTML = '';

      const appEl = document.getElementById('app');

      // ===== 第一页：场景图 =====
      const page1 = document.createElement('div');
      page1.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:#000;display:flex;flex-direction:column;z-index:9999;opacity:0;transition:opacity 1.5s ease;';

      const sceneImg = document.createElement('img');
      sceneImg.src = 'assets/finale-scene.jpg';
      sceneImg.alt = '结局场景';
      sceneImg.style.cssText = 'width:100%;flex:1;object-fit:cover;opacity:0;transition:opacity 2s ease 1.5s;';
      page1.appendChild(sceneImg);

      // 继续按钮
      const continueBtn = document.createElement('button');
      continueBtn.style.cssText = 'margin:12px auto 28px;padding:10px 32px;border:none;border-radius:20px;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);font-size:14px;cursor:pointer;opacity:0;transition:opacity 1s ease 3s;flex-shrink:0;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';
      continueBtn.textContent = '继续';
      continueBtn.addEventListener('click', () => {
        // 淡出第一页
        page1.style.transition = 'opacity 1s ease';
        page1.style.opacity = '0';
        setTimeout(() => {
          page1.remove();
          // 显示第二页
          appEl.appendChild(page2);
          requestAnimationFrame(() => {
            page2.style.opacity = '1';
            page2Text.style.opacity = '1';
            page2Btn.style.opacity = '1';
          });
        }, 1000);
      });
      page1.appendChild(continueBtn);

      // ===== 第二页：结局文字 =====
      const page2 = document.createElement('div');
      page2.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:#000;display:flex;flex-direction:column;z-index:9999;opacity:0;transition:opacity 1.5s ease;';

      const page2Text = document.createElement('div');
      page2Text.style.cssText = 'flex:1;overflow-y:auto;font-size:15px;color:#fff;text-align:left;line-height:1.8;opacity:0;transition:opacity 2s ease 1.5s;padding:32px 24px 16px;white-space:pre-wrap;';
      page2Text.textContent = page.data.finaleText || page.data.endingText || '';
      page2.appendChild(page2Text);

      const page2Btn = document.createElement('button');
      page2Btn.style.cssText = 'margin:8px auto 24px;padding:10px 28px;border:none;border-radius:20px;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);font-size:14px;cursor:pointer;opacity:0;transition:opacity 1s ease 4s;flex-shrink:0;';
      page2Btn.textContent = '返回主界面';
      page2Btn.addEventListener('click', () => {
        page2.remove();
        Router.goHome();
      });
      page2.appendChild(page2Btn);

      // 显示第一页
      appEl.appendChild(page1);
      requestAnimationFrame(() => {
        page1.style.opacity = '1';
        sceneImg.style.opacity = '1';
        continueBtn.style.opacity = '1';
      });
    },

    renderWechatList(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader('\u5FAE\u4FE1'));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '0';
      content.style.background = '#fff';

      const chatList = data.chatList || [];
      chatList.forEach(function(item) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;padding:14px 20px;border-bottom:0.5px solid #E5E5EA;background:#fff;cursor:pointer;';
        row.addEventListener('click', function() {
          if (row._clicked) return;
          row._clicked = true;
          Router.navigate('07_chat_' + item.name);
          const chatPage = window.gameData.pages['07'];
          PageRenderer._renderWechatChat(chatPage, item.name);
        });
        row.addEventListener('touchstart', function() { row.style.backgroundColor = '#ECECEC'; });
        row.addEventListener('touchend', function() { row.style.backgroundColor = ''; });

        const avatar = document.createElement('div');
        avatar.style.cssText = 'width:48px;height:48px;border-radius:6px;background:#5B9BD5;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;';
        avatar.textContent = item.avatar || '💬';
        row.appendChild(avatar);

        const info = document.createElement('div');
        info.style.cssText = 'flex:1;margin-left:12px;min-width:0;';

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';

        const nameEl = document.createElement('div');
        nameEl.style.cssText = 'font-size:16px;font-weight:600;color:#6B5340;';
        nameEl.textContent = item.name || '';
        topRow.appendChild(nameEl);

        const timeEl = document.createElement('div');
        timeEl.style.cssText = 'font-size:12px;color:#8E8E93;flex-shrink:0;margin-left:8px;';
        timeEl.textContent = item.date || '';
        topRow.appendChild(timeEl);

        info.appendChild(topRow);

        const previewEl = document.createElement('div');
        previewEl.style.cssText = 'font-size:14px;color:#8E8E93;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        previewEl.textContent = item.preview || '';
        info.appendChild(previewEl);

        row.appendChild(info);
        content.appendChild(row);
      });

      container.appendChild(content);
    },

    renderGallery(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};
      container.appendChild(this.createHeader('\u76F8\u518C'));

      const content = document.createElement('div');
      content.className = 'page-content';
      content.style.padding = '4px';

      if (data.photos && data.photos.length > 0) {
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:2px;';

        data.photos.forEach(function(photo, index) {
          const cell = document.createElement('div');
          cell.style.cssText = 'aspect-ratio:1;background:#F2F2F7;overflow:hidden;cursor:pointer;position:relative;border-radius:8px;';

          if (photo.src) {
            const img = document.createElement('img');
            img.src = photo.src;
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            img.loading = 'lazy';
            cell.appendChild(img);
          } else {
            const icon = document.createElement('div');
            icon.style.cssText = 'font-size:32px;color:#C7C7CC;display:flex;align-items:center;justify-content:center;height:100%;';
            icon.textContent = '\uD83D\uDBC2';
            cell.appendChild(icon);
          }

          grid.appendChild(cell);

          cell.addEventListener('click', function() {
            GalleryViewer.show(data.photos, index);
          });
        });

        content.appendChild(grid);
      }

      container.appendChild(content);
    },

    renderDiary(page) {
      const container = document.getElementById('page-container');
      const data = page.data || {};

      if (data.locked) {
        container.appendChild(this.createHeader('\u52A0\u5BC6\u65E5\u8BB0'));

        const content = document.createElement('div');
        content.className = 'page-content';
        content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;';

        const lockIcon = document.createElement('div');
        lockIcon.style.cssText = 'font-size:48px;color:#C7C7CC;margin-bottom:16px;';
        lockIcon.textContent = '\uD83D\uDD12';
        content.appendChild(lockIcon);

        const lockTitle = document.createElement('div');
        lockTitle.style.cssText = 'font-size:17px;font-weight:600;color:#6B5340;margin-bottom:16px;';
        lockTitle.textContent = '\u52A0\u5BC6\u65E5\u8BB0';
        content.appendChild(lockTitle);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '\u8BF7\u8F93\u5165\u5BC6\u7801';
        input.style.cssText = 'width:240px;height:44px;border:1px solid #E5E5EA;border-radius:10px;text-align:center;font-size:16px;outline:none;margin-bottom:12px;';
        content.appendChild(input);

        const hint = document.createElement('div');
        hint.style.cssText = 'text-align:center;font-size:14px;color:#007AFF;cursor:pointer;padding:8px 0;text-decoration:underline;';
        hint.textContent = '\u5FD8\u8BB0\u5BC6\u7801\uFF1F';
        hint.addEventListener('click', function() {
          showPasswordHint(data.passwordHint || '\u6682\u65E0\u63D0\u793A');
        });
        content.appendChild(hint);

        const btn = document.createElement('div');
        btn.style.cssText = 'width:240px;height:44px;background:#5B9BD5;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:600;cursor:pointer;';
        btn.textContent = '\u89E3\u9501';
        btn.addEventListener('click', function() {
          if (input.value === data.password || input.value.toLowerCase() === data.password.toLowerCase()) {
            data.locked = false;
            PageRenderer.render('46');
          } else {
            input.style.borderColor = '#FF3B30';
            input.style.animation = 'shake 0.3s ease';
            setTimeout(function() {
              input.style.borderColor = '#E5E5EA';
              input.style.animation = '';
            }, 500);
          }
        });
        content.appendChild(btn);

        container.appendChild(content);
      } else {
        container.appendChild(this.createHeader('\u52A0\u5BC6\u65E5\u8BB0'));

        const content = document.createElement('div');
        content.className = 'page-content';
        content.style.padding = '20px';

        if (data.entries && data.entries.length > 0) {
          data.entries.forEach(function(entry) {
            const entryEl = document.createElement('div');
            entryEl.style.cssText = 'margin-bottom:20px;';

            const dateEl = document.createElement('div');
            dateEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:6px;font-weight:600;';
            dateEl.textContent = entry.date || '';
            entryEl.appendChild(dateEl);

            const textEl = document.createElement('div');
            textEl.style.cssText = 'font-size:15px;color:#6B5340;line-height:1.6;';
            textEl.textContent = entry.content || '';
            entryEl.appendChild(textEl);

            content.appendChild(entryEl);
          });
        }

        container.appendChild(content);
      }
    }
  };

  // ========== 6. Search 搜索系统 ==========
  const Search = {
    /** 显示搜索栏（不弹出历史记录） */
    show(focus = false) {
      const searchBar = document.getElementById('search-bar');
      if (searchBar) {
        searchBar.style.display = '';
        const input = searchBar.querySelector('input');
        if (input) {
          input.value = '';
          if (focus) input.focus();
        }
      }
    },

    /** 隐藏搜索栏 */
    hide() {
      const searchBar = document.getElementById('search-bar');
      if (searchBar) {
        searchBar.style.display = 'none';
      }
    },

    /**
     * 处理搜索输入 - 实时匹配并显示卡片
     * @param {string} keyword - 用户输入的关键词
     * @param {boolean} showResults - 是否显示结果到下拉面板
     */
    handleInput(keyword, showResults) {
      keyword = keyword.trim().toLowerCase();
      if (!keyword) return false;

      const cards = window.gameData.searchCards;
      if (!cards) return false;

      // 精确匹配（不区分大小写）
      var matched = null;
      for (var key in cards) {
        if (key.toLowerCase() === keyword) {
          matched = cards[key];
          break;
        }
      }

      if (!matched) return false;

      // 如果需要显示结果卡片（实时搜索模式）
      if (showResults) {
        this._renderCards(matched, keyword);
        return true;
      }

      // 直接跳转模式（历史记录点击，单结果时直接跳）
      if (matched.length === 1) {
        this._executeCard(matched[0], keyword);
      } else {
        // 多个结果时显示卡片
        this._renderCards(matched, keyword);
      }
      return true;
    },

    /**
     * 渲染搜索结果卡片到下拉面板
     */
    _renderCards(cardList, keyword) {
      var panel = document.getElementById('search-history');
      if (!panel) return;
      panel.innerHTML = '';
      panel.style.display = 'block';

      cardList.forEach(function(card) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;padding:12px;background:#fff;border-radius:10px;margin-bottom:6px;cursor:pointer;gap:10px;';

        var icon = document.createElement('span');
        icon.style.cssText = 'font-size:20px;flex-shrink:0;';
        icon.textContent = card.icon || '\uD83D\uDCC4';

        var title = document.createElement('span');
        title.style.cssText = 'font-size:14px;color:#6B5340;flex:1;';
        title.textContent = card.title || '';

        var arrow = document.createElement('span');
        arrow.style.cssText = 'font-size:16px;color:#C7C7CC;flex-shrink:0;';
        arrow.textContent = '\u203A';

        row.appendChild(icon);
        row.appendChild(title);
        row.appendChild(arrow);

        row.addEventListener('mousedown', function(e) {
          e.preventDefault(); // 阻止输入框失焦
          Search._executeCard(card, keyword);
        });

        // 移动端兼容
        row.addEventListener('touchstart', function(e) {
          e.preventDefault();
        }, { passive: false });
        row.addEventListener('touchend', function(e) {
          Search._executeCard(card, keyword);
        });

        panel.appendChild(row);
      });
    },

    /**
     * 执行卡片跳转
     */
    _executeCard(card, keyword) {
      // 保存搜索历史
      var HISTORY_KEY = 'search_history';
      try {
        var list = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        var idx = list.indexOf(keyword);
        if (idx >= 0) list.splice(idx, 1);
        list.unshift(keyword);
        if (list.length > 10) list = list.slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch(e) {}

      this.hide();
      var panel = document.getElementById('search-history');
      if (panel) panel.style.display = 'none';

      // 特殊action处理
      if (card.action === 'check-coin') {
        if (!window.gameData.state.hasCoin) {
          this.show();
          Modal.show('提示', '你还没有钥匙。', [
            { text: '确定', onClick: function() {} }
          ]);
          return;
        }
        Router.navigate(card.target);
        return;
      }

      if (card.action === 'expand-gemini') {
        Router.navigate(card.target);
        // 延迟展开双子座科普全文
        setTimeout(function() {
          var expandBtn = document.querySelector('.expand-btn');
          if (expandBtn) expandBtn.click();
        }, 300);
        return;
      }

      // 默认：直接导航
      Router.navigate(card.target);
    }
  };

  // ========== 7. DeepSeek 提示系统 ==========
  const DeepSeek = {
    /**
     * 处理 DeepSeek 输入框的输入
     * 在页面 02 中，用户输入页面编号获取提示
     * @param {string} input - 用户输入
     */
    handleInput(input) {
      input = input.trim();
      if (!input) return;

      const chatContainer = document.querySelector('#page-container .chat-container');
      if (!chatContainer) return;

      // 用户输入气泡（右侧绿色）
      const userWrapper = document.createElement('div');
      userWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;margin-bottom:12px;';
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble sent';
      userBubble.style.cssText = 'max-width:70%;padding:9px 13px;font-size:15px;line-height:1.5;word-break:break-word;';
      userBubble.textContent = input;
      userWrapper.appendChild(userBubble);
      chatContainer.appendChild(userWrapper);

      // DeepSeek 回复气泡（左侧灰色）
      // 尝试匹配提示（支持 "1" 匹配 "01"，"01" 匹配 "01"）
      let hint = window.gameData.hints[input];
      if (!hint && input.length === 1) {
        hint = window.gameData.hints['0' + input];
      }
      if (!hint && input.length === 2 && input.startsWith('0')) {
        hint = window.gameData.hints[input.substring(1)];
      }
      const replyText = hint || '未找到相关提示。请输入页面编号（如 01、02...）';

      const aiWrapper = document.createElement('div');
      aiWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;margin-bottom:12px;';
      const aiBubble = document.createElement('div');
      aiBubble.className = 'chat-bubble received';
      aiBubble.style.cssText = 'max-width:70%;padding:9px 13px;font-size:15px;line-height:1.5;word-break:break-word;';
      aiBubble.textContent = replyText;
      aiWrapper.appendChild(aiBubble);
      chatContainer.appendChild(aiWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // 保存线索对话到state
      if (!window.gameData.state.hintChatHistory) {
        window.gameData.state.hintChatHistory = [];
      }
      window.gameData.state.hintChatHistory.push({ role: 'user', text: input });
      window.gameData.state.hintChatHistory.push({ role: 'ai', text: replyText });
      StateSaver.save();
    }
  };

  // ========== 8. 足迹页面渲染 ==========
  /**
   * 渲染足迹页面（已访问页面列表）
   */
  function renderFootprints() {
    const visited = window.gameData.state.visitedPages;
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    container.className = 'page-enter active';

    // 创建头部（iOS 风格返回按钮）
    const header = document.createElement('header');
    header.className = 'page-header';

    const backBtn = document.createElement('span');
    backBtn.className = 'back-btn';
    backBtn.textContent = '\u2039 返回';
    backBtn.addEventListener('click', () => Router.back());
    header.appendChild(backBtn);

    const titleEl = document.createElement('span');
    titleEl.className = 'title';
    titleEl.textContent = '足迹';
    header.appendChild(titleEl);

    const spacer = document.createElement('span');
    spacer.style.width = '60px';
    spacer.style.minWidth = '60px';
    header.appendChild(spacer);
    container.appendChild(header);

    // 内容区域
    const content = document.createElement('div');
    content.className = 'page-content';

    if (visited.length === 0) {
      content.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#8E8E93;">
          <div style="font-size:48px;margin-bottom:16px;">\u{1F6A7}</div>
          <div style="font-size:15px;">还没有访问过任何页面</div>
          <div style="font-size:13px;margin-top:8px;color:#AEAEB2;">打开应用后会自动记录在这里</div>
        </div>
      `;
    } else {
      const countEl = document.createElement('div');
      countEl.style.cssText = 'font-size:13px;color:#8E8E93;margin-bottom:12px;';
      countEl.textContent = `已访问 ${visited.length} 个页面`;
      content.appendChild(countEl);

      // 按编号从小到大排序
      var sorted = visited.slice().sort(function(a, b) {
        return parseInt(a) - parseInt(b);
      });

      sorted.forEach((pageId) => {
        const page = window.gameData.pages[pageId];
        if (!page) return;

        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.justifyContent = 'space-between';

        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.fontSize = '15px';
        title.textContent = page.title;

        const id = document.createElement('div');
        id.style.fontSize = '12px';
        id.style.color = '#8E8E93';
        id.textContent = '#' + pageId;

        item.appendChild(title);
        item.appendChild(id);

        // 点击可跳转到对应页面
        item.addEventListener('click', () => {
          Router.navigate(pageId);
        });

        content.appendChild(item);
      });
    }

    container.appendChild(content);

    // 更新页面编号
    const pageNumber = document.getElementById('page-number');
    if (pageNumber) {
      pageNumber.textContent = '';
      pageNumber.style.display = 'none';
    }
  }

  // ========== 9. 事件绑定初始化 ==========
  function initEventListeners() {
    // 1. App图标点击（主屏幕 + Dock栏）
    // data-app 现在直接存储页面编号
    document.querySelectorAll('.app-icon[data-app], .dock-icon[data-app]').forEach(icon => {
      icon.addEventListener('click', () => {
        const pageId = icon.dataset.app;
        if (pageId) {
          if (pageId === 'footprints') {
            Router.navigate('footprints');
          } else {
            Router.navigate(pageId);
          }
        }
      });
    });

    // 2. 小组件点击跳转
    document.querySelectorAll('[data-navigate]').forEach(widget => {
      widget.addEventListener('click', () => {
        const pageId = widget.dataset.navigate;
        if (pageId) Router.navigate(pageId);
      });
    });

    // 3. 搜索栏：回车触发搜索 + 历史记录
    const searchInput = document.getElementById('search-input');
    const searchHistory = document.getElementById('search-history');
    if (searchInput && searchHistory) {
      // 搜索历史 localStorage key
      var HISTORY_KEY = 'search_history';
      var MAX_HISTORY = 10;

      // 读取历史
      function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch(e) { return []; }
      }

      // 保存历史（去重，最多10条）
      function saveHistory(keyword) {
        var list = getHistory();
        var idx = list.indexOf(keyword);
        if (idx >= 0) list.splice(idx, 1);
        list.unshift(keyword);
        if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      }

      // 删除单条历史
      function removeHistory(keyword) {
        var list = getHistory();
        list = list.filter(function(k) { return k !== keyword; });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      }

      // 渲染历史下拉
      function renderHistory() {
        var list = getHistory();
        searchHistory.innerHTML = '';
        if (list.length === 0) {
          searchHistory.style.display = 'none';
          return;
        }
        searchHistory.style.display = 'block';
        list.forEach(function(keyword) {
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#fff;border-radius:8px;margin-bottom:4px;cursor:pointer;';

          var text = document.createElement('span');
          text.style.cssText = 'font-size:14px;color:#6B5340;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
          text.textContent = keyword;
          text.addEventListener('mousedown', function(e) {
            e.preventDefault();
            searchInput.value = keyword;
            Search.handleInput(keyword, true);
          });
          row.appendChild(text);

          var delBtn = document.createElement('span');
          delBtn.style.cssText = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#8E8E93;font-size:18px;flex-shrink:0;margin:-10px -12px -10px 0;border-radius:8px;';
          delBtn.textContent = '\u00D7';
          delBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            removeHistory(keyword);
            renderHistory();
          });
          row.appendChild(delBtn);

          searchHistory.appendChild(row);
        });
      }

      // 焦点时显示历史
      searchInput.addEventListener('focus', function() {
        renderHistory();
      });

      // 失焦时隐藏（延迟以允许点击事件）
      searchInput.addEventListener('blur', function() {
        setTimeout(function() {
          searchHistory.style.display = 'none';
        }, 200);
      });

      // 实时输入匹配
      searchInput.addEventListener('input', function() {
        var keyword = searchInput.value.trim();
        if (!keyword) {
          renderHistory();
          return;
        }
        // 尝试匹配，显示结果卡片
        var found = Search.handleInput(keyword, true);
        if (!found) {
          // 无匹配结果
          searchHistory.innerHTML = '';
          searchHistory.style.display = 'block';
          var noResult = document.createElement('div');
          noResult.style.cssText = 'text-align:center;font-size:13px;color:#8E8E93;padding:16px 0;';
          noResult.textContent = '未找到相关内容';
          searchHistory.appendChild(noResult);
        }
      });

      // 回车：如果有匹配结果，执行第一张卡片
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var keyword = searchInput.value.trim();
          if (keyword) {
            var found = Search.handleInput(keyword, false);
            if (!found) {
              // 无匹配
              searchHistory.innerHTML = '';
              searchHistory.style.display = 'block';
              var noResult = document.createElement('div');
              noResult.style.cssText = 'text-align:center;font-size:13px;color:#8E8E93;padding:16px 0;';
              noResult.textContent = '未找到相关内容';
              searchHistory.appendChild(noResult);
            }
          }
          searchInput.value = '';
          searchInput.blur();
        }
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchInput.blur();
        }
      });
    }
  }

  // ========== 10. 状态栏时间更新 ==========
  /**
   * 更新状态栏时间显示
   */
  function updateTime() {
    // 游戏内固定时间：10:30（不使用真实时间）
    const timeEl = document.getElementById('status-time');
    if (timeEl) timeEl.textContent = '10:30';
  }

  // ========== 11. 左边缘滑动返回手势 ==========
  function initSwipeBack() {
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    const EDGE_WIDTH = 30;   // 左边缘触发区域宽度
    const THRESHOLD = 100;   // 滑动超过此距离触发返回

    pageContainer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = 0;
      // 只在左边缘30px内触发
      if (startX < EDGE_WIDTH) {
        isDragging = true;
      }
    }, { passive: true });

    pageContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      currentX = touch.clientX - startX;
      // 只允许向右滑
      if (currentX > 0) {
        // 页面跟随手指移动（带阻尼，最大移动屏幕宽度的60%）
        const screenWidth = window.innerWidth;
        const maxMove = screenWidth * 0.6;
        const moveX = Math.min(currentX * 0.6, maxMove);
        pageContainer.style.transform = `translateX(${moveX}px)`;
        pageContainer.style.transition = 'none';
      }
    }, { passive: true });

    pageContainer.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentX > THRESHOLD) {
        // 超过阈值，执行返回
        pageContainer.style.transition = 'transform 0.25s ease';
        pageContainer.style.transform = 'translateX(100%)';
        setTimeout(() => {
          pageContainer.style.transform = '';
          pageContainer.style.transition = '';
          Router.back();
        }, 250);
      } else {
        // 未超过阈值，弹回原位
        pageContainer.style.transition = 'transform 0.2s ease';
        pageContainer.style.transform = 'translateX(0)';
        setTimeout(() => {
          pageContainer.style.transition = '';
        }, 200);
      }
      currentX = 0;
    }, { passive: true });
  }

  // ========== 12. 应用初始化 ==========
  document.addEventListener('DOMContentLoaded', () => {
    // 清理可能损坏的localStorage
    try {
      const saved = localStorage.getItem('meteor_game_state');
      if (saved) JSON.parse(saved); // 验证是否有效JSON
    } catch(e) {
      localStorage.removeItem('meteor_game_state'); // 损坏则清除
    }
    initEventListeners();
    initSwipeBack();
    // 初始化状态栏时间
    updateTime();
    // 每分钟更新一次时间
    setInterval(updateTime, 60000);
  });

  // 暴露到全局（供调试和外部调用）
  window.Router = Router;
  window.PageRenderer = PageRenderer;

})();
