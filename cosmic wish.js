// script.js

// 数据结构设计
// wishes: [
//   {
//     id: 'unique-id',
//     challenge: '困境描述',
//     difficulty: 50,
//     goal: '期望成果',
//     currentEnergy: 0,
//     fulfilled: false,
//     createdAt: '2023-01-01'
//   }
// ]
//
// energyRecords: [
//   {
//     id: 'unique-id',
//     wishId: '关联的wish id',
//     effort: '努力记录',
//     date: '2023-01-01'
//   }
// ]

class WishApp {
    constructor() {
        this.wishes = [];
        this.energyRecords = [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        this.renderWishes();
        this.renderCalendar();
    }

    // 从localStorage加载数据
    loadFromLocalStorage() {
        const wishesData = localStorage.getItem('wishes');
        const energyRecordsData = localStorage.getItem('energyRecords');
        
        if (wishesData) {
            this.wishes = JSON.parse(wishesData);
        }
        
        if (energyRecordsData) {
            this.energyRecords = JSON.parse(energyRecordsData);
        }
    }

    // 保存数据到localStorage
    saveToLocalStorage() {
        localStorage.setItem('wishes', JSON.stringify(this.wishes));
        localStorage.setItem('energyRecords', JSON.stringify(this.energyRecords));
    }

    // 绑定事件
    bindEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 许愿表单提交
        document.getElementById('wish-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createWish();
        });

        // 难度滑块
        document.getElementById('difficulty').addEventListener('input', (e) => {
            document.getElementById('difficulty-value').textContent = e.target.value;
        });

        // 注入能量表单提交
        document.getElementById('energy-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.injectEnergy();
        });

        // 模态框关闭
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // 日历导航
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // 使用说明按钮
        document.getElementById('instructions-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').style.display = 'block';
        });
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新激活的标签按钮
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');

        // 显示对应的内容区域
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 如果是日历标签，重新渲染
        if (tabName === 'calendar') {
            this.renderCalendar();
        }
    }

    // 创建愿望
    createWish() {
        const challenge = document.getElementById('challenge').value;
        const difficulty = parseInt(document.getElementById('difficulty').value);
        const goal = document.getElementById('goal').value;

        if (!challenge || !goal) {
            alert('请填写所有必填项');
            return;
        }

        const wish = {
            id: this.generateId(),
            challenge,
            difficulty,
            goal,
            currentEnergy: 0,
            fulfilled: false,
            createdAt: new Date().toISOString().split('T')[0]
        };

        this.wishes.push(wish);
        this.saveToLocalStorage();
        this.renderWishes();

        // 重置表单
        document.getElementById('wish-form').reset();
        document.getElementById('difficulty-value').textContent = '50';

        // 切换到愿望清单标签
        this.switchTab('wish-list');
    }

    // 注入能量
    injectEnergy() {
        const wishId = document.getElementById('wish-id').value;
        const effort = document.getElementById('energy-effort').value;

        if (!effort) {
            alert('请记录你的努力');
            return;
        }

        const energyRecord = {
            id: this.generateId(),
            wishId,
            effort,
            date: new Date().toISOString().split('T')[0]
        };

        this.energyRecords.push(energyRecord);

        // 更新愿望的能量值
        const wish = this.wishes.find(w => w.id === wishId);
        if (wish) {
            wish.currentEnergy += 1;
        }

        this.saveToLocalStorage();
        this.renderWishes();
        this.renderCalendar();

        // 关闭模态框并重置表单
        document.getElementById('energy-modal').style.display = 'none';
        document.getElementById('energy-form').reset();
    }

    // 还愿
    fulfillWish(wishId) {
        const wish = this.wishes.find(w => w.id === wishId);
        if (wish) {
            wish.fulfilled = true;
            this.saveToLocalStorage();
            this.renderWishes();
            this.renderCalendar();
        }
    }

    // 打开注入能量模态框
    openEnergyModal(wishId) {
        document.getElementById('wish-id').value = wishId;
        document.getElementById('energy-modal').style.display = 'block';
    }

    // 显示能量详情
    showEnergyDetails(date) {
        this.selectedDate = date;
        const recordsForDate = this.energyRecords.filter(record => record.date === date);
        
        const detailsContent = document.getElementById('details-content');
        detailsContent.innerHTML = '';
        
        if (recordsForDate.length === 0) {
            detailsContent.innerHTML = '<p>这一天没有能量注入记录</p>';
            return;
        }
        
        const dateObj = new Date(date);
        const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        detailsContent.innerHTML = `<h3>${formattedDate} 的能量记录</h3>`;
        
        recordsForDate.forEach(record => {
            const wish = this.wishes.find(w => w.id === record.wishId);
            if (wish) {
                const recordElement = document.createElement('div');
                recordElement.className = 'energy-record';
                recordElement.innerHTML = `
                    <div class="wish-name">${wish.goal}</div>
                    <div class="effort">${record.effort}</div>
                    <div class="date">${record.date}</div>
                `;
                detailsContent.appendChild(recordElement);
            }
        });
        
        document.getElementById('details-modal').style.display = 'block';
    }

    // 渲染愿望列表
    renderWishes() {
        const container = document.getElementById('wishes-container');
        
        if (this.wishes.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>还没有许愿哦，快去播种你的第一颗心愿种子吧！</p></div>';
            return;
        }
        
        // 分离未完成和已完成的愿望
        const pendingWishes = this.wishes.filter(wish => !wish.fulfilled);
        const fulfilledWishes = this.wishes.filter(wish => wish.fulfilled);
        
        let html = '';
        
        // 渲染未完成的愿望
        pendingWishes.forEach(wish => {
            html += this.createWishCard(wish);
        });
        
        // 渲染已完成的愿望
        if (fulfilledWishes.length > 0) {
            html += '<h3 style="grid-column: 1 / -1; margin-top: 30px; color: gold;">✨ 已达成的愿望</h3>';
            fulfilledWishes.forEach(wish => {
                html += this.createWishCard(wish);
            });
        }
        
        container.innerHTML = html;
        
        // 绑定卡片按钮事件
        this.bindWishCardEvents();
    }

    // 创建愿望卡片HTML
    createWishCard(wish) {
        const energyPercentage = Math.min(100, Math.round((wish.currentEnergy / wish.difficulty) * 100));
        
        return `
            <div class="wish-card ${wish.fulfilled ? 'fulfilled' : ''}" data-id="${wish.id}">
                <h3>${wish.goal}</h3>
                <p class="challenge">${wish.challenge}</p>
                <p class="goal">${wish.goal}</p>
                <div class="difficulty">
                    <span>困难程度: ${wish.difficulty}</span>
                    <span>当前能量: ${wish.currentEnergy}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${energyPercentage}%"></div>
                </div>
                <div class="progress-text">${energyPercentage}%</div>
                ${!wish.fulfilled ? `
                    <div class="card-buttons">
                        <button class="btn btn-inject" data-action="inject" data-id="${wish.id}">注入能量</button>
                        <button class="btn btn-fulfill" data-action="fulfill" data-id="${wish.id}">还愿</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 绑定愿望卡片事件
    bindWishCardEvents() {
        // 注入能量按钮
        document.querySelectorAll('.btn-inject').forEach(button => {
            button.addEventListener('click', (e) => {
                const wishId = e.target.dataset.id;
                this.openEnergyModal(wishId);
            });
        });
        
        // 还愿按钮
        document.querySelectorAll('.btn-fulfill').forEach(button => {
            button.addEventListener('click', (e) => {
                const wishId = e.target.dataset.id;
                if (confirm('确定要标记这个愿望为已达成吗？')) {
                    this.fulfillWish(wishId);
                }
            });
        });
    }

    // 渲染日历
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('current-month-year').textContent = `${year}年 ${monthNames[month]}`;
        
        // 获取月份信息
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // 获取上个月的信息
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // 生成日历日期
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // 添加上个月的日期
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarDays.innerHTML += `
                <div class="calendar-day other-month" data-date="${dateStr}">
                    ${day}
                </div>
            `;
        }
        
        // 添加当前月的日期
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEnergy = this.energyRecords.some(record => record.date === dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = this.selectedDate === dateStr;
            
            calendarDays.innerHTML += `
                <div class="calendar-day ${hasEnergy ? 'has-energy' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     data-date="${dateStr}">
                    ${day}
                </div>
            `;
        }
        
        // 添加下个月的日期以填满网格
        const totalCells = 42; // 6行7列
        const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            const nextMonth = month + 2 > 12 ? 1 : month + 2;
            const nextYear = month + 2 > 12 ? year + 1 : year;
            const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarDays.innerHTML += `
                <div class="calendar-day other-month" data-date="${dateStr}">
                    ${day}
                </div>
            `;
        }
        
        // 绑定日期点击事件
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                if (!e.currentTarget.classList.contains('other-month')) {
                    this.showEnergyDetails(date);
                }
            });
        });
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WishApp();
});