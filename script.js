// wish-planet JavaScript 功能实现

// 数据存储键名
const WISHES_KEY = 'WISH_PLANET_WISHES';

// 工具函数：生成UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 工具函数：防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 工具函数：格式化日期
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 工具函数：获取今天的日期字符串
function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 数据管理类
class WishManager {
  constructor() {
    this.wishes = this.loadWishes();
  }

  // 从localStorage加载愿望
  loadWishes() {
    try {
      const wishes = localStorage.getItem(WISHES_KEY);
      return wishes ? JSON.parse(wishes) : [];
    } catch (error) {
      console.error('加载愿望数据时出错:', error);
      return [];
    }
  }

  // 保存愿望到localStorage
  saveWishes() {
    try {
      localStorage.setItem(WISHES_KEY, JSON.stringify(this.wishes));
    } catch (error) {
      console.error('保存愿望数据时出错:', error);
    }
  }

  // 添加新愿望
  addWish(challenge, difficulty, goal) {
    const newWish = {
      id: generateUUID(),
      困境描述: challenge,
      困难程度: parseInt(difficulty),
      期望成果: goal,
      当前能量: 0,
      是否达成: false,
      创建时间: new Date().toISOString(),
      更新时间: new Date().toISOString(),
      能量记录: []
    };

    this.wishes.push(newWish);
    this.saveWishes();
    return newWish;
  }

  // 获取所有愿望
  getAllWishes() {
    return this.wishes;
  }

  // 根据ID获取愿望
  getWishById(id) {
    return this.wishes.find(wish => wish.id === id);
  }

  // 为愿望注入能量
  injectEnergy(wishId, content) {
    const wish = this.getWishById(wishId);
    if (!wish) return false;

    const energyRecord = {
      id: generateUUID(),
      内容: content,
      时间: new Date().toISOString()
    };

    wish.能量记录.push(energyRecord);
    wish.当前能量 += 1;
    wish.更新时间 = new Date().toISOString();
    
    this.saveWishes();
    return energyRecord;
  }

  // 标记愿望为已达成
  fulfillWish(wishId, content) {
    const wish = this.getWishById(wishId);
    if (!wish) return false;

    wish.是否达成 = true;
    wish.更新时间 = new Date().toISOString();
    
    // 添加还愿记录
    const fulfillRecord = {
      id: generateUUID(),
      内容: content,
      时间: new Date().toISOString(),
      类型: '还愿'
    };
    
    wish.能量记录.push(fulfillRecord);
    this.saveWishes();
    return true;
  }

  // 获取指定日期的能量记录
  getEnergyRecordsByDate(dateString) {
    const records = [];
    
    this.wishes.forEach(wish => {
      wish.能量记录.forEach(record => {
        // 提取记录日期部分进行比较
        const recordDate = record.时间.split('T')[0];
        if (recordDate === dateString) {
          records.push({
            wishId: wish.id,
            wishTitle: wish.期望成果,
            record: record
          });
        }
      });
    });
    
    return records;
  }

  // 获取有能量记录的日期
  getEnergyDates() {
    const dates = new Set();
    
    this.wishes.forEach(wish => {
      wish.能量记录.forEach(record => {
        // 提取日期部分
        const date = record.时间.split('T')[0];
        dates.add(date);
      });
    });
    
    return Array.from(dates);
  }
}

// UI管理类
class UIManager {
  constructor(wishManager) {
    this.wishManager = wishManager;
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    
    this.initEventListeners();
    this.renderWishList();
  }

  // 初始化事件监听器
  initEventListeners() {
    // 标签切换
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // 许愿表单提交
    document.getElementById('wishForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleWishSubmit(e);
    });

    // 难度滑块变化（使用防抖优化性能）
    const difficultySlider = document.getElementById('difficulty');
    const difficultyValue = document.getElementById('difficultyValue');
    
    difficultySlider.addEventListener('input', debounce((e) => {
      difficultyValue.textContent = e.target.value;
    }, 100));

    // 注入能量表单提交
    document.getElementById('energyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEnergySubmit(e);
    });

    // 还愿表单提交
    document.getElementById('fulfillForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFulfillSubmit(e);
    });

    // 模态框关闭按钮
    document.querySelectorAll('.modal .close').forEach(button => {
      button.addEventListener('click', () => {
        this.closeModals();
      });
    });

    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModals();
        }
      });
    });

    // 日历导航
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.navigateToPreviousMonth();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
      this.navigateToNextMonth();
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  // 切换标签
  switchTab(tabId) {
    // 更新激活的标签按钮
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // 更新激活的面板
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // 根据标签更新内容
    if (tabId === 'wish-list') {
      this.renderWishList();
    } else if (tabId === 'calendar') {
      this.renderCalendar();
    }
  }

  // 处理许愿表单提交
  handleWishSubmit(e) {
    const challenge = document.getElementById('challenge').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    const goal = document.getElementById('goal').value.trim();

    // 验证输入
    if (!challenge || !goal) {
      this.showMessage('请完整填写困境描述和期望成果', 'error');
      return;
    }

    if (challenge.length < 5 || goal.length < 5) {
      this.showMessage('困境描述和期望成果至少需要5个字符', 'error');
      return;
    }

    const newWish = this.wishManager.addWish(challenge, difficulty, goal);
    
    // 重置表单
    document.getElementById('wishForm').reset();
    document.getElementById('difficultyValue').textContent = '50';
    
    // 切换到愿望列表标签
    this.switchTab('wish-list');
    
    // 显示成功消息
    this.showMessage('愿望已成功种下！宇宙已收到你的传讯。', 'success');
    
    // 滚动到新添加的愿望卡片
    setTimeout(() => {
      const newWishCard = document.querySelector(`[data-wish-id="${newWish.id}"]`);
      if (newWishCard) {
        newWishCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 添加临时高亮效果
        newWishCard.style.transition = 'box-shadow 0.5s ease';
        newWishCard.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        setTimeout(() => {
          newWishCard.style.boxShadow = '';
        }, 2000);
      }
    }, 500);
  }

  // 处理能量注入提交
  handleEnergySubmit(e) {
    const wishId = document.getElementById('wishId').value;
    const content = document.getElementById('energyContent').value.trim();

    // 验证输入
    if (!content) {
      this.showMessage('请输入你的努力记录', 'error');
      return;
    }

    if (content.length < 10) {
      this.showMessage('努力记录至少需要10个字符', 'error');
      return;
    }

    const result = this.wishManager.injectEnergy(wishId, content);
    
    if (result) {
      // 关闭模态框并重置表单
      this.closeModals();
      document.getElementById('energyForm').reset();
      
      // 重新渲染愿望列表
      this.renderWishList();
      
      // 显示成功消息
      this.showMessage('能量已成功注入！你的努力被宇宙感知到了。', 'success');
    } else {
      this.showMessage('注入能量失败，请重试', 'error');
    }
  }

  // 处理还愿提交
  handleFulfillSubmit(e) {
    const wishId = document.getElementById('fulfillWishId').value;
    const content = document.getElementById('fulfillContent').value.trim();

    // 验证输入
    if (!content) {
      this.showMessage('请输入你的还愿感悟', 'error');
      return;
    }

    if (content.length < 10) {
      this.showMessage('还愿感悟至少需要10个字符', 'error');
      return;
    }

    const result = this.wishManager.fulfillWish(wishId, content);
    
    if (result) {
      // 关闭模态框并重置表单
      this.closeModals();
      document.getElementById('fulfillForm').reset();
      
      // 重新渲染愿望列表
      this.renderWishList();
      
      // 显示成功消息
      this.showMessage('恭喜你还愿成功！愿你的下一个愿望也能实现。', 'success');
    } else {
      this.showMessage('还愿失败，请重试', 'error');
    }
  }

  // 显示消息
  showMessage(message, type) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // 添加样式
    Object.assign(messageEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    if (type === 'success') {
      messageEl.style.background = 'linear-gradient(45deg, #2d0a4d, #8a2be2)';
      messageEl.style.border = '1px solid #ffd700';
    } else {
      messageEl.style.background = 'linear-gradient(45deg, #4d0a0a, #d22)';
    }
    
    document.body.appendChild(messageEl);
    
    // 动画显示
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后自动移除
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, 3000);
  }

  // 渲染愿望列表
  renderWishList() {
    const wishListEl = document.getElementById('wishList');
    const wishes = this.wishManager.getAllWishes();
    
    if (wishes.length === 0) {
      wishListEl.innerHTML = `
        <div class="empty-state">
          <p>还没有种下任何愿望种子</p>
          <p>点击"许愿"标签开始你的宇宙对话</p>
        </div>
      `;
      return;
    }
    
    // 按创建时间倒序排列
    const sortedWishes = [...wishes].sort((a, b) => new Date(b.创建时间) - new Date(a.创建时间));
    
    wishListEl.innerHTML = sortedWishes.map(wish => this.createWishCard(wish)).join('');
    
    // 为新添加的按钮添加事件监听器
    this.initWishCardEvents();
    
    // 添加卡片出现动画
    setTimeout(() => {
      document.querySelectorAll('.wish-card').forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('card-appear');
        }, index * 100);
      });
    }, 100);
  }

  // 创建愿望卡片HTML
  createWishCard(wish) {
    const progress = wish.困难程度 > 0 ? Math.min(100, (wish.当前能量 / wish.困难程度) * 100) : 0;
    
    return `
      <div class="wish-card ${wish.是否达成 ? 'fulfilled' : ''}" data-wish-id="${wish.id}">
        <h3>${wish.期望成果}</h3>
        
        <div class="wish-section">
          <h4>当前困境</h4>
          <p>${wish.困境描述}</p>
        </div>
        
        <div class="wish-section">
          <h4>困难程度</h4>
          <p>${wish.困难程度}/100</p>
        </div>
        
        <div class="progress-container">
          <div class="progress-label">
            <span>能量进度</span>
            <span>${wish.当前能量}/${wish.困难程度}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <div class="card-buttons">
          ${!wish.是否达成 ? 
            `<button class="card-btn energy" data-wish-id="${wish.id}">注入能量</button>
             <button class="card-btn fulfill" data-wish-id="${wish.id}">还愿</button>` :
            `<button class="card-btn" disabled style="background: rgba(255,215,0,0.2); color: #ffd700;">已完成</button>`
          }
        </div>
      </div>
    `;
  }

  // 初始化愿望卡片事件
  initWishCardEvents() {
    // 注入能量按钮
    document.querySelectorAll('.card-btn.energy').forEach(button => {
      button.addEventListener('click', (e) => {
        const wishId = e.target.dataset.wishId;
        this.openEnergyModal(wishId);
      });
    });
    
    // 还愿按钮
    document.querySelectorAll('.card-btn.fulfill').forEach(button => {
      button.addEventListener('click', (e) => {
        const wishId = e.target.dataset.wishId;
        this.openFulfillModal(wishId);
      });
    });
  }

  // 打开注入能量模态框
  openEnergyModal(wishId) {
    document.getElementById('wishId').value = wishId;
    document.getElementById('energyModal').classList.add('active');
  }

  // 打开还愿模态框
  openFulfillModal(wishId) {
    document.getElementById('fulfillWishId').value = wishId;
    document.getElementById('fulfillModal').classList.add('active');
  }

  // 关闭所有模态框
  closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // 渲染日历
  renderCalendar() {
    const calendarDaysEl = document.getElementById('calendarDays');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    
    // 设置当前月份年份显示
    currentMonthYearEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
    
    // 获取当前月份的日期信息
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 从周日开始
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // 到周六结束
    
    // 清空日历
    calendarDaysEl.innerHTML = '';
    
    // 获取有能量记录的日期
    const energyDates = this.wishManager.getEnergyDates();
    const todayString = getTodayString();
    
    // 生成日期元素
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
      const isToday = dateStr === todayString;
      const hasEnergy = energyDates.includes(dateStr);
      
      const dayEl = document.createElement('div');
      dayEl.className = `day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''} ${hasEnergy ? 'has-energy' : ''}`;
      dayEl.innerHTML = `
        <span>${currentDate.getDate()}</span>
      `;
      
      // 为有能量记录的日期添加点击事件
      if (hasEnergy) {
        dayEl.addEventListener('click', () => {
          this.showDateDetails(dateStr);
        });
      }
      
      calendarDaysEl.appendChild(dayEl);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // 显示日期详情
  showDateDetails(dateString) {
    const records = this.wishManager.getEnergyRecordsByDate(dateString);
    const modal = document.getElementById('dateDetailModal');
    const modalDateEl = document.getElementById('modalDate');
    const modalRecordsEl = document.getElementById('modalRecords');
    
    // 设置日期标题
    const date = new Date(dateString);
    modalDateEl.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    
    // 生成记录内容
    if (records.length > 0) {
      modalRecordsEl.innerHTML = records.map(record => `
        <div class="energy-record">
          <h4>${record.wishTitle}</h4>
          <p>${record.record.内容}</p>
          <div class="record-time">${formatDate(record.record.时间)}</div>
        </div>
      `).join('');
    } else {
      modalRecordsEl.innerHTML = '<p>这一天没有能量记录。</p>';
    }
    
    // 显示模态框
    modal.classList.add('active');
  }

  // 导航到上个月
  navigateToPreviousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
  }

  // 导航到下个月
  navigateToNextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 隐藏加载动画
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    setTimeout(() => {
      loadingEl.classList.add('hidden');
    }, 500);
  }
  
  const wishManager = new WishManager();
  const uiManager = new UIManager(wishManager);
  
  // 初始化日历
  if (document.getElementById('calendar').classList.contains('active')) {
    uiManager.renderCalendar();
  }
});