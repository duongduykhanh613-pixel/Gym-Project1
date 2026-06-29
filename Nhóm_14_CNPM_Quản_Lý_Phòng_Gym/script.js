// ==================== STORAGE CONFIGURATION ====================
const STORE = {
    USERS: 'gym_users_pro',
    MEMBERS: 'gym_members_pro',
    PLANS: 'gym_plans_pro',
    SUBS: 'gym_subs_pro',
    CHECKINS: 'gym_checkins_pro',
    TRAINERS: 'gym_trainers_pro',
    CURRENT_USER: 'gym_current_user'
};

function get(key, def=[]) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }
function set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Seed dữ liệu mặc định ban đầu bao gồm tài khoản Admin cố định
function seedData(){
    let users = get(STORE.USERS);
    const requiredAdmin = { id: 1, username: 'admin2006', email: 'admin@iron.com', password: 'trantien1234', role: 'admin' };
    
    if (users.length === 0) {
        set(STORE.USERS, [
            requiredAdmin,
            { id: 2, username: 'tienphong', email: 'staff@gym.com', password: '123456', role: 'user' },
            { id: 3, username: 'minhthu', email: 'subadmin@gym.com', password: '123456', role: 'sub-admin' }
        ]);
    } else {
        let adminIdx = users.findIndex(u => u.username === 'admin2006');
        if (adminIdx === -1) {
            users.push(requiredAdmin);
            set(STORE.USERS, users);
        } else if (users[adminIdx].password !== 'trantien1234' || users[adminIdx].role !== 'admin') {
            users[adminIdx].password = 'trantien1234';
            users[adminIdx].role = 'admin';
            set(STORE.USERS, users);
        }
    }

    if(get(STORE.PLANS).length===0){
        set(STORE.PLANS, [
            { id: 'P-101', name: '🔥 Gói Sắt Cơ Bản', price: 450000, type: 'time', days: 30, sessions: null },
            { id: 'P-102', name: '💪 Gói Thép Thượng Hạng', price: 1200000, type: 'time', days: 90, sessions: null },
            { id: 'P-103', name: '🥊 Gói KickBoxing 24 Buổi', price: 2500000, type: 'session', days: 180, sessions: 24 }
        ]);
    }
    if (get(STORE.TRAINERS).length === 0) {
        set(STORE.TRAINERS, [
            { 
                id: 'T-801', 
                name: 'Ricardo', 
                special: 'Cơ bắp & Siết mỡ', 
                phone: '0912345678', 
                status: 'active', 
                image: 'ricardo.jpg' 
            },
            { 
                id: 'T-802', 
                name: 'Homelander', 
                special: 'Kickboxing & Cardio', 
                phone: '0988887777', 
                status: 'busy', 
                image: 'homelander.jpg' 
            }
        ]);
    }
    if(get(STORE.MEMBERS).length===0){
        set(STORE.MEMBERS, [
            { id: 'M-1001', name: 'Trần Văn Hùng', phone: '0961234567', gender: 'Nam', type: '🔥 Gói Sắt Cơ Bản', status: 'active', joinDate: '2026-05-10', expireDate: '2026-06-10', remainingSessions: null },
            { id: 'M-1002', name: 'Hoàng Thu Thủy', phone: '0977654321', gender: 'Nữ', type: '🥊 Gói KickBoxing 24 Buổi', status: 'active', joinDate: '2026-05-15', expireDate: '2026-11-15', remainingSessions: 24 }
        ]);
    }
    if(get(STORE.SUBS).length===0){
        set(STORE.SUBS, [
            { id: 'SUB-10001', memberName: 'Trần Văn Hùng', planName: '🔥 Gói Sắt Cơ Bản', date: '2026-05-10', detail: '30 Ngày' },
            { id: 'SUB-10002', memberName: 'Hoàng Thu Thủy', planName: '🥊 Gói KickBoxing 24 Buổi', date: '2026-05-15', detail: '24 Buổi' }
        ]);
    }
}
seedData();

let currentUser = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');

const dom = {
    landing: document.getElementById('landingContainer'),
    auth: document.getElementById('authContainer'),
    dashboard: document.getElementById('dashboardContainer')
};

function showLanding() { if(dom.landing) dom.landing.style.display = 'block'; if(dom.auth) dom.auth.style.display = 'none'; if(dom.dashboard) dom.dashboard.style.display = 'none'; }
function showAuth() { if(dom.landing) dom.landing.style.display = 'none'; if(dom.auth) dom.auth.style.display = 'flex'; if(dom.dashboard) dom.dashboard.style.display = 'none'; }

function showDashboardApp() {
    if(dom.landing) dom.landing.style.display = 'none';
    if(dom.auth) dom.auth.style.display = 'none';
    if(dom.dashboard) dom.dashboard.style.display = 'flex';
    
    // Quản lý hiển thị thanh Menu chuyển đổi nhanh dựa vào cấp bậc tài khoản
    const adminNav = document.getElementById('adminPanelNav');
    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));
    
    if(adminNav) adminNav.style.display = isPowerAdmin ? 'flex' : 'none';
    
    const statsNavItem = document.querySelector('.nav-menu .nav-item[data-view="stats"]');
    if(statsNavItem) {
        statsNavItem.style.display = isPowerAdmin ? 'flex' : 'none';
    }
    
    switchView('dashboard');
}

document.getElementById('navLoginBtn')?.addEventListener('click', showAuth);
document.getElementById('backToHomeBtn')?.addEventListener('click', showLanding);

document.getElementById('loginBtn')?.addEventListener('click', () => {
    let user = document.getElementById('loginUser').value.trim();
    let pass = document.getElementById('loginPass').value.trim();
    if(!user || !pass) return alert('Vui lòng điền đầy đủ thông tin!');
    
    let users = get(STORE.USERS);
    let matched = users.find(u => u.username === user && u.password === pass);
    
    if(matched) {
        currentUser = { id: matched.id, username: matched.username, role: matched.role };
        localStorage.setItem(STORE.CURRENT_USER, JSON.stringify(currentUser));
        showDashboardApp();
    } else {
        alert('Sai thông tin tài khoản hoặc mật khẩu!');
    }
});

document.getElementById('adminQuickBtn')?.addEventListener('click', () => {
    document.getElementById('loginUser').value = 'admin2006';
    document.getElementById('loginPass').value = 'trantien1234';
    currentUser = { id: 1, username: 'admin2006', role: 'admin' };
    localStorage.setItem(STORE.CURRENT_USER, JSON.stringify(currentUser));
    alert('Đăng nhập thành công với quyền Admin tối cao!');
    showDashboardApp();
});

document.getElementById('registerBtn')?.addEventListener('click', () => {
    let uname = document.getElementById('regUser').value.trim();
    let email = document.getElementById('regEmail').value.trim();
    let pwd = document.getElementById('regPass').value.trim();
    if(!uname || !email || !pwd) return alert('Vui lòng điền đầy đủ thông tin!');
    
    let users = get(STORE.USERS);
    if(users.find(u => u.username === uname)) return alert('Tên tài khoản đã tồn tại!');
    
    users.push({ id: Date.now(), username: uname, email: email, password: pwd, role: 'user' });
    set(STORE.USERS, users);
    alert('Đăng ký thành công tài khoản Nhân viên mới! Hãy thực hiện đăng nhập.');
    document.getElementById('toLogin').click();
});

document.getElementById('toRegister')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginCard').style.display = 'none'; document.getElementById('registerCard').style.display = 'block'; });
document.getElementById('toLogin')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginCard').style.display = 'block'; document.getElementById('registerCard').style.display = 'none'; });

function logoutProcess(){
    currentUser = null;
    localStorage.removeItem(STORE.CURRENT_USER);
    showLanding();
}
document.getElementById('logoutTop')?.addEventListener('click', logoutProcess);
document.getElementById('logoutSide')?.addEventListener('click', logoutProcess);


// ==================== CORE SWITCH VIEW FUNCTION ====================
function switchView(viewName) {
    const isSysAdmin = (currentUser && currentUser.role === 'admin');
    const isSubAdmin = (currentUser && currentUser.role === 'sub-admin');
    const isUser = (currentUser && currentUser.role === 'user');

    // Chặn bảo vệ dữ liệu nhạy cảm nếu nhân viên thường truy cập URL ảo
    if((viewName === 'stats' || viewName === 'admin') && isUser) {
        alert('Tài khoản của bạn không có đặc quyền truy cập khu vực quản trị tối cao!');
        switchView('dashboard');
        return;
    }

    document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
    let activeItem = document.querySelector(`.nav-menu .nav-item[data-view="${viewName}"]`);
    if(activeItem) activeItem.classList.add('active');
    
    const titleEl = document.getElementById('dynamicTitle');
    const contentEl = document.getElementById('viewContent');
    if(!titleEl || !contentEl) return;
    
    // --- VIEW: DASHBOARD ---
    if(viewName === 'dashboard') {
        let roleName = "Nhân viên Lễ tân";
        if(isSysAdmin) roleName = "Quản trị viên tối cao 👑";
        if(isSubAdmin) roleName = "Admin phụ (Quản lý vùng)";

        titleEl.innerText = 'BẢNG ĐIỀU KHIỂN CHUNG';
        contentEl.innerHTML = `
            <div class="metric-grid">
                <div class="card-metric"><div class="icon-box"><i class="fas fa-users"></i></div><div class="info"><h3>Hội viên hoạt động</h3><p>${get(STORE.MEMBERS).length}</p></div></div>
                <div class="card-metric"><div class="icon-box"><i class="fas fa-tag"></i></div><div class="info"><h3>Gói tập hiện có</h3><p>${get(STORE.PLANS).length}</p></div></div>
                <div class="card-metric"><div class="icon-box"><i class="fas fa-fist-raised"></i></div><div class="info"><h3>Check-in hôm nay</h3><p>${get(STORE.CHECKINS).length}</p></div></div>
            </div>
            <div style="background:#0f0f0f; padding:2rem; border-radius:1rem; border:1px solid #222; margin-top: 2rem;">
                <h3 style="color:var(--primary-red); font-family:'Orbitron'; font-size:1.1rem;"><i class="fas fa-id-badge"></i> THÔNG TIN PHIÊN LÀM VIỆC</h3>
                <p style="color:#aaa; margin-top:1rem; line-height:1.6;">
                    Tài khoản: <strong style="color:#fff;">${currentUser ? currentUser.username : ''}</strong> <br>
                    Cấp bậc phân quyền: <span style="color:var(--gold-red); font-weight:bold;">${roleName}</span>
                </p>
                <div style="margin-top:15px; border-top:1px solid #222; padding-top:15px; color:#666; font-size:0.85rem;">
                    <i class="fas fa-info-circle"></i> ${isUser ? 'Giao diện đã được tối ưu hóa chuẩn cho Nhân viên Vận hành phòng máy.' : 'Mọi nhật ký tác vụ thay đổi phân bổ vị trí đều được ghi nhận tự động.'}
                </div>
            </div>
        `;
    } 
    // --- VIEW: MEMBERS ---
    else if(viewName === 'members') {
        titleEl.innerText = 'QUẢN LÝ HỘI VIÊN';
        let members = get(STORE.MEMBERS);
        
        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 15px; flex-wrap: wrap;">
                    <div style="position: relative; flex: 1; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                        <input type="text" id="memberSearch" placeholder="Tìm kiếm nhanh hội viên..." style="width: 100%; background: #111; border: 1px solid #222; padding: 12px 12px 12px 45px; border-radius: 8px; color: #fff; outline: none;">
                    </div>
                    <button id="openAddMemberModal" class="btn-sm" style="padding: 12px 25px; font-weight: 600; border-radius: 8px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-user-plus"></i> Thêm Hội Viên Mới</button>
                </div>

                <div id="addMemberBlock" style="display: none; background: #0f0f0f; border: 1px solid #222; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--primary-red);"><i class="fas fa-plus-circle"></i> ĐĂNG KÝ HỘI VIÊN MỚI</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Họ và tên *</label>
                            <input type="text" id="newMemName" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Số điện thoại *</label>
                            <input type="text" id="newMemPhone" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Giới tính</label>
                            <select id="newMemGender" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Hạng Thẻ Đầu Vào</label>
                            <select id="newMemType" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="Chưa đăng ký">Chưa đăng ký gói</option>
                                ${get(STORE.PLANS).map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelAddMember" style="background:#222; border:none; color:#ccc; padding:10px 20px; border-radius:6px; cursor:pointer;">Hủy</button>
                        <button id="saveMemberBtn" class="btn-sm" style="padding:10px 25px; border-radius:6px;">Lưu Dữ Liệu</button>
                    </div>
                </div>

                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã Số</th><th>Họ Và Tên</th><th>Số Điện Thoại</th><th>Giới Tính</th><th>Hạng Thẻ</th><th>Ngày Tham Gia</th><th>Trạng Thái</th><th style="text-align: center;">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody id="memberTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderMemberTable(members);
        
        document.getElementById('openAddMemberModal').addEventListener('click', () => {
            let block = document.getElementById('addMemberBlock');
            block.style.display = block.style.display === 'none' ? 'block' : 'none';
        });
        document.getElementById('cancelAddMember').addEventListener('click', () => { document.getElementById('addMemberBlock').style.display = 'none'; });

        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            let name = document.getElementById('newMemName').value.trim();
            let phone = document.getElementById('newMemPhone').value.trim();
            let gender = document.getElementById('newMemGender').value;
            let type = document.getElementById('newMemType').value;

            if(!name || !phone) return alert('Hãy nhập tên và số điện thoại hội viên!');

            let list = get(STORE.MEMBERS);
            let id = 'M-' + Math.floor(1000 + Math.random() * 9000);
            let isNoPack = (type === 'Chưa đăng ký');
            let selectedPlan = get(STORE.PLANS).find(p => p.name === type);

            list.unshift({ 
                id, name, phone, gender, type, 
                status: isNoPack ? 'expired' : 'active', 
                joinDate: new Date().toISOString().split('T')[0],
                expireDate: isNoPack ? null : new Date(Date.now() + (selectedPlan ? selectedPlan.days : 30)*24*60*60*1000).toISOString().split('T')[0],
                remainingSessions: selectedPlan ? selectedPlan.sessions : null
            });
            set(STORE.MEMBERS, list);
            
            alert('Thêm mới dữ liệu khách hàng thành công!');
            switchView('members');
        });

        document.getElementById('memberSearch').addEventListener('input', function() {
            let kw = this.value.toLowerCase().trim();
            let filtered = get(STORE.MEMBERS).filter(m => m.id.toLowerCase().includes(kw) || m.name.toLowerCase().includes(kw) || m.phone.includes(kw));
            renderMemberTable(filtered);
        });
    }
    // --- VIEW: PACKAGES ---
    else if(viewName === 'packages') {
        titleEl.innerText = 'DANH MỤC GÓI TẬP DỊCH VỤ';
        let plans = get(STORE.PLANS);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 15px; flex-wrap: wrap;">
                    <div style="position: relative; flex: 1; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                        <input type="text" id="planSearch" placeholder="Tìm nhanh gói tập dịch vụ..." style="width: 100%; background: #111; border: 1px solid #222; padding: 12px 12px 12px 45px; border-radius: 8px; color: #fff; outline: none;">
                    </div>
                    <button id="openAddPlanModal" class="btn-sm" style="padding: 12px 25px; font-weight: 600; border-radius: 8px; display: ${isUser ? 'none' : 'flex'}; align-items: center; gap: 8px;">
                        <i class="fas fa-plus-square"></i> Cấu Hình Gói Mới
                    </button>
                </div>

                <div id="addPlanBlock" style="display: none; background: #0f0f0f; border: 1px solid #222; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--primary-red);"><i class="fas fa-sliders-h"></i> THIẾT LẬP THÔNG SỐ GÓI</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Tên gói tập *</label>
                            <input type="text" id="newPlanName" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Giá tiền (VND) *</label>
                            <input type="number" id="newPlanPrice" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Loại hình gói</label>
                            <select id="newPlanType" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="time">Theo Thời Gian (Ngày)</option>
                                <option value="session">Theo Lượt / Số Buổi</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Hạn dùng (Ngày) *</label>
                            <input type="number" id="newPlanDays" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div id="sessionCountWrapper" style="display: none;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Số buổi chỉ định *</label>
                            <input type="number" id="newPlanSessions" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelAddPlan" style="background:#222; border:none; color:#ccc; padding:10px 20px; border-radius:6px; cursor:pointer;">Hủy</button>
                        <button id="savePlanBtn" class="btn-sm" style="padding:10px 25px; border-radius:6px;">Lưu Gói</button>
                    </div>
                </div>

                <div class="packages-grid" id="packagesGridBody"></div>
            </div>
        `;

        renderPackagesGrid(plans);

        if (!isUser) {
            document.getElementById('newPlanType').addEventListener('change', function() {
                document.getElementById('sessionCountWrapper').style.display = this.value === 'session' ? 'block' : 'none';
            });
            document.getElementById('openAddPlanModal').addEventListener('click', () => {
                let block = document.getElementById('addPlanBlock'); block.style.display = block.style.display === 'none' ? 'block' : 'none';
            });
            document.getElementById('cancelAddPlan').addEventListener('click', () => { document.getElementById('addPlanBlock').style.display = 'none'; });
            document.getElementById('savePlanBtn').addEventListener('click', () => {
                let name = document.getElementById('newPlanName').value.trim();
                let price = parseFloat(document.getElementById('newPlanPrice').value);
                let type = document.getElementById('newPlanType').value;
                let days = parseInt(document.getElementById('newPlanDays').value);
                let sessions = parseInt(document.getElementById('newPlanSessions').value) || null;

                if(!name || isNaN(price) || isNaN(days)) return alert('Vui lòng nhập đầy đủ thông tin!');

                let currentPlans = get(STORE.PLANS);
                currentPlans.push({ id: 'P-' + Math.floor(100 + Math.random() * 900), name, price, type, days, sessions: type === 'session' ? sessions : null });
                set(STORE.PLANS, currentPlans);
                alert('Tạo cấu hình gói thành công!');
                switchView('packages');
            });
        }

        document.getElementById('planSearch').addEventListener('input', function() {
            let kw = this.value.toLowerCase().trim();
            let filtered = get(STORE.PLANS).filter(p => p.name.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw));
            renderPackagesGrid(filtered);
        });
    }
    // --- VIEW: SUBSCRIPTIONS ---
    else if(viewName === 'subscriptions') {
        titleEl.innerText = 'ĐĂNG KÝ GÓI TẬP DỊCH VỤ';
        let members = get(STORE.MEMBERS);
        let plans = get(STORE.PLANS);
        let subs = get(STORE.SUBS);

        contentEl.innerHTML = `
            <div class="fade-up" style="display:grid; grid-template-columns: 1fr 1.8fr; gap:25px; align-items:start;">
                <div style="background:#0f0f0f; border:1px solid #222; padding:25px; border-radius:12px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:1.5rem;"><i class="fas fa-file-invoice-dollar"></i> KÍCH HOẠT GÓI THẺ</h3>
                    <div style="margin-bottom:12px;">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:5px;">1. Chọn hội viên *</label>
                        <select id="subMemberId" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px; outline:none;">
                            <option value="">-- Chọn hội viên --</option>
                            ${members.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:5px;">2. Chọn gói tập *</label>
                        <select id="subPlanId" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px; outline:none;">
                            <option value="">-- Chọn gói dịch vụ --</option>
                            ${plans.map(p => `<option value="${p.id}">${p.name} (${new Intl.NumberFormat('vi-VN').format(p.price)}đ)</option>`).join('')}
                        </select>
                    </div>
                    <button id="submitSubscriptionBtn" class="btn-sm" style="width:100%; padding:12px; font-weight:600; border-radius:6px;">Xác nhận kích hoạt</button>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.85rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-history" style="color:var(--primary-red);"></i> LỊCH SỬ THU NGÂN / ĐĂNG KÝ GÓI
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th><th>Hội viên</th><th>Gói tập áp dụng</th><th>Ngày đăng ký</th><th>Hạn sử dụng</th>
                            </tr>
                        </thead>
                        <tbody id="subTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderSubscriptionsTable(subs);

        document.getElementById('submitSubscriptionBtn').addEventListener('click', () => {
            let mId = document.getElementById('subMemberId').value;
            let pId = document.getElementById('subPlanId').value;
            if(!mId || !pId) return alert('Vui lòng chọn đầy đủ thông tin hội viên và gói tập!');

            let allM = get(STORE.MEMBERS);
            let allP = get(STORE.PLANS);
            let targetM = allM.find(m => m.id === mId);
            let targetP = allP.find(p => p.id === pId);

            targetM.type = targetP.name;
            targetM.status = 'active';
            let exp = new Date();
            exp.setDate(exp.getDate() + targetP.days);
            targetM.expireDate = exp.toISOString().split('T')[0];
            targetM.remainingSessions = targetP.sessions; 

            let currentSubs = get(STORE.SUBS);
            currentSubs.unshift({
                id: 'SUB-' + Math.floor(10000 + Math.random() * 90000),
                memberName: targetM.name,
                planName: targetP.name,
                date: new Date().toISOString().split('T')[0],
                detail: targetP.type === 'time' ? `${targetP.days} Ngày` : `${targetP.sessions} Buổi`
            });

            set(STORE.MEMBERS, allM);
            set(STORE.SUBS, currentSubs);
            alert(`Đã gia hạn/đăng ký thành công gói cho hội viên ${targetM.name}!`);
            switchView('subscriptions');
        });
    }
    // --- VIEW: CHECKINS ---
    else if(viewName === 'checkins') {
        titleEl.innerText = 'CỔNG QUÉT THẺ CHECK-IN HỘI VIÊN';
        let checkinsList = get(STORE.CHECKINS);

        contentEl.innerHTML = `
            <div class="fade-up checkin-container" style="display:grid; grid-template-columns: 1fr 1.5fr; gap:25px; align-items:start;">
                <div class="quick-search-box" style="background:#0f0f0f; border:1px solid #222; padding:25px; border-radius:12px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:1rem;"><i class="fas fa-qrcode"></i> QUÉT MÃ VÀO CỬA TỰ ĐỘNG</h3>
                    <input type="text" id="checkinInput" placeholder="Nhập mã thẻ hội viên..." style="width:100%; background:#161616; border:1px solid #333; padding:12px; border-radius:8px; color:#fff; outline:none; font-family:'Orbitron'; letter-spacing:1px; text-transform:uppercase;">
                    <button id="triggerCheckinBtn" class="btn-sm" style="width:100%; padding:12px; font-weight:600; margin-top:12px;"><i class="fas fa-sign-in-alt"></i> Duyệt Check-in</button>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.9rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-history"></i> NHẬT KÝ ĐÓN KHÁCH TRONG NGÀY
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Thời gian</th><th>Mã Số</th><th>Họ tên</th><th>Gói tập</th><th>Ghi chú trạng thái</th>
                            </tr>
                        </thead>
                        <tbody id="checkinTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        renderCheckinsTable(checkinsList);

        document.getElementById('triggerCheckinBtn').addEventListener('click', () => {
            let inputCode = document.getElementById('checkinInput').value.trim().toUpperCase();
            if(!inputCode) return alert('Vui lòng nhập mã số hội viên!');

            let allM = get(STORE.MEMBERS);
            let targetM = allM.find(m => m.id.toUpperCase() === inputCode);

            if(!targetM) return alert('Không tìm thấy mã số hội viên này!');
            if(targetM.status === 'expired' || targetM.type === 'Chưa đăng ký') return alert('Thẻ hội viên đã hết hiệu lực tập luyện!');

            let note = 'Thẻ hợp lệ';
            if(targetM.remainingSessions !== undefined && targetM.remainingSessions !== null) {
                if(targetM.remainingSessions <= 0) return alert('Hội viên đã dùng hết số buổi tập!');
                targetM.remainingSessions -= 1;
                note = `Trừ 1 lượt PT (Còn lại: ${targetM.remainingSessions})`;
                if(targetM.remainingSessions === 0) targetM.status = 'expired';
            }

            let now = new Date();
            let timeStr = now.toTimeString().split(' ')[0] + ' ' + now.toISOString().split('T')[0];
            let currentLogs = get(STORE.CHECKINS);
            currentLogs.unshift({ time: timeStr, id: targetM.id, name: targetM.name, plan: targetM.type, note });

            set(STORE.MEMBERS, allM);
            set(STORE.CHECKINS, currentLogs);
            alert(`Chào mừng hội viên ${targetM.name} đến phòng tập!`);
            switchView('checkins');
        });
    }
    // --- VIEW: TRAINERS ---
    else if(viewName === 'trainers') {
        titleEl.innerText = 'ĐỘI NGŨ HUẤN LUYỆN VIÊN (PT)';
        contentEl.innerHTML = `<div class="trainers-grid" id="trainersGridBody" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;"></div>`;
        renderTrainersGrid(get(STORE.TRAINERS));
    }
    // --- VIEW: STATS (DÀNH CHO ADMIN PHỤ VÀ ADMIN TỐI CAO) ---
    else if(viewName === 'stats' && !isUser) {
        titleEl.innerText = 'THỐNG KÊ DOANH THU & CHỈ SỐ KINH DOANH';
        let subs = get(STORE.SUBS);
        let plans = get(STORE.PLANS);
        let totalRevenue = subs.reduce((sum, s) => sum + ((plans.find(p => p.name === s.planName))?.price || 0), 0);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div class="metric-grid">
                    <div class="card-metric" style="border-left: 4px solid #48bb78;">
                        <div class="info"><h3>Tổng Doanh Thu Phòng</h3><p style="color:#48bb78;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</p></div>
                    </div>
                    <div class="card-metric" style="border-left: 4px solid #3182ce;">
                        <div class="info"><h3>Tổng Đơn Đã Thu</h3><p>${subs.length} đơn</p></div>
                    </div>
                </div>
                <div style="background:#0f0f0f; border:1px solid #222; border-radius:12px; padding:25px; margin-top:20px;">
                    <h4 style="font-family:'Orbitron'; font-size:0.9rem; margin-bottom:15px;"><i class="fas fa-chart-line"></i> BIỂU ĐỒ TRỰC QUAN</h4>
                    <div style="height:250px; position:relative;"><canvas id="revenueChart"></canvas></div>
                </div>
            </div>
        `;
        setTimeout(() => {
            let planMap = {}; plans.forEach(p => planMap[p.name] = 0);
            subs.forEach(s => { if(planMap[s.planName] !== undefined) planMap[s.planName] += (plans.find(p => p.name === s.planName))?.price || 0; });
            const ctx = document.getElementById('revenueChart')?.getContext('2d');
            // Kiểm tra thư viện Chart trước khi vẽ tránh crash app
            if(ctx && typeof Chart !== 'undefined') {
                new Chart(ctx, {
                    type: 'bar',
                    data: { labels: Object.keys(planMap), datasets: [{ label: 'Doanh thu (VND)', data: Object.values(planMap), backgroundColor: '#e11d2c' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }, 50);
    }
    // --- VIEW: ADMIN PANEL (TIẾN TRÌNH CẢI TIẾN CAO CẤP TỐI CAO) ---
    else if(viewName === 'admin' && !isUser) {
        titleEl.innerText = 'KHUNG QUẢN TRỊ ADMIN PANEL TỐI CAO';
        let users = get(STORE.USERS);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="background: #0f0f0f; border:1px solid #222; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:10px;"><i class="fas fa-users-cog"></i> PHÂN BỔ VÀ ỦY QUYỀN ADMIN PHỤ</h3>
                    <p style="color:#aaa; font-size:0.85rem; margin-bottom:20px;">
                        Chức năng độc quyền dành cho <strong>Quản trị viên tối cao</strong> để nâng quyền hoặc hạ quyền nhân sự trong chuỗi phòng tập.
                    </p>
                    
                    <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; background:#141414; padding:15px; border-radius:8px; border:1px solid #222;">
                        <div style="flex:1; min-width:200px;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">1. Chọn Thành Viên / Nhân Viên</label>
                            <select id="allocUserSelect" style="width:100%; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="">-- Chọn tài khoản nhân sự --</option>
                                ${users.filter(u => u.username !== 'admin2006').map(u => `<option value="${u.id}">${u.username} (Chức vụ hiện tại: ${u.role})</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:180px;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">2. Chỉ Định Vai Trò Quyền Hạn Mới</label>
                            <select id="allocRoleSelect" style="width:100%; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="sub-admin">Admin Phụ (Sub-Admin / Quản lý vụ)</option>
                                <option value="user">User (Nhân Viên Lễ Tân thường)</option>
                            </select>
                        </div>
                        <button id="saveAllocationBtn" class="btn-sm" style="padding:11px 25px; border-radius:6px; font-weight:600;"><i class="fas fa-user-shield"></i> Cập Nhật Ủy Quyền</button>
                    </div>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.85rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-list"></i> DANH SÁCH NHÂN SỰ TOÀN HỆ THỐNG
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID Nhân Sự</th><th>Tên Tài Khoản (Username)</th><th>Email Liên Hệ</th><th>Quyền Hạn Hiện Tại</th><th>Mật Khẩu Thô</th>
                            </tr>
                        </thead>
                        <tbody id="adminUserTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderAdminUserTable(users);

        document.getElementById('saveAllocationBtn').addEventListener('click', () => {
            // Ràng buộc bảo mật tối cao: Chỉ duy nhất tài khoản cố định admin2006 mới được đổi quyền nhân sự
            if(currentUser.username !== 'admin2006') {
                return alert('Từ chối thao tác: Chỉ có duy nhất Admin Tối Cao Thượng Cấp (admin2006) mới có quyền phân bổ Admin phụ!');
            }

            let uId = parseInt(document.getElementById('allocUserSelect').value);
            let newRole = document.getElementById('allocRoleSelect').value;

            if(!uId) return alert('Vui lòng chọn 1 thành viên nhân sự cần phân bổ!');

            let allUsers = get(STORE.USERS);
            let targetIdx = allUsers.findIndex(u => u.id === uId);

            if(targetIdx !== -1) {
                allUsers[targetIdx].role = newRole;
                set(STORE.USERS, allUsers);
                alert(`Đã phân bổ thành công tài khoản "${allUsers[targetIdx].username}" sang quyền chức vụ: ${newRole.toUpperCase()}`);
                switchView('admin');
            }
        });
    }
}

// ==================== RENDERING SUB-FUNCTIONS ====================
function renderAdminUserTable(usersArray) {
    const tbody = document.getElementById('adminUserTableBody');
    if(!tbody) return;
    tbody.innerHTML = usersArray.map(u => {
        let roleBadge = "";
        if(u.role === 'admin') roleBadge = `<span style="background:rgba(225,29,44,0.2); color:#ff3b3f; padding:3px 10px; border-radius:4px; font-weight:bold;">Tối Cao (Admin)</span>`;
        else if(u.role === 'sub-admin') roleBadge = `<span style="background:rgba(212,175,55,0.2); color:#d4af37; padding:3px 10px; border-radius:4px; font-weight:bold;">Admin Phụ</span>`;
        else roleBadge = `<span style="background:#222; color:#aaa; padding:3px 10px; border-radius:4px;">Nhân Viên Thường</span>`;

        return `
            <tr>
                <td style="font-family:'Orbitron'; font-size:0.8rem;">${u.id}</td>
                <td style="font-weight:600; color:#fff;">${u.username}</td>
                <td>${u.email}</td><td>${roleBadge}</td>
                <td style="font-family:'Courier New'; color:#666;">${u.password}</td>
            </tr>
        `;
    }).join('');
}

function renderMemberTable(dataArray) {
    const tbody = document.getElementById('memberTableBody');
    if(!tbody) return;
    if(dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#666; padding: 2rem;">Không tìm thấy dữ liệu hội viên.</td></tr>`;
        return;
    }

    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));

    tbody.innerHTML = dataArray.map(m => {
        let statusBadge = m.status === 'active' 
            ? `<span style="background: rgba(56, 161, 105, 0.15); color: #38a169; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight:600;">Đang hoạt động</span>`
            : `<span style="background: rgba(225, 29, 44, 0.15); color: #ff3b3f; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight:600;">Hết hạn/Chưa gói</span>`;
        
        let actionsHtml = "";
        if(isPowerAdmin) {
            actionsHtml = `
                <button class="action-icon" onclick="deleteMember('${m.id}')" style="background:none; border:none; cursor:pointer;" title="Xóa hội viên"><i class="fas fa-trash-alt" style="color:#ff3b3f;"></i></button>
                <button class="action-icon" onclick="alert('Tính năng chỉnh sửa thông số đang kết nối cơ sở dữ liệu...')" style="background:none; border:none; cursor:pointer; margin-left:8px;" title="Sửa thông tin"><i class="fas fa-edit" style="color:#3182ce;"></i></button>
            `;
        } else {
            actionsHtml = `<button onclick="alert('Yêu cầu điều chỉnh thông tin khách hàng ${m.id} đã gửi lên Ban quản lý Admin duyệt!')" style="background:#161616; border:1px solid #333; color:#aaa; font-size:0.75rem; padding:4px 8px; border-radius:4px; cursor:pointer;"><i class="fas fa-paper-plane"></i> Gửi yêu cầu sửa</button>`;
        }

        return `
            <tr>
                <td style="font-family:'Orbitron'; font-weight:700; color:#ff6b6b;">${m.id}</td>
                <td style="font-weight:600; color:#fff;">${m.name}</td>
                <td>${m.phone}</td><td>${m.gender}</td><td>${m.type}</td>
                <td>${m.joinDate}</td><td>${statusBadge}</td>
                <td style="text-align:center;">${actionsHtml}</td>
            </tr>
        `;
    }).join('');
}

function renderPackagesGrid(dataArray) {
    const gridBody = document.getElementById('packagesGridBody');
    if(!gridBody) return;
    if(dataArray.length === 0) {
        gridBody.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#666; padding:3rem;">Không tìm thấy gói tập dịch vụ nào.</div>`;
        return;
    }

    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));

    gridBody.innerHTML = dataArray.map(p => {
        let formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        let detailLine = p.type === 'time' ? `Thời gian: ${p.days} Ngày` : `Số buổi: ${p.sessions} lượt`;
        let deleteBtnHtml = isPowerAdmin ? `<button onclick="deletePackage('${p.id}')" style="background:none; border:none; color:#ff3b3f; cursor:pointer;"><i class="fas fa-trash-alt"></i> Xóa gói</button>` : '';

        return `
            <div class="package-item-card">
                <div>
                    <div class="pack-header">
                        <div class="pack-icon"><i class="fas fa-dumbbell"></i></div>
                        <div class="pack-badge" style="font-size: 0.65rem;">${p.id}</div>
                    </div>
                    <h4>${p.name}</h4>
                    <div class="pack-price" style="font-size:1.3rem; margin:10px 0;">${formattedPrice}</div>
                    <p style="font-size:0.8rem; color:#aaa;">${detailLine}</p>
                </div>
                <div style="margin-top:15px; display:flex; justify-content:flex-end; font-size:0.8rem;">
                    ${deleteBtnHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderTrainersGrid(trainersArray) {
    const target = document.getElementById('trainersGridBody');
    if(!target) return;
    target.innerHTML = trainersArray.map(t => {
        const defaultAvatar = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500';
        const avatar = t.image || defaultAvatar;
        return `
            <div class="trainer-card" style="background: #0f0f0f; border: 1px solid #222; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow: hidden;">
                <div style="width: 100%; height: 230px; overflow: hidden; border-radius: 8px; border: 1px solid #222; background: #111;">
                    <img src="${avatar}" alt="PT ${t.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div>
                    <h4 style="color:#fff; font-size:1.15rem; margin-bottom:6px; font-family:'Orbitron', sans-serif;">PT: ${t.name}</h4>
                    <div style="color:var(--primary-red); font-size:0.85rem; font-weight:600; margin-bottom:10px;">
                        <i class="fas fa-star" style="margin-right: 4px;"></i>Chuyên môn: ${t.special}
                    </div>
                    <div style="font-size:0.85rem; color:#888;">
                        <i class="fas fa-phone-alt" style="margin-right: 6px;"></i>Liên hệ: ${t.phone}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSubscriptionsTable(subsArray) {
    const tbody = document.getElementById('subTableBody');
    if(!tbody) return;
    tbody.innerHTML = subsArray.map(s => `
        <tr>
            <td style="font-family:'Orbitron'; font-size:0.8rem; color:#aaa;">${s.id}</td>
            <td style="font-weight:600; color:#fff;">${s.memberName}</td>
            <td><span style="color:var(--primary-red);">${s.planName}</span></td>
            <td>${s.date}</td><td>${s.detail}</td>
        </tr>
    `).join('');
}

function renderCheckinsTable(logsArray) {
    const tbody = document.getElementById('checkinTableBody');
    if(!tbody) return;
    tbody.innerHTML = logsArray.map(l => `
        <tr>
            <td style="color:#888; font-family:'Orbitron'; font-size:0.8rem;">${l.time}</td>
            <td style="font-family:'Orbitron'; font-weight:bold; color:var(--primary-red);">${l.id}</td>
            <td style="color:#fff; font-weight:600;">${l.name}</td><td>${l.plan}</td><td>${l.note}</td>
        </tr>
    `).join('');
}

// ==================== PRIVILEGE ACTIONS DELETES ====================
window.deletePackage = function(planId) {
    let userSession = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');
    if(!userSession || userSession.role === 'user') return alert('Bạn không có quyền thực hiện chức năng xóa!');
    if(confirm(`Xóa vĩnh viễn gói tập dịch vụ ${planId}?`)) {
        let list = get(STORE.PLANS).filter(p => p.id !== planId);
        set(STORE.PLANS, list); switchView('packages');
    }
};

window.deleteMember = function(memberId) {
    let userSession = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');
    if(!userSession || userSession.role === 'user') return alert('Bạn không có quyền thực hiện chức năng xóa hội viên!');
    if(confirm(`Xóa vĩnh viễn hội viên ${memberId}?`)) {
        let list = get(STORE.MEMBERS).filter(m => m.id !== memberId);
        set(STORE.MEMBERS, list); switchView('members');// ==================== STORAGE CONFIGURATION ====================
const STORE = {
    USERS: 'gym_users_pro',
    MEMBERS: 'gym_members_pro',
    PLANS: 'gym_plans_pro',
    SUBS: 'gym_subs_pro',
    CHECKINS: 'gym_checkins_pro',
    TRAINERS: 'gym_trainers_pro',
    CURRENT_USER: 'gym_current_user'
};

function get(key, def=[]) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }
function set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Seed dữ liệu mặc định ban đầu bao gồm tài khoản Admin cố định
function seedData(){
    let users = get(STORE.USERS);
    const requiredAdmin = { id: 1, username: 'admin2006', email: 'admin@iron.com', password: 'trantien1234', role: 'admin' };
    
    if (users.length === 0) {
        set(STORE.USERS, [
            requiredAdmin,
            { id: 2, username: 'tienphong', email: 'staff@gym.com', password: '123456', role: 'user' },
            { id: 3, username: 'minhthu', email: 'subadmin@gym.com', password: '123456', role: 'sub-admin' }
        ]);
    } else {
        let adminIdx = users.findIndex(u => u.username === 'admin2006');
        if (adminIdx === -1) {
            users.push(requiredAdmin);
            set(STORE.USERS, users);
        } else if (users[adminIdx].password !== 'trantien1234' || users[adminIdx].role !== 'admin') {
            users[adminIdx].password = 'trantien1234';
            users[adminIdx].role = 'admin';
            set(STORE.USERS, users);
        }
    }

    if(get(STORE.PLANS).length===0){
        set(STORE.PLANS, [
            { id: 'P-101', name: '🔥 Gói Sắt Cơ Bản', price: 450000, type: 'time', days: 30, sessions: null },
            { id: 'P-102', name: '💪 Gói Thép Thượng Hạng', price: 1200000, type: 'time', days: 90, sessions: null },
            { id: 'P-103', name: '🥊 Gói KickBoxing 24 Buổi', price: 2500000, type: 'session', days: 180, sessions: 24 }
        ]);
    }
    if (get(STORE.TRAINERS).length === 0) {
        set(STORE.TRAINERS, [
            { 
                id: 'T-801', 
                name: 'Ricardo', 
                special: 'Cơ bắp & Siết mỡ', 
                phone: '0912345678', 
                status: 'active', 
                image: 'ricardo.jpg' 
            },
            { 
                id: 'T-802', 
                name: 'Homelander', 
                special: 'Kickboxing & Cardio', 
                phone: '0988887777', 
                status: 'busy', 
                image: 'homelander.jpg' 
            }
        ]);
    }
    if(get(STORE.MEMBERS).length===0){
        set(STORE.MEMBERS, [
            { id: 'M-1001', name: 'Trần Văn Hùng', phone: '0961234567', gender: 'Nam', type: '🔥 Gói Sắt Cơ Bản', status: 'active', joinDate: '2026-05-10', expireDate: '2026-06-10', remainingSessions: null },
            { id: 'M-1002', name: 'Hoàng Thu Thủy', phone: '0977654321', gender: 'Nữ', type: '🥊 Gói KickBoxing 24 Buổi', status: 'active', joinDate: '2026-05-15', expireDate: '2026-11-15', remainingSessions: 24 }
        ]);
    }
    if(get(STORE.SUBS).length===0){
        set(STORE.SUBS, [
            { id: 'SUB-10001', memberName: 'Trần Văn Hùng', planName: '🔥 Gói Sắt Cơ Bản', date: '2026-05-10', detail: '30 Ngày' },
            { id: 'SUB-10002', memberName: 'Hoàng Thu Thủy', planName: '🥊 Gói KickBoxing 24 Buổi', date: '2026-05-15', detail: '24 Buổi' }
        ]);
    }
}
seedData();

let currentUser = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');

const dom = {
    landing: document.getElementById('landingContainer'),
    auth: document.getElementById('authContainer'),
    dashboard: document.getElementById('dashboardContainer')
};

function showLanding() { if(dom.landing) dom.landing.style.display = 'block'; if(dom.auth) dom.auth.style.display = 'none'; if(dom.dashboard) dom.dashboard.style.display = 'none'; }
function showAuth() { if(dom.landing) dom.landing.style.display = 'none'; if(dom.auth) dom.auth.style.display = 'flex'; if(dom.dashboard) dom.dashboard.style.display = 'none'; }

function showDashboardApp() {
    if(dom.landing) dom.landing.style.display = 'none';
    if(dom.auth) dom.auth.style.display = 'none';
    if(dom.dashboard) dom.dashboard.style.display = 'flex';
    
    // Quản lý hiển thị thanh Menu chuyển đổi nhanh dựa vào cấp bậc tài khoản
    const adminNav = document.getElementById('adminPanelNav');
    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));
    
    if(adminNav) adminNav.style.display = isPowerAdmin ? 'flex' : 'none';
    
    const statsNavItem = document.querySelector('.nav-menu .nav-item[data-view="stats"]');
    if(statsNavItem) {
        statsNavItem.style.display = isPowerAdmin ? 'flex' : 'none';
    }
    
    switchView('dashboard');
}

document.getElementById('navLoginBtn')?.addEventListener('click', showAuth);
document.getElementById('backToHomeBtn')?.addEventListener('click', showLanding);

document.getElementById('loginBtn')?.addEventListener('click', () => {
    let user = document.getElementById('loginUser').value.trim();
    let pass = document.getElementById('loginPass').value.trim();
    if(!user || !pass) return alert('Vui lòng điền đầy đủ thông tin!');
    
    let users = get(STORE.USERS);
    let matched = users.find(u => u.username === user && u.password === pass);
    
    if(matched) {
        currentUser = { id: matched.id, username: matched.username, role: matched.role };
        localStorage.setItem(STORE.CURRENT_USER, JSON.stringify(currentUser));
        showDashboardApp();
    } else {
        alert('Sai thông tin tài khoản hoặc mật khẩu!');
    }
});

document.getElementById('adminQuickBtn')?.addEventListener('click', () => {
    document.getElementById('loginUser').value = 'admin2006';
    document.getElementById('loginPass').value = 'trantien1234';
    currentUser = { id: 1, username: 'admin2006', role: 'admin' };
    localStorage.setItem(STORE.CURRENT_USER, JSON.stringify(currentUser));
    alert('Đăng nhập thành công với quyền Admin tối cao!');
    showDashboardApp();
});

document.getElementById('registerBtn')?.addEventListener('click', () => {
    let uname = document.getElementById('regUser').value.trim();
    let email = document.getElementById('regEmail').value.trim();
    let pwd = document.getElementById('regPass').value.trim();
    if(!uname || !email || !pwd) return alert('Vui lòng điền đầy đủ thông tin!');
    
    let users = get(STORE.USERS);
    if(users.find(u => u.username === uname)) return alert('Tên tài khoản đã tồn tại!');
    
    users.push({ id: Date.now(), username: uname, email: email, password: pwd, role: 'user' });
    set(STORE.USERS, users);
    alert('Đăng ký thành công tài khoản Nhân viên mới! Hãy thực hiện đăng nhập.');
    document.getElementById('toLogin').click();
});

document.getElementById('toRegister')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginCard').style.display = 'none'; document.getElementById('registerCard').style.display = 'block'; });
document.getElementById('toLogin')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('loginCard').style.display = 'block'; document.getElementById('registerCard').style.display = 'none'; });

function logoutProcess(){
    currentUser = null;
    localStorage.removeItem(STORE.CURRENT_USER);
    showLanding();
}
document.getElementById('logoutTop')?.addEventListener('click', logoutProcess);
document.getElementById('logoutSide')?.addEventListener('click', logoutProcess);


// ==================== CORE SWITCH VIEW FUNCTION ====================
function switchView(viewName) {
    const isSysAdmin = (currentUser && currentUser.role === 'admin');
    const isSubAdmin = (currentUser && currentUser.role === 'sub-admin');
    const isUser = (currentUser && currentUser.role === 'user');

    // Chặn bảo vệ dữ liệu nhạy cảm nếu nhân viên thường truy cập URL ảo
    if((viewName === 'stats' || viewName === 'admin') && isUser) {
        alert('Tài khoản của bạn không có đặc quyền truy cập khu vực quản trị tối cao!');
        switchView('dashboard');
        return;
    }

    document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
    let activeItem = document.querySelector(`.nav-menu .nav-item[data-view="${viewName}"]`);
    if(activeItem) activeItem.classList.add('active');
    
    const titleEl = document.getElementById('dynamicTitle');
    const contentEl = document.getElementById('viewContent');
    if(!titleEl || !contentEl) return;
    
    // --- VIEW: DASHBOARD ---
    if(viewName === 'dashboard') {
        let roleName = "Nhân viên Lễ tân";
        if(isSysAdmin) roleName = "Quản trị viên tối cao 👑";
        if(isSubAdmin) roleName = "Admin phụ (Quản lý vùng)";

        titleEl.innerText = 'BẢNG ĐIỀU KHIỂN CHUNG';
        contentEl.innerHTML = `
            <div class="metric-grid">
                <div class="card-metric"><div class="icon-box"><i class="fas fa-users"></i></div><div class="info"><h3>Hội viên hoạt động</h3><p>${get(STORE.MEMBERS).length}</p></div></div>
                <div class="card-metric"><div class="icon-box"><i class="fas fa-tag"></i></div><div class="info"><h3>Gói tập hiện có</h3><p>${get(STORE.PLANS).length}</p></div></div>
                <div class="card-metric"><div class="icon-box"><i class="fas fa-fist-raised"></i></div><div class="info"><h3>Check-in hôm nay</h3><p>${get(STORE.CHECKINS).length}</p></div></div>
            </div>
            <div style="background:#0f0f0f; padding:2rem; border-radius:1rem; border:1px solid #222; margin-top: 2rem;">
                <h3 style="color:var(--primary-red); font-family:'Orbitron'; font-size:1.1rem;"><i class="fas fa-id-badge"></i> THÔNG TIN PHIÊN LÀM VIỆC</h3>
                <p style="color:#aaa; margin-top:1rem; line-height:1.6;">
                    Tài khoản: <strong style="color:#fff;">${currentUser ? currentUser.username : ''}</strong> <br>
                    Cấp bậc phân quyền: <span style="color:var(--gold-red); font-weight:bold;">${roleName}</span>
                </p>
                <div style="margin-top:15px; border-top:1px solid #222; padding-top:15px; color:#666; font-size:0.85rem;">
                    <i class="fas fa-info-circle"></i> ${isUser ? 'Giao diện đã được tối ưu hóa chuẩn cho Nhân viên Vận hành phòng máy.' : 'Mọi nhật ký tác vụ thay đổi phân bổ vị trí đều được ghi nhận tự động.'}
                </div>
            </div>
        `;
    } 
    // --- VIEW: MEMBERS ---
    else if(viewName === 'members') {
        titleEl.innerText = 'QUẢN LÝ HỘI VIÊN';
        let members = get(STORE.MEMBERS);
        
        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 15px; flex-wrap: wrap;">
                    <div style="position: relative; flex: 1; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                        <input type="text" id="memberSearch" placeholder="Tìm kiếm nhanh hội viên..." style="width: 100%; background: #111; border: 1px solid #222; padding: 12px 12px 12px 45px; border-radius: 8px; color: #fff; outline: none;">
                    </div>
                    <button id="openAddMemberModal" class="btn-sm" style="padding: 12px 25px; font-weight: 600; border-radius: 8px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-user-plus"></i> Thêm Hội Viên Mới</button>
                </div>

                <div id="addMemberBlock" style="display: none; background: #0f0f0f; border: 1px solid #222; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--primary-red);"><i class="fas fa-plus-circle"></i> ĐĂNG KÝ HỘI VIÊN MỚI</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Họ và tên *</label>
                            <input type="text" id="newMemName" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Số điện thoại *</label>
                            <input type="text" id="newMemPhone" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Giới tính</label>
                            <select id="newMemGender" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Hạng Thẻ Đầu Vào</label>
                            <select id="newMemType" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="Chưa đăng ký">Chưa đăng ký gói</option>
                                ${get(STORE.PLANS).map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelAddMember" style="background:#222; border:none; color:#ccc; padding:10px 20px; border-radius:6px; cursor:pointer;">Hủy</button>
                        <button id="saveMemberBtn" class="btn-sm" style="padding:10px 25px; border-radius:6px;">Lưu Dữ Liệu</button>
                    </div>
                </div>

                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã Số</th><th>Họ Và Tên</th><th>Số Điện Thoại</th><th>Giới Tính</th><th>Hạng Thẻ</th><th>Ngày Tham Gia</th><th>Trạng Thái</th><th style="text-align: center;">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody id="memberTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderMemberTable(members);
        
        document.getElementById('openAddMemberModal').addEventListener('click', () => {
            let block = document.getElementById('addMemberBlock');
            block.style.display = block.style.display === 'none' ? 'block' : 'none';
        });
        document.getElementById('cancelAddMember').addEventListener('click', () => { document.getElementById('addMemberBlock').style.display = 'none'; });

        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            let name = document.getElementById('newMemName').value.trim();
            let phone = document.getElementById('newMemPhone').value.trim();
            let gender = document.getElementById('newMemGender').value;
            let type = document.getElementById('newMemType').value;

            if(!name || !phone) return alert('Hãy nhập tên và số điện thoại hội viên!');

            let list = get(STORE.MEMBERS);
            let id = 'M-' + Math.floor(1000 + Math.random() * 9000);
            let isNoPack = (type === 'Chưa đăng ký');
            let selectedPlan = get(STORE.PLANS).find(p => p.name === type);

            list.unshift({ 
                id, name, phone, gender, type, 
                status: isNoPack ? 'expired' : 'active', 
                joinDate: new Date().toISOString().split('T')[0],
                expireDate: isNoPack ? null : new Date(Date.now() + (selectedPlan ? selectedPlan.days : 30)*24*60*60*1000).toISOString().split('T')[0],
                remainingSessions: selectedPlan ? selectedPlan.sessions : null
            });
            set(STORE.MEMBERS, list);
            
            alert('Thêm mới dữ liệu khách hàng thành công!');
            switchView('members');
        });

        document.getElementById('memberSearch').addEventListener('input', function() {
            let kw = this.value.toLowerCase().trim();
            let filtered = get(STORE.MEMBERS).filter(m => m.id.toLowerCase().includes(kw) || m.name.toLowerCase().includes(kw) || m.phone.includes(kw));
            renderMemberTable(filtered);
        });
    }
    // --- VIEW: PACKAGES ---
    else if(viewName === 'packages') {
        titleEl.innerText = 'DANH MỤC GÓI TẬP DỊCH VỤ';
        let plans = get(STORE.PLANS);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 15px; flex-wrap: wrap;">
                    <div style="position: relative; flex: 1; max-width: 400px;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                        <input type="text" id="planSearch" placeholder="Tìm nhanh gói tập dịch vụ..." style="width: 100%; background: #111; border: 1px solid #222; padding: 12px 12px 12px 45px; border-radius: 8px; color: #fff; outline: none;">
                    </div>
                    <button id="openAddPlanModal" class="btn-sm" style="padding: 12px 25px; font-weight: 600; border-radius: 8px; display: ${isUser ? 'none' : 'flex'}; align-items: center; gap: 8px;">
                        <i class="fas fa-plus-square"></i> Cấu Hình Gói Mới
                    </button>
                </div>

                <div id="addPlanBlock" style="display: none; background: #0f0f0f; border: 1px solid #222; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                    <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--primary-red);"><i class="fas fa-sliders-h"></i> THIẾT LẬP THÔNG SỐ GÓI</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Tên gói tập *</label>
                            <input type="text" id="newPlanName" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Giá tiền (VND) *</label>
                            <input type="number" id="newPlanPrice" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Loại hình gói</label>
                            <select id="newPlanType" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="time">Theo Thời Gian (Ngày)</option>
                                <option value="session">Theo Lượt / Số Buổi</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Hạn dùng (Ngày) *</label>
                            <input type="number" id="newPlanDays" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                        <div id="sessionCountWrapper" style="display: none;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">Số buổi chỉ định *</label>
                            <input type="number" id="newPlanSessions" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; outline:none;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelAddPlan" style="background:#222; border:none; color:#ccc; padding:10px 20px; border-radius:6px; cursor:pointer;">Hủy</button>
                        <button id="savePlanBtn" class="btn-sm" style="padding:10px 25px; border-radius:6px;">Lưu Gói</button>
                    </div>
                </div>

                <div class="packages-grid" id="packagesGridBody"></div>
            </div>
        `;

        renderPackagesGrid(plans);

        if (!isUser) {
            document.getElementById('newPlanType').addEventListener('change', function() {
                document.getElementById('sessionCountWrapper').style.display = this.value === 'session' ? 'block' : 'none';
            });
            document.getElementById('openAddPlanModal').addEventListener('click', () => {
                let block = document.getElementById('addPlanBlock'); block.style.display = block.style.display === 'none' ? 'block' : 'none';
            });
            document.getElementById('cancelAddPlan').addEventListener('click', () => { document.getElementById('addPlanBlock').style.display = 'none'; });
            document.getElementById('savePlanBtn').addEventListener('click', () => {
                let name = document.getElementById('newPlanName').value.trim();
                let price = parseFloat(document.getElementById('newPlanPrice').value);
                let type = document.getElementById('newPlanType').value;
                let days = parseInt(document.getElementById('newPlanDays').value);
                let sessions = parseInt(document.getElementById('newPlanSessions').value) || null;

                if(!name || isNaN(price) || isNaN(days)) return alert('Vui lòng nhập đầy đủ thông tin!');

                let currentPlans = get(STORE.PLANS);
                currentPlans.push({ id: 'P-' + Math.floor(100 + Math.random() * 900), name, price, type, days, sessions: type === 'session' ? sessions : null });
                set(STORE.PLANS, currentPlans);
                alert('Tạo cấu hình gói thành công!');
                switchView('packages');
            });
        }

        document.getElementById('planSearch').addEventListener('input', function() {
            let kw = this.value.toLowerCase().trim();
            let filtered = get(STORE.PLANS).filter(p => p.name.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw));
            renderPackagesGrid(filtered);
        });
    }
    // --- VIEW: SUBSCRIPTIONS ---
    else if(viewName === 'subscriptions') {
        titleEl.innerText = 'ĐĂNG KÝ GÓI TẬP DỊCH VỤ';
        let members = get(STORE.MEMBERS);
        let plans = get(STORE.PLANS);
        let subs = get(STORE.SUBS);

        contentEl.innerHTML = `
            <div class="fade-up" style="display:grid; grid-template-columns: 1fr 1.8fr; gap:25px; align-items:start;">
                <div style="background:#0f0f0f; border:1px solid #222; padding:25px; border-radius:12px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:1.5rem;"><i class="fas fa-file-invoice-dollar"></i> KÍCH HOẠT GÓI THẺ</h3>
                    <div style="margin-bottom:12px;">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:5px;">1. Chọn hội viên *</label>
                        <select id="subMemberId" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px; outline:none;">
                            <option value="">-- Chọn hội viên --</option>
                            ${members.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:5px;">2. Chọn gói tập *</label>
                        <select id="subPlanId" style="width:100%; background:#161616; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px; outline:none;">
                            <option value="">-- Chọn gói dịch vụ --</option>
                            ${plans.map(p => `<option value="${p.id}">${p.name} (${new Intl.NumberFormat('vi-VN').format(p.price)}đ)</option>`).join('')}
                        </select>
                    </div>
                    <button id="submitSubscriptionBtn" class="btn-sm" style="width:100%; padding:12px; font-weight:600; border-radius:6px;">Xác nhận kích hoạt</button>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.85rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-history" style="color:var(--primary-red);"></i> LỊCH SỬ THU NGÂN / ĐĂNG KÝ GÓI
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th><th>Hội viên</th><th>Gói tập áp dụng</th><th>Ngày đăng ký</th><th>Hạn sử dụng</th>
                            </tr>
                        </thead>
                        <tbody id="subTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderSubscriptionsTable(subs);

        document.getElementById('submitSubscriptionBtn').addEventListener('click', () => {
            let mId = document.getElementById('subMemberId').value;
            let pId = document.getElementById('subPlanId').value;
            if(!mId || !pId) return alert('Vui lòng chọn đầy đủ thông tin hội viên và gói tập!');

            let allM = get(STORE.MEMBERS);
            let allP = get(STORE.PLANS);
            let targetM = allM.find(m => m.id === mId);
            let targetP = allP.find(p => p.id === pId);

            targetM.type = targetP.name;
            targetM.status = 'active';
            let exp = new Date();
            exp.setDate(exp.getDate() + targetP.days);
            targetM.expireDate = exp.toISOString().split('T')[0];
            targetM.remainingSessions = targetP.sessions; 

            let currentSubs = get(STORE.SUBS);
            currentSubs.unshift({
                id: 'SUB-' + Math.floor(10000 + Math.random() * 90000),
                memberName: targetM.name,
                planName: targetP.name,
                date: new Date().toISOString().split('T')[0],
                detail: targetP.type === 'time' ? `${targetP.days} Ngày` : `${targetP.sessions} Buổi`
            });

            set(STORE.MEMBERS, allM);
            set(STORE.SUBS, currentSubs);
            alert(`Đã gia hạn/đăng ký thành công gói cho hội viên ${targetM.name}!`);
            switchView('subscriptions');
        });
    }
    // --- VIEW: CHECKINS ---
    else if(viewName === 'checkins') {
        titleEl.innerText = 'CỔNG QUÉT THẺ CHECK-IN HỘI VIÊN';
        let checkinsList = get(STORE.CHECKINS);

        contentEl.innerHTML = `
            <div class="fade-up checkin-container" style="display:grid; grid-template-columns: 1fr 1.5fr; gap:25px; align-items:start;">
                <div class="quick-search-box" style="background:#0f0f0f; border:1px solid #222; padding:25px; border-radius:12px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:1rem;"><i class="fas fa-qrcode"></i> QUÉT MÃ VÀO CỬA TỰ ĐỘNG</h3>
                    <input type="text" id="checkinInput" placeholder="Nhập mã thẻ hội viên..." style="width:100%; background:#161616; border:1px solid #333; padding:12px; border-radius:8px; color:#fff; outline:none; font-family:'Orbitron'; letter-spacing:1px; text-transform:uppercase;">
                    <button id="triggerCheckinBtn" class="btn-sm" style="width:100%; padding:12px; font-weight:600; margin-top:12px;"><i class="fas fa-sign-in-alt"></i> Duyệt Check-in</button>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.9rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-history"></i> NHẬT KÝ ĐÓN KHÁCH TRONG NGÀY
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Thời gian</th><th>Mã Số</th><th>Họ tên</th><th>Gói tập</th><th>Ghi chú trạng thái</th>
                            </tr>
                        </thead>
                        <tbody id="checkinTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        renderCheckinsTable(checkinsList);

        document.getElementById('triggerCheckinBtn').addEventListener('click', () => {
            let inputCode = document.getElementById('checkinInput').value.trim().toUpperCase();
            if(!inputCode) return alert('Vui lòng nhập mã số hội viên!');

            let allM = get(STORE.MEMBERS);
            let targetM = allM.find(m => m.id.toUpperCase() === inputCode);

            if(!targetM) return alert('Không tìm thấy mã số hội viên này!');
            if(targetM.status === 'expired' || targetM.type === 'Chưa đăng ký') return alert('Thẻ hội viên đã hết hiệu lực tập luyện!');

            let note = 'Thẻ hợp lệ';
            if(targetM.remainingSessions !== undefined && targetM.remainingSessions !== null) {
                if(targetM.remainingSessions <= 0) return alert('Hội viên đã dùng hết số buổi tập!');
                targetM.remainingSessions -= 1;
                note = `Trừ 1 lượt PT (Còn lại: ${targetM.remainingSessions})`;
                if(targetM.remainingSessions === 0) targetM.status = 'expired';
            }

            let now = new Date();
            let timeStr = now.toTimeString().split(' ')[0] + ' ' + now.toISOString().split('T')[0];
            let currentLogs = get(STORE.CHECKINS);
            currentLogs.unshift({ time: timeStr, id: targetM.id, name: targetM.name, plan: targetM.type, note });

            set(STORE.MEMBERS, allM);
            set(STORE.CHECKINS, currentLogs);
            alert(`Chào mừng hội viên ${targetM.name} đến phòng tập!`);
            switchView('checkins');
        });
    }
    // --- VIEW: TRAINERS ---
    else if(viewName === 'trainers') {
        titleEl.innerText = 'ĐỘI NGŨ HUẤN LUYỆN VIÊN (PT)';
        contentEl.innerHTML = `<div class="trainers-grid" id="trainersGridBody" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;"></div>`;
        renderTrainersGrid(get(STORE.TRAINERS));
    }
    // --- VIEW: STATS (DÀNH CHO ADMIN PHỤ VÀ ADMIN TỐI CAO) ---
    else if(viewName === 'stats' && !isUser) {
        titleEl.innerText = 'THỐNG KÊ DOANH THU & CHỈ SỐ KINH DOANH';
        let subs = get(STORE.SUBS);
        let plans = get(STORE.PLANS);
        let totalRevenue = subs.reduce((sum, s) => sum + ((plans.find(p => p.name === s.planName))?.price || 0), 0);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div class="metric-grid">
                    <div class="card-metric" style="border-left: 4px solid #48bb78;">
                        <div class="info"><h3>Tổng Doanh Thu Phòng</h3><p style="color:#48bb78;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}</p></div>
                    </div>
                    <div class="card-metric" style="border-left: 4px solid #3182ce;">
                        <div class="info"><h3>Tổng Đơn Đã Thu</h3><p>${subs.length} đơn</p></div>
                    </div>
                </div>
                <div style="background:#0f0f0f; border:1px solid #222; border-radius:12px; padding:25px; margin-top:20px;">
                    <h4 style="font-family:'Orbitron'; font-size:0.9rem; margin-bottom:15px;"><i class="fas fa-chart-line"></i> BIỂU ĐỒ TRỰC QUAN</h4>
                    <div style="height:250px; position:relative;"><canvas id="revenueChart"></canvas></div>
                </div>
            </div>
        `;
        setTimeout(() => {
            let planMap = {}; plans.forEach(p => planMap[p.name] = 0);
            subs.forEach(s => { if(planMap[s.planName] !== undefined) planMap[s.planName] += (plans.find(p => p.name === s.planName))?.price || 0; });
            const ctx = document.getElementById('revenueChart')?.getContext('2d');
            // Kiểm tra thư viện Chart trước khi vẽ tránh crash app
            if(ctx && typeof Chart !== 'undefined') {
                new Chart(ctx, {
                    type: 'bar',
                    data: { labels: Object.keys(planMap), datasets: [{ label: 'Doanh thu (VND)', data: Object.values(planMap), backgroundColor: '#e11d2c' }] },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }, 50);
    }
    // --- VIEW: ADMIN PANEL (TIẾN TRÌNH CẢI TIẾN CAO CẤP TỐI CAO) ---
    else if(viewName === 'admin' && !isUser) {
        titleEl.innerText = 'KHUNG QUẢN TRỊ ADMIN PANEL TỐI CAO';
        let users = get(STORE.USERS);

        contentEl.innerHTML = `
            <div class="fade-up">
                <div style="background: #0f0f0f; border:1px solid #222; padding:25px; border-radius:12px; margin-bottom:20px;">
                    <h3 style="font-family:'Orbitron'; font-size:1rem; color:var(--primary-red); margin-bottom:10px;"><i class="fas fa-users-cog"></i> PHÂN BỔ VÀ ỦY QUYỀN ADMIN PHỤ</h3>
                    <p style="color:#aaa; font-size:0.85rem; margin-bottom:20px;">
                        Chức năng độc quyền dành cho <strong>Quản trị viên tối cao</strong> để nâng quyền hoặc hạ quyền nhân sự trong chuỗi phòng tập.
                    </p>
                    
                    <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; background:#141414; padding:15px; border-radius:8px; border:1px solid #222;">
                        <div style="flex:1; min-width:200px;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">1. Chọn Thành Viên / Nhân Viên</label>
                            <select id="allocUserSelect" style="width:100%; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="">-- Chọn tài khoản nhân sự --</option>
                                ${users.filter(u => u.username !== 'admin2006').map(u => `<option value="${u.id}">${u.username} (Chức vụ hiện tại: ${u.role})</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1; min-width:180px;">
                            <label style="display:block; font-size:0.75rem; color:#aaa; margin-bottom:5px;">2. Chỉ Định Vai Trò Quyền Hạn Mới</label>
                            <select id="allocRoleSelect" style="width:100%; background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; height:41px;">
                                <option value="sub-admin">Admin Phụ (Sub-Admin / Quản lý vụ)</option>
                                <option value="user">User (Nhân Viên Lễ Tân thường)</option>
                            </select>
                        </div>
                        <button id="saveAllocationBtn" class="btn-sm" style="padding:11px 25px; border-radius:6px; font-weight:600;"><i class="fas fa-user-shield"></i> Cập Nhật Ủy Quyền</button>
                    </div>
                </div>

                <div class="data-table">
                    <div style="padding:15px 20px; font-family:'Orbitron'; font-size:0.85rem; border-bottom:1px solid #222; background:#161616; color:#fff;">
                        <i class="fas fa-list"></i> DANH SÁCH NHÂN SỰ TOÀN HỆ THỐNG
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID Nhân Sự</th><th>Tên Tài Khoản (Username)</th><th>Email Liên Hệ</th><th>Quyền Hạn Hiện Tại</th><th>Mật Khẩu Thô</th>
                            </tr>
                        </thead>
                        <tbody id="adminUserTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderAdminUserTable(users);

        document.getElementById('saveAllocationBtn').addEventListener('click', () => {
            // Ràng buộc bảo mật tối cao: Chỉ duy nhất tài khoản cố định admin2006 mới được đổi quyền nhân sự
            if(currentUser.username !== 'admin2006') {
                return alert('Từ chối thao tác: Chỉ có duy nhất Admin Tối Cao Thượng Cấp (admin2006) mới có quyền phân bổ Admin phụ!');
            }

            let uId = parseInt(document.getElementById('allocUserSelect').value);
            let newRole = document.getElementById('allocRoleSelect').value;

            if(!uId) return alert('Vui lòng chọn 1 thành viên nhân sự cần phân bổ!');

            let allUsers = get(STORE.USERS);
            let targetIdx = allUsers.findIndex(u => u.id === uId);

            if(targetIdx !== -1) {
                allUsers[targetIdx].role = newRole;
                set(STORE.USERS, allUsers);
                alert(`Đã phân bổ thành công tài khoản "${allUsers[targetIdx].username}" sang quyền chức vụ: ${newRole.toUpperCase()}`);
                switchView('admin');
            }
        });
    }
}

// ==================== RENDERING SUB-FUNCTIONS ====================
function renderAdminUserTable(usersArray) {
    const tbody = document.getElementById('adminUserTableBody');
    if(!tbody) return;
    tbody.innerHTML = usersArray.map(u => {
        let roleBadge = "";
        if(u.role === 'admin') roleBadge = `<span style="background:rgba(225,29,44,0.2); color:#ff3b3f; padding:3px 10px; border-radius:4px; font-weight:bold;">Tối Cao (Admin)</span>`;
        else if(u.role === 'sub-admin') roleBadge = `<span style="background:rgba(212,175,55,0.2); color:#d4af37; padding:3px 10px; border-radius:4px; font-weight:bold;">Admin Phụ</span>`;
        else roleBadge = `<span style="background:#222; color:#aaa; padding:3px 10px; border-radius:4px;">Nhân Viên Thường</span>`;

        return `
            <tr>
                <td style="font-family:'Orbitron'; font-size:0.8rem;">${u.id}</td>
                <td style="font-weight:600; color:#fff;">${u.username}</td>
                <td>${u.email}</td><td>${roleBadge}</td>
                <td style="font-family:'Courier New'; color:#666;">${u.password}</td>
            </tr>
        `;
    }).join('');
}

function renderMemberTable(dataArray) {
    const tbody = document.getElementById('memberTableBody');
    if(!tbody) return;
    if(dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#666; padding: 2rem;">Không tìm thấy dữ liệu hội viên.</td></tr>`;
        return;
    }

    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));

    tbody.innerHTML = dataArray.map(m => {
        let statusBadge = m.status === 'active' 
            ? `<span style="background: rgba(56, 161, 105, 0.15); color: #38a169; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight:600;">Đang hoạt động</span>`
            : `<span style="background: rgba(225, 29, 44, 0.15); color: #ff3b3f; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight:600;">Hết hạn/Chưa gói</span>`;
        
        let actionsHtml = "";
        if(isPowerAdmin) {
            actionsHtml = `
                <button class="action-icon" onclick="deleteMember('${m.id}')" style="background:none; border:none; cursor:pointer;" title="Xóa hội viên"><i class="fas fa-trash-alt" style="color:#ff3b3f;"></i></button>
                <button class="action-icon" onclick="alert('Tính năng chỉnh sửa thông số đang kết nối cơ sở dữ liệu...')" style="background:none; border:none; cursor:pointer; margin-left:8px;" title="Sửa thông tin"><i class="fas fa-edit" style="color:#3182ce;"></i></button>
            `;
        } else {
            actionsHtml = `<button onclick="alert('Yêu cầu điều chỉnh thông tin khách hàng ${m.id} đã gửi lên Ban quản lý Admin duyệt!')" style="background:#161616; border:1px solid #333; color:#aaa; font-size:0.75rem; padding:4px 8px; border-radius:4px; cursor:pointer;"><i class="fas fa-paper-plane"></i> Gửi yêu cầu sửa</button>`;
        }

        return `
            <tr>
                <td style="font-family:'Orbitron'; font-weight:700; color:#ff6b6b;">${m.id}</td>
                <td style="font-weight:600; color:#fff;">${m.name}</td>
                <td>${m.phone}</td><td>${m.gender}</td><td>${m.type}</td>
                <td>${m.joinDate}</td><td>${statusBadge}</td>
                <td style="text-align:center;">${actionsHtml}</td>
            </tr>
        `;
    }).join('');
}

function renderPackagesGrid(dataArray) {
    const gridBody = document.getElementById('packagesGridBody');
    if(!gridBody) return;
    if(dataArray.length === 0) {
        gridBody.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#666; padding:3rem;">Không tìm thấy gói tập dịch vụ nào.</div>`;
        return;
    }

    const isPowerAdmin = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'sub-admin'));

    gridBody.innerHTML = dataArray.map(p => {
        let formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        let detailLine = p.type === 'time' ? `Thời gian: ${p.days} Ngày` : `Số buổi: ${p.sessions} lượt`;
        let deleteBtnHtml = isPowerAdmin ? `<button onclick="deletePackage('${p.id}')" style="background:none; border:none; color:#ff3b3f; cursor:pointer;"><i class="fas fa-trash-alt"></i> Xóa gói</button>` : '';

        return `
            <div class="package-item-card">
                <div>
                    <div class="pack-header">
                        <div class="pack-icon"><i class="fas fa-dumbbell"></i></div>
                        <div class="pack-badge" style="font-size: 0.65rem;">${p.id}</div>
                    </div>
                    <h4>${p.name}</h4>
                    <div class="pack-price" style="font-size:1.3rem; margin:10px 0;">${formattedPrice}</div>
                    <p style="font-size:0.8rem; color:#aaa;">${detailLine}</p>
                </div>
                <div style="margin-top:15px; display:flex; justify-content:flex-end; font-size:0.8rem;">
                    ${deleteBtnHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderTrainersGrid(trainersArray) {
    const target = document.getElementById('trainersGridBody');
    if(!target) return;
    target.innerHTML = trainersArray.map(t => {
        const defaultAvatar = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500';
        const avatar = t.image || defaultAvatar;
        return `
            <div class="trainer-card" style="background: #0f0f0f; border: 1px solid #222; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow: hidden;">
                <div style="width: 100%; height: 230px; overflow: hidden; border-radius: 8px; border: 1px solid #222; background: #111;">
                    <img src="${avatar}" alt="PT ${t.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div>
                    <h4 style="color:#fff; font-size:1.15rem; margin-bottom:6px; font-family:'Orbitron', sans-serif;">PT: ${t.name}</h4>
                    <div style="color:var(--primary-red); font-size:0.85rem; font-weight:600; margin-bottom:10px;">
                        <i class="fas fa-star" style="margin-right: 4px;"></i>Chuyên môn: ${t.special}
                    </div>
                    <div style="font-size:0.85rem; color:#888;">
                        <i class="fas fa-phone-alt" style="margin-right: 6px;"></i>Liên hệ: ${t.phone}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSubscriptionsTable(subsArray) {
    const tbody = document.getElementById('subTableBody');
    if(!tbody) return;
    tbody.innerHTML = subsArray.map(s => `
        <tr>
            <td style="font-family:'Orbitron'; font-size:0.8rem; color:#aaa;">${s.id}</td>
            <td style="font-weight:600; color:#fff;">${s.memberName}</td>
            <td><span style="color:var(--primary-red);">${s.planName}</span></td>
            <td>${s.date}</td><td>${s.detail}</td>
        </tr>
    `).join('');
}

function renderCheckinsTable(logsArray) {
    const tbody = document.getElementById('checkinTableBody');
    if(!tbody) return;
    tbody.innerHTML = logsArray.map(l => `
        <tr>
            <td style="color:#888; font-family:'Orbitron'; font-size:0.8rem;">${l.time}</td>
            <td style="font-family:'Orbitron'; font-weight:bold; color:var(--primary-red);">${l.id}</td>
            <td style="color:#fff; font-weight:600;">${l.name}</td><td>${l.plan}</td><td>${l.note}</td>
        </tr>
    `).join('');
}

// ==================== PRIVILEGE ACTIONS DELETES ====================
window.deletePackage = function(planId) {
    let userSession = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');
    if(!userSession || userSession.role === 'user') return alert('Bạn không có quyền thực hiện chức năng xóa!');
    if(confirm(`Xóa vĩnh viễn gói tập dịch vụ ${planId}?`)) {
        let list = get(STORE.PLANS).filter(p => p.id !== planId);
        set(STORE.PLANS, list); switchView('packages');
    }
};

window.deleteMember = function(memberId) {
    let userSession = JSON.parse(localStorage.getItem(STORE.CURRENT_USER) || 'null');
    if(!userSession || userSession.role === 'user') return alert('Bạn không có quyền thực hiện chức năng xóa hội viên!');
    if(confirm(`Xóa vĩnh viễn hội viên ${memberId}?`)) {
        let list = get(STORE.MEMBERS).filter(m => m.id !== memberId);
        set(STORE.MEMBERS, list); switchView('members');
    }
};

// Lắng nghe sự kiện click menu điều hướng SideBar chính
document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
    item.addEventListener('click', function() {
        let view = this.getAttribute('data-view');
        if(view && view !== 'about') switchView(view);
    });
});

// Khởi chạy app
if(currentUser) { showDashboardApp(); } else { showLanding(); }
    }
};

// Lắng nghe sự kiện click menu điều hướng SideBar chính
document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
    item.addEventListener('click', function() {
        let view = this.getAttribute('data-view');
        if(view && view !== 'about') switchView(view);
    });
});

// Khởi chạy app
if(currentUser) { showDashboardApp(); } else { showLanding(); }