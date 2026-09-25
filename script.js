/**
 * ========================================================
 * ĐÊM RẰM TRUNG THU - INTERACTIVE JAVASCRIPT
 * Features:
 *  - URL Parameter decoding (?to=...&from=...&msg=...)
 *  - Interactive Canvas: Sky lanterns, starry night, shooting stars, fireworks
 *  - Web Audio API Synthesizer (Lofi pentatonic melody & chimes)
 *  - Built-in QR Code Generator (Downloadable image & copy link)
 *  - HTML5 Camera QR Code Scanner with auto-decoding
 *  - Wish Lantern release physics & Confetti celebration
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  
  const envelopeSection = document.getElementById('envelope-section');
  const cardSection = document.getElementById('card-section');
  const starLanternHero = document.getElementById('star-lantern-hero');
  const btnOpenLetter = document.getElementById('btn-open-letter');
  
  const cardReceiverName = document.getElementById('card-receiver-name');
  const cardSenderName = document.getElementById('card-sender-name');
  const cardLetterBody = document.getElementById('card-letter-body');
  const recipientGreetingIntro = document.getElementById('recipient-greeting-intro');
  
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const soundIcon = document.getElementById('sound-icon');
  
  const btnOpenScanner = document.getElementById('btn-open-scanner');
  const modalScanner = document.getElementById('modal-qr-scanner');
  const btnCloseScanner = document.getElementById('btn-close-scanner');
  const btnStopScanner = document.getElementById('btn-stop-scanner');
  const scannerResultMsg = document.getElementById('scanner-result-msg');
  
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
  
  const btnMakeWish = document.getElementById('btn-make-wish');
  const modalWish = document.getElementById('modal-wish');
  const btnCloseWish = document.getElementById('btn-close-wish');
  const btnSendWish = document.getElementById('btn-send-wish');
  const inputWishText = document.getElementById('input-wish-text');
  
  const btnFireworks = document.getElementById('btn-fireworks');
  const toastEl = document.getElementById('toast');

  // State
  let qrCodeInstance = null;
  let html5QrCodeScanner = null;
  let isScanning = false;
  let generatedShareUrl = '';

  /* ========================================================
     1. XỬ LÝ DỮ LIỆU TỪ URL (KHI QUÉT MÃ QR MỞ TRANG)
     ======================================================== */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    const from = params.get('from');
    const msg = params.get('msg');
    return { to, from, msg };
  }

  function applyCustomGreeting() {
    const { to, from, msg } = getUrlParams();

    if (to) {
      const decodedTo = decodeURIComponent(to);
      cardReceiverName.textContent = decodedTo;
      recipientGreetingIntro.textContent = `${decodedTo} ơi, có một bức thư bí mật dưới trăng rằm dành riêng cho bạn! ✨`;
      document.title = `Thiệp Trung Thu gửi tặng ${decodedTo} 🌕`;
    }

    if (from) {
      cardSenderName.textContent = `${decodeURIComponent(from)} 🏮`;
    }

    if (msg) {
      cardLetterBody.textContent = `"${decodeURIComponent(msg)}"`;
    }
  }

  applyCustomGreeting();

  /* ========================================================
     2. HỆ THỐNG ÂM THANH BẰNG WEB AUDIO API (KHÔNG SỢ LỖI FILE)
     Nhạc ngũ cung đêm trăng nhẹ nhàng + tiếng chuông gió & pháo hoa
     ======================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timerId = null;
      this.step = 0;
      // Thang âm ngũ cung êm dịu (C, D, E, G, A) mang phong cách Á Đông
      this.pentatonic = [
        261.63, 293.66, 329.63, 392.00, 440.00,
        523.25, 587.33, 659.25, 783.99, 880.00
      ];
      // Giai điệu nhẹ nhàng
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
    }

    stop() {
      this.isPlaying = false;
      if (this.timerId) clearTimeout(this.timerId);
    }

    scheduleNote() {
      if (!this.isPlaying) return;
      const noteIdx = this.melody[this.step % this.melody.length];
      const freq = this.pentatonic[noteIdx] || 440;
      this.playPluck(freq, 1.2);

      // Thỉnh thoảng đệm thêm một nốt bass ấm
      if (this.step % 4 === 0) {
        this.playPluck(freq / 2, 2.0, 0.15);
      }

      this.step++;
      // Nhịp độ thư giãn, tự nhiên
      const delay = (this.step % 4 === 3) ? 700 : 450;
      this.timerId = setTimeout(() => this.scheduleNote(), delay);
    }

    playPluck(freq, duration = 1, volume = 0.2) {
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
        setTimeout(() => this.playPluck(freq, 1.5, 0.25), i * 90);
      });
    }

    playFireworkSound() {
      this.init();
      if (!this.ctx) return;
      // Âm thanh nổ tách nhẹ của pháo hoa
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

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
      showToast('Đã bật nhạc nền đêm rằm 🎵');
    } else {
      soundIcon.textContent = '🎵';
      btnToggleSound.querySelector('.btn-text').textContent = 'Bật Nhạc';
      showToast('Đã tạm dừng nhạc');
    }
  });

  /* ========================================================
     3. CANVAS TƯƠNG TÁC: PHÁO HOA & ĐÈN ƯỚC (TƯƠNG TÁC THỰC TẾ)
     ======================================================== */
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Danh sách đèn ước nguyện & tia pháo hoa (chỉ xuất hiện khi tương tác)
  const wishLanterns = [];
  const sparks = [];

  class UserWishLantern {
    constructor(wishText = '') {
      this.wishText = wishText;
      this.x = width * 0.5 + (Math.random() * 80 - 40);
      this.y = height + 30;
      this.w = 34;
      this.h = 44;
      this.speedY = 1.2;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.opacity = 1;
    }

    update() {
      this.y -= this.speedY;
      this.swayOffset += 0.02;
      this.x += Math.sin(this.swayOffset) * 0.8;
      if (this.y < 100) {
        this.opacity -= 0.015;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = Math.max(0, this.opacity);

      // Thân đèn lồng màu đỏ cam truyền thống
      ctx.fillStyle = '#c53030';
      ctx.beginPath();
      ctx.roundRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h, 6);
      ctx.fill();

      // Đáy đèn màu vàng ấm
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, this.h * 0.4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Nhãn điều ước
      if (this.wishText) {
        ctx.fillStyle = '#1f2937';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🏮 ${this.wishText}`, 0, -this.h * 0.65);
      }

      ctx.restore();
    }
  }

  // Hiệu ứng pháo hoa khi người dùng click/chạm
  function createFireworkSparks(x, y) {
    sound.playFireworkSound();
    const count = 30;
    const colors = ['#c53030', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.2;
      const speed = Math.random() * 4 + 1.5;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: Math.random() * 0.025 + 0.02,
        radius: Math.random() * 2 + 1.2
      });
    }
  }

  // Animation Loop: Chỉ chạy khi có hạt cần render
  function renderSky() {
    ctx.clearRect(0, 0, width, height);

    // Vẽ đèn ước
    for (let i = wishLanterns.length - 1; i >= 0; i--) {
      const l = wishLanterns[i];
      l.update();
      l.draw();
      if (l.opacity <= 0 || l.y < -50) {
        wishLanterns.splice(i, 1);
      }
    }

    // Vẽ pháo hoa
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.08; // Trọng lực nhẹ
      sp.alpha -= sp.decay;

      if (sp.alpha <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(renderSky);
  }
  requestAnimationFrame(renderSky);

  // Chạm/Click bất kỳ vào canvas để bắn pháo hoa
  canvas.addEventListener('click', (e) => {
    createFireworkSparks(e.clientX, e.clientY);
  });
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      createFireworkSparks(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  /* ========================================================
     4. MỞ THIỆP & TƯƠNG TÁC CHÍNH
     ======================================================== */
  function openLetter() {
    sound.init();
    sound.playChime();

    // Hiệu ứng pháo giấy confetti tưng bừng
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd166', '#ff3b5c', '#06d6a0', '#118ab2', '#ffea79']
      });
    }

    // Chuyển từ màn hình chờ sang bức thiệp 3D
    envelopeSection.classList.add('hidden');
    cardSection.classList.remove('hidden');

    // Tự động bật nhạc nhẹ nếu chưa bật
    if (!sound.isPlaying) {
      sound.play();
      soundIcon.textContent = '🔊';
      btnToggleSound.querySelector('.btn-text').textContent = 'Tắt Nhạc';
    }

    showToast('🌕 Chúc bạn một mùa Trung Thu ấm áp, viên mãn!');
  }

  starLanternHero.addEventListener('click', openLetter);
  btnOpenLetter.addEventListener('click', openLetter);

  // Nút bắn pháo hoa từ thanh công cụ
  btnFireworks.addEventListener('click', () => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#ffd166', '#ff4d6d', '#ff9f1c', '#ffffff']
      });
    }
    createFireworkSparks(width * 0.3, height * 0.35);
    createFireworkSparks(width * 0.7, height * 0.3);
  });

  /* ========================================================
     5. TẠO MÃ QR THIỆP TRUNG THU CÁ NHÂN HÓA (ĐU TREND TIKTOK)
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

  // Xử lý tạo mã QR khi bấm "Sinh Mã QR Ngay"
  btnGenerateQr.addEventListener('click', () => {
    const receiver = document.getElementById('input-receiver').value.trim();
    const message = document.getElementById('input-message').value.trim();
    const sender = document.getElementById('input-sender').value.trim();

    if (!receiver) {
      showToast('⚠️ Vui lòng nhập tên người nhận!');
      document.getElementById('input-receiver').focus();
      return;
    }

    // Xây dựng link với query parameters
    const currentBaseUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams();
    urlParams.set('to', receiver);
    if (message) urlParams.set('msg', message);
    if (sender) urlParams.set('from', sender);

    generatedShareUrl = `${currentBaseUrl}?${urlParams.toString()}`;

    // Xóa mã QR cũ nếu có
    qrcodeDisplay.innerHTML = '';

    // Tạo mã QR mới bằng QRCode.js
    if (typeof QRCode !== 'undefined') {
      qrCodeInstance = new QRCode(qrcodeDisplay, {
        text: generatedShareUrl,
        width: 190,
        height: 190,
        colorDark: '#0b0f2a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      qrResultContainer.classList.remove('hidden');
      copyStatus.classList.add('hidden');
      showToast('✨ Đã tạo mã QR thành công!');
    } else {
      showToast('⚠️ Không thể tải thư viện QR, hãy thử lại.');
    }
  });

  // Tải ảnh mã QR về máy
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
    downloadLink.download = `Thiep_Trung_Thu_QR_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('📥 Đã tải ảnh mã QR về máy!');
  });

  // Copy link
  btnCopyLink.addEventListener('click', async () => {
    if (!generatedShareUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedShareUrl);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = generatedShareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      copyStatus.classList.remove('hidden');
      showToast('📋 Đã sao chép link thiệp!');
    } catch (err) {
      showToast('⚠️ Không thể sao chép link tự động.');
    }
  });

  // Xem thử thiệp vừa tạo
  btnTestPreview.addEventListener('click', () => {
    if (!generatedShareUrl) return;
    window.location.href = generatedShareUrl;
  });

  /* ========================================================
     6. MÁY QUÉT MÃ QR BẰNG CAMERA TRỰC TIẾP TRÊN WEB
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
        { facingMode: 'environment' }, // Ưu tiên camera sau trên điện thoại
        config,
        (decodedText) => {
          // Khi quét trúng mã QR!
          onQrCodeScanned(decodedText);
        },
        () => {
          // Quét liên tục từng frame (không cần log lỗi)
        }
      )
      .then(() => {
        isScanning = true;
        scannerResultMsg.textContent = 'Đã kết nối camera! Hãy đưa mã QR vào khung quét.';
      })
      .catch((err) => {
        isScanning = false;
        scannerResultMsg.textContent = 'Không thể mở camera. Vui lòng cấp quyền truy cập camera trên trình duyệt!';
        console.error('Camera Error: ', err);
      });
  }

  function stopQrScanner() {
    if (html5QrCodeScanner && isScanning) {
      html5QrCodeScanner
        .stop()
        .then(() => {
          isScanning = false;
          html5QrCodeScanner.clear();
        })
        .catch((err) => {
          console.warn('Lỗi khi dừng camera:', err);
          isScanning = false;
        });
    }
  }

  function onQrCodeScanned(decodedText) {
    sound.playChime();
    scannerResultMsg.textContent = `🎉 Đã nhận diện mã: ${decodedText.substring(0, 35)}...`;

    // Dừng camera
    stopQrScanner();

    setTimeout(() => {
      closeScannerModal();

      // Nếu quét được link của chính website này hoặc URL có chứa tham số thiệp
      try {
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
          const scannedUrl = new URL(decodedText);
          const to = scannedUrl.searchParams.get('to');
          const from = scannedUrl.searchParams.get('from');
          const msg = scannedUrl.searchParams.get('msg');

          if (to || msg || from) {
            // Cập nhật nội dung thiệp ngay lập tức mà không cần tải lại trang
            if (to) {
              cardReceiverName.textContent = decodeURIComponent(to);
              recipientGreetingIntro.textContent = `${decodeURIComponent(to)} ơi, có một bức thư bí mật dành cho bạn! ✨`;
            }
            if (from) cardSenderName.textContent = `${decodeURIComponent(from)} 🏮`;
            if (msg) cardLetterBody.textContent = `"${decodeURIComponent(msg)}"`;

            openLetter();
            showToast('🌕 Đã mở bức thiệp bí mật từ mã QR thành công!');
            return;
          } else {
            // Nếu là link khác, hỏi người dùng mở link
            window.location.href = decodedText;
            return;
          }
        }
      } catch (e) {
        // Không phải URL hợp lệ, hiển thị như tin nhắn bí mật
      }

      // Nếu quét ra dạng chữ / text bình thường:
      cardLetterBody.textContent = `"${decodedText}"`;
      cardReceiverName.textContent = 'Bạn';
      openLetter();
      showToast('💌 Đã giải mã thông điệp bí mật từ mã QR!');
    }, 600);
  }

  /* ========================================================
     7. THẢ ĐÈN TRỜI NGUYỆN ƯỚC
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

    // Tạo chiếc đèn trời đặc biệt mang điều ước
    const wishLantern = new UserWishLantern(wishText);
    wishLanterns.push(wishLantern);

    sound.playChime();
    modalWish.classList.add('hidden');
    inputWishText.value = '';

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffd166', '#ffea79']
      });
    }

    showToast('🏮 Chiếc đèn trời nguyện ước của bạn đã được thả lên bầu trăng rằm!');
  });

  /* ========================================================
     8. TOAST THÔNG BÁO NHẸ
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
