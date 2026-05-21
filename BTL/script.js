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

// Seed dữ liệu mặc định ban đầu
function seedData(){
    if(get(STORE.USERS).length===0){
        set(STORE.USERS, [
            { id: 1, username: 'admin', email: 'admin@iron.com', password: 'admin123', role: 'admin' },
            { id: 2, username: 'tienphong', email: 'staff@gym.com', password: '123456', role: 'user' }
        ]);
    }
    if(get(STORE.PLANS).length===0){
        set(STORE.PLANS, [
            { id: 1, name: '🔥 Gói Sắt 1 tháng', price: 450000, type: 'time', days: 30, sessions: null },
            { id: 2, name: '💪 Gói Thép 3 tháng', price: 1200000, type: 'time', days: 90, sessions: null },
            { id: 3, name: '🏆 Gói 12 buổi PT', price: 2800000, type: 'sessions', days: null, sessions: 12 }
        ]);
    }
    if(get(STORE.MEMBERS).length===0){
        set(STORE.MEMBERS, [
            { id: 201, name: 'Mai Văn Nam', phone: '0912345678', email: 'nam@gym.com', joinDate: '2025-03-01', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
            { id: 202, name: 'Trần Thị Linh', phone: '0988777666', email: 'linh@gym.com', joinDate: '2025-04-10', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' }
        ]);
    }
    if(get(STORE.TRAINERS).length===0){
        set(STORE.TRAINERS, [
            { id: 101, name: 'Nguyễn Hùng Cường', specialty: 'Thể hình & Fitness', phone: '0903123456', email: 'cuong@gym.com', bio: 'HLV chuyên nghiệp 8 năm kinh nghiệm, từng đạt giải thể hình', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: 102, name: 'Lê Thị Ánh Tuyết', specialty: 'Yoga & Cardio', phone: '0988111222', email: 'tuyet@gym.com', bio: 'Chuyên gia Yoga, hướng dẫn giảm cân và cải thiện sức khỏe', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
            { id: 103, name: 'Phạm Văn Đức', specialty: 'PT cao cấp & Calisthenics', phone: '0912333444', email: 'duc@gym.com', bio: 'HLV đào tạo vận động viên, kỹ thuật chuyên sâu', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' }
        ]);
    }
    if(get(STORE.SUBS).length===0){
        let mems = get(STORE.MEMBERS), plans=get(STORE.PLANS), trainers=get(STORE.TRAINERS);
        if(mems.length && plans.length) set(STORE.SUBS, [
            { id: 1001, memberId: mems[0].id, planId: plans[0].id, startDate: '2025-04-01', endDate: '2025-05-01', remainingSessions: null, status: 'active', trainerId: trainers[0]?.id || null },
            { id: 1002, memberId: mems[1].id, planId: plans[2].id, startDate: '2025-04-05', endDate: null, remainingSessions: 10, status: 'active', trainerId: trainers[1]?.id || null }
        ]); else set(STORE.SUBS,[]);
    }
    if(get(STORE.CHECKINS).length===0) set(STORE.CHECKINS, []);
}
seedData();

// Global states
let currentUser = localStorage.getItem(STORE.CURRENT_USER) ? JSON.parse(localStorage.getItem(STORE.CURRENT_USER)) : null;
let activeView = 'dashboard';
let chartInstance = null;

const authDiv = document.getElementById('authContainer');
const dashboardDiv = document.getElementById('dashboardContainer');
const viewContent = document.getElementById('viewContent');
const titleSpan = document.getElementById('dynamicTitle');

function showAuth(){ authDiv.style.display='flex'; dashboardDiv.style.display='none'; }
function showDashboardApp(){ authDiv.style.display='none'; dashboardDiv.style.display='block'; renderView(); updateAdminNav(); }

function updateAdminNav(){
    const adminNav = document.getElementById('adminPanelNav');
    if(currentUser && currentUser.role === 'admin') adminNav.style.display = 'flex';
    else if(adminNav) adminNav.style.display = 'none';
}

function logout(){
    localStorage.removeItem(STORE.CURRENT_USER);
    currentUser = null;
    showAuth();
}

// Router hiển thị View tương ứng
function renderView(){
    if(!currentUser) return;
    const titles = {
        dashboard:'THỐNG KÊ TỔNG HỢP', members:'QUẢN LÝ HỘI VIÊN', packages:'GÓI TẬP',
        trainers:'HUẤN LUYỆN VIÊN', subscriptions:'ĐĂNG KÝ GÓI + HLV', checkins:'CHECK-IN',
        stats:'BIỂU ĐỒ & BÁO CÁO', about:'🏋️ GIỚI THIỆU', admin:'👑 ADMIN CENTER'
    };
    titleSpan.innerText = titles[activeView] || 'DASHBOARD';
    if(activeView === 'dashboard') renderDashboard();
    else if(activeView === 'members') renderMembers();
    else if(activeView === 'packages') renderPackages();
    else if(activeView === 'trainers') renderTrainers();
    else if(activeView === 'subscriptions') renderSubscriptions();
    else if(activeView === 'checkins') renderCheckins();
    else if(activeView === 'stats') renderStats();
    else if(activeView === 'about') renderAbout();
    else if(activeView === 'admin' && currentUser.role === 'admin') renderAdminPanel();
}

// ==================== VIEW RENDERING FUNCTIONS ====================

// DASHBOARD VIEW
function renderDashboard(){
    let members = get(STORE.MEMBERS);
    let subs = get(STORE.SUBS);
    let checkins = get(STORE.CHECKINS);
    let today = new Date().toISOString().slice(0,10);
    let todayCheckins = checkins.filter(c => c.date === today).length;
    let activeSubs = subs.filter(s => s.status === 'active').length;
    let totalRevenue = subs.reduce((sum, sub) => {
        let plan = get(STORE.PLANS).find(p => p.id === sub.planId);
        return sum + (plan ? plan.price : 0);
    },0);
    viewContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><i class="fas fa-users fa-2x" style="color:#e11d2c"></i><h4>Tổng hội viên</h4><div class="stat-number">${members.length}</div></div>
            <div class="stat-card"><i class="fas fa-calendar-check fa-2x" style="color:#e11d2c"></i><h4>Check-in hôm nay</h4><div class="stat-number">${todayCheckins}</div></div>
            <div class="stat-card"><i class="fas fa-id-card fa-2x" style="color:#e11d2c"></i><h4>Gói đang hoạt động</h4><div class="stat-number">${activeSubs}</div></div>
            <div class="stat-card"><i class="fas fa-chart-line fa-2x" style="color:#e11d2c"></i><h4>Doanh thu (VND)</h4><div class="stat-number">${totalRevenue.toLocaleString()}đ</div></div>
        </div>
        <div class="data-table"><h4>📅 Hội viên mới nhất</h4><table><tr><th>Tên</th><th>Email</th><th>Ngày tham gia</th></tr>${members.slice(-4).reverse().map(m => `<tr><td>${m.name}</td><td>${m.email}</td><td>${m.joinDate}</td></tr>`).join('')}</table></div>
    `;
}

// MEMBERS VIEW (CRUD)
function renderMembers(){
    let members = get(STORE.MEMBERS);
    viewContent.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:1rem;"><button class="btn-sm" id="addMemberBtn"><i class="fas fa-user-plus"></i> Thêm hội viên</button><input type="text" id="searchMem" placeholder="🔍 Tìm kiếm..." style="background:#1f1f1f; border-radius:2rem; padding:5px 15px; border:1px solid red;"></div>
    <div class="data-table"><table><thead><tr><th>ID</th><th>Ảnh</th><th>Tên</th><th>Email</th><th>Điện thoại</th><th>Ngày TK</th><th>Hành động</th></tr></thead><tbody id="membersTbody"></tbody></table></div>
    <div id="memberModal" class="modal"><div class="modal-card"><h3 id="modalTitleMember">Thêm hội viên</h3><div class="input-field"><label>Tên</label><input id="memName"></div><div class="input-field"><label>Email</label><input id="memEmail"></div><div class="input-field"><label>Phone</label><input id="memPhone"></div><div class="input-field"><label>Ngày tham gia</label><input type="date" id="memJoin"></div><div class="flex-btns"><button class="btn-sm" id="saveMemberBtn">Lưu</button><button class="btn-sm" id="closeMemberModal" style="background:gray;">Hủy</button></div></div></div>`;
    
    let currentEditId = null;
    function refreshList(filter=''){
        let data = members.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()) || m.email.includes(filter));
        let tbody = document.getElementById('membersTbody');
        if(tbody) tbody.innerHTML = data.map(m => `<tr><td>${m.id}</td><td><img src="${m.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}" width="35" style="border-radius:50%;"></td><td>${m.name}</td><td>${m.email}</td><td>${m.phone}</td><td>${m.joinDate}</td><td><button class="action-icon editMem" data-id="${m.id}"><i class="fas fa-edit"></i></button><button class="action-icon delMem" data-id="${m.id}"><i class="fas fa-trash"></i></button></td></tr>`).join('');
        attachMemberEvents();
    }
    function attachMemberEvents(){
        document.querySelectorAll('.editMem').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); openModal(id); }));
        document.querySelectorAll('.delMem').forEach(btn => btn.addEventListener('click', (e)=>{ if(confirm('Xóa hội viên này?')){ let id = parseInt(btn.dataset.id); let newMems = members.filter(m => m.id !== id); set(STORE.MEMBERS, newMems); renderMembers(); } }));
    }
    function openModal(id){
        currentEditId = id;
        let modal = document.getElementById('memberModal');
        if(id){
            let mem = members.find(m=>m.id === id);
            document.getElementById('memName').value = mem.name;
            document.getElementById('memEmail').value = mem.email;
            document.getElementById('memPhone').value = mem.phone;
            document.getElementById('memJoin').value = mem.joinDate;
            document.getElementById('modalTitleMember').innerText = 'Cập nhật hội viên';
        } else {
            document.getElementById('memName').value = '';
            document.getElementById('memEmail').value = '';
            document.getElementById('memPhone').value = '';
            document.getElementById('memJoin').value = new Date().toISOString().slice(0,10);
            document.getElementById('modalTitleMember').innerText = 'Thêm hội viên';
        }
        modal.style.display = 'flex';
    }
    document.getElementById('addMemberBtn')?.addEventListener('click', ()=>openModal(null));
    document.getElementById('saveMemberBtn')?.addEventListener('click', ()=>{
        let name = document.getElementById('memName').value;
        let email = document.getElementById('memEmail').value;
        let phone = document.getElementById('memPhone').value;
        let join = document.getElementById('memJoin').value;
        if(!name) return alert('Nhập tên');
        let membersList = get(STORE.MEMBERS);
        if(currentEditId){
            let index = membersList.findIndex(m=>m.id === currentEditId);
            membersList[index] = {...membersList[index], name, email, phone, joinDate:join};
            set(STORE.MEMBERS, membersList);
        } else {
            let newId = Date.now();
            membersList.push({id:newId, name, email, phone, joinDate:join, avatar:'https://randomuser.me/api/portraits/lego/2.jpg'});
            set(STORE.MEMBERS, membersList);
        }
        document.getElementById('memberModal').style.display = 'none';
        renderMembers();
    });
    document.getElementById('closeMemberModal')?.addEventListener('click', ()=>document.getElementById('memberModal').style.display='none');
    document.getElementById('searchMem')?.addEventListener('input', e=>refreshList(e.target.value));
    refreshList();
}

// PACKAGES VIEW
function renderPackages(){
    let plans = get(STORE.PLANS);
    viewContent.innerHTML = `<button class="btn-sm" id="addPlanBtn"><i class="fas fa-plus"></i> Thêm gói tập</button><div class="data-table"><table><tr><th>ID</th><th>Gói tập</th><th>Giá (VNĐ)</th><th>Loại</th><th>Thời hạn/Buổi</th><th>Xóa</th></tr>${plans.map(p => `<tr><td>${p.id}</td><td>🔥 ${p.name}</td><td>${p.price.toLocaleString()}</td><td>${p.type==='time'?'Theo ngày':'Theo buổi'}</td><td>${p.type==='time'?p.days+' ngày':p.sessions+' buổi'}</td><td><button class="action-icon delPlan" data-id="${p.id}"><i class="fas fa-trash"></i></button></td></tr>`).join('')}</table></div>`;
    document.getElementById('addPlanBtn')?.addEventListener('click', ()=>{
        let name = prompt('Tên gói:');
        let price = parseInt(prompt('Giá:'));
        let type = prompt('Loại (time/sessions):');
        if(type === 'time'){ let days = parseInt(prompt('Số ngày:')); if(name && price && days){ let newId = Date.now(); plans.push({id:newId, name, price, type, days, sessions:null}); set(STORE.PLANS, plans); renderPackages(); } }
        else if(type === 'sessions'){ let sessions = parseInt(prompt('Số buổi:')); if(name && price && sessions){ plans.push({id:Date.now(), name, price, type, days:null, sessions}); set(STORE.PLANS, plans); renderPackages(); } }
        else alert('Chỉ hỗ trợ nhập: time hoặc sessions');
    });
    document.querySelectorAll('.delPlan').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); let newPlans = plans.filter(p=>p.id !== id); set(STORE.PLANS, newPlans); renderPackages(); }));
}

// TRAINERS VIEW
function renderTrainers(){
    let trainers = get(STORE.TRAINERS);
    viewContent.innerHTML = `<button class="btn-sm" id="addTrainerBtn"><i class="fas fa-plus"></i> Thêm HLV</button><div class="data-table"><table><th>ID</th><th>Ảnh</th><th>Tên HLV</th><th>Chuyên môn</th><th>Email</th><th>SĐT</th><th>Thông tin</th><th>Hành động</th></tr>${trainers.map(t => `
        <tr>
            <td>${t.id}</td>
            <td><img src="${t.avatar}" class="trainer-img"></td>
            <td>${t.name}</td>
            <td>${t.specialty}</td>
            <td>${t.email}</td>
            <td>${t.phone}</td>
            <td><button class="action-icon viewTrainer" data-id="${t.id}"><i class="fas fa-info-circle"></i></button></td>
            <td><button class="action-icon editTrainer" data-id="${t.id}"><i class="fas fa-edit"></i></button><button class="action-icon delTrainer" data-id="${t.id}"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('')}</table></div>
    <div id="trainerModal" class="modal"><div class="modal-card"><h3 id="trainerModalTitle">HLV</h3><div class="input-field"><label>Tên</label><input id="trainerName"></div><div class="input-field"><label>Chuyên môn</label><input id="trainerSpecialty"></div><div class="input-field"><label>Email</label><input id="trainerEmail"></div><div class="input-field"><label>SĐT</label><input id="trainerPhone"></div><div class="input-field"><label>Tiểu sử / Bio</label><textarea id="trainerBio" rows="2" style="width:100%; background:#1f1f1f; color:white; border-radius:1rem;"></textarea></div><div class="flex-btns"><button class="btn-sm" id="saveTrainerBtn">Lưu</button><button class="btn-sm closeModalBtn">Hủy</button></div></div></div>`;
    
    let currentTrainerId = null;
    function openTrainerModal(id=null){
        let modal = document.getElementById('trainerModal');
        if(id){
            let t = trainers.find(t=>t.id === id);
            if(t){
                document.getElementById('trainerName').value = t.name;
                document.getElementById('trainerSpecialty').value = t.specialty;
                document.getElementById('trainerEmail').value = t.email;
                document.getElementById('trainerPhone').value = t.phone;
                document.getElementById('trainerBio').value = t.bio;
                document.getElementById('trainerModalTitle').innerText = 'Chỉnh sửa HLV';
                currentTrainerId = id;
            }
        } else {
            document.getElementById('trainerName').value = '';
            document.getElementById('trainerSpecialty').value = '';
            document.getElementById('trainerEmail').value = '';
            document.getElementById('trainerPhone').value = '';
            document.getElementById('trainerBio').value = '';
            document.getElementById('trainerModalTitle').innerText = 'Thêm Huấn luyện viên';
            currentTrainerId = null;
        }
        modal.style.display = 'flex';
    }
    document.getElementById('addTrainerBtn')?.addEventListener('click', ()=>openTrainerModal(null));
    document.getElementById('saveTrainerBtn')?.addEventListener('click', ()=>{
        let name = document.getElementById('trainerName').value;
        let specialty = document.getElementById('trainerSpecialty').value;
        let email = document.getElementById('trainerEmail').value;
        let phone = document.getElementById('trainerPhone').value;
        let bio = document.getElementById('trainerBio').value;
        if(!name) return alert('Tên HLV không được trống');
        let trainersList = get(STORE.TRAINERS);
        if(currentTrainerId){
            let idx = trainersList.findIndex(t => t.id === currentTrainerId);
            trainersList[idx] = {...trainersList[idx], name, specialty, email, phone, bio};
            set(STORE.TRAINERS, trainersList);
        } else {
            let newId = Date.now();
            trainersList.push({id:newId, name, specialty, email, phone, bio, avatar:'https://randomuser.me/api/portraits/lego/6.jpg'});
            set(STORE.TRAINERS, trainersList);
        }
        document.getElementById('trainerModal').style.display = 'none';
        renderTrainers();
    });
    document.querySelectorAll('.closeModalBtn').forEach(btn => btn.addEventListener('click', ()=>document.getElementById('trainerModal').style.display='none'));
    document.querySelectorAll('.editTrainer').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); openTrainerModal(id); }));
    document.querySelectorAll('.delTrainer').forEach(btn => btn.addEventListener('click', (e)=>{ if(confirm('Xóa HLV này?')){ let id = parseInt(btn.dataset.id); let newList = trainers.filter(t=>t.id !== id); set(STORE.TRAINERS, newList); renderTrainers(); } }));
    document.querySelectorAll('.viewTrainer').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); let trainer = trainers.find(t=>t.id===id); alert(`📌 ${trainer.name}\n🏆 Chuyên môn: ${trainer.specialty}\n📧 ${trainer.email}\n📞 ${trainer.phone}\n📝 Bio: ${trainer.bio}`); }));
}

// SUBSCRIPTIONS VIEW
function renderSubscriptions(){
    let subs = get(STORE.SUBS), members=get(STORE.MEMBERS), plans=get(STORE.PLANS), trainers=get(STORE.TRAINERS);
    viewContent.innerHTML = `<button class="btn-sm" id="newSubBtn"><i class="fas fa-plus-circle"></i> Đăng ký gói + HLV</button><div class="data-table"><table><th>Hội viên</th><th>Gói tập</th><th>HLV phụ trách</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Trạng thái</th><th>Hủy</th></tr>${subs.map(s => { let m = members.find(x=>x.id===s.memberId); let p = plans.find(x=>x.id===s.planId); let trainer = trainers.find(t=>t.id===s.trainerId); return `<tr><td>${m?.name||'?'}</td><td>${p?.name||'?'}</td><td>${trainer?.name || 'Chưa phân công'}</td><td>${s.startDate}</td><td>${s.endDate||'Linh hoạt'}</td><td><span class="badge-active">${s.status}</span></td><td><button class="action-icon cancelSub" data-id="${s.id}"><i class="fas fa-ban"></i></button></td></tr>`; }).join('')}</table></div>`;
    
    document.getElementById('newSubBtn')?.addEventListener('click', ()=>{
        let memId = parseInt(prompt('ID hội viên:'));
        let planId = parseInt(prompt('ID gói tập:'));
        let trainerIdInput = prompt('ID Huấn luyện viên (để trống nếu không chọn):');
        let trainerId = trainerIdInput ? parseInt(trainerIdInput) : null;
        if(members.find(m=>m.id===memId) && plans.find(p=>p.id===planId)){
            let start = new Date().toISOString().slice(0,10);
            let plan = plans.find(p=>p.id===planId);
            let end = null, rem = null;
            if(plan.type === 'time'){ let d=new Date(); d.setDate(d.getDate()+plan.days); end = d.toISOString().slice(0,10);}
            else rem = plan.sessions;
            let newSub = { id: Date.now(), memberId:memId, planId, startDate:start, endDate:end, remainingSessions:rem, status:'active', trainerId: trainerId };
            set(STORE.SUBS, [...subs, newSub]);
            renderSubscriptions();
        } else alert('ID hội viên hoặc ID gói không hợp lệ!');
    });
    document.querySelectorAll('.cancelSub').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); let upd = subs.map(s => s.id===id ? {...s, status:'canceled'} : s); set(STORE.SUBS, upd); renderSubscriptions(); }));
}

// CHECKINS VIEW
function renderCheckins(){
    let members=get(STORE.MEMBERS), subs=get(STORE.SUBS), checkins=get(STORE.CHECKINS);
    viewContent.innerHTML = `<div class="stats-grid"><div class="stat-card"><h4>✅ Tổng lượt check-in</h4><div class="stat-number">${checkins.length}</div></div></div><button class="btn-sm" id="quickCheckin"><i class="fas fa-fingerprint"></i> Check-in nhanh</button><div class="data-table"><table><th>Hội viên</th><th>Thời gian check-in</th><th>Gói áp dụng</th></tr>${checkins.slice().reverse().slice(0,15).map(c => { let mem = members.find(m=>m.id===c.memberId); return `<tr><td>${mem?.name||'N/A'}</td><td>${c.datetime}</td><td>${c.planName}</td></tr>`; }).join('')}</table></div>`;
    
    document.getElementById('quickCheckin')?.addEventListener('click', ()=>{
        let memId = parseInt(prompt('Nhập ID hội viên:'));
        let activeSub = subs.find(s => s.memberId === memId && s.status === 'active');
        if(!activeSub){ alert('Không tìm thấy gói active hoặc sai ID'); return; }
        let plan = get(STORE.PLANS).find(p=>p.id === activeSub.planId);
        if(plan.type === 'sessions' && activeSub.remainingSessions <= 0){ alert('Hết buổi tập, cần gia hạn!'); return; }
        if(plan.type === 'time' && activeSub.endDate && new Date(activeSub.endDate) < new Date()){ alert('Gói đã hết hạn'); return; }
        if(plan.type === 'sessions'){ activeSub.remainingSessions -=1; let allSubs = get(STORE.SUBS); let idx = allSubs.findIndex(s=>s.id===activeSub.id); if(idx!==-1) allSubs[idx].remainingSessions = activeSub.remainingSessions; set(STORE.SUBS, allSubs); }
        let newCheck = { id:Date.now(), memberId:memId, date:new Date().toISOString().slice(0,10), datetime:new Date().toLocaleString(), planName:plan.name };
        set(STORE.CHECKINS, [...get(STORE.CHECKINS), newCheck]);
        alert('Check-in thành công!');
        renderCheckins();
    });
}

// STATS VIEW WITH CHART
function renderStats(){
    let subs = get(STORE.SUBS), plans = get(STORE.PLANS), members=get(STORE.MEMBERS);
    let monthlyRevenue = {};
    subs.forEach(sub => { let month = sub.startDate.slice(0,7); let plan = plans.find(p=>p.id===sub.planId); if(plan) monthlyRevenue[month] = (monthlyRevenue[month]||0)+plan.price; });
    let labels = Object.keys(monthlyRevenue).sort();
    let data = labels.map(l => monthlyRevenue[l]);
    viewContent.innerHTML = `<div class="stats-grid"><div class="stat-card"><h4>📈 Tổng doanh thu: ${subs.reduce((a,s)=>{let p=plans.find(pl=>pl.id===s.planId); return a+(p?p.price:0);},0).toLocaleString()}đ</h4></div></div><canvas id="revenueChart" width="400" height="200" style="background:#1a1a1a; border-radius:1rem; padding:1rem;"></canvas><div class="data-table" style="margin-top:1rem;"><h4>🏆 Top hội viên tập nhiều</h4>${(()=>{ let ch = get(STORE.CHECKINS); let countMap = {}; ch.forEach(c=>{ countMap[c.memberId] = (countMap[c.memberId]||0)+1; }); let sorted = Object.entries(countMap).sort((a,b)=>b[1]-a[1]).slice(0,5); return `<table><tr><th>Hội viên</th><th>Số lần check-in</th></tr>${sorted.map(([mid, cnt])=>{ let mem=members.find(m=>m.id==mid); return `<tr><td>${mem?.name||'N/A'}</td><td>${cnt}</td></tr>`; }).join('')}</table>`; })()}</div>`;
    
    if(chartInstance) chartInstance.destroy();
    let ctx = document.getElementById('revenueChart')?.getContext('2d');
    if(ctx) chartInstance = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Doanh thu (VNĐ)', data, backgroundColor:'#e11d2c', borderRadius:8 }] }, options:{ responsive:true, plugins:{ legend:{ labels:{ color:'white' } } } } });
}

// ABOUT VIEW
function renderAbout(){
    viewContent.innerHTML = `<div style="background:linear-gradient(145deg,#0b0b0b,#1a0f0f); border-radius:2rem; padding:2rem;"><h2><i class="fas fa-dragon"></i> IRON GYM - Hệ thống quản lý & Đào tạo</h2><p>Trang quản lý toàn diện dành cho chủ phòng gym, admin, nhân viên và huấn luyện viên.</p><br><p><i class="fas fa-dumbbell"></i> Đăng ký gói tập linh hoạt, chọn HLV riêng, theo dõi check-in tự động.</p><p><i class="fas fa-chart-line"></i> Báo cáo doanh thu chi tiết, quản lý hội viên chuyên nghiệp.</p><div style="margin-top:1rem;"><img src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600" style="border-radius:20px; width:100%;max-width:350px;"></div></div>`;
}

// ADMIN PANEL VIEW
function renderAdminPanel(){
    if(currentUser.role !== 'admin') { renderDashboard(); return; }
    let users = get(STORE.USERS);
    viewContent.innerHTML = `<h3>Quản lý tài khoản hệ thống</h3><div class="data-table"><table><thead><tr><th>ID</th><th>Tên đăng nhập</th><th>Email</th><th>Vai trò</th><th>Hành động</th></tr></thead><tbody>${users.map(u => `<tr><td>${u.id}</td><td>${u.username}</td><td>${u.email}</td><td><span style="color:${u.role === 'admin' ? '#ff5e5e' : '#ccc'}">${u.role}</span></td><td>${u.username !== 'admin' ? `<button class="action-icon promoteUser" data-id="${u.id}"><i class="fas fa-crown"></i></button><button class="action-icon deleteUser" data-id="${u.id}"><i class="fas fa-user-minus"></i></button>` : 'Mặc định'}</td></tr>`).join('')}</tbody></table></div><button class="btn-sm" id="addUserBtn">+ Tạo tài khoản mới</button>`;
    
    document.getElementById('addUserBtn')?.addEventListener('click', ()=>{
        let uname = prompt('Username mới:');
        let email = prompt('Email:');
        let pwd = prompt('Mật khẩu:');
        let role = confirm('Là admin? (OK = admin, Cancel = user)') ? 'admin' : 'user';
        if(uname && email && pwd){
            let usersList = get(STORE.USERS);
            if(usersList.find(u=>u.username === uname)) alert('Tên đăng nhập đã tồn tại');
            else { usersList.push({id:Date.now(), username:uname, email, password:pwd, role}); set(STORE.USERS, usersList); renderAdminPanel(); }
        }
    });
    document.querySelectorAll('.promoteUser').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); let usersList = get(STORE.USERS); let idx = usersList.findIndex(u=>u.id===id); if(idx!==-1){ usersList[idx].role = usersList[idx].role === 'admin' ? 'user' : 'admin'; set(STORE.USERS, usersList); renderAdminPanel(); } }));
    document.querySelectorAll('.deleteUser').forEach(btn => btn.addEventListener('click', (e)=>{ let id = parseInt(btn.dataset.id); let usersList = get(STORE.USERS); if(usersList.find(u=>u.id===id)?.username === 'admin') return alert('Không thể xóa admin mặc định'); let newUsers = usersList.filter(u=>u.id !== id); set(STORE.USERS, newUsers); renderAdminPanel(); }));
}

// ==================== NAVIGATION & AUTH EVENTS ====================
document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', (e) => {
        if(nav.id === 'logoutSide' || nav.classList.contains('logout-btn')) logout();
        else {
            let view = nav.dataset.view;
            if(view) { activeView = view; document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); nav.classList.add('active'); renderView(); }
        }
    });
});

document.getElementById('logoutTop')?.addEventListener('click', logout);
document.getElementById('logoutSide')?.addEventListener('click', logout);

// Logic Đăng nhập
document.getElementById('loginBtn')?.addEventListener('click', ()=>{
    let uname = document.getElementById('loginUser').value;
    let pwd = document.getElementById('loginPass').value;
    let users = get(STORE.USERS);
    let u = users.find(u => u.username === uname && u.password === pwd);
    if(u){ currentUser = { id:u.id, username:u.username, role:u.role }; localStorage.setItem(STORE.CURRENT_USER, JSON.stringify(currentUser)); showDashboardApp(); }
    else alert('Sai thông tin tài khoản hoặc mật khẩu');
});

// Logic Đăng ký
document.getElementById('registerBtn')?.addEventListener('click', ()=>{
    let uname = document.getElementById('regUser').value;
    let email = document.getElementById('regEmail').value;
    let pwd = document.getElementById('regPass').value;
    if(!uname || !email || !pwd) return alert('Vui lòng điền đầy đủ thông tin');
    let users = get(STORE.USERS);
    if(users.find(u=>u.username===uname)) return alert('Username đã tồn tại');
    users.push({id:Date.now(), username:uname, email, password:pwd, role:'user'});
    set(STORE.USERS, users);
    alert('Đăng ký thành công! Đăng nhập ngay.');
    document.getElementById('toLogin').click();
});

// Chuyển đổi qua lại form Login / Register
document.getElementById('toRegister')?.addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('loginCard').style.display='none'; document.getElementById('registerCard').style.display='block'; });
document.getElementById('toLogin')?.addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('loginCard').style.display='block'; document.getElementById('registerCard').style.display='none'; });

// Khởi chạy ứng dụng ban đầu (Kiểm tra Session)
if(currentUser) showDashboardApp(); else showAuth();