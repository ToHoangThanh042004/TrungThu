/**
 * ========================================================
 * TRUNG THU ONLINE - 3D INTERACTIVE TIKTOK MOTION SCRIPT
 * Features:
 *  1. URL Param parsing (?to=...&from=...&msg=...&photo=...)
 *  2. Stage 1: Glowing Moon & Jade Rabbit (Chạm vào mặt trăng)
 *  3. Stage 2: 3D Celestial Galaxy of Wishes (3D Sphere rotation with touch/mouse)
 *  4. Stage 3: Parchment Scroll Letter with personalized wishes
 *  5. Stage 4: Sparkling Golden Heart particle canvas with photo
 *  6. Web Audio Synthesizer (Romantic lofi melody & chimes)
 *  7. QR Code Generator & Camera QR Scanner
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Navigation & Stages
  const stageMoon = document.getElementById('envelope-section');
  const stageGalaxy = document.getElementById('galaxy-section');
  const stageCard = document.getElementById('card-section');
  const stageHeart = document.getElementById('heart-section');

  const starLanternHero = document.getElementById('star-lantern-hero');
  const btnOpenLetter = document.getElementById('btn-open-letter');
  const btnViewLetter = document.getElementById('btn-view-letter');
  const btnViewHeart = document.getElementById('btn-view-heart');
  const btnCloseCard = document.getElementById('btn-close-card');
  const btnBackToGalaxy = document.getElementById('btn-back-to-galaxy');
  const btnReReadLetter = document.getElementById('btn-re-read-letter');

  const cardReceiverName = document.getElementById('card-receiver-name');
  const cardSenderName = document.getElementById('card-sender-name');
  const cardLetterBody = document.getElementById('card-letter-body');
  const recipientGreetingIntro = document.getElementById('recipient-greeting-intro');
  const couplePhotoImg = document.getElementById('couple-photo-img');

  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');
  const bgVideo = document.getElementById('bg-video-element');

  // QR Creator & Scanner
  const btnOpenCreator = document.getElementById('btn-open-creator');
  const btnShareCard = document.getElementById('btn-share-card');
  const modalCreator = document.getElementById('modal-qr-creator');
  const btnCloseCreator = document.getElementById('btn-close-creator');
  const btnGenerateQr = document.getElementById('btn-generate-qr');
  const qrResultContainer = document.getElementById('qr-result-container');
  const qrcodeDisplay = document.getElementById('qrcode-display');
  const btnDownloadQr = document.getElementById('btn-download-qr');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnTestPreview = document.getElementById('btn-test-preview');
  const copyStatus = document.getElementById('copy-status');

  const btnOpenScanner = document.getElementById('btn-open-scanner');
  const modalScanner = document.getElementById('modal-qr-scanner');
  const btnCloseScanner = document.getElementById('btn-close-scanner');
  const btnStopScanner = document.getElementById('btn-stop-scanner');
  const scannerResultMsg = document.getElementById('scanner-result-msg');

  // Wish & Fireworks
  const btnMakeWish = document.getElementById('btn-make-wish');
  const modalWish = document.getElementById('modal-wish');
  const btnCloseWish = document.getElementById('btn-close-wish');
  const btnSendWish = document.getElementById('btn-send-wish');
  const inputWishText = document.getElementById('input-wish-text');
  const btnFireworks = document.getElementById('btn-fireworks');
  const toastEl = document.getElementById('toast');

  // Canvases
  const skyCanvas = document.getElementById('sky-canvas');
  const skyCtx = skyCanvas.getContext('2d');
  const heartCanvas = document.getElementById('heart-canvas');
  const heartCtx = heartCanvas ? heartCanvas.getContext('2d') : null;

  // 3D Galaxy elements
  const galaxyViewport = document.getElementById('galaxy-viewport');
  const galaxySphere = document.getElementById('galaxy-sphere');

  // State
  let qrCodeInstance = null;
  let html5QrCodeScanner = null;
  let isScanning = false;
  let generatedShareUrl = '';

  /* ========================================================
     1. XỬ LÝ URL PARAMS (?to=...&from=...&msg=...&photo=...)
     ======================================================== */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      to: params.get('to'),
      from: params.get('from'),
      msg: params.get('msg'),
      photo: params.get('photo'),
    };
  }

  const currentParams = getUrlParams();

  function applyCustomData() {
    if (currentParams.to) {
      const decodedTo = decodeURIComponent(currentParams.to);
      cardReceiverName.textContent = decodedTo;
      recipientGreetingIntro.textContent = `${decodedTo} ơi, ấn vào mặt trăng để mở thiệp... ✨`;
      document.title = `Thiệp Trung Thu gửi tặng ${decodedTo} 🌕`;
    }

    if (currentParams.from) {
      cardSenderName.textContent = `${decodeURIComponent(currentParams.from)} 🏮`;
    }

    if (currentParams.msg) {
      cardLetterBody.textContent = `"${decodeURIComponent(currentParams.msg)}"`;
    }

    if (currentParams.photo && couplePhotoImg) {
      couplePhotoImg.src = decodeURIComponent(currentParams.photo);
    }
  }

  applyCustomData();

  /* ========================================================
     2. HỆ THỐNG ÂM THANH WEB AUDIO SYNTHESIZER
     (Giai điệu lãng mạn nhẹ nhàng)
     ======================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timerId = null;
      this.step = 0;
      this.notes = [
        261.63, 293.66, 329.63, 392.00, 440.00,
        523.25, 587.33, 659.25, 783.99, 880.00
      ];
      this.melody = [4, 5, 7, 5, 8, 7, 5, 3, 4, 5, 7, 8, 9, 8, 7, 5];
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.init();
      if (this.isPlaying) {
        this.stop();
        return false;
      } else {
        this.play();
        return true;
      }
    }

    play() {
      this.isPlaying = true;
      this.step = 0;
      this.scheduleNote();
      if (bgVideo) {
        bgVideo.play().catch(() => {});
      }
    }

    stop() {
      this.isPlaying = false;
      if (this.timerId) clearTimeout(this.timerId);
      if (bgVideo) bgVideo.pause();
    }

    scheduleNote() {
      if (!this.isPlaying) return;
      const noteIdx = this.melody[this.step % this.melody.length];
      const freq = this.notes[noteIdx] || 440;
      this.playTone(freq, 1.2, 0.18);

      if (this.step % 4 === 0) {
        this.playTone(freq / 2, 2.0, 0.12);
      }

      this.step++;
      const delay = (this.step % 4 === 3) ? 650 : 420;
      this.timerId = setTimeout(() => this.scheduleNote(), delay);
    }

    playTone(freq, duration = 1, volume = 0.2) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    playChime() {
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 1.4, 0.22), i * 80);
      });
    }

    playFirework() {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    }
  }

  const sound = new SoundEngine();

  btnToggleSound.addEventListener('click', () => {
    const isNowPlaying = sound.toggle();
    if (isNowPlaying) {
      soundIcon.textContent = '🔊';
      btnToggleSound.querySelector('.btn-text').textContent = 'Tắt Nhạc';
      showToast('Đã bật giai điệu Trung Thu 🎵');
    } else {
      soundIcon.textContent = '🎵';
      btnToggleSound.querySelector('.btn-text').textContent = 'Bật Nhạc';
      showToast('Đã tạm dừng nhạc');
    }
  });

  /* ========================================================
     3. THIÊN HÀ LỜI CHÚC 3D (3D GALAXY SPHERE ENGINE)
     (Hệt như cảnh xoay các dòng chữ 3D trong clip TikTok)
     ======================================================== */
  class GalaxySphere3D {
    constructor(container, radius = 200) {
      this.container = container;
      this.radius = radius;
      this.items = [];
      this.angleX = 0;
      this.angleY = 0;
      this.speedX = 0.002;
      this.speedY = 0.003;
      this.isDragging = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.targetSpeedX = 0.002;
      this.targetSpeedY = 0.003;

      this.initWords();
      this.bindEvents();
      this.animate();
    }

    initWords() {
      const receiver = currentParams.to ? decodeURIComponent(currentParams.to) : 'Bạn';

      // ===== LỜI CHÚC & LỜI KHEN TRUNG THU (không có lời yêu) =====
      const wordList = [
        // --- Lời chào & Lời chúc Trung Thu ---
        `🌕 Chúc ${receiver} Trung Thu Vui Vẻ!`,
        'Chúc Mừng Tết Đoàn Viên 🥮',
        'Trung Thu bình an & ấm áp',
        'Mừng Rằm Tháng Tám 🏮',
        'Chúc mọi điều tốt đẹp',
        'Bình an đến muôn nơi ✨',
        'Tết Đoàn Viên sum họp',
        'Ngập tràn niềm vui và tiếng cười',
        'Sức khỏe dồi dào mỗi ngày',
        'Mọi ước nguyện thành hiện thực',
        'Vạn sự như ý 🌟',
        'Bình an thịnh vượng',
        'Hạnh phúc viên mãn',
        'May mắn đong đầy',
        'Cuộc sống tươi sáng mỗi ngày',
        'Luôn mỉm cười rạng rỡ',
        'Trọn vẹn niềm vui',
        'Tết Trung Thu ấm áp 🌕',

        // --- Lời khen ngợi ---
        `${receiver} thật tài năng 💫`,
        `${receiver} luôn toả sáng ✨`,
        'Bạn thật xuất sắc!',
        'Người thật đặc biệt 🌟',
        'Tài năng vô hạn',
        'Thông minh & sáng tạo',
        'Nghị lực phi thường 💪',
        'Luôn truyền cảm hứng',
        'Nhân cách tuyệt vời',
        'Tâm hồn trong sáng',
        'Nụ cười rạng ngời như trăng',
        'Bước đi vững chắc & tự tin',
        'Trái tim nhân hậu',
        'Kiên trì & cố gắng mỗi ngày',
        'Tinh thần lạc quan',
        'Luôn lan toả năng lượng tích cực',
        'Người bạn tuyệt vời nhất',
        'Đáng kính & đáng ngưỡng mộ',

        // --- Hình ảnh & ẩn dụ Trung Thu ---
        'Xinh đẹp như Chị Hằng 🌕',
        'Dịu dàng như ánh trăng',
        'Ngọt ngào như bánh dẻo 🥮',
        'Sáng ngời tựa vầng nguyệt',
        'Rực rỡ như đèn lồng đêm hội',
        'Trong trẻo như đêm Rằm',
        'Ấm áp như lửa đèn Trung Thu',
        'Thỏ Ngọc cung trăng 🐇',
        'Hương quế bay khắp nơi',

        // --- Lời chúc tương lai ---
        'Thành công rực rỡ phía trước',
        'Vươn cao hơn mỗi ngày',
        'Ước mơ chắp cánh bay xa',
        'Tương lai xán lạn đón chờ',
        'Học hành giỏi giang 📚',
        'Sự nghiệp thăng tiến',
        'Sống thật & sống tốt',
        'Trưởng thành từng bước',

        // --- Emoji bầu không khí Trung Thu ---
        '🌕', '🌙', '⭐', '✨', '💫', '🌟',
        '🏮', '🏮', '🐇', '🥮', '🎆', '🎇',
        '🌸', '🍃', '🌺', '🦋'
      ];

      if (currentParams.photo) {
        wordList.push({ type: 'photo', url: decodeURIComponent(currentParams.photo) });
      }

      // Danh sách emoji để nhận diện class
      const emojiSet = new Set(['🌕','🌙','⭐','✨','💫','🌟','🏮','🐇','🥮','🎆','🎇','🌸','🍃','🌺','🦋']);

      // Từ khoá nổi bật màu vàng
      const highlightKeywords = [receiver, 'Chúc Mừng', 'Tết Đoàn Viên', 'toả sáng', 'Xuất Sắc'];

      this.container.innerHTML = '';
      const count = wordList.length;

      // Thuật toán Fibonacci Sphere – rải đều các từ trên bề mặt cầu
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

        const x = this.radius * Math.sin(phi) * Math.cos(theta);
        const y = this.radius * Math.sin(phi) * Math.sin(theta);
        const z = this.radius * Math.cos(phi);

        const el = document.createElement('div');
        el.className = 'galaxy-tag';

        const item = wordList[i];
        if (typeof item === 'object' && item.type === 'photo') {
          el.classList.add('photo-tag');
          const img = document.createElement('img');
          img.src = item.url;
          el.appendChild(img);
        } else if (emojiSet.has(item)) {
          el.classList.add('emoji-tag');
          el.textContent = item;
        } else {
          el.textContent = item;
          if (highlightKeywords.some(kw => item.includes(kw))) {
            el.classList.add('highlight');
          }
        }

        this.container.appendChild(el);
        this.items.push({ el, x, y, z });
      }
    }

    bindEvents() {
      const target = galaxyViewport || this.container;

      // Chuột
      target.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.speedY = dx * 0.0004;
        this.speedX = -dy * 0.0004;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      // Chạm cảm ứng trên điện thoại
      target.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          this.isDragging = true;
          this.lastMouseX = e.touches[0].clientX;
          this.lastMouseY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDragging || !e.touches || !e.touches[0]) return;
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.speedY = dx * 0.0005;
        this.speedX = -dy * 0.0005;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    rotateX(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (let item of this.items) {
        const y = item.y * cos - item.z * sin;
        const z = item.y * sin + item.z * cos;
        item.y = y;
        item.z = z;
      }
    }

    rotateY(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (let item of this.items) {
        const x = item.x * cos + item.z * sin;
        const z = -item.x * sin + item.z * cos;
        item.x = x;
        item.z = z;
      }
    }

    animate() {
      // Dần dần hồi phục tốc độ quay tự nhiên khi nhả tay
      if (!this.isDragging) {
        this.speedX += (this.targetSpeedX - this.speedX) * 0.05;
        this.speedY += (this.targetSpeedY - this.speedY) * 0.05;
      }

      this.rotateX(this.speedX);
      this.rotateY(this.speedY);

      // Cập nhật vị trí hiển thị và độ sâu
      for (let item of this.items) {
        const perspective = 350;
        const scale = perspective / (perspective + item.z);
        const alpha = Math.max(0.2, (item.z + this.radius) / (2 * this.radius) * 0.8 + 0.2);

        item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, ${item.z}px) scale(${scale})`;
        item.el.style.opacity = alpha;
        item.el.style.zIndex = Math.floor(item.z + this.radius);
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  let galaxyInstance = null;

  /* ========================================================
     4. TRÁI TIM ÁNH SÁNG VÀNG LẤP LÁNH (SPARKLING HEART CANVAS)
     (Cảnh kết thúc lãng mạn trong video TikTok)
     ======================================================== */
  class SparklingHeart {
    constructor(canvas) {
      this.canvas = canvas;
      if (!this.canvas) return;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.ringParticles = [];
      this.init();
      this.animate();
    }

    init() {
      this.width = this.canvas.width = 280;
      this.height = this.canvas.height = 280;
      this.sparkles = []; // Hạt lấp lánh bắn ngẫu nhiên
      this.time = 0;

      // Lớp 1: Hạt trượt dọc viền trái tim (dày hơn)
      const heartColors = ['#ffd166', '#ffeaa7', '#f59e0b', '#ff6b6b', '#ffffff'];
      for (let i = 0; i < 120; i++) {
        this.particles.push({
          t: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.012 + 0.005,
          size: Math.random() * 3 + 1,
          glow: Math.random() * 18 + 6,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
          trail: [] // Vệt đuôi sao
        });
      }

      // Lớp 2: Hạt hào quang xoay tròn quanh ảnh (2 vòng)
      for (let i = 0; i < 60; i++) {
        const inner = i < 30;
        this.ringParticles.push({
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 0.018 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
          radius: inner ? (Math.random() * 8 + 100) : (Math.random() * 12 + 118),
          size: Math.random() * 2.5 + 0.8,
          color: inner ? '#ffd166' : '#ffffff',
          twinkle: Math.random() * Math.PI * 2 // phase để nhấp nháy
        });
      }
    }

    spawnSparkle() {
      // Thỉnh thoảng bắn hạt sáng nhỏ từ trái tim ra ngoài
      const t = Math.random() * Math.PI * 2;
      const pt = this.getHeartPoint(t);
      const angle = Math.random() * Math.PI * 2;
      this.sparkles.push({
        x: pt.x, y: pt.y,
        vx: Math.cos(angle) * (Math.random() * 1.5 + 0.5),
        vy: Math.sin(angle) * (Math.random() * 1.5 + 0.5),
        alpha: 1,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#ffd166' : '#fff'
      });
    }

    getHeartPoint(t, scale = 7.5) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return {
        x: this.width / 2 + x * scale,
        y: this.height / 2 - 10 + y * scale
      };
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.time++;

      // Thỉnh thoảng bắn sparkle
      if (this.time % 4 === 0) this.spawnSparkle();

      // Lớp 1: Hạt trái tim
      for (let p of this.particles) {
        p.t += p.speed;
        if (p.t > Math.PI * 2) p.t -= Math.PI * 2;
        const pt = this.getHeartPoint(p.t);

        // Vệt đuôi sao chổi nhỏ
        p.trail.push({ x: pt.x, y: pt.y });
        if (p.trail.length > 5) p.trail.shift();

        for (let ti = 0; ti < p.trail.length; ti++) {
          const tp = p.trail[ti];
          const trailAlpha = (ti + 1) / p.trail.length * 0.4;
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(tp.x, tp.y, p.size * 0.5, 0, Math.PI * 2);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = trailAlpha;
          this.ctx.fill();
          this.ctx.restore();
        }

        // Đầu hạt phát sáng
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.glow;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Lớp 2: Hào quang vòng nhấp nháy
      for (let rp of this.ringParticles) {
        rp.angle += rp.speed;
        rp.twinkle += 0.08;
        const rx = this.width / 2 + Math.cos(rp.angle) * rp.radius;
        const ry = this.height / 2 + Math.sin(rp.angle) * (rp.radius * 0.38);
        const alpha = 0.55 + 0.45 * Math.sin(rp.twinkle);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, rp.size, 0, Math.PI * 2);
        this.ctx.fillStyle = rp.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.shadowColor = '#ffd166';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Lớp 3: Sparkle bắn ra từ trái tim
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const sp = this.sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.03;

        if (sp.alpha <= 0) { this.sparkles.splice(i, 1); continue; }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        this.ctx.fillStyle = sp.color;
        this.ctx.globalAlpha = sp.alpha;
        this.ctx.shadowColor = sp.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  let heartInstance = null;

  /* ========================================================
     5. ĐIỀU HƯỚNG CHUYỂN CẢNH (STAGE NAVIGATION)
     ======================================================== */
  function goToGalaxyStage() {
    sound.init();
    sound.playChime();

    // Hiệu ứng pháo giấy tưng bừng khi mở cổng vũ trụ
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#ffd166', '#ff4d6d', '#06d6a0', '#ffea79']
      });
    }

    // Tự động bật nhạc nếu chưa bật
    if (!sound.isPlaying) {
      sound.play();
      soundIcon.textContent = '🔊';
      btnToggleSound.querySelector('.btn-text').textContent = 'Tắt Nhạc';
    }

    // Ẩn trăng, hiện thiên hà 3D
    stageMoon.classList.add('hidden');
    stageGalaxy.classList.remove('hidden');
    stageCard.classList.add('hidden');
    stageHeart.classList.add('hidden');

    if (!galaxyInstance) {
      galaxyInstance = new GalaxySphere3D(galaxySphere, 175);
    }

    showToast('✨ Vuốt trên màn hình để xoay thiên hà lời chúc!');
  }

  // Chạm vào mặt trăng hoặc nút để vào thiên hà
  starLanternHero.addEventListener('click', goToGalaxyStage);
  btnOpenLetter.addEventListener('click', goToGalaxyStage);

  // Mở bức thư từ thiên hà
  btnViewLetter.addEventListener('click', () => {
    sound.playChime();
    stageCard.classList.remove('hidden');
  });

  // Đóng bức thư quay lại thiên hà
  btnCloseCard.addEventListener('click', () => {
    stageCard.classList.add('hidden');
  });

  // Mở cảnh Trái Tim Ánh Sáng từ thiên hà
  const lyricLine = document.getElementById('lyric-line');
  const heartLyricLines = [
    '✨ "Bạn tỏa sáng như vầng trăng Rằm — rực rỡ, dịu dàng và đáng kính ngưỡng..." ✨',
    '🌕 Chúc bạn Trung Thu bình an, hạnh phúc và tràn đầy niềm vui!',
    '💫 Tài năng của bạn là ánh sáng soi đường cho nhiều người xung quanh.',
    '🏮 Mừng Tết Đoàn Viên — mọi điều tốt đẹp hãy đến với bạn!',
    '🌟 Bạn thật đặc biệt: kiên trì, nhân hậu và luôn truyền cảm hứng.',
    '🥮 Ngọt ngào như bánh dẻo Trung Thu — chúc bạn cuộc sống viên mãn!',
    '⭐ Ước mơ của bạn xứng đáng được thực hiện. Hãy vươn cao hơn nữa!',
    '🐇 Thỏ Ngọc cung trăng chuyển lời chúc: sức khỏe dồi dào mỗi ngày!',
    '🎆 Thành công rực rỡ phía trước đang chờ đón bạn. Bước tiếp nhé!',
    '🌙 Dịu dàng như ánh trăng đêm nay — bạn làm cho cuộc đời thêm đẹp.',
  ];
  let lyricIdx = 0;
  let lyricInterval = null;

  function startLyricCycle() {
    if (lyricLine) lyricLine.textContent = heartLyricLines[0];
    clearInterval(lyricInterval);
    lyricInterval = setInterval(() => {
      lyricIdx = (lyricIdx + 1) % heartLyricLines.length;
      if (lyricLine) {
        lyricLine.style.opacity = '0';
        lyricLine.style.transition = 'opacity 0.6s ease';
        setTimeout(() => {
          lyricLine.textContent = heartLyricLines[lyricIdx];
          lyricLine.style.opacity = '1';
        }, 620);
      }
    }, 4000);
  }

  btnViewHeart.addEventListener('click', () => {
    sound.playChime();
    stageGalaxy.classList.add('hidden');
    stageCard.classList.add('hidden');
    stageHeart.classList.remove('hidden');

    if (!heartInstance && heartCanvas) {
      heartInstance = new SparklingHeart(heartCanvas);
    }
    startLyricCycle();
  });

  // Về lại thiên hà từ trái tim
  btnBackToGalaxy.addEventListener('click', () => {
    stageHeart.classList.add('hidden');
    stageGalaxy.classList.remove('hidden');
  });

  // Đọc lại bức thư từ trái tim
  btnReReadLetter.addEventListener('click', () => {
    stageHeart.classList.add('hidden');
    stageCard.classList.remove('hidden');
  });

  /* ========================================================
     6. BẦU TRỜI NỀN ĐẦY HIỆU ỨNG + PHÁO HOA TƯƠNG TÁC
     ======================================================== */
  let width = (skyCanvas.width = window.innerWidth);
  let height = (skyCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = skyCanvas.width = window.innerWidth;
    height = skyCanvas.height = window.innerHeight;
    initStarfield();
  });

  // === SAO LẤP LÁNH ===
  const stars = [];
  function initStarfield() {
    stars.length = 0;
    const n = Math.floor((width * height) / 4200);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.92,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: (Math.random() * 0.015 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
      });
    }
  }
  initStarfield();

  // === SAO BĂNG ===
  const shootingStars = [];
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * width * 0.85,
      y: Math.random() * height * 0.35,
      len: Math.random() * 90 + 40,
      speed: Math.random() * 8 + 10,
      angle: Math.PI / 4 + (Math.random() * 0.25 - 0.12),
      alpha: 1,
    });
  }
  setInterval(() => { if (Math.random() > 0.35) spawnShootingStar(); }, 3800);

  // === ĐÈN TRỜI MINI BAY LƠ LỬNG ===
  class MiniLantern {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : height + Math.random() * 60 + 20;
      this.size = Math.random() * 13 + 9;
      this.speedY = Math.random() * 0.38 + 0.2;
      this.swayA = Math.random() * Math.PI * 2;
      this.swayS = Math.random() * 0.012 + 0.006;
      this.swayD = Math.random() * 1.1 + 0.4;
      this.alpha = Math.random() * 0.45 + 0.45;
      this.hue = Math.random() > 0.35 ? 40 : 12;
    }
    update() {
      this.y -= this.speedY;
      this.swayA += this.swayS;
      this.x += Math.sin(this.swayA) * this.swayD;
      if (this.y < -60) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.alpha;
      const g = ctx.createRadialGradient(0, 0, this.size * 0.15, 0, 0, this.size * 1.6);
      g.addColorStop(0, `hsla(${this.hue},100%,70%,0.55)`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.35, this.size * 0.5);
      ctx.quadraticCurveTo(-this.size * 0.55, 0, -this.size * 0.38, -this.size * 0.48);
      ctx.quadraticCurveTo(0, -this.size * 0.58, this.size * 0.38, -this.size * 0.48);
      ctx.quadraticCurveTo(this.size * 0.55, 0, this.size * 0.35, this.size * 0.5);
      ctx.closePath();
      const b = ctx.createLinearGradient(0, -this.size * 0.5, 0, this.size * 0.5);
      b.addColorStop(0, `hsla(${this.hue},90%,52%,0.9)`);
      b.addColorStop(0.7, `hsla(${this.hue + 8},100%,72%,0.9)`);
      b.addColorStop(1, `hsla(15,100%,58%,0.9)`);
      ctx.fillStyle = b;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, this.size * 0.4, this.size * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }
  const lanterns = Array.from({ length: 18 }, () => new MiniLantern());

  // === BỤI SAO VÀNG TRÔI DẠT ===
  const dustParticles = [];
  (function initDust() {
    for (let i = 0; i < 65; i++) {
      dustParticles.push({
        x: Math.random() * (typeof width !== 'undefined' ? width : window.innerWidth),
        y: Math.random() * (typeof height !== 'undefined' ? height : window.innerHeight),
        r: Math.random() * 1.2 + 0.25,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -Math.random() * 0.22 - 0.08,
        alpha: Math.random() * 0.5 + 0.12,
        twinkle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#ffd166' : '#ffffff',
      });
    }
  })();

  // === PHÁO HOA ===
  const sparks = [];
  function createFireworkSparks(x, y) {
    sound.playFirework();
    const count = 35;
    const colors = ['#ffd166', '#ff4d6d', '#34d399', '#60a5fa', '#f59e0b'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
      const speed = Math.random() * 4.5 + 2;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: Math.random() * 0.025 + 0.015,
        radius: Math.random() * 2 + 1.2
      });
    }
  }

  // === VÒNG LẶP RENDER TỔNG HỢP ===
  function renderSky() {
    skyCtx.clearRect(0, 0, width, height);

    // 1. Sao lấp lánh
    for (const s of stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.05) s.speed = -s.speed;
      skyCtx.beginPath();
      skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      skyCtx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      skyCtx.fill();
    }

    // 2. Bụi sao vàng trôi
    for (const d of dustParticles) {
      d.x += d.vx;
      d.y += d.vy;
      d.twinkle += 0.03;
      if (d.x < 0) d.x = width; if (d.x > width) d.x = 0;
      if (d.y < 0) d.y = height; if (d.y > height) d.y = 0;
      const a = d.alpha * (0.55 + 0.45 * Math.sin(d.twinkle));
      skyCtx.beginPath();
      skyCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      skyCtx.fillStyle = d.color;
      skyCtx.globalAlpha = a;
      skyCtx.fill();
      skyCtx.globalAlpha = 1;
    }

    // 3. Sao băng
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.022;
      if (ss.alpha <= 0) { shootingStars.splice(i, 1); continue; }
      skyCtx.save();
      const grad = skyCtx.createLinearGradient(
        ss.x, ss.y,
        ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len
      );
      grad.addColorStop(0, `rgba(255,234,167,${ss.alpha})`);
      grad.addColorStop(1, 'rgba(255,234,167,0)');
      skyCtx.strokeStyle = grad;
      skyCtx.lineWidth = 2;
      skyCtx.beginPath();
      skyCtx.moveTo(ss.x, ss.y);
      skyCtx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
      skyCtx.stroke();
      skyCtx.restore();
    }

    // 4. Đèn trời mini
    for (const l of lanterns) { l.update(); l.draw(skyCtx); }

    // 5. Pháo hoa tia sáng
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.07; sp.alpha -= sp.decay;
      if (sp.alpha <= 0) { sparks.splice(i, 1); continue; }
      skyCtx.beginPath();
      skyCtx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      skyCtx.fillStyle = sp.color;
      skyCtx.globalAlpha = sp.alpha;
      skyCtx.fill();
      skyCtx.globalAlpha = 1;
    }

    requestAnimationFrame(renderSky);
  }
  requestAnimationFrame(renderSky);

  skyCanvas.addEventListener('click', (e) => {
    createFireworkSparks(e.clientX, e.clientY);
  });

  btnFireworks.addEventListener('click', () => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffd166', '#ff4d6d', '#ffea79', '#38bdf8']
      });
    }
    createFireworkSparks(width * 0.35, height * 0.35);
    createFireworkSparks(width * 0.65, height * 0.3);
  });

  /* ========================================================
     7. TẠO MÃ QR THIỆP CÁ NHÂN HÓA (ĐU TREND TIKTOK)
     ======================================================== */
  function openCreatorModal() {
    modalCreator.classList.remove('hidden');
  }

  function closeCreatorModal() {
    modalCreator.classList.add('hidden');
  }

  btnOpenCreator.addEventListener('click', openCreatorModal);
  btnShareCard.addEventListener('click', openCreatorModal);
  btnCloseCreator.addEventListener('click', closeCreatorModal);

  modalCreator.addEventListener('click', (e) => {
    if (e.target === modalCreator) closeCreatorModal();
  });

  btnGenerateQr.addEventListener('click', () => {
    const receiver = document.getElementById('input-receiver').value.trim();
    const message = document.getElementById('input-message').value.trim();
    const sender = document.getElementById('input-sender').value.trim();
    const photo = document.getElementById('input-photo').value.trim();

    if (!receiver) {
      showToast('⚠️ Vui lòng nhập tên người nhận!');
      document.getElementById('input-receiver').focus();
      return;
    }

    const currentBaseUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams();
    urlParams.set('to', receiver);
    if (message) urlParams.set('msg', message);
    if (sender) urlParams.set('from', sender);
    if (photo) urlParams.set('photo', photo);

    generatedShareUrl = `${currentBaseUrl}?${urlParams.toString()}`;

    qrcodeDisplay.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      qrCodeInstance = new QRCode(qrcodeDisplay, {
        text: generatedShareUrl,
        width: 190,
        height: 190,
        colorDark: '#0e122b',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      qrResultContainer.classList.remove('hidden');
      copyStatus.classList.add('hidden');
      showToast('✨ Đã sinh mã QR thiên hà 3D thành công!');
    }
  });

  btnDownloadQr.addEventListener('click', () => {
    const img = qrcodeDisplay.querySelector('img');
    const canvasEl = qrcodeDisplay.querySelector('canvas');
    let dataUrl = '';

    if (img && img.src) {
      dataUrl = img.src;
    } else if (canvasEl) {
      dataUrl = canvasEl.toDataURL('image/png');
    }

    if (!dataUrl) {
      showToast('⚠️ Vui lòng tạo mã QR trước khi tải!');
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `Thiep_Trung_Thu_3D_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('📥 Đã tải ảnh mã QR về máy!');
  });

  btnCopyLink.addEventListener('click', async () => {
    if (!generatedShareUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedShareUrl);
      } else {
        const temp = document.createElement('input');
        temp.value = generatedShareUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      copyStatus.classList.remove('hidden');
      showToast('📋 Đã sao chép link thiệp!');
    } catch (err) {
      showToast('⚠️ Không thể sao chép tự động.');
    }
  });

  btnTestPreview.addEventListener('click', () => {
    if (!generatedShareUrl) return;
    window.location.href = generatedShareUrl;
  });

  /* ========================================================
     8. QUÉT MÃ QR BẰNG CAMERA & AUTO CHUYỂN CẢNH
     ======================================================== */
  function openScannerModal() {
    modalScanner.classList.remove('hidden');
    startQrScanner();
  }

  function closeScannerModal() {
    stopQrScanner();
    modalScanner.classList.add('hidden');
  }

  btnOpenScanner.addEventListener('click', openScannerModal);
  btnCloseScanner.addEventListener('click', closeScannerModal);
  btnStopScanner.addEventListener('click', closeScannerModal);

  modalScanner.addEventListener('click', (e) => {
    if (e.target === modalScanner) closeScannerModal();
  });

  function startQrScanner() {
    if (typeof Html5Qrcode === 'undefined') {
      scannerResultMsg.textContent = 'Lỗi: Không tìm thấy thư viện quét mã!';
      return;
    }

    if (isScanning) return;

    scannerResultMsg.textContent = 'Đang khởi động camera...';
    html5QrCodeScanner = new Html5Qrcode('qr-reader');

    const config = {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0
    };

    html5QrCodeScanner
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => onQrCodeScanned(decodedText),
        () => {}
      )
      .then(() => {
        isScanning = true;
        scannerResultMsg.textContent = 'Đã kết nối camera! Hãy đưa mã QR vào khung.';
      })
      .catch((err) => {
        isScanning = false;
        scannerResultMsg.textContent = 'Không thể mở camera. Vui lòng cấp quyền truy cập camera trên trình duyệt!';
      });
  }

  function stopQrScanner() {
    if (html5QrCodeScanner && isScanning) {
      html5QrCodeScanner.stop().then(() => {
        isScanning = false;
        html5QrCodeScanner.clear();
      }).catch(() => {
        isScanning = false;
      });
    }
  }

  function onQrCodeScanned(decodedText) {
    sound.playChime();
    scannerResultMsg.textContent = `🎉 Quét mã thành công!`;
    stopQrScanner();

    setTimeout(() => {
      closeScannerModal();

      try {
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
          const scannedUrl = new URL(decodedText);
          const to = scannedUrl.searchParams.get('to');
          const from = scannedUrl.searchParams.get('from');
          const msg = scannedUrl.searchParams.get('msg');
          const photo = scannedUrl.searchParams.get('photo');

          if (to || msg || from || photo) {
            if (to) {
              cardReceiverName.textContent = decodeURIComponent(to);
              currentParams.to = to;
            }
            if (from) cardSenderName.textContent = `${decodeURIComponent(from)} 🏮`;
            if (msg) cardLetterBody.textContent = `"${decodeURIComponent(msg)}"`;
            if (photo && couplePhotoImg) {
              couplePhotoImg.src = decodeURIComponent(photo);
              currentParams.photo = photo;
            }

            // Tự động nhảy thẳng vào Thiên Hà Lời Chúc 3D!
            goToGalaxyStage();
            showToast('🌕 Đã mở thiệp Trung Thu 3D từ mã QR!');
            return;
          } else {
            window.location.href = decodedText;
            return;
          }
        }
      } catch (e) {}

      // Nếu là text thông thường
      cardLetterBody.textContent = `"${decodedText}"`;
      goToGalaxyStage();
      showToast('💌 Đã giải mã thông điệp!');
    }, 500);
  }

  /* ========================================================
     9. THẢ ĐÈN TRỜI ƯỚC NGUYỆN
     ======================================================== */
  btnMakeWish.addEventListener('click', () => {
    modalWish.classList.remove('hidden');
    inputWishText.focus();
  });

  btnCloseWish.addEventListener('click', () => {
    modalWish.classList.add('hidden');
  });

  modalWish.addEventListener('click', (e) => {
    if (e.target === modalWish) modalWish.classList.add('hidden');
  });

  btnSendWish.addEventListener('click', () => {
    const wishText = inputWishText.value.trim();
    if (!wishText) {
      showToast('⚠️ Vui lòng viết điều ước của bạn!');
      return;
    }

    sound.playChime();
    modalWish.classList.add('hidden');
    inputWishText.value = '';

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#ffd166', '#ffea79', '#ff4d6d']
      });
    }

    showToast(`🏮 Điều ước "${wishText}" đã được thả lên đêm trăng rằm!`);
  });

  /* ========================================================
     10. TOAST THÔNG BÁO
     ======================================================== */
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 3200);
  }
});
